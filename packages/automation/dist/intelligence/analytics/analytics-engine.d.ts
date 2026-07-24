import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { AnalyticsSnapshot, AnalyticsHistory, AnalyticsPlatform, ContentScore } from '../types/intelligence.types';
interface AnalyticsInput {
    request: Record<string, unknown>;
    platformPostId: string;
    platform: AnalyticsPlatform;
    userId: string;
    projectId: string;
}
export declare class AnalyticsEngine implements IAutomationAgent<AnalyticsInput, AnalyticsSnapshot> {
    readonly agentId = "intelligence.analytics";
    readonly agentName = "Analytics Engine";
    readonly stage = "analytics";
    private history;
    private scores;
    validate(input: AnalyticsInput): {
        valid: boolean;
        errors: string[];
    };
    estimateCost(): {
        costUsd: number;
        breakdown: string[];
    };
    healthCheck(): Promise<{
        healthy: boolean;
        details: string;
    }>;
    execute(input: AnalyticsInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<AnalyticsSnapshot>;
    /** Get analytics history for a post. */
    getHistory(platformPostId: string): AnalyticsHistory | undefined;
    /** Get all tracked posts for a user. */
    getUserPosts(userId: string): AnalyticsHistory[];
    /** Score content performance relative to benchmarks. */
    scoreContent(platformPostId: string): ContentScore | undefined;
    /** Get aggregate stats for a user across all platforms. */
    getAggregateStats(userId: string): {
        totalViews: number;
        totalEngagement: number;
        avgCtr: number;
        contentCount: number;
    };
    private addToHistory;
}
export {};
//# sourceMappingURL=analytics-engine.d.ts.map