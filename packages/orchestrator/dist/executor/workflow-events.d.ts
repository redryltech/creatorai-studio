import type { WorkflowRun } from '../planner/workflow.types';
export declare enum WorkflowEventType {
    WORKFLOW_CREATED = "workflow.created",
    WORKFLOW_STARTED = "workflow.started",
    WORKFLOW_COMPLETED = "workflow.completed",
    WORKFLOW_FAILED = "workflow.failed",
    WORKFLOW_CANCELLED = "workflow.cancelled",
    WORKFLOW_PAUSED = "workflow.paused",
    WORKFLOW_RESUMED = "workflow.resumed",
    NODE_STARTED = "node.started",
    NODE_PROGRESS = "node.progress",
    NODE_COMPLETED = "node.completed",
    NODE_FAILED = "node.failed",
    NODE_RETRYING = "node.retrying",
    NODE_SKIPPED = "node.skipped"
}
export interface WorkflowEvent {
    type: WorkflowEventType;
    workflowRunId: string;
    userId: string;
    projectId: string;
    timestamp: Date;
    data: Record<string, unknown>;
}
export type WorkflowEventHandler = (event: WorkflowEvent) => void;
/**
 * Workflow event emitter — singleton that bridges the Executor
 * with all event consumers (SSE, logging, analytics).
 */
export declare class WorkflowEventEmitter {
    private static instance;
    private emitter;
    private constructor();
    static getInstance(): WorkflowEventEmitter;
    static resetInstance(): void;
    /**
     * Emit a workflow event.
     *
     * @param type — Event type
     * @param run — Current workflow run state
     * @param data — Event-specific data
     */
    emit(type: WorkflowEventType, run: WorkflowRun, data: Record<string, unknown>): void;
    /** Subscribe to all events (for SSE bridge, logging) */
    onAll(handler: WorkflowEventHandler): () => void;
    /** Subscribe to events for a specific workflow run */
    onRun(runId: string, handler: WorkflowEventHandler): () => void;
    /** Subscribe to events for a specific user */
    onUser(userId: string, handler: WorkflowEventHandler): () => void;
    /** Subscribe to a specific event type */
    onType(type: WorkflowEventType, handler: WorkflowEventHandler): () => void;
}
//# sourceMappingURL=workflow-events.d.ts.map