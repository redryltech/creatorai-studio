// ============================================================
// CreatorAI Studio — Character Validator
// ============================================================
export class CharacterValidator {
    static validate(database) {
        const errors = [];
        const warnings = [];
        let score = 100;
        if (!database.id) {
            errors.push('No database ID');
            score -= 10;
        }
        if (database.entities.length === 0) {
            warnings.push('No entities detected');
            score -= 5;
        }
        const seenIds = new Set();
        const seenUuids = new Set();
        for (const entity of database.entities) {
            // Duplicate IDs
            if (seenIds.has(entity.id)) {
                errors.push(`Duplicate entity ID: ${entity.id}`);
                score -= 10;
            }
            seenIds.add(entity.id);
            // Duplicate UUIDs
            if (seenUuids.has(entity.uuid)) {
                errors.push(`Duplicate UUID: ${entity.uuid}`);
                score -= 10;
            }
            seenUuids.add(entity.uuid);
            // Required fields
            if (!entity.displayName) {
                errors.push(`${entity.id}: no display name`);
                score -= 5;
            }
            if (!entity.category) {
                errors.push(`${entity.id}: no category`);
                score -= 5;
            }
            if (!entity.identityBlock) {
                errors.push(`${entity.id}: no identity block`);
                score -= 10;
            }
            if (entity.scenePresence.length === 0) {
                warnings.push(`${entity.id}: appears in no scenes`);
                score -= 3;
            }
            // Seed validation
            if (entity.globalSeed === 0) {
                warnings.push(`${entity.id}: globalSeed is 0`);
                score -= 2;
            }
            // Profile completeness
            if (entity.category === 'vehicle' && !entity.vehicleProfile) {
                errors.push(`${entity.id}: vehicle entity missing vehicleProfile`);
                score -= 10;
            }
            if (entity.category === 'human' && !entity.characterProfile) {
                warnings.push(`${entity.id}: human entity missing characterProfile`);
                score -= 5;
            }
            // Identity block quality
            if (entity.identityBlock.length < 20) {
                warnings.push(`${entity.id}: identity block too short`);
                score -= 3;
            }
            // Appearance memory
            if (entity.appearance.forbiddenChanges.length === 0 && entity.continuityLevel === 'strict') {
                warnings.push(`${entity.id}: strict continuity but no forbidden changes defined`);
                score -= 2;
            }
        }
        // Seed collisions
        const seeds = database.entities.map((e) => e.globalSeed);
        const uniqueSeeds = new Set(seeds);
        if (uniqueSeeds.size < seeds.length) {
            warnings.push('Seed collision detected — two entities share the same global seed');
            score -= 5;
        }
        // Identity map completeness
        for (const entity of database.entities) {
            if (!database.identityMap[entity.id]) {
                errors.push(`${entity.id}: missing from identityMap`);
                score -= 5;
            }
            if (database.seedMap[entity.id] === undefined) {
                errors.push(`${entity.id}: missing from seedMap`);
                score -= 5;
            }
        }
        return {
            valid: errors.length === 0,
            score: Math.max(0, Math.min(100, score)),
            errors,
            warnings,
        };
    }
}
//# sourceMappingURL=character-validator.js.map