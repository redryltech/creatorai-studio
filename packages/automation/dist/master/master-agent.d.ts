import type { AutomationRequest, AutomationResponse } from '../types/automation.types';
export declare class MasterAgent {
    private readonly registry;
    private readonly costTracker;
    private readonly sseManager;
    private readonly activeExecutions;
    constructor();
    /**
     * Execute an automation request end-to-end.
     *
     * This is the main entry point. The Master Agent:
     * 1. Creates a plan
     * 2. Executes each stage sequentially
     * 3. Reports progress via SSE
     * 4. Handles retries and failures
     * 5. Returns the final result
     *
     * @param request — What the user wants
     * @param userId — Who's requesting
     * @param projectId — Where to store results
     * @returns Automation response with workflow ID
     */
    executeAutomation(request: AutomationRequest, userId: string, projectId: string): Promise<AutomationResponse>;
    /**
     * Cancel an active automation.
     */
    cancelAutomation(executionId: string): boolean;
    /**
     * Get active execution count.
     */
    get activeCount(): number;
    private buildPlan;
    private executeWorkflow;
    private executeTask;
    private resolveTaskInput;
    private createTask;
    private markTaskStatus;
    private createInitialMetrics;
    private updateMetrics;
    private emitEvent;
    private buildResponseMessage;
}
//# sourceMappingURL=master-agent.d.ts.map