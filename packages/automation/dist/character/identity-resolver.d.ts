import type { Storyboard } from '../storyboard/storyboard.types';
import type { DirectorPlan } from '../director/director.types';
import type { EntityIdentity } from './character.types';
import { SeedManager } from './seed-manager';
export declare class IdentityResolver {
    private seedManager;
    constructor(seedManager: SeedManager);
    /**
     * Scan a storyboard and extract all entities with full profiles.
     */
    resolve(storyboard: Storyboard, directorPlan?: DirectorPlan): EntityIdentity[];
    private buildEntity;
    private buildIdentityBlock;
    private buildAppearanceMemory;
    private buildCharacterProfile;
    private buildDefaultCharacterProfile;
}
//# sourceMappingURL=identity-resolver.d.ts.map