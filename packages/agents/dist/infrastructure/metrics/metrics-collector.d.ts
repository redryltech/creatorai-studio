import type { MetricPoint, MetricsSummary } from '@creatorai/shared';
export declare class MetricsCollector {
    private static instance;
    private points;
    private cleanupTimer;
    private constructor();
    static getInstance(): MetricsCollector;
    static resetInstance(): void;
    /** Record a single metric data point. */
    record(name: string, value: number, unit: MetricPoint['unit'], tags?: Record<string, string>): void;
    recordAgentDuration(agentId: string, durationMs: number): void;
    recordAgentSuccess(agentId: string): void;
    recordAgentFailure(agentId: string): void;
    recordProviderLatency(providerId: string, latencyMs: number): void;
    recordProviderError(providerId: string): void;
    recordTokenUsage(agentId: string, providerId: string, model: string, tokens: number): void;
    recordCost(agentId: string, providerId: string, model: string, costUsd: number): void;
    recordWorkflowCompleted(durationMs: number, costUsd: number): void;
    recordWorkflowFailed(): void;
    /** Generate a summary for a given time period. */
    getSummary(period?: MetricsSummary['period']): MetricsSummary;
    /** Get raw points for a specific metric (for charts). */
    getTimeSeries(name: string, periodHours?: number): MetricPoint[];
    get pointCount(): number;
    private aggregateWorkflows;
    private aggregateAgents;
    private aggregateProviders;
    private aggregateCosts;
    private aggregateUsage;
    private periodToMs;
    private cleanup;
}
//# sourceMappingURL=metrics-collector.d.ts.map