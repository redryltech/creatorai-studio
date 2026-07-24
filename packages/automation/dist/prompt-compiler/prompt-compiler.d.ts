import type { DirectorPlan } from '../director/director.types';
import type { Storyboard } from '../storyboard/storyboard.types';
import type { CharacterDatabase } from '../character/character.types';
import type { SceneGraphPackage } from '../scene-graph/scene-graph.types';
import type { WorldStatePackage } from '../world-state/world-state.types';
import type { AssetMemoryPackage } from '../asset-memory/asset.types';
import type { CompiledPromptPackage, PromptLength } from './prompt.types';
export declare class PromptCompilerCore {
    /**
     * Compile all prompts from the complete planning pipeline.
     */
    static compile(directorPlan: DirectorPlan, storyboard: Storyboard, charDb: CharacterDatabase, sceneGraphPkg: SceneGraphPackage, worldStatePkg: WorldStatePackage, assetMemoryPkg: AssetMemoryPackage, promptLength?: PromptLength): CompiledPromptPackage;
}
//# sourceMappingURL=prompt-compiler.d.ts.map