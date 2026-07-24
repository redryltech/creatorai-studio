import type { SceneGraphPackage } from '../scene-graph/scene-graph.types';
import type { CharacterDatabase } from '../character/character.types';
import type { DirectorPlan } from '../director/director.types';
import type { Storyboard } from '../storyboard/storyboard.types';
import type { WorldStatePackage } from './world-state.types';
export declare class WorldStatePlanner {
    /**
     * Build the complete world state from all upstream data.
     */
    static plan(sceneGraphPkg: SceneGraphPackage, charDb: CharacterDatabase, storyboard: Storyboard, directorPlan?: DirectorPlan): WorldStatePackage;
    private static buildSnapshot;
    private static computeTransition;
    private static detectIssues;
    private static computeMetrics;
    private static makeIssue;
}
//# sourceMappingURL=world-state-planner.d.ts.map