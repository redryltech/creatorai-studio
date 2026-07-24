import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { ScriptPackage } from '../../types/automation.types';
import type { MusicPackage } from '../types/media.types';
import { AutomationStage } from '../../types/automation.types';
interface MusicInput {
    request: Record<string, unknown>;
    scriptPackage: ScriptPackage;
    totalDuration: number;
}
export declare class MusicAgent implements IAutomationAgent<MusicInput, MusicPackage> {
    readonly agentId = "automation.music";
    readonly agentName = "Music Agent";
    readonly stage = AutomationStage.MEDIA;
    validate(input: MusicInput): {
        valid: boolean;
        errors: string[];
    };
    estimateCost(_input: MusicInput): {
        costUsd: number;
        breakdown: string[];
    };
    healthCheck(): Promise<{
        healthy: boolean;
        details: string;
    }>;
    execute(input: MusicInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<MusicPackage>;
}
export {};
//# sourceMappingURL=music-agent.d.ts.map