import type { Storyboard } from '../storyboard/storyboard.types';
import type { CharacterDatabase } from '../character/character.types';
import type { DirectorPlan } from '../director/director.types';
import type { SceneGraphPackage } from './scene-graph.types';
export declare class SceneGraphPlanner {
    /**
     * Build scene graphs for all frames in a storyboard.
     */
    static plan(storyboard: Storyboard, charDb: CharacterDatabase, directorPlan?: DirectorPlan): SceneGraphPackage;
    private static buildSceneGraph;
    private static makeNode;
    private static tempToHex;
}
//# sourceMappingURL=scene-graph-planner.d.ts.map