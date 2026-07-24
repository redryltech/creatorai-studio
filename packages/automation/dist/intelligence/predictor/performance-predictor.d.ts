import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { PerformancePrediction, LearningMemory, AnalyticsPlatform } from '../types/intelligence.types';
interface PredictorInput {
    request: Record<string, unknown>;
    userId: string;
    title: string;
    hookText: string;
    platform: AnalyticsPlatform;
    duration: number;
    learnings: LearningMemory[];
}
export declare class PerformancePredictorAgent implements IAutomationAgent<PredictorInput, PerformancePrediction> {
    readonly agentId = "intelligence.predictor";
    readonly agentName = "Performance Predictor";
    readonly stage = "prediction";
    validate(input: PredictorInput): {
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
    execute(input: PredictorInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<PerformancePrediction>;
}
export {};
//# sourceMappingURL=performance-predictor.d.ts.map