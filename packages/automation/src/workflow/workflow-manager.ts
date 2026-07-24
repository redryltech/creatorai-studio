// ============================================================
// CreatorAI Studio — Automation Workflow Manager
// ============================================================
// Manages workflow state, provides query APIs, and handles
// lifecycle operations (pause, resume, cancel, retry).
// ============================================================

import { Logger } from '@creatorai/agents';
import type { WorkflowExecution, WorkflowMetrics } from '../types/automation.types';
import { TaskStatus } from '../types/automation.types';

const log = Logger.for('WorkflowManager');

export class WorkflowManager {
  private static instance: WorkflowManager | null = null;
  private workflows: Map<string, WorkflowExecution> = new Map();

  private constructor() {}

  static getInstance(): WorkflowManager {
    if (!WorkflowManager.instance) {
      WorkflowManager.instance = new WorkflowManager();
    }
    return WorkflowManager.instance;
  }

  static resetInstance(): void { WorkflowManager.instance = null; }

  /** Store a workflow execution. */
  store(workflow: WorkflowExecution): void {
    this.workflows.set(workflow.id, workflow);
    log.debug('Workflow stored', { workflowId: workflow.id, status: workflow.status });
  }

  /** Get a workflow by ID. */
  get(workflowId: string): WorkflowExecution | undefined {
    return this.workflows.get(workflowId);
  }

  /** Get all workflows for a user. */
  getByUser(userId: string): WorkflowExecution[] {
    return Array.from(this.workflows.values())
      .filter((w) => w.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /** Get active workflows for a user. */
  getActive(userId: string): WorkflowExecution[] {
    return this.getByUser(userId).filter(
      (w) => w.status === TaskStatus.RUNNING || w.status === TaskStatus.PAUSED || w.status === TaskStatus.RETRYING,
    );
  }

  /** Get workflow summary for the dashboard. */
  getSummary(): {
    total: number;
    running: number;
    completed: number;
    failed: number;
    paused: number;
  } {
    const all = Array.from(this.workflows.values());
    return {
      total: all.length,
      running: all.filter((w) => w.status === TaskStatus.RUNNING).length,
      completed: all.filter((w) => w.status === TaskStatus.COMPLETED).length,
      failed: all.filter((w) => w.status === TaskStatus.FAILED).length,
      paused: all.filter((w) => w.status === TaskStatus.PAUSED).length,
    };
  }

  /** Pause a workflow (sets status, Master Agent checks this). */
  pause(workflowId: string): boolean {
    const wf = this.workflows.get(workflowId);
    if (!wf || wf.status !== TaskStatus.RUNNING) return false;
    wf.status = TaskStatus.PAUSED;
    wf.updatedAt = new Date();
    log.info('Workflow paused', { workflowId });
    return true;
  }

  /** Resume a paused workflow. */
  resume(workflowId: string): boolean {
    const wf = this.workflows.get(workflowId);
    if (!wf || wf.status !== TaskStatus.PAUSED) return false;
    wf.status = TaskStatus.RUNNING;
    wf.updatedAt = new Date();
    log.info('Workflow resumed', { workflowId });
    return true;
  }

  /** Get workflow count. */
  get size(): number { return this.workflows.size; }

  /** Cleanup completed workflows older than maxAge. */
  cleanup(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - maxAgeMs;
    let removed = 0;
    for (const [id, wf] of this.workflows) {
      if (wf.completedAt && wf.completedAt.getTime() < cutoff) {
        this.workflows.delete(id);
        removed++;
      }
    }
    return removed;
  }
}
