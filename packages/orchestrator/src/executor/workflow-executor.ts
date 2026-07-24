// ============================================================
// CreatorAI Studio — Workflow Executor
// ============================================================
// Reads a WorkflowPlan and executes it node by node.
//
// Responsibilities:
// - Resolve dependencies (topological order from the plan)
// - Execute nodes (via AgentRegistry)
// - Resolve input mappings (via ArtifactManager for artifact refs,
//   ParsedIntent for intent refs, static values)
// - Store outputs as artifacts (via ArtifactManager)
// - Handle retries (per-node retry policy)
// - Support cancellation, pause/resume
// - Report progress (via WorkflowEventEmitter → SSE)
// - Parallel execution (nodes at the same DAG depth run concurrently)
//
// The Executor contains ZERO business logic.
// It does not know what a "script" or "image" is.
// It only knows nodes, dependencies, agents, and artifacts.
// ============================================================

import { AgentRegistry, createAgentContext, Logger, type IAgent } from '@creatorai/agents';
import { sleep, AgentError } from '@creatorai/shared';
import type { WorkflowPlan, WorkflowNode, WorkflowRun, NodeRunState } from '../planner/workflow.types';
import { WorkflowStatus, NodeStatus } from '../planner/workflow.types';
import type { ParsedIntent } from '../intent/intent.types';
import { ArtifactManager } from '../artifacts/artifact-manager';
import { ArtifactType } from '../artifacts/artifact.types';
import { WorkflowEventEmitter, WorkflowEventType } from './workflow-events';

const log = Logger.for('WorkflowExecutor');

export interface ExecutorConfig {
  /** Maximum number of nodes executing concurrently */
  maxConcurrency: number;
  /** How often to check for new runnable nodes (ms) */
  tickIntervalMs: number;
}

const DEFAULT_CONFIG: ExecutorConfig = {
  maxConcurrency: 4,
  tickIntervalMs: 500,
};

export class WorkflowExecutor {
  private readonly config: ExecutorConfig;
  private readonly agentRegistry: AgentRegistry;
  private readonly events: WorkflowEventEmitter;
  private readonly cancelledRuns: Set<string> = new Set();
  private readonly pausedRuns: Set<string> = new Set();

  constructor(config: Partial<ExecutorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.agentRegistry = AgentRegistry.getInstance();
    this.events = WorkflowEventEmitter.getInstance();
  }

  /**
   * Execute a workflow plan to completion.
   *
   * @param plan — The plan to execute (from the Planner)
   * @param intent — The parsed intent (for resolving 'intent' input mappings)
   * @param userId — Owner
   * @param projectId — Target project
   * @returns The completed WorkflowRun with all artifacts
   */
  async execute(
    plan: WorkflowPlan,
    intent: ParsedIntent,
    userId: string,
    projectId: string,
  ): Promise<{ run: WorkflowRun; artifacts: ArtifactManager }> {
    const artifactManager = new ArtifactManager();

    // Initialize run state
    const run: WorkflowRun = {
      id: plan.id,
      planId: plan.id,
      userId,
      projectId,
      status: WorkflowStatus.RUNNING,
      progress: 0,
      currentNodeId: null,
      nodeStates: new Map(
        plan.nodes.map((n) => [n.id, this.createInitialNodeState(n.id)]),
      ),
      startedAt: new Date(),
      completedAt: null,
      error: null,
      totalCostUsd: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.events.emit(WorkflowEventType.WORKFLOW_STARTED, run, {
      planId: plan.id,
      nodeCount: plan.nodes.length,
      itemCount: plan.itemCount,
    });

    log.info('Workflow execution started', {
      runId: run.id,
      nodeCount: plan.nodes.length,
      itemCount: plan.itemCount,
    });

    try {
      await this.executeDAG(plan, intent, run, artifactManager);

      // Success
      run.status = WorkflowStatus.COMPLETED;
      run.completedAt = new Date();
      run.progress = 100;
      run.updatedAt = new Date();

      this.events.emit(WorkflowEventType.WORKFLOW_COMPLETED, run, {
        artifactCount: artifactManager.size,
        totalCostUsd: run.totalCostUsd,
        durationMs: run.completedAt.getTime() - (run.startedAt?.getTime() ?? 0),
      });

      log.info('Workflow execution completed', {
        runId: run.id,
        durationMs: run.completedAt.getTime() - (run.startedAt?.getTime() ?? 0),
        artifactCount: artifactManager.size,
        totalCostUsd: run.totalCostUsd.toFixed(4),
      });
    } catch (error) {
      run.status = this.cancelledRuns.has(run.id)
        ? WorkflowStatus.CANCELLED
        : WorkflowStatus.FAILED;
      run.completedAt = new Date();
      run.updatedAt = new Date();
      run.error = {
        nodeId: run.currentNodeId ?? 'unknown',
        message: error instanceof Error ? error.message : String(error),
        code: 'WORKFLOW_EXECUTION_ERROR',
      };

      const eventType = run.status === WorkflowStatus.CANCELLED
        ? WorkflowEventType.WORKFLOW_CANCELLED
        : WorkflowEventType.WORKFLOW_FAILED;

      this.events.emit(eventType, run, { error: run.error });

      log.error('Workflow execution failed', {
        runId: run.id,
        failedNode: run.currentNodeId,
      }, error instanceof Error ? error : undefined);
    } finally {
      this.cancelledRuns.delete(run.id);
      this.pausedRuns.delete(run.id);
    }

    return { run, artifacts: artifactManager };
  }

  /**
   * Cancel a running workflow.
   */
  cancel(runId: string): void {
    this.cancelledRuns.add(runId);
    log.info('Workflow cancellation requested', { runId });
  }

  /**
   * Pause a running workflow.
   */
  pause(runId: string): void {
    this.pausedRuns.add(runId);
    log.info('Workflow pause requested', { runId });
  }

  /**
   * Resume a paused workflow.
   */
  resume(runId: string): void {
    this.pausedRuns.delete(runId);
    log.info('Workflow resume requested', { runId });
  }

  // ================================================================
  // DAG Execution Loop
  // ================================================================

  private async executeDAG(
    plan: WorkflowPlan,
    intent: ParsedIntent,
    run: WorkflowRun,
    artifacts: ArtifactManager,
  ): Promise<void> {
    const nodeMap = new Map(plan.nodes.map((n) => [n.id, n]));
    const activeNodes: Set<string> = new Set();

    const isRunnable = (nodeId: string): boolean => {
      const state = run.nodeStates.get(nodeId);
      const node = nodeMap.get(nodeId);
      if (!state || !node) return false;
      if (state.status !== NodeStatus.PENDING) return false;

      // All dependencies must be completed (or skipped if optional)
      return node.dependsOn.every((depId) => {
        const depState = run.nodeStates.get(depId);
        return depState?.status === NodeStatus.COMPLETED || depState?.status === NodeStatus.SKIPPED;
      });
    };

    while (true) {
      // Check cancellation
      if (this.cancelledRuns.has(run.id)) {
        throw new Error('Workflow cancelled by user');
      }

      // Check pause
      if (this.pausedRuns.has(run.id)) {
        run.status = WorkflowStatus.PAUSED;
        run.updatedAt = new Date();
        this.events.emit(WorkflowEventType.WORKFLOW_PAUSED, run, {});
        // Wait until resumed or cancelled
        while (this.pausedRuns.has(run.id) && !this.cancelledRuns.has(run.id)) {
          await sleep(1000);
        }
        if (this.cancelledRuns.has(run.id)) throw new Error('Workflow cancelled while paused');
        run.status = WorkflowStatus.RUNNING;
        this.events.emit(WorkflowEventType.WORKFLOW_RESUMED, run, {});
      }

      // Find all runnable nodes
      const runnableIds = plan.executionOrder.filter(
        (id) => isRunnable(id) && !activeNodes.has(id),
      );

      // If nothing is runnable and nothing is active, we're done
      if (runnableIds.length === 0 && activeNodes.size === 0) {
        // Check if all nodes are completed/skipped
        const allDone = [...run.nodeStates.values()].every(
          (s) => s.status === NodeStatus.COMPLETED || s.status === NodeStatus.SKIPPED,
        );
        if (allDone) return;

        // Deadlock: pending nodes exist but can't run
        const pending = [...run.nodeStates.entries()]
          .filter(([, s]) => s.status === NodeStatus.PENDING)
          .map(([id]) => id);
        if (pending.length > 0) {
          throw new Error(`Workflow deadlock: nodes ${pending.join(', ')} are pending but not runnable`);
        }
        return;
      }

      // Launch runnable nodes up to concurrency limit
      const slotsAvailable = this.config.maxConcurrency - activeNodes.size;
      const batch = runnableIds.slice(0, slotsAvailable);

      if (batch.length > 0) {
        const promises = batch.map(async (nodeId) => {
          activeNodes.add(nodeId);
          try {
            await this.executeNode(nodeMap.get(nodeId)!, intent, run, artifacts);
          } finally {
            activeNodes.delete(nodeId);
          }
        });

        // Wait for at least one to complete before checking for new runnable nodes
        await Promise.race([
          Promise.allSettled(promises),
          sleep(this.config.tickIntervalMs),
        ]);

        // Update overall progress
        const completedCount = [...run.nodeStates.values()].filter(
          (s) => s.status === NodeStatus.COMPLETED || s.status === NodeStatus.SKIPPED,
        ).length;
        run.progress = Math.round((completedCount / plan.nodes.length) * 100);
        run.updatedAt = new Date();
      } else {
        // Active nodes exist but no new nodes to launch — wait
        await sleep(this.config.tickIntervalMs);
      }
    }
  }

  // ================================================================
  // Single Node Execution
  // ================================================================

  private async executeNode(
    node: WorkflowNode,
    intent: ParsedIntent,
    run: WorkflowRun,
    artifacts: ArtifactManager,
  ): Promise<void> {
    const state = run.nodeStates.get(node.id)!;
    state.status = NodeStatus.RUNNING;
    state.startedAt = new Date();
    run.currentNodeId = node.id;

    this.events.emit(WorkflowEventType.NODE_STARTED, run, {
      nodeId: node.id,
      agentId: node.agentId,
      label: node.label,
    });

    log.info('Executing node', { nodeId: node.id, agentId: node.agentId, label: node.label });

    // Resolve input from mappings
    const input = this.resolveInputMappings(node.inputMapping, intent, artifacts);

    // Get agent
    const agent = this.agentRegistry.get(node.agentId);
    if (!agent) {
      this.handleNodeFailure(node, state, run, `Agent "${node.agentId}" not registered`);
      return;
    }

    // Execute with retries
    let lastError: string | null = null;
    for (let attempt = 1; attempt <= node.retry.maxAttempts; attempt++) {
      if (this.cancelledRuns.has(run.id)) {
        state.status = NodeStatus.CANCELLED;
        return;
      }

      try {
        state.attempts = attempt;
        if (attempt > 1) {
          state.status = NodeStatus.RETRYING;
          this.events.emit(WorkflowEventType.NODE_RETRYING, run, {
            nodeId: node.id, attempt, maxAttempts: node.retry.maxAttempts,
          });
          await sleep(node.retry.backoffMs * Math.pow(2, attempt - 2));
        }

        // Create agent context with progress reporting
        const context = createAgentContext({
          pipelineId: run.id,
          projectId: run.projectId,
          userId: run.userId,
          onProgress: (update) => {
            state.progress = update.progress;
            this.events.emit(WorkflowEventType.NODE_PROGRESS, run, {
              nodeId: node.id,
              progress: update.progress,
              message: update.message,
            });
          },
          cancelSignal: { cancelled: this.cancelledRuns.has(run.id) },
        });

        const result = await (agent as IAgent).execute(input, context);

        if (!result.success) {
          lastError = result.error?.message ?? 'Agent returned failure';
          if (result.error?.retryable && attempt < node.retry.maxAttempts) {
            continue;
          }
          this.handleNodeFailure(node, state, run, lastError);
          return;
        }

        // Success — store artifact
        const artifactType = this.mapAgentToArtifactType(node.agentId);
        artifacts.store({
          nodeId: node.id,
          workflowRunId: run.id,
          projectId: run.projectId,
          userId: run.userId,
          type: artifactType,
          data: result.data as Record<string, unknown>,
          sourceAgentId: node.agentId,
          metadata: {
            metrics: result.metrics,
            attempt,
          },
        });

        // Mark completed
        const now = new Date();
        state.status = NodeStatus.COMPLETED;
        state.completedAt = now;
        state.durationMs = now.getTime() - (state.startedAt?.getTime() ?? now.getTime());
        state.costUsd = result.metrics.costUsd;
        state.progress = 100;

        if (result.metrics.costUsd) {
          run.totalCostUsd += result.metrics.costUsd;
        }

        this.events.emit(WorkflowEventType.NODE_COMPLETED, run, {
          nodeId: node.id,
          agentId: node.agentId,
          durationMs: state.durationMs,
          artifactCount: artifacts.getByNode(node.id).length,
        });

        log.info('Node completed', {
          nodeId: node.id,
          agentId: node.agentId,
          durationMs: state.durationMs,
          attempt,
        });

        return; // Success — exit retry loop

      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        if (attempt >= node.retry.maxAttempts) {
          this.handleNodeFailure(node, state, run, lastError);
          return;
        }
      }
    }
  }

  // ================================================================
  // Helpers
  // ================================================================

  /**
   * Resolve input mappings for a node.
   * Converts WorkflowInputMapping declarations into actual data.
   */
  private resolveInputMappings(
    mappings: WorkflowNode['inputMapping'],
    intent: ParsedIntent,
    artifacts: ArtifactManager,
  ): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};

    for (const [field, mapping] of Object.entries(mappings)) {
      let value: unknown;

      switch (mapping.source) {
        case 'intent':
          value = (intent.entities as Record<string, unknown>)[mapping.key];
          break;
        case 'artifact':
          value = artifacts.resolve(mapping.key);
          break;
        case 'static':
          value = mapping.key;
          break;
        case 'context':
          value = undefined; // Extended in future
          break;
      }

      // Apply fallback
      if (value === undefined || value === null) {
        value = mapping.fallback;
      }

      // Boolean string conversion
      if (value === 'true') value = true;
      if (value === 'false') value = false;

      resolved[field] = value;
    }

    return resolved;
  }

  private handleNodeFailure(
    node: WorkflowNode,
    state: NodeRunState,
    run: WorkflowRun,
    errorMessage: string,
  ): void {
    state.status = NodeStatus.FAILED;
    state.error = errorMessage;
    state.completedAt = new Date();
    state.durationMs = state.completedAt.getTime() - (state.startedAt?.getTime() ?? 0);

    this.events.emit(WorkflowEventType.NODE_FAILED, run, {
      nodeId: node.id,
      agentId: node.agentId,
      error: errorMessage,
      attempts: state.attempts,
    });

    if (!node.optional) {
      // Skip dependent nodes
      this.skipDependentNodes(node.id, run);
      throw new Error(`Required node "${node.label}" failed: ${errorMessage}`);
    }

    // Optional node — mark as skipped, continue workflow
    log.warn('Optional node failed, continuing workflow', {
      nodeId: node.id,
      error: errorMessage,
    });
    state.status = NodeStatus.SKIPPED;
  }

  private skipDependentNodes(failedNodeId: string, run: WorkflowRun): void {
    for (const [nodeId, state] of run.nodeStates) {
      if (state.status === NodeStatus.PENDING) {
        // This is a simplified check — in the full implementation
        // we'd traverse the DAG to find all transitive dependents
        state.status = NodeStatus.SKIPPED;
      }
    }
  }

  private createInitialNodeState(nodeId: string): NodeRunState {
    return {
      nodeId,
      status: NodeStatus.PENDING,
      attempts: 0,
      progress: 0,
      artifactIds: [],
      startedAt: null,
      completedAt: null,
      durationMs: null,
      costUsd: null,
      error: null,
    };
  }

  private mapAgentToArtifactType(agentId: string): ArtifactType {
    const mapping: Record<string, ArtifactType> = {
      script: ArtifactType.SCRIPT,
      prompt: ArtifactType.SCENE_PROMPTS,
      image: ArtifactType.IMAGE,
      voice: ArtifactType.VOICEOVER,
      video: ArtifactType.VIDEO,
      thumbnail: ArtifactType.THUMBNAIL,
      seo: ArtifactType.SEO_METADATA,
      editor: ArtifactType.COMPOSED_VIDEO,
      trend: ArtifactType.TREND_RESEARCH,
    };
    return mapping[agentId] ?? ArtifactType.GENERIC;
  }
}
