import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { ScriptPackage } from '../../types/automation.types';
import type { VoicePackage } from '../../media/types/media.types';
import type { CaptionPackage, CaptionStyle } from '../types/video-production.types';
interface CaptionInput {
    request: Record<string, unknown>;
    scriptPackage: ScriptPackage;
    voiceovers: VoicePackage[];
    platform: string;
    style?: Partial<CaptionStyle>;
}
export declare class CaptionGeneratorAgent implements IAutomationAgent<CaptionInput, CaptionPackage> {
    readonly agentId = "automation.caption_gen";
    readonly agentName = "Caption Generator";
    readonly stage = "captions";
    validate(input: CaptionInput): {
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
    execute(input: CaptionInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<CaptionPackage>;
    private generateSRT;
    private generateVTT;
    private formatTime;
}
export {};
//# sourceMappingURL=caption-generator.d.ts.map