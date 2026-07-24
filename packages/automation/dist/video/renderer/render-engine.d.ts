import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { VideoTimeline, CaptionPackage, RenderResult } from '../types/video-production.types';
type RenderQuality = '720p' | '1080p' | '4k';
type RenderOrientation = 'vertical' | 'horizontal' | 'square';
interface RenderInput {
    request: Record<string, unknown>;
    timeline: VideoTimeline;
    captions: CaptionPackage;
    quality?: RenderQuality;
    orientation?: RenderOrientation;
}
export declare class RenderEngineAgent implements IAutomationAgent<RenderInput, RenderResult> {
    readonly agentId = "automation.render";
    readonly agentName = "Render Engine";
    readonly stage = "rendering";
    validate(input: RenderInput): {
        valid: boolean;
        errors: string[];
    };
    estimateCost(input: RenderInput): {
        costUsd: number;
        breakdown: string[];
    };
    healthCheck(): Promise<{
        healthy: boolean;
        details: string;
    }>;
    execute(input: RenderInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<RenderResult>;
}
export {};
//# sourceMappingURL=render-engine.d.ts.map