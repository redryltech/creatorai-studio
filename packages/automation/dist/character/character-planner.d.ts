import type { Storyboard } from '../storyboard/storyboard.types';
import type { DirectorPlan } from '../director/director.types';
import type { CharacterDatabase, ProviderIdentityPackage } from './character.types';
export declare class CharacterPlanner {
    /**
     * Build a complete CharacterDatabase from a Storyboard.
     */
    static plan(storyboard: Storyboard, directorPlan?: DirectorPlan, baseSeed?: number): CharacterDatabase;
    /**
     * Generate provider identity packages for prompt injection.
     */
    static buildProviderPackage(database: CharacterDatabase, storyboard: Storyboard): ProviderIdentityPackage;
    /**
     * Run continuity analysis.
     */
    static analyzeContinuity(storyboard: Storyboard, database: CharacterDatabase, baseSeed?: number): import("./character.types").ContinuityReport;
}
//# sourceMappingURL=character-planner.d.ts.map