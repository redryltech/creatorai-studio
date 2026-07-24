import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { ScriptPackage } from '../../types/automation.types';
import type { VoicePackage } from '../types/media.types';
import { AutomationStage } from '../../types/automation.types';
interface VoiceGenInput {
    request: Record<string, unknown>;
    scriptPackage: ScriptPackage;
    speaker?: string;
    language?: string;
    speed?: number;
}
export declare class VoiceGenerationAgent implements IAutomationAgent<VoiceGenInput, VoicePackage[]> {
    readonly agentId = "automation.voice_gen";
    readonly agentName = "Voice Generator";
    readonly stage = AutomationStage.MEDIA;
    validate(input: VoiceGenInput): {
        valid: boolean;
        errors: string[];
    };
    estimateCost(input: VoiceGenInput): {
        costUsd: number;
        breakdown: string[];
    };
    healthCheck(): Promise<{
        healthy: boolean;
        details: string;
    }>;
    execute(input: VoiceGenInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<VoicePackage[]>;
}
export {};
//# sourceMappingURL=voice-gen-agent.d.ts.map