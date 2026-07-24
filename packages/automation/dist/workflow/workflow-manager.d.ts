import type { WorkflowExecution } from '../types/automation.types';
export declare class WorkflowManager {
    private static instance;
    private workflows;
    private constructor();
    static getInstance(): WorkflowManager;
    static resetInstance(): void;
    /** Store a workflow execution. */
    store(workflow: WorkflowExecution): void;
    /** Get a workflow by ID. */
    get(workflowId: string): WorkflowExecution | undefined;
    /** Get all workflows for a user. */
    getByUser(userId: string): WorkflowExecution[];
    /** Get active workflows for a user. */
    getActive(userId: string): WorkflowExecution[];
    /** Get workflow summary for the dashboard. */
    getSummary(): {
        total: number;
        running: number;
        completed: number;
        failed: number;
        paused: number;
    };
    /** Pause a workflow (sets status, Master Agent checks this). */
    pause(workflowId: string): boolean;
    /** Resume a paused workflow. */
    resume(workflowId: string): boolean;
    /** Get workflow count. */
    get size(): number;
    /** Cleanup completed workflows older than maxAge. */
    cleanup(maxAgeMs?: number): number;
}
//# sourceMappingURL=workflow-manager.d.ts.map