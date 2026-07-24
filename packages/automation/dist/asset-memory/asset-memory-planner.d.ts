import type { DirectorPlan } from '../director/director.types';
import type { Storyboard } from '../storyboard/storyboard.types';
import type { CharacterDatabase } from '../character/character.types';
import type { SceneGraphPackage } from '../scene-graph/scene-graph.types';
import type { WorldStatePackage } from '../world-state/world-state.types';
import type { AssetMemoryPackage } from './asset.types';
export declare class AssetMemoryPlanner {
    /**
     * Build the complete asset memory package from all upstream data.
     */
    static plan(directorPlan: DirectorPlan, storyboard: Storyboard, charDb: CharacterDatabase, sceneGraphPkg: SceneGraphPackage, worldStatePkg: WorldStatePackage): AssetMemoryPackage;
    private static buildBrandKit;
    private static buildStyleGuide;
    private static generateRecommendations;
    private static makeAsset;
}
//# sourceMappingURL=asset-memory-planner.d.ts.map