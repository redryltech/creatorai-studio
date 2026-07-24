import type { EntityIdentity, CharacterProfile, VehicleProfile, CharacterDatabase } from './character.types';
export declare class CharacterProfileManager {
    private database;
    constructor(database: CharacterDatabase);
    /** Get an entity by ID. */
    getEntity(id: string): EntityIdentity | undefined;
    /** Update a character profile field. */
    updateCharacterProfile(entityId: string, updates: Partial<CharacterProfile>): boolean;
    /** Update a vehicle profile field. */
    updateVehicleProfile(entityId: string, updates: Partial<VehicleProfile>): boolean;
    /** Override the identity block directly. */
    setIdentityBlock(entityId: string, block: string): boolean;
    /** Add a forbidden change to an entity. */
    addForbiddenChange(entityId: string, rule: string): boolean;
    /** Add a required object to an entity. */
    addRequiredObject(entityId: string, obj: string): boolean;
    /** List all entities. */
    listEntities(): Array<{
        id: string;
        name: string;
        category: string;
        scenes: number;
    }>;
    /** Get the underlying database. */
    getDatabase(): CharacterDatabase;
    private rebuildIdentityBlock;
}
//# sourceMappingURL=character-profile-manager.d.ts.map