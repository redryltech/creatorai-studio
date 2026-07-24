import type { AgentContext, AgentResult, CostEstimate, HealthCheckResult, ValidationResult } from '@creatorai/shared';
import type { IAgent, AgentStatus, AgentMetadata } from './agent.interface';
import { Logger } from '../infrastructure/logger';
import { CostTracker } from '../infrastructure/cost/cost-tracker';
export declare abstract class BaseAgent<TInput, TOutput> implements IAgent<TInput, TOutput> {
    abstract readonly id: string;
    abstract readonly name: string;
    abstract readonly version: string;
    abstract readonly description: string;
    protected readonly log: Logger;
    protected readonly costTracker: CostTracker;
    private _status;
    constructor();
    /**
     * Lazy logger that includes the agent ID.
     * First call after construction creates the real logger.
     */
    private getLog;
    validate(input: TInput): Promise<ValidationResult>;
    execute(input: TInput, context: AgentContext): Promise<AgentResult<TOutput>>;
    rollback(context: AgentContext): Promise<void>;
    getStatus(): AgentStatus;
    estimateCost(input: TInput): Promise<CostEstimate>;
    healthCheck(): Promise<HealthCheckResult>;
    abstract getMetadata(): AgentMetadata;
    protected abstract doValidate(input: TInput): Promise<ValidationResult>;
    protected abstract doExecute(input: TInput, context: AgentContext): Promise<{
        data: TOutput;
        metrics?: {
            tokensUsed?: number;
            costUsd?: number;
            provider?: string;
        };
    }>;
    protected abstract doRollback(context: AgentContext): Promise<void>;
    protected abstract doEstimateCost(input: TInput): Promise<CostEstimate>;
    protected abstract doHealthCheck(): Promise<HealthCheckResult>;
    protected updateStatus(progress: number, operation: string): void;
    protected reportProgress(context: AgentContext, progress: number, message?: string): void;
}
//# sourceMappingURL=base-agent.d.ts.map