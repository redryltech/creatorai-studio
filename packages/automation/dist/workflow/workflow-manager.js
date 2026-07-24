// ============================================================
// CreatorAI Studio — Automation Workflow Manager
// ============================================================
// Manages workflow state, provides query APIs, and handles
// lifecycle operations (pause, resume, cancel, retry).
// ============================================================
import { Logger } from '@creatorai/agents';
import { TaskStatus } from '../types/automation.types';
const log = Logger.for('WorkflowManager');
export class WorkflowManager {
    static instance = null;
    workflows = new Map();
    constructor() { }
    static getInstance() {
        if (!WorkflowManager.instance) {
            WorkflowManager.instance = new WorkflowManager();
        }
        return WorkflowManager.instance;
    }
    static resetInstance() { WorkflowManager.instance = null; }
    /** Store a workflow execution. */
    store(workflow) {
        this.workflows.set(workflow.id, workflow);
        log.debug('Workflow stored', { workflowId: workflow.id, status: workflow.status });
    }
    /** Get a workflow by ID. */
    get(workflowId) {
        return this.workflows.get(workflowId);
    }
    /** Get all workflows for a user. */
    getByUser(userId) {
        return Array.from(this.workflows.values())
            .filter((w) => w.userId === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    /** Get active workflows for a user. */
    getActive(userId) {
        return this.getByUser(userId).filter((w) => w.status === TaskStatus.RUNNING || w.status === TaskStatus.PAUSED || w.status === TaskStatus.RETRYING);
    }
    /** Get workflow summary for the dashboard. */
    getSummary() {
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
    pause(workflowId) {
        const wf = this.workflows.get(workflowId);
        if (!wf || wf.status !== TaskStatus.RUNNING)
            return false;
        wf.status = TaskStatus.PAUSED;
        wf.updatedAt = new Date();
        log.info('Workflow paused', { workflowId });
        return true;
    }
    /** Resume a paused workflow. */
    resume(workflowId) {
        const wf = this.workflows.get(workflowId);
        if (!wf || wf.status !== TaskStatus.PAUSED)
            return false;
        wf.status = TaskStatus.RUNNING;
        wf.updatedAt = new Date();
        log.info('Workflow resumed', { workflowId });
        return true;
    }
    /** Get workflow count. */
    get size() { return this.workflows.size; }
    /** Cleanup completed workflows older than maxAge. */
    cleanup(maxAgeMs = 24 * 60 * 60 * 1000) {
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
//# sourceMappingURL=workflow-manager.js.map