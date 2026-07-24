/**
 * Pipeline event types.
 */
export declare enum PipelineEventType {
    STEP_STARTED = "step.started",
    STEP_PROGRESS = "step.progress",
    STEP_COMPLETED = "step.completed",
    STEP_FAILED = "step.failed",
    STEP_RETRYING = "step.retrying",
    PIPELINE_STARTED = "pipeline.started",
    PIPELINE_PROGRESS = "pipeline.progress",
    PIPELINE_COMPLETED = "pipeline.completed",
    PIPELINE_FAILED = "pipeline.failed",
    PIPELINE_CANCELLED = "pipeline.cancelled",
    PIPELINE_PAUSED = "pipeline.paused",
    PIPELINE_RESUMED = "pipeline.resumed"
}
/**
 * Pipeline event payload.
 */
export interface PipelineEventPayload {
    type: PipelineEventType;
    pipelineId: string;
    projectId: string;
    userId: string;
    timestamp: Date;
    data: Record<string, unknown>;
}
/**
 * Event listener callback type.
 */
export type PipelineEventListener = (event: PipelineEventPayload) => void;
/**
 * In-process event bus for pipeline events.
 *
 * Design decisions:
 * - Extends Node.js EventEmitter (battle-tested, zero dependencies)
 * - Typed events prevent typo bugs
 * - User-scoped subscriptions (clients only see their own events)
 * - Wildcard subscription for monitoring/logging
 */
export declare class PipelineEventBus {
    private static instance;
    private emitter;
    private constructor();
    static getInstance(): PipelineEventBus;
    static resetInstance(): void;
    /**
     * Emit a pipeline event.
     */
    emit(event: PipelineEventPayload): void;
    /**
     * Subscribe to events for a specific pipeline.
     * Returns an unsubscribe function.
     */
    subscribePipeline(pipelineId: string, listener: PipelineEventListener): () => void;
    /**
     * Subscribe to all events for a specific user.
     * Returns an unsubscribe function.
     */
    subscribeUser(userId: string, listener: PipelineEventListener): () => void;
    /**
     * Subscribe to a specific event type (global).
     */
    subscribeType(type: PipelineEventType, listener: PipelineEventListener): () => void;
    /**
     * Subscribe to all events (for monitoring/logging).
     */
    subscribeAll(listener: PipelineEventListener): () => void;
    /**
     * Get the number of listeners for a channel.
     */
    listenerCount(channel: string): number;
    emitStepStarted(pipelineId: string, projectId: string, userId: string, stepId: string, agentId: string): void;
    emitStepProgress(pipelineId: string, projectId: string, userId: string, stepId: string, progress: number, message?: string): void;
    emitStepCompleted(pipelineId: string, projectId: string, userId: string, stepId: string, output: Record<string, unknown>): void;
    emitStepFailed(pipelineId: string, projectId: string, userId: string, stepId: string, error: string, retrying: boolean): void;
    emitPipelineCompleted(pipelineId: string, projectId: string, userId: string, outputs: Record<string, unknown>): void;
    emitPipelineFailed(pipelineId: string, projectId: string, userId: string, error: string, failedStep: string | null): void;
}
//# sourceMappingURL=event-bus.d.ts.map