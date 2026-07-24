import type { CostRecord, ModelPricing, TokenUsage } from '@creatorai/shared';
export declare class CostTracker {
    private static instance;
    private pricing;
    private records;
    private flushCallback;
    private flushInterval;
    private constructor();
    static getInstance(): CostTracker;
    static resetInstance(): void;
    /**
     * Set the callback for persisting cost records to the database.
     * Records are batched and flushed periodically to avoid per-call writes.
     */
    setFlushCallback(callback: (records: CostRecord[]) => Promise<void>, intervalMs?: number): void;
    /**
     * Calculate and record the cost of an LLM completion.
     */
    trackLLMUsage(params: {
        userId: string;
        projectId: string | null;
        pipelineId: string | null;
        agentId: string;
        providerId: string;
        model: string;
        tokens: TokenUsage;
    }): CostRecord;
    /**
     * Record the cost of image generation.
     */
    trackImageGeneration(params: {
        userId: string;
        projectId: string | null;
        pipelineId: string | null;
        agentId: string;
        providerId: string;
        model: string;
        imageCount: number;
    }): CostRecord;
    /**
     * Record the cost of video generation.
     */
    trackVideoGeneration(params: {
        userId: string;
        projectId: string | null;
        pipelineId: string | null;
        agentId: string;
        providerId: string;
        model: string;
        durationSeconds: number;
    }): CostRecord;
    /**
     * Record the cost of voice synthesis.
     */
    trackVoiceSynthesis(params: {
        userId: string;
        projectId: string | null;
        pipelineId: string | null;
        agentId: string;
        providerId: string;
        model: string;
        characterCount: number;
    }): CostRecord;
    /**
     * Get total cost for a pipeline.
     */
    getPipelineCost(pipelineId: string): number;
    /**
     * Get total cost for a user in the current month.
     */
    getUserMonthlyCost(userId: string): number;
    /**
     * Flush accumulated records to persistent storage.
     */
    flush(): Promise<void>;
    /**
     * Update pricing for a model (e.g., when a provider changes prices).
     */
    updatePricing(pricing: ModelPricing): void;
    private getPricing;
    private record;
}
//# sourceMappingURL=cost-tracker.d.ts.map