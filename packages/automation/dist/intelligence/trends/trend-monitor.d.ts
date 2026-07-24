import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { TrendReport } from '../types/intelligence.types';
interface TrendInput {
    request: Record<string, unknown>;
    userId: string;
    niche: string;
    platforms: string[];
}
export declare class TrendMonitorAgent implements IAutomationAgent<TrendInput, TrendReport> {
    readonly agentId = "intelligence.trends";
    readonly agentName = "Trend Monitor";
    readonly stage = "trends";
    validate(input: TrendInput): {
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
    execute(input: TrendInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<TrendReport>;
}
export {};
//# sourceMappingURL=trend-monitor.d.ts.map