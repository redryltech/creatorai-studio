import type { Storyboard } from '../storyboard/storyboard.types';
import type { CharacterDatabase } from '../character/character.types';
import type { SceneGraphPackage } from '../scene-graph/scene-graph.types';
import type { WorldStatePackage } from '../world-state/world-state.types';
import type { AssetMemoryPackage } from '../asset-memory/asset.types';
import type { DirectorPlan } from '../director/director.types';
import type { ImagePlanningPackage } from './image.types';
export declare class ImagePlanner {
    static plan(storyboard: Storyboard, charDb: CharacterDatabase, directorPlan?: DirectorPlan, sceneGraphPkg?: SceneGraphPackage, worldStatePkg?: WorldStatePackage, assetMemPkg?: AssetMemoryPackage): ImagePlanningPackage;
}
//# sourceMappingURL=image-planner.d.ts.map