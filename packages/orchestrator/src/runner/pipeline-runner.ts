// ============================================================
// CreatorAI Studio — Pipeline Runner
// ============================================================
// Executes a pipeline plan (DAG) with:
// - Dependency-aware step ordering
// - Parallel execution of independent steps
// - Retry with exponential backoff
// - Progress tracking and event emission
// - Cancellation support
// - State persistence to Firestore
//
// This is the heart of the orchestration engine.
// ============================================================

import type { Pipeline, PipelineStep, AgentContext, AgentResult } from '@creatorai/shared';
import {
  PipelineStatus,
  StepStatus,
  generateId,
  ID_PREFIXES,
  PipelineError,
  sleep,
} from '@creatorai/shared';
import { AgentRegistry, createAgentContext } from '@creatorai/agents';
import type { PipelineRepository } from '@creatorai/database';
import { PipelineEventBus, PipelineEventType } from '../events/event-bus';

/**
 * Configuration for the pipeline runner.
 */
export interface PipelineRunnerConfig {
  /** Maximum parallel agent executions */
  maxConcurrency: number;
  /** Default retry delay base (ms) */
  retryBaseDelayMs: number;
  /** Maximum retry delay (ms) */
  retryMaxDelayMs: number;
}

const DEFAULT_CONFIG: PipelineRunnerConfig = {
  maxConcurrency: 3,
  retryBaseDelayMs: 2000,
  retryMaxDelayMs: 30000,
};

/**
 * Pipeline Runner — executes a pipeline plan as a DAG.
 */
export class PipelineRunner {
  private readonly config: PipelineRunnerConfig;
  private readonly agentRegistry: AgentRegistry;
  private readonly eventBus: PipelineEventBus;
  private readonly pipelineRepo: PipelineRepository;
  private readonly cancelledPipelines: Set<string> = new Set();

  constructor(
    pipelineRepo: PipelineRepository,
    config: Partial<PipelineRunnerConfig> = {},
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.agentRegistry = AgentRegistry.getInstance();
    this.eventBus = PipelineEventBus.getInstance();
    this.pipelineRepo = pipelineRepo;
  }

  /**
   * Execute a pipeline from start to finish.
   *
   * Algorithm:
   * 1. Find all steps with no unmet dependencies (ready steps)
   * 2. Execute ready steps in parallel (up to maxConcurrency)
   * 3. When a step completes, check if new steps are now ready
   * 4. Repeat until all steps are done or a non-optional step fails
   */
  async run(pipeline: Pipeline): Promise<Pipeline> {
    const { pipelineId, projectId, userId } = {
      pipelineId: pipeline.id,
      projectId: pipeline.projectId,
      userId: pipeline.userId,
    };

    // Update status to running
    await this.pipelineRepo.updateStatus(pipelineId, PipelineStatus.RUNNING);
    this.eventBus.emit({
      type: PipelineEventType.PIPELINE_STARTED,
      pipelineId,
      projectId,
      userId,
      timestamp: new Date(),
      data: { totalSteps: pipeline.plan.steps.length },
    });

    // Create shared context for all agents in this pipeline
    const cancelSignal = { cancelled: false };
    const context = createAgentContext({
      pipelineId,
      projectId,
      userId,
      onProgress: (update) => {
        this.eventBus.emitStepProgress(
          pipelineId,
          projectId,
          userId,
          pipeline.currentStep ?? '',
          update.progress,
          update.message,
        );
      },
      onLog: (entry) => {
        if (entry.level === 'error') {
          console.error(`[Pipeline ${pipelineId}]`, entry.message, entry.data);
        }
      },
      cancelSignal,
    });

    try {
      const steps = [...pipeline.plan.steps];
      const completedSteps = new Set<string>();
      const failedSteps = new Set<string>();

      while (true) {
        // Check cancellation
        if (this.cancelledPipelines.has(pipelineId)) {
          cancelSignal.cancelled = true;
          await this.pipelineRepo.updateStatus(pipelineId, PipelineStatus.CANCELLED);
          this.eventBus.emit({
            type: PipelineEventType.PIPELINE_CANCELLED,
            pipelineId,
            projectId,
            userId,
            timestamp: new Date(),
            data: {},
          });
          break;
        }

        // Find ready steps (all dependencies completed)
        const readySteps = steps.filter(
          (step) =>
            step.status === StepStatus.PENDING &&
            step.dependsOn.every(
              (depId) => completedSteps.has(depId) || failedSteps.has(depId),
            ),
        );

        // Check if we're done
        if (readySteps.length === 0) {
          const allDone = steps.every(
            (s) =>
              s.status === StepStatus.COMPLETED ||
              s.status === StepStatus.SKIPPED ||
              s.status === StepStatus.FAILED,
          );

          if (allDone) break;

          // Deadlock detection — no ready steps but not all done
          const pendingSteps = steps.filter((s) => s.status === StepStatus.PENDING);
          if (pendingSteps.length > 0) {
            throw new PipelineError(
              pipelineId,
              `Pipeline deadlock: ${pendingSteps.length} steps pending but no steps are ready`,
            );
          }
          break;
        }

        // Execute ready steps in parallel (limited concurrency)
        const batch = readySteps.slice(0, this.config.maxConcurrency);
        const results = await Promise.allSettled(
          batch.map((step) => this.executeStep(step, context, pipelineId, projectId, userId)),
        );

        // Process results
        for (let i = 0; i < results.length; i++) {
          const step = batch[i]!;
          const result = results[i]!;

          if (result.status === 'fulfilled' && result.value.success) {
            step.status = StepStatus.COMPLETED;
            step.output = result.value.data as Record<string, unknown>;
            completedSteps.add(step.id);

            // Store output in context for downstream agents
            context.setStoreValue(`${step.agentId}.output`, result.value.data);
          } else {
            const error =
              result.status === 'rejected'
                ? result.reason?.message ?? 'Unknown error'
                : result.value.error?.message ?? 'Unknown error';

            step.status = StepStatus.FAILED;
            failedSteps.add(step.id);

            // Check if this step has dependents that are non-optional
            const isBlocking = steps.some(
              (s) => s.dependsOn.includes(step.id) && !this.isStepOptional(s, steps),
            );

            // If a required step failed AND it has non-optional dependents, fail the pipeline
            if (!this.isStepOptional(step, steps) || isBlocking) {
              throw new PipelineError(pipelineId, `Step "${step.name}" failed: ${error}`, step.id);
            }

            // Mark dependent steps as skipped
            this.skipDependentSteps(step.id, steps);
          }
        }

        // Update overall progress
        const completedCount = steps.filter(
          (s) => s.status === StepStatus.COMPLETED || s.status === StepStatus.SKIPPED,
        ).length;
        const progress = Math.round((completedCount / steps.length) * 100);
        await this.pipelineRepo.updateProgress(pipelineId, progress, null);
      }

      // Pipeline completed successfully
      await this.pipelineRepo.updateStatus(pipelineId, PipelineStatus.COMPLETED);
      await this.pipelineRepo.updateProgress(pipelineId, 100, null);

      this.eventBus.emitPipelineCompleted(pipelineId, projectId, userId, context.store);

      // Return updated pipeline
      return await this.pipelineRepo.findByIdOrThrow(pipelineId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const failedStep = error instanceof PipelineError ? error.failedStep : null;

      await this.pipelineRepo.updateStatus(pipelineId, PipelineStatus.FAILED);
      await this.pipelineRepo.update(pipelineId, {
        error: {
          message: errorMessage,
          step: failedStep ?? 'unknown',
          timestamp: new Date(),
          code: 'PIPELINE_EXECUTION_ERROR',
        },
      } as Partial<Pipeline>);

      this.eventBus.emitPipelineFailed(pipelineId, projectId, userId, errorMessage, failedStep);

      throw error;
    } finally {
      this.cancelledPipelines.delete(pipelineId);
    }
  }

  /**
   * Cancel a running pipeline.
   */
  cancel(pipelineId: string): void {
    this.cancelledPipelines.add(pipelineId);
  }

  /**
   * Execute a single pipeline step with retry logic.
   */
  private async executeStep(
    step: PipelineStep,
    context: AgentContext,
    pipelineId: string,
    projectId: string,
    userId: string,
  ): Promise<AgentResult<unknown>> {
    const agent = this.agentRegistry.getOrThrow(step.agentId);

    // Emit step started
    await this.pipelineRepo.markStepStarted(pipelineId, step.id);
    this.eventBus.emitStepStarted(pipelineId, projectId, userId, step.id, step.agentId);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= step.maxRetries; attempt++) {
      try {
        // Check cancellation before each attempt
        if (context.isCancelled()) {
          return {
            success: false,
            data: null,
            error: {
              code: 'CANCELLED',
              message: 'Pipeline cancelled',
              provider: null,
              retryable: false,
              timestamp: new Date(),
            },
            metrics: { durationMs: 0, tokensUsed: null, costUsd: null, provider: 'none' },
          };
        }

        const result = await agent.execute(step.input, context);

        if (result.success) {
          // Step succeeded
          await this.pipelineRepo.markStepCompleted(pipelineId, step.id, result.data as Record<string, unknown>);
          this.eventBus.emitStepCompleted(
            pipelineId,
            projectId,
            userId,
            step.id,
            result.data as Record<string, unknown>,
          );
          return result;
        }

        // Step failed — check if retryable
        if (!result.error?.retryable || attempt >= step.maxRetries) {
          await this.pipelineRepo.markStepFailed(pipelineId, step.id, {
            code: result.error?.code ?? 'UNKNOWN',
            message: result.error?.message ?? 'Unknown error',
            retryable: result.error?.retryable ?? false,
          });
          this.eventBus.emitStepFailed(
            pipelineId,
            projectId,
            userId,
            step.id,
            result.error?.message ?? 'Unknown error',
            false,
          );
          return result;
        }

        // Retry
        lastError = new Error(result.error.message);
        this.eventBus.emitStepFailed(
          pipelineId,
          projectId,
          userId,
          step.id,
          result.error.message,
          true,
        );

        const delay = Math.min(
          this.config.retryBaseDelayMs * Math.pow(2, attempt),
          this.config.retryMaxDelayMs,
        );
        await sleep(delay);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt >= step.maxRetries) {
          await this.pipelineRepo.markStepFailed(pipelineId, step.id, {
            code: 'EXECUTION_ERROR',
            message: lastError.message,
            retryable: false,
          });
          this.eventBus.emitStepFailed(
            pipelineId,
            projectId,
            userId,
            step.id,
            lastError.message,
            false,
          );
          throw lastError;
        }

        const delay = Math.min(
          this.config.retryBaseDelayMs * Math.pow(2, attempt),
          this.config.retryMaxDelayMs,
        );
        await sleep(delay);
      }
    }

    throw lastError ?? new Error('Step execution failed with no error details');
  }

  /**
   * Check if a step is optional (its template says so or has no
   * non-optional dependents).
   */
  private isStepOptional(step: PipelineStep, _allSteps: PipelineStep[]): boolean {
    // Steps are non-optional by default; this can be extended
    // with step metadata if needed.
    return false;
  }

  /**
   * Skip all steps that depend on a failed step.
   */
  private skipDependentSteps(failedStepId: string, steps: PipelineStep[]): void {
    for (const step of steps) {
      if (step.dependsOn.includes(failedStepId) && step.status === StepStatus.PENDING) {
        step.status = StepStatus.SKIPPED;
        // Recursively skip dependents of skipped steps
        this.skipDependentSteps(step.id, steps);
      }
    }
  }
}
