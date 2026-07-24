import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { OptimizedPromptPackage, ImagePackage, VideoClipPackage } from '../types/media.types';
import { AutomationStage } from '../../types/automation.types';
interface VideoGenInput {
    request: Record<string, unknown>;
    prompts: OptimizedPromptPackage;
    images: ImagePackage[];
    clipDuration?: number;
}
export declare class VideoGenerationAgent implements IAutomationAgent<VideoGenInput, VideoClipPackage[]> {
    readonly agentId = "automation.video_gen";
    readonly agentName = "Video Generator";
    readonly stage = AutomationStage.MEDIA;
    validate(input: VideoGenInput): {
        valid: boolean;
        errors: string[];
    };
    estimateCost(input: VideoGenInput): {
        costUsd: number;
        breakdown: string[];
    };
    healthCheck(): Promise<{
        healthy: boolean;
        details: string;
    }>;
    execute(input: VideoGenInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<VideoClipPackage[]>;
}
export {};
//# sourceMappingURL=video-gen-agent.d.ts.map