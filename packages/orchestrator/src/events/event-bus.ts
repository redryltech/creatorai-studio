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
export enum PipelineEventType {
  // Step lifecycle
  STEP_STARTED = 'step.started',
  STEP_PROGRESS = 'step.progress',
  STEP_COMPLETED = 'step.completed',
  STEP_FAILED = 'step.failed',
  STEP_RETRYING = 'step.retrying',

  // Pipeline lifecycle
  PIPELINE_STARTED = 'pipeline.started',
  PIPELINE_PROGRESS = 'pipeline.progress',
  PIPELINE_COMPLETED = 'pipeline.completed',
  PIPELINE_FAILED = 'pipeline.failed',
  PIPELINE_CANCELLED = 'pipeline.cancelled',
  PIPELINE_PAUSED = 'pipeline.paused',
  PIPELINE_RESUMED = 'pipeline.resumed',
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
export class PipelineEventBus {
  private static instance: PipelineEventBus | null = null;
  private emitter: EventEmitter;

  private constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100); // Support many concurrent clients
  }

  static getInstance(): PipelineEventBus {
    if (!PipelineEventBus.instance) {
      PipelineEventBus.instance = new PipelineEventBus();
    }
    return PipelineEventBus.instance;
  }

  static resetInstance(): void {
    if (PipelineEventBus.instance) {
      PipelineEventBus.instance.emitter.removeAllListeners();
    }
    PipelineEventBus.instance = null;
  }

  /**
   * Emit a pipeline event.
   */
  emit(event: PipelineEventPayload): void {
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
  subscribePipeline(pipelineId: string, listener: PipelineEventListener): () => void {
    const channel = `pipeline:${pipelineId}`;
    this.emitter.on(channel, listener);
    return () => this.emitter.off(channel, listener);
  }

  /**
   * Subscribe to all events for a specific user.
   * Returns an unsubscribe function.
   */
  subscribeUser(userId: string, listener: PipelineEventListener): () => void {
    const channel = `user:${userId}`;
    this.emitter.on(channel, listener);
    return () => this.emitter.off(channel, listener);
  }

  /**
   * Subscribe to a specific event type (global).
   */
  subscribeType(type: PipelineEventType, listener: PipelineEventListener): () => void {
    this.emitter.on(type, listener);
    return () => this.emitter.off(type, listener);
  }

  /**
   * Subscribe to all events (for monitoring/logging).
   */
  subscribeAll(listener: PipelineEventListener): () => void {
    this.emitter.on('*', listener);
    return () => this.emitter.off('*', listener);
  }

  /**
   * Get the number of listeners for a channel.
   */
  listenerCount(channel: string): number {
    return this.emitter.listenerCount(channel);
  }

  // ---- Convenience emit methods ----

  emitStepStarted(
    pipelineId: string,
    projectId: string,
    userId: string,
    stepId: string,
    agentId: string,
  ): void {
    this.emit({
      type: PipelineEventType.STEP_STARTED,
      pipelineId,
      projectId,
      userId,
      timestamp: new Date(),
      data: { stepId, agentId },
    });
  }

  emitStepProgress(
    pipelineId: string,
    projectId: string,
    userId: string,
    stepId: string,
    progress: number,
    message?: string,
  ): void {
    this.emit({
      type: PipelineEventType.STEP_PROGRESS,
      pipelineId,
      projectId,
      userId,
      timestamp: new Date(),
      data: { stepId, progress, message },
    });
  }

  emitStepCompleted(
    pipelineId: string,
    projectId: string,
    userId: string,
    stepId: string,
    output: Record<string, unknown>,
  ): void {
    this.emit({
      type: PipelineEventType.STEP_COMPLETED,
      pipelineId,
      projectId,
      userId,
      timestamp: new Date(),
      data: { stepId, output },
    });
  }

  emitStepFailed(
    pipelineId: string,
    projectId: string,
    userId: string,
    stepId: string,
    error: string,
    retrying: boolean,
  ): void {
    this.emit({
      type: PipelineEventType.STEP_FAILED,
      pipelineId,
      projectId,
      userId,
      timestamp: new Date(),
      data: { stepId, error, retrying },
    });
  }

  emitPipelineCompleted(
    pipelineId: string,
    projectId: string,
    userId: string,
    outputs: Record<string, unknown>,
  ): void {
    this.emit({
      type: PipelineEventType.PIPELINE_COMPLETED,
      pipelineId,
      projectId,
      userId,
      timestamp: new Date(),
      data: { outputs },
    });
  }

  emitPipelineFailed(
    pipelineId: string,
    projectId: string,
    userId: string,
    error: string,
    failedStep: string | null,
  ): void {
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
