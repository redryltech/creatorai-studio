// ============================================================
// CreatorAI Studio — Workflow Event System
// ============================================================
// Every stage of workflow execution emits a typed event.
// Events flow to:
//   1. SSE Manager → real-time UI updates
//   2. Logger → structured audit log
//   3. Analytics (future) → execution metrics
//   4. Firestore (future) → persistent event history
//
// This is the Observer pattern applied at the orchestration level.
// The Executor has zero knowledge of SSE or logging — it just
// calls events.emit(). Subscribers handle delivery.
// ============================================================
import { EventEmitter } from 'events';
export var WorkflowEventType;
(function (WorkflowEventType) {
    WorkflowEventType["WORKFLOW_CREATED"] = "workflow.created";
    WorkflowEventType["WORKFLOW_STARTED"] = "workflow.started";
    WorkflowEventType["WORKFLOW_COMPLETED"] = "workflow.completed";
    WorkflowEventType["WORKFLOW_FAILED"] = "workflow.failed";
    WorkflowEventType["WORKFLOW_CANCELLED"] = "workflow.cancelled";
    WorkflowEventType["WORKFLOW_PAUSED"] = "workflow.paused";
    WorkflowEventType["WORKFLOW_RESUMED"] = "workflow.resumed";
    WorkflowEventType["NODE_STARTED"] = "node.started";
    WorkflowEventType["NODE_PROGRESS"] = "node.progress";
    WorkflowEventType["NODE_COMPLETED"] = "node.completed";
    WorkflowEventType["NODE_FAILED"] = "node.failed";
    WorkflowEventType["NODE_RETRYING"] = "node.retrying";
    WorkflowEventType["NODE_SKIPPED"] = "node.skipped";
})(WorkflowEventType || (WorkflowEventType = {}));
/**
 * Workflow event emitter — singleton that bridges the Executor
 * with all event consumers (SSE, logging, analytics).
 */
export class WorkflowEventEmitter {
    static instance = null;
    emitter;
    constructor() {
        this.emitter = new EventEmitter();
        this.emitter.setMaxListeners(50);
    }
    static getInstance() {
        if (!WorkflowEventEmitter.instance) {
            WorkflowEventEmitter.instance = new WorkflowEventEmitter();
        }
        return WorkflowEventEmitter.instance;
    }
    static resetInstance() {
        if (WorkflowEventEmitter.instance) {
            WorkflowEventEmitter.instance.emitter.removeAllListeners();
        }
        WorkflowEventEmitter.instance = null;
    }
    /**
     * Emit a workflow event.
     *
     * @param type — Event type
     * @param run — Current workflow run state
     * @param data — Event-specific data
     */
    emit(type, run, data) {
        const event = {
            type,
            workflowRunId: run.id,
            userId: run.userId,
            projectId: run.projectId,
            timestamp: new Date(),
            data: {
                ...data,
                status: run.status,
                progress: run.progress,
            },
        };
        // Emit on typed channel
        this.emitter.emit(type, event);
        // Emit on run-specific channel
        this.emitter.emit(`run:${run.id}`, event);
        // Emit on user-specific channel
        this.emitter.emit(`user:${run.userId}`, event);
        // Emit on wildcard for global subscribers
        this.emitter.emit('*', event);
    }
    /** Subscribe to all events (for SSE bridge, logging) */
    onAll(handler) {
        this.emitter.on('*', handler);
        return () => this.emitter.off('*', handler);
    }
    /** Subscribe to events for a specific workflow run */
    onRun(runId, handler) {
        const channel = `run:${runId}`;
        this.emitter.on(channel, handler);
        return () => this.emitter.off(channel, handler);
    }
    /** Subscribe to events for a specific user */
    onUser(userId, handler) {
        const channel = `user:${userId}`;
        this.emitter.on(channel, handler);
        return () => this.emitter.off(channel, handler);
    }
    /** Subscribe to a specific event type */
    onType(type, handler) {
        this.emitter.on(type, handler);
        return () => this.emitter.off(type, handler);
    }
}
//# sourceMappingURL=workflow-events.js.map