import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { DirectorPlan } from '../director/director.types';
import type { Storyboard } from '../storyboard/storyboard.types';
import type { CharacterDatabase } from '../character/character.types';
import type { SceneGraphPackage } from '../scene-graph/scene-graph.types';
import type { WorldStatePackage } from '../world-state/world-state.types';
import type { AssetMemoryPackage } from './asset.types';
export interface AssetMemoryInput {
    request: Record<string, unknown>;
    directorPlan: DirectorPlan;
    storyboard: Storyboard;
    characterDatabase: CharacterDatabase;
    sceneGraphPackage: SceneGraphPackage;
    worldStatePackage: WorldStatePackage;
}
export declare class AssetMemoryAgent implements IAutomationAgent<AssetMemoryInput, AssetMemoryPackage> {
    readonly agentId = "automation.asset_memory";
    readonly agentName = "Asset Memory & Brand Kit Engine";
    readonly stage: AutomationStage;
    validate(input: AssetMemoryInput): {
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
    execute(input: AssetMemoryInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<AssetMemoryPackage>;
}
//# sourceMappingURL=asset-memory-agent.d.ts.map