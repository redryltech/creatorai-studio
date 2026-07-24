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
import type { WorkflowRun } from '../planner/workflow.types';

export enum WorkflowEventType {
  WORKFLOW_CREATED = 'workflow.created',
  WORKFLOW_STARTED = 'workflow.started',
  WORKFLOW_COMPLETED = 'workflow.completed',
  WORKFLOW_FAILED = 'workflow.failed',
  WORKFLOW_CANCELLED = 'workflow.cancelled',
  WORKFLOW_PAUSED = 'workflow.paused',
  WORKFLOW_RESUMED = 'workflow.resumed',

  NODE_STARTED = 'node.started',
  NODE_PROGRESS = 'node.progress',
  NODE_COMPLETED = 'node.completed',
  NODE_FAILED = 'node.failed',
  NODE_RETRYING = 'node.retrying',
  NODE_SKIPPED = 'node.skipped',
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
export class WorkflowEventEmitter {
  private static instance: WorkflowEventEmitter | null = null;
  private emitter: EventEmitter;

  private constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(50);
  }

  static getInstance(): WorkflowEventEmitter {
    if (!WorkflowEventEmitter.instance) {
      WorkflowEventEmitter.instance = new WorkflowEventEmitter();
    }
    return WorkflowEventEmitter.instance;
  }

  static resetInstance(): void {
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
  emit(type: WorkflowEventType, run: WorkflowRun, data: Record<string, unknown>): void {
    const event: WorkflowEvent = {
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
  onAll(handler: WorkflowEventHandler): () => void {
    this.emitter.on('*', handler);
    return () => this.emitter.off('*', handler);
  }

  /** Subscribe to events for a specific workflow run */
  onRun(runId: string, handler: WorkflowEventHandler): () => void {
    const channel = `run:${runId}`;
    this.emitter.on(channel, handler);
    return () => this.emitter.off(channel, handler);
  }

  /** Subscribe to events for a specific user */
  onUser(userId: string, handler: WorkflowEventHandler): () => void {
    const channel = `user:${userId}`;
    this.emitter.on(channel, handler);
    return () => this.emitter.off(channel, handler);
  }

  /** Subscribe to a specific event type */
  onType(type: WorkflowEventType, handler: WorkflowEventHandler): () => void {
    this.emitter.on(type, handler);
    return () => this.emitter.off(type, handler);
  }
}
