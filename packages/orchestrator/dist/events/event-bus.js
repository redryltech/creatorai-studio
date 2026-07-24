// ============================================================
// CreatorAI Studio — Event Bus
// ============================================================
// In-process event bus for decoupling pipeline state changes
// from UI updates, logging, and analytics.
//
// Uses the Observer pattern. Pipeline runner emits events,
// multiple subscribers can listen (SSE handler, logger, metrics).
//
// Future: Replace with Redis Pub/Sub or Kafka for multi-process.
// ============================================================
import { EventEmitter } from 'events';
/**
 * Pipeline event types.
 */
export var PipelineEventType;
(function (PipelineEventType) {
    // Step lifecycle
    PipelineEventType["STEP_STARTED"] = "step.started";
    PipelineEventType["STEP_PROGRESS"] = "step.progress";
    PipelineEventType["STEP_COMPLETED"] = "step.completed";
    PipelineEventType["STEP_FAILED"] = "step.failed";
    PipelineEventType["STEP_RETRYING"] = "step.retrying";
    // Pipeline lifecycle
    PipelineEventType["PIPELINE_STARTED"] = "pipeline.started";
    PipelineEventType["PIPELINE_PROGRESS"] = "pipeline.progress";
    PipelineEventType["PIPELINE_COMPLETED"] = "pipeline.completed";
    PipelineEventType["PIPELINE_FAILED"] = "pipeline.failed";
    PipelineEventType["PIPELINE_CANCELLED"] = "pipeline.cancelled";
    PipelineEventType["PIPELINE_PAUSED"] = "pipeline.paused";
    PipelineEventType["PIPELINE_RESUMED"] = "pipeline.resumed";
})(PipelineEventType || (PipelineEventType = {}));
/**
 * In-process event bus for pipeline events.
 *
 * Design decisions:
 * - Extends Node.js EventEmitter (battle-tested, zero dependencies)
 * - Typed events prevent typo bugs
 * - User-scoped subscriptions (clients only see their own events)
 * - Wildcard subscription for monitoring/logging
 */
export class PipelineEventBus {
    static instance = null;
    emitter;
    constructor() {
        this.emitter = new EventEmitter();
        this.emitter.setMaxListeners(100); // Support many concurrent clients
    }
    static getInstance() {
        if (!PipelineEventBus.instance) {
            PipelineEventBus.instance = new PipelineEventBus();
        }
        return PipelineEventBus.instance;
    }
    static resetInstance() {
        if (PipelineEventBus.instance) {
            PipelineEventBus.instance.emitter.removeAllListeners();
        }
        PipelineEventBus.instance = null;
    }
    /**
     * Emit a pipeline event.
     */
    emit(event) {
        // Emit on specific channels for targeted subscription
        this.emitter.emit(event.type, event);
        this.emitter.emit(`pipeline:${event.pipelineId}`, event);
        this.emitter.emit(`user:${event.userId}`, event);
        // Emit on wildcard for monitoring
        this.emitter.emit('*', event);
    }
    /**
     * Subscribe to events for a specific pipeline.
     * Returns an unsubscribe function.
     */
    subscribePipeline(pipelineId, listener) {
        const channel = `pipeline:${pipelineId}`;
        this.emitter.on(channel, listener);
        return () => this.emitter.off(channel, listener);
    }
    /**
     * Subscribe to all events for a specific user.
     * Returns an unsubscribe function.
     */
    subscribeUser(userId, listener) {
        const channel = `user:${userId}`;
        this.emitter.on(channel, listener);
        return () => this.emitter.off(channel, listener);
    }
    /**
     * Subscribe to a specific event type (global).
     */
    subscribeType(type, listener) {
        this.emitter.on(type, listener);
        return () => this.emitter.off(type, listener);
    }
    /**
     * Subscribe to all events (for monitoring/logging).
     */
    subscribeAll(listener) {
        this.emitter.on('*', listener);
        return () => this.emitter.off('*', listener);
    }
    /**
     * Get the number of listeners for a channel.
     */
    listenerCount(channel) {
        return this.emitter.listenerCount(channel);
    }
    // ---- Convenience emit methods ----
    emitStepStarted(pipelineId, projectId, userId, stepId, agentId) {
        this.emit({
            type: PipelineEventType.STEP_STARTED,
            pipelineId,
            projectId,
            userId,
            timestamp: new Date(),
            data: { stepId, agentId },
        });
    }
    emitStepProgress(pipelineId, projectId, userId, stepId, progress, message) {
        this.emit({
            type: PipelineEventType.STEP_PROGRESS,
            pipelineId,
            projectId,
            userId,
            timestamp: new Date(),
            data: { stepId, progress, message },
        });
    }
    emitStepCompleted(pipelineId, projectId, userId, stepId, output) {
        this.emit({
            type: PipelineEventType.STEP_COMPLETED,
            pipelineId,
            projectId,
            userId,
            timestamp: new Date(),
            data: { stepId, output },
        });
    }
    emitStepFailed(pipelineId, projectId, userId, stepId, error, retrying) {
        this.emit({
            type: PipelineEventType.STEP_FAILED,
            pipelineId,
            projectId,
            userId,
            timestamp: new Date(),
            data: { stepId, error, retrying },
        });
    }
    emitPipelineCompleted(pipelineId, projectId, userId, outputs) {
        this.emit({
            type: PipelineEventType.PIPELINE_COMPLETED,
            pipelineId,
            projectId,
            userId,
            timestamp: new Date(),
            data: { outputs },
        });
    }
    emitPipelineFailed(pipelineId, projectId, userId, error, failedStep) {
        this.emit({
            type: PipelineEventType.PIPELINE_FAILED,
            pipelineId,
            projectId,
            userId,
            timestamp: new Date(),
            data: { error, failedStep },
        });
    }
}
//# sourceMappingURL=event-bus.js.map