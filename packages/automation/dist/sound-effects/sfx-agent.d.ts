import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { SfxPackage } from './sfx.types';
export interface SfxInput {
    request: Record<string, unknown>;
    scenes: Array<{
        id: string;
        order: number;
        narration: string;
        visualNotes: string;
    }>;
    outputDir: string;
}
export declare class SfxAgent implements IAutomationAgent<SfxInput, SfxPackage> {
    readonly agentId = "automation.sound_effects";
    readonly agentName = "AI Sound Effects Engine";
    readonly stage: AutomationStage;
    validate(input: SfxInput): {
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
    execute(input: SfxInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<SfxPackage>;
}
//# sourceMappingURL=sfx-agent.d.ts.map