// ============================================================
// CreatorAI Studio — Base Agent (Abstract)
// ============================================================
// Template Method pattern — defines the common agent lifecycle.
//
// Every agent inherits:
// - Structured logging (via Logger)
// - Cost tracking (via CostTracker)
// - Execution timing and metrics
// - Status tracking for the pipeline UI
// - Error wrapping and classification
// - Progress reporting
//
// Concrete agents override doValidate(), doExecute(), doRollback(),
// doEstimateCost(), and doHealthCheck().
// ============================================================

import type {
  AgentContext,
  AgentResult,
  CostEstimate,
  HealthCheckResult,
  ValidationResult,
} from '@creatorai/shared';
import { AgentError } from '@creatorai/shared';
import type { IAgent, AgentStatus, AgentMetadata } from './agent.interface';
import { Logger } from '../infrastructure/logger';
import { CostTracker } from '../infrastructure/cost/cost-tracker';

export abstract class BaseAgent<TInput, TOutput> implements IAgent<TInput, TOutput> {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly description: string;

  protected readonly log: Logger;
  protected readonly costTracker: CostTracker;

  private _status: AgentStatus = {
    isRunning: false,
    progress: 0,
    currentOperation: null,
    startedAt: null,
    lastError: null,
  };

  constructor() {
    // Logger and CostTracker are initialized in constructor body
    // because `this.id` is abstract and not available until subclass construction.
    // We use a proxy pattern: create with a placeholder, then update in first use.
    this.log = Logger.for('Agent');
    this.costTracker = CostTracker.getInstance();
  }

  /**
   * Lazy logger that includes the agent ID.
   * First call after construction creates the real logger.
   */
  private getLog(context?: AgentContext): Logger {
    return Logger.for(this.id, {
      agentId: this.id,
      ...(context ? {
        pipelineId: context.pipelineId,
        projectId: context.projectId,
        userId: context.userId,
        correlationId: context.correlationId,
      } : {}),
    });
  }

  // ---- Public API ----

  async validate(input: TInput): Promise<ValidationResult> {
    try {
      return await this.doValidate(input);
    } catch (error) {
      return {
        valid: false,
        errors: [{
          field: '_root',
          message: error instanceof Error ? error.message : 'Validation failed',
          code: 'VALIDATION_EXCEPTION',
        }],
      };
    }
  }

  async execute(input: TInput, context: AgentContext): Promise<AgentResult<TOutput>> {
    const log = this.getLog(context);
    const startTime = performance.now();

    this._status = {
      isRunning: true,
      progress: 0,
      currentOperation: 'Initializing',
      startedAt: new Date(),
      lastError: null,
    };

    try {
      // Validate
      log.info('Validating input');
      const validation = await this.validate(input);
      if (!validation.valid) {
        const errorMsg = validation.errors.map((e) => `${e.field}: ${e.message}`).join('; ');
        throw new AgentError(this.id, `Validation failed: ${errorMsg}`, false);
      }

      // Check cancellation
      if (context.isCancelled()) {
        throw new AgentError(this.id, 'Execution cancelled', false);
      }

      // Execute
      log.info('Starting execution');
      this.updateStatus(5, 'Executing');
      const result = await this.doExecute(input, context);

      // Complete
      const durationMs = Math.round(performance.now() - startTime);
      this.updateStatus(100, 'Completed');

      log.info('Execution completed', {
        durationMs,
        tokensUsed: result.metrics?.tokensUsed,
        costUsd: result.metrics?.costUsd?.toFixed(6),
        provider: result.metrics?.provider,
      });

      return {
        success: true,
        data: result.data,
        error: null,
        metrics: {
          durationMs,
          tokensUsed: result.metrics?.tokensUsed ?? null,
          costUsd: result.metrics?.costUsd ?? null,
          provider: result.metrics?.provider ?? 'unknown',
        },
      };
    } catch (error) {
      const durationMs = Math.round(performance.now() - startTime);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRetryable = error instanceof AgentError ? error.retryable : true;

      this._status.isRunning = false;
      this._status.lastError = errorMessage;
      this._status.currentOperation = 'Failed';

      log.error('Execution failed', { durationMs }, error instanceof Error ? error : undefined);

      return {
        success: false,
        data: null,
        error: {
          code: error instanceof AgentError ? error.code : 'AGENT_EXECUTION_ERROR',
          message: errorMessage,
          provider: null,
          retryable: isRetryable,
          timestamp: new Date(),
        },
        metrics: {
          durationMs,
          tokensUsed: null,
          costUsd: null,
          provider: 'unknown',
        },
      };
    } finally {
      this._status.isRunning = false;
    }
  }

  async rollback(context: AgentContext): Promise<void> {
    const log = this.getLog(context);
    try {
      log.info('Rolling back');
      await this.doRollback(context);
      log.info('Rollback completed');
    } catch (error) {
      log.error('Rollback failed (non-fatal)', {}, error instanceof Error ? error : undefined);
    }
  }

  getStatus(): AgentStatus {
    return { ...this._status };
  }

  async estimateCost(input: TInput): Promise<CostEstimate> {
    return this.doEstimateCost(input);
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const start = performance.now();
    try {
      const result = await this.doHealthCheck();
      return { ...result, latencyMs: Math.round(performance.now() - start) };
    } catch (error) {
      return {
        healthy: false,
        provider: 'unknown',
        latencyMs: Math.round(performance.now() - start),
        details: { error: error instanceof Error ? error.message : String(error) },
      };
    }
  }

  abstract getMetadata(): AgentMetadata;

  // ---- Abstract Methods (implement in subclass) ----

  protected abstract doValidate(input: TInput): Promise<ValidationResult>;

  protected abstract doExecute(
    input: TInput,
    context: AgentContext,
  ): Promise<{
    data: TOutput;
    metrics?: {
      tokensUsed?: number;
      costUsd?: number;
      provider?: string;
    };
  }>;

  protected abstract doRollback(context: AgentContext): Promise<void>;
  protected abstract doEstimateCost(input: TInput): Promise<CostEstimate>;
  protected abstract doHealthCheck(): Promise<HealthCheckResult>;

  // ---- Protected Helpers ----

  protected updateStatus(progress: number, operation: string): void {
    this._status.progress = Math.min(100, Math.max(0, progress));
    this._status.currentOperation = operation;
  }

  protected reportProgress(context: AgentContext, progress: number, message?: string): void {
    this.updateStatus(progress, message ?? `Processing (${progress}%)`);
    context.reportProgress(progress, message);
  }
}
