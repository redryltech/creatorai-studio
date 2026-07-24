import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { SceneGraphPackage } from '../scene-graph/scene-graph.types';
import type { CharacterDatabase } from '../character/character.types';
import type { DirectorPlan } from '../director/director.types';
import type { Storyboard } from '../storyboard/storyboard.types';
import type { WorldStatePackage } from './world-state.types';
export interface WorldStateInput {
    request: Record<string, unknown>;
    sceneGraphPackage: SceneGraphPackage;
    characterDatabase: CharacterDatabase;
    storyboard: Storyboard;
    directorPlan?: DirectorPlan;
}
export declare class WorldStateAgent implements IAutomationAgent<WorldStateInput, WorldStatePackage> {
    readonly agentId = "automation.world_state";
    readonly agentName = "World State Engine";
    readonly stage: AutomationStage;
    validate(input: WorldStateInput): {
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
    execute(input: WorldStateInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<WorldStatePackage>;
}
//# sourceMappingURL=world-state-agent.d.ts.map