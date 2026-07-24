import type { AgentContext, ValidationResult, CostEstimate, HealthCheckResult, ComposedVideo, ImageResult, VoiceResult, ScriptScene } from '@creatorai/shared';
import { AgentId } from '@creatorai/shared';
import { BaseAgent } from '../core/base-agent';
import type { AgentMetadata } from '../core/agent.interface';
export interface EditorAgentInput {
    /** Project identifier for storage paths */
    projectId: string;
    userId: string;
    /** Script scenes with narration text (for subtitle generation) */
    scenes: ScriptScene[];
    /** Generated images — one per scene */
    images: ImageResult[];
    /** Generated voiceovers — one per scene */
    voiceovers: Array<VoiceResult & {
        sceneId: string;
    }>;
    /** Video settings */
    settings: {
        width: number;
        height: number;
        fps: number;
        format: 'mp4';
        codec: 'h264';
    };
    /** Subtitle configuration */
    subtitles: {
        enabled: boolean;
        fontSize: number;
        fontColor: string;
        strokeColor: string;
        position: 'bottom' | 'center';
    };
    /** Background music */
    music: {
        enabled: boolean;
        volume: number;
        url?: string;
    };
    /** Transition between scenes */
    transition: {
        type: 'cut' | 'crossfade' | 'fade_black';
        durationSec: number;
    };
}
export type EditorAgentOutput = ComposedVideo;
export declare class EditorAgent extends BaseAgent<EditorAgentInput, EditorAgentOutput> {
    readonly id = AgentId.EDITOR;
    readonly name = "Video Composer";
    readonly version = "1.0.0";
    readonly description = "Composes final MP4 videos from images, voiceovers, subtitles, and music using FFmpeg";
    getMetadata(): AgentMetadata;
    protected doValidate(input: EditorAgentInput): Promise<ValidationResult>;
    protected doExecute(input: EditorAgentInput, context: AgentContext): Promise<{
        data: EditorAgentOutput;
        metrics?: {
            tokensUsed?: number;
            costUsd?: number;
            provider?: string;
        };
    }>;
    protected doRollback(context: AgentContext): Promise<void>;
    protected doEstimateCost(_input: EditorAgentInput): Promise<CostEstimate>;
    protected doHealthCheck(): Promise<HealthCheckResult>;
    /**
     * Generate SRT subtitle file from scenes and voiceover timings.
     */
    private generateSRT;
    private formatSRTTime;
}
//# sourceMappingURL=editor.agent.d.ts.map