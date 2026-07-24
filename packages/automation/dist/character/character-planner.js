// ============================================================
// CreatorAI Studio — Character Planner
// ============================================================
// Orchestrates entity detection, profile building, seed
// assignment, continuity analysis, and identity packaging.
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import { IdentityResolver } from './identity-resolver';
import { ContinuityEngine } from './continuity-engine';
import { SeedManager } from './seed-manager';
const log = Logger.for('CharacterPlanner');
export class CharacterPlanner {
    /**
     * Build a complete CharacterDatabase from a Storyboard.
     */
    static plan(storyboard, directorPlan, baseSeed) {
        const startTime = performance.now();
        const seedManager = new SeedManager(baseSeed);
        log.info('Character planning starting', { frames: storyboard.frames.length });
        // ── Step 1: Resolve entities ──
        const resolver = new IdentityResolver(seedManager);
        const entities = resolver.resolve(storyboard, directorPlan);
        // ── Step 2: Build maps ──
        const identityMap = {};
        const seedMap = {};
        const categoryCounts = {
            human: 0, vehicle: 0, animal: 0, product: 0,
            building: 0, weapon: 0, prop: 0, logo: 0, brand_asset: 0,
        };
        for (const entity of entities) {
            identityMap[entity.id] = entity.identityBlock;
            seedMap[entity.id] = entity.globalSeed;
            categoryCounts[entity.category]++;
        }
        const processingTimeMs = Math.round(performance.now() - startTime);
        log.info('Character database built', {
            entities: entities.length,
            categories: Object.entries(categoryCounts).filter(([, v]) => v > 0).map(([k, v]) => `${k}:${v}`),
            processingTimeMs,
        });
        return {
            id: generateId(ID_PREFIXES.pipeline),
            productionTitle: storyboard.title,
            entities,
            identityMap,
            seedMap,
            metadata: {
                totalEntities: entities.length,
                categories: categoryCounts,
                generatedAt: new Date().toISOString(),
                engine: 'character-planner-v1',
                processingTimeMs,
            },
        };
    }
    /**
     * Generate provider identity packages for prompt injection.
     */
    static buildProviderPackage(database, storyboard) {
        const seedManager = new SeedManager();
        // Identity blocks
        const identityBlocks = {};
        for (const entity of database.entities) {
            identityBlocks[entity.id] = entity.identityBlock;
        }
        // Scene identities
        const sceneIdentities = storyboard.frames.map((frame) => {
            const sceneEntities = database.entities
                .filter((e) => e.scenePresence.includes(frame.sceneId))
                .map((e) => ({
                entityId: e.id,
                identityBlock: e.identityBlock,
                seed: typeof e.sceneSeed === 'object' && !Array.isArray(e.sceneSeed)
                    ? (e.sceneSeed[frame.sceneId] ?? e.globalSeed)
                    : e.globalSeed,
                visibility: e.visibilityScore,
            }));
            return { sceneId: frame.sceneId, entities: sceneEntities };
        });
        // Provider seeds
        const providerSeeds = {};
        for (const entity of database.entities) {
            providerSeeds[entity.id] = seedManager.providerSeedMap(entity.id);
        }
        return { identityBlocks, sceneIdentities, providerSeeds };
    }
    /**
     * Run continuity analysis.
     */
    static analyzeContinuity(storyboard, database, baseSeed) {
        const seedManager = new SeedManager(baseSeed);
        return ContinuityEngine.analyze(storyboard, database.entities, seedManager);
    }
}
//# sourceMappingURL=character-planner.js.map