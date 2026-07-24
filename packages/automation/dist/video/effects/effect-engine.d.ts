import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { ScriptPackage } from '../../types/automation.types';
import type { VoicePackage } from '../../media/types/media.types';
import type { VideoEffect } from '../types/video-production.types';
interface EffectInput {
    request: Record<string, unknown>;
    scriptPackage: ScriptPackage;
    voiceovers: VoicePackage[];
}
export declare class EffectEngineAgent implements IAutomationAgent<EffectInput, VideoEffect[]> {
    readonly agentId = "automation.effects";
    readonly agentName = "Effect Engine";
    readonly stage = "effects";
    validate(input: EffectInput): {
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
    execute(input: EffectInput, onProgress: ProgressCallback, _cancellation: CancellationToken): Promise<VideoEffect[]>;
}
export {};
//# sourceMappingURL=effect-engine.d.ts.map