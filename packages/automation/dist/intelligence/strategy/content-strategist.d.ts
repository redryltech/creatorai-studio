import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { StrategyRecommendation, LearningMemory, AnalyticsSnapshot, TrendReport } from '../types/intelligence.types';
interface StrategyInput {
    request: Record<string, unknown>;
    userId: string;
    learnings: LearningMemory[];
    recentAnalytics: AnalyticsSnapshot[];
    trendReport: TrendReport | null;
}
export declare class ContentStrategistAgent implements IAutomationAgent<StrategyInput, StrategyRecommendation[]> {
    readonly agentId = "intelligence.strategist";
    readonly agentName = "Content Strategist";
    readonly stage = "strategy";
    validate(input: StrategyInput): {
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
    execute(input: StrategyInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<StrategyRecommendation[]>;
}
export {};
//# sourceMappingURL=content-strategist.d.ts.map