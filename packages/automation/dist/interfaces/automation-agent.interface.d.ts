/**
 * Progress callback — agents report progress through this.
 */
export type ProgressCallback = (progress: number, message: string) => void;
/**
 * Cancellation token — checked by agents during execution.
 */
export interface CancellationToken {
    readonly isCancelled: boolean;
}
/**
 * Every automation agent implements this interface.
 * The interface is intentionally generic to support any agent type.
 */
export interface IAutomationAgent<TInput, TOutput> {
    /** Unique agent identifier */
    readonly agentId: string;
    /** Human-readable name */
    readonly agentName: string;
    /** Which automation stage this agent belongs to */
    readonly stage: string;
    /**
     * Execute the agent's primary function.
     *
     * @param input — Strongly typed input
     * @param onProgress — Progress reporting callback
     * @param cancellation — Cancellation token
     * @returns Strongly typed output
     */
    execute(input: TInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<TOutput>;
    /**
     * Validate input before execution.
     * Should be fast — no I/O, no API calls.
     */
    validate(input: TInput): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Estimate cost before execution.
     */
    estimateCost(input: TInput): {
        costUsd: number;
        breakdown: string[];
    };
    /**
     * Check if this agent's dependencies are healthy.
     */
    healthCheck(): Promise<{
        healthy: boolean;
        details: string;
    }>;
}
/**
 * Research provider interface — pluggable data sources.
 * Each research source (Google Trends, YouTube, Reddit, etc.)
 * implements this interface independently.
 */
export interface IResearchProvider {
    readonly providerId: string;
    readonly providerName: string;
    readonly category: 'trends' | 'social' | 'search' | 'news' | 'competitor';
    research(query: string, options: Record<string, unknown>): Promise<Record<string, unknown>>;
    isAvailable(): Promise<boolean>;
}
//# sourceMappingURL=automation-agent.interface.d.ts.map