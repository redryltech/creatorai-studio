import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { ThumbnailPackage } from './thumbnail.types';
export interface ThumbnailInput {
    request: Record<string, unknown>;
    topic: string;
    videoPath: string | null;
    bestFrameTimeSec: number;
    colorPalette: string[];
    category: string;
    outputDir?: string;
}
export declare class ThumbnailAgent implements IAutomationAgent<ThumbnailInput, ThumbnailPackage> {
    readonly agentId = "automation.thumbnail";
    readonly agentName = "AI Thumbnail Generator";
    readonly stage: AutomationStage;
    validate(input: ThumbnailInput): {
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
    execute(input: ThumbnailInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<ThumbnailPackage>;
}
//# sourceMappingURL=thumbnail-agent.d.ts.map