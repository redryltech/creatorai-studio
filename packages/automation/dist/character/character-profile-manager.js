// ============================================================
// CreatorAI Studio — Character Profile Manager
// ============================================================
// CRUD operations for entity profiles. Allows manual overrides,
// profile updates, and cross-production profile reuse.
// ============================================================
export class CharacterProfileManager {
    database;
    constructor(database) {
        this.database = database;
    }
    /** Get an entity by ID. */
    getEntity(id) {
        return this.database.entities.find((e) => e.id === id);
    }
    /** Update a character profile field. */
    updateCharacterProfile(entityId, updates) {
        const entity = this.getEntity(entityId);
        if (!entity?.characterProfile)
            return false;
        Object.assign(entity.characterProfile, updates);
        entity.identityBlock = this.rebuildIdentityBlock(entity);
        this.database.identityMap[entityId] = entity.identityBlock;
        return true;
    }
    /** Update a vehicle profile field. */
    updateVehicleProfile(entityId, updates) {
        const entity = this.getEntity(entityId);
        if (!entity?.vehicleProfile)
            return false;
        Object.assign(entity.vehicleProfile, updates);
        entity.identityBlock = this.rebuildIdentityBlock(entity);
        this.database.identityMap[entityId] = entity.identityBlock;
        return true;
    }
    /** Override the identity block directly. */
    setIdentityBlock(entityId, block) {
        const entity = this.getEntity(entityId);
        if (!entity)
            return false;
        entity.identityBlock = block;
        this.database.identityMap[entityId] = block;
        return true;
    }
    /** Add a forbidden change to an entity. */
    addForbiddenChange(entityId, rule) {
        const entity = this.getEntity(entityId);
        if (!entity)
            return false;
        entity.appearance.forbiddenChanges.push(rule);
        return true;
    }
    /** Add a required object to an entity. */
    addRequiredObject(entityId, obj) {
        const entity = this.getEntity(entityId);
        if (!entity)
            return false;
        entity.appearance.requiredObjects.push(obj);
        return true;
    }
    /** List all entities. */
    listEntities() {
        return this.database.entities.map((e) => ({
            id: e.id, name: e.displayName, category: e.category, scenes: e.scenePresence.length,
        }));
    }
    /** Get the underlying database. */
    getDatabase() { return this.database; }
    rebuildIdentityBlock(entity) {
        const lines = [`ENTITY ${entity.id} (${entity.category.toUpperCase()})`];
        lines.push(`Always use: ${entity.displayName}`);
        if (entity.vehicleProfile) {
            const v = entity.vehicleProfile;
            lines.push(`Color: ${v.primaryColor} ${v.paintFinish}`);
            lines.push(`Wheels: ${v.wheelDesign}`);
            lines.push(`Exhaust: ${v.exhaust}`);
            lines.push(`Condition: ${v.damageState}, ${v.cleanliness}`);
        }
        if (entity.characterProfile) {
            const c = entity.characterProfile;
            lines.push(`Gender: ${c.gender}, Age: ${c.ageRange}`);
            lines.push(`Build: ${c.bodyType}, Height: ${c.height}`);
            lines.push(`Clothing: ${c.clothing.overall}`);
            if (c.helmet)
                lines.push(`Helmet: ${c.helmet}`);
        }
        lines.push('Maintain identity across ALL scenes.');
        return lines.join('\n');
    }
}
//# sourceMappingURL=character-profile-manager.js.map