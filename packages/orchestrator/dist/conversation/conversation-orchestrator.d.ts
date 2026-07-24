import type { ParsedIntent } from '../intent/intent.types';
import type { WorkflowPlan, WorkflowRun } from '../planner/workflow.types';
import type { ArtifactManager } from '../artifacts/artifact-manager';
export interface OrchestratorRequest {
    userId: string;
    conversationId: string | null;
    message: string;
    projectId?: string;
}
export interface OrchestratorResponse {
    conversationId: string;
    assistantMessage: string;
    intent: ParsedIntent | null;
    workflowPlan: WorkflowPlan | null;
    workflowRunId: string | null;
    requiresClarification: boolean;
    clarificationQuestion: string | null;
}
export interface OrchestratorWorkflowResult {
    run: WorkflowRun;
    artifacts: ArtifactManager;
}
export declare class ConversationOrchestrator {
    private readonly intentParser;
    private readonly planner;
    private readonly executor;
    private readonly costTracker;
    private readonly activeWorkflows;
    constructor();
    /**
     * Process a user message — THE main entry point.
     *
     * This method returns immediately with intent and plan info.
     * If a workflow is triggered, it runs asynchronously and streams
     * progress via the WorkflowEventEmitter → SSE bridge.
     */
    processMessage(request: OrchestratorRequest): Promise<OrchestratorResponse>;
    /**
     * Cancel an active workflow.
     */
    cancelWorkflow(runId: string): boolean;
    /**
     * Pause an active workflow.
     */
    pauseWorkflow(runId: string): boolean;
    /**
     * Resume a paused workflow.
     */
    resumeWorkflow(runId: string): boolean;
    /**
     * Wait for a workflow to complete (used in tests or synchronous flows).
     */
    waitForWorkflow(runId: string): Promise<OrchestratorWorkflowResult | null>;
    /**
     * Get count of active workflows.
     */
    get activeWorkflowCount(): number;
    /**
     * Handle general chat messages by forwarding to the LLM.
     */
    private handleGeneralChat;
    /**
     * Build a human-readable summary of the plan.
     */
    private buildPlanSummary;
}
//# sourceMappingURL=conversation-orchestrator.d.ts.map