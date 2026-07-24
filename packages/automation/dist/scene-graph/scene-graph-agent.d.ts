import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { Storyboard } from '../storyboard/storyboard.types';
import type { CharacterDatabase } from '../character/character.types';
import type { DirectorPlan } from '../director/director.types';
import type { SceneGraphPackage } from './scene-graph.types';
export interface SceneGraphInput {
    request: Record<string, unknown>;
    storyboard: Storyboard;
    characterDatabase: CharacterDatabase;
    directorPlan?: DirectorPlan;
}
export declare class SceneGraphAgent implements IAutomationAgent<SceneGraphInput, SceneGraphPackage> {
    readonly agentId = "automation.scene_graph";
    readonly agentName = "Scene Graph Engine";
    readonly stage: AutomationStage;
    validate(input: SceneGraphInput): {
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
    execute(input: SceneGraphInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<SceneGraphPackage>;
}
//# sourceMappingURL=scene-graph-agent.d.ts.map