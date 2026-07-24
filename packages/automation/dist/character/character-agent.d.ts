import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { Storyboard } from '../storyboard/storyboard.types';
import type { DirectorPlan } from '../director/director.types';
import type { CharacterDatabase } from './character.types';
export interface CharacterInput {
    request: Record<string, unknown>;
    storyboard: Storyboard;
    directorPlan?: DirectorPlan;
    baseSeed?: number;
}
export declare class CharacterAgent implements IAutomationAgent<CharacterInput, CharacterDatabase> {
    readonly agentId = "automation.character";
    readonly agentName = "Character Consistency Engine";
    readonly stage: AutomationStage;
    validate(input: CharacterInput): {
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
    execute(input: CharacterInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<CharacterDatabase>;
}
//# sourceMappingURL=character-agent.d.ts.map