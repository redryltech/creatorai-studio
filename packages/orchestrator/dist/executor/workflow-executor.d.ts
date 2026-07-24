import type { WorkflowPlan, WorkflowRun } from '../planner/workflow.types';
import type { ParsedIntent } from '../intent/intent.types';
import { ArtifactManager } from '../artifacts/artifact-manager';
export interface ExecutorConfig {
    /** Maximum number of nodes executing concurrently */
    maxConcurrency: number;
    /** How often to check for new runnable nodes (ms) */
    tickIntervalMs: number;
}
export declare class WorkflowExecutor {
    private readonly config;
    private readonly agentRegistry;
    private readonly events;
    private readonly cancelledRuns;
    private readonly pausedRuns;
    constructor(config?: Partial<ExecutorConfig>);
    /**
     * Execute a workflow plan to completion.
     *
     * @param plan — The plan to execute (from the Planner)
     * @param intent — The parsed intent (for resolving 'intent' input mappings)
     * @param userId — Owner
     * @param projectId — Target project
     * @returns The completed WorkflowRun with all artifacts
     */
    execute(plan: WorkflowPlan, intent: ParsedIntent, userId: string, projectId: string): Promise<{
        run: WorkflowRun;
        artifacts: ArtifactManager;
    }>;
    /**
     * Cancel a running workflow.
     */
    cancel(runId: string): void;
    /**
     * Pause a running workflow.
     */
    pause(runId: string): void;
    /**
     * Resume a paused workflow.
     */
    resume(runId: string): void;
    private executeDAG;
    private executeNode;
    /**
     * Resolve input mappings for a node.
     * Converts WorkflowInputMapping declarations into actual data.
     */
    private resolveInputMappings;
    private handleNodeFailure;
    private skipDependentNodes;
    private createInitialNodeState;
    private mapAgentToArtifactType;
}
//# sourceMappingURL=workflow-executor.d.ts.map