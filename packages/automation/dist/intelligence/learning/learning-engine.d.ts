import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { LearningMemory, AnalyticsSnapshot } from '../types/intelligence.types';
interface LearningInput {
    request: Record<string, unknown>;
    analytics: AnalyticsSnapshot[];
    userId: string;
}
export declare class LearningEngine implements IAutomationAgent<LearningInput, LearningMemory[]> {
    readonly agentId = "intelligence.learning";
    readonly agentName = "Learning Engine";
    readonly stage = "learning";
    private memories;
    validate(input: LearningInput): {
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
    execute(input: LearningInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<LearningMemory[]>;
    /** Get all learned patterns for a user. */
    getUserMemories(userId: string): LearningMemory[];
    /** Get top patterns by category. */
    getTopPatterns(userId: string, category: LearningMemory['category'], limit?: number): LearningMemory[];
}
export {};
//# sourceMappingURL=learning-engine.d.ts.map