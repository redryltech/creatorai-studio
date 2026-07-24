import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { VideoTimeline, CaptionPackage, RenderResult, QualityReport } from '../types/video-production.types';
import type { ImagePackage, VoicePackage } from '../../media/types/media.types';
interface QualityInput {
    request: Record<string, unknown>;
    timeline: VideoTimeline;
    captions: CaptionPackage;
    renderResult: RenderResult;
    images: ImagePackage[];
    voiceovers: VoicePackage[];
}
export declare class QualityCheckerAgent implements IAutomationAgent<QualityInput, QualityReport> {
    readonly agentId = "automation.quality_check";
    readonly agentName = "Quality Checker";
    readonly stage = "quality";
    validate(input: QualityInput): {
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
    execute(input: QualityInput, onProgress: ProgressCallback, _cancellation: CancellationToken): Promise<QualityReport>;
}
export {};
//# sourceMappingURL=quality-checker.d.ts.map