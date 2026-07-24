import type { ScriptPackage } from '../../types/automation.types';
import type { ImagePackage, VideoClipPackage, VoicePackage, MusicPackage } from '../../media/types/media.types';
import type { VideoTimeline, Transition, VideoEffect } from '../types/video-production.types';
import type { ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { IAutomationAgent } from '../../interfaces/automation-agent.interface';
interface TimelineInput {
    request: Record<string, unknown>;
    scriptPackage: ScriptPackage;
    images: ImagePackage[];
    videoClips: VideoClipPackage[];
    voiceovers: VoicePackage[];
    music: MusicPackage | null;
    transitions: Transition[];
    effects: VideoEffect[];
    resolution?: {
        width: number;
        height: number;
    };
    fps?: number;
}
export declare class TimelineBuilderAgent implements IAutomationAgent<TimelineInput, VideoTimeline> {
    readonly agentId = "automation.timeline_builder";
    readonly agentName = "Timeline Builder";
    readonly stage = "timeline";
    validate(input: TimelineInput): {
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
    execute(input: TimelineInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<VideoTimeline>;
}
export {};
//# sourceMappingURL=timeline-builder.d.ts.map