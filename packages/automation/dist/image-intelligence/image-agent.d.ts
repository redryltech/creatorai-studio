import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { Storyboard } from '../storyboard/storyboard.types';
import type { CharacterDatabase } from '../character/character.types';
import type { SceneGraphPackage } from '../scene-graph/scene-graph.types';
import type { WorldStatePackage } from '../world-state/world-state.types';
import type { AssetMemoryPackage } from '../asset-memory/asset.types';
import type { DirectorPlan } from '../director/director.types';
import type { ImagePlanningPackage } from './image.types';
export interface ImageIntelligenceInput {
    request: Record<string, unknown>;
    storyboard: Storyboard;
    characterDatabase: CharacterDatabase;
    directorPlan?: DirectorPlan;
    sceneGraphPackage?: SceneGraphPackage;
    worldStatePackage?: WorldStatePackage;
    assetMemoryPackage?: AssetMemoryPackage;
}
export declare class ImageIntelligenceAgent implements IAutomationAgent<ImageIntelligenceInput, ImagePlanningPackage> {
    readonly agentId = "automation.image_intelligence";
    readonly agentName = "Image Intelligence Engine";
    readonly stage: AutomationStage;
    validate(input: ImageIntelligenceInput): {
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
    execute(input: ImageIntelligenceInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<ImagePlanningPackage>;
}
//# sourceMappingURL=image-agent.d.ts.map