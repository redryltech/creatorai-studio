import type { Storyboard } from '../storyboard/storyboard.types';
import type { EntityIdentity, ContinuityReport } from './character.types';
import { SeedManager } from './seed-manager';
export declare class ContinuityEngine {
    /**
     * Analyze a storyboard for continuity issues across all scenes.
     */
    static analyze(storyboard: Storyboard, entities: EntityIdentity[], seedManager: SeedManager): ContinuityReport;
}
//# sourceMappingURL=continuity-engine.d.ts.map