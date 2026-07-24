export declare class SeedManager {
    private globalBase;
    constructor(baseSeed?: number);
    /** Generate a deterministic seed from a string key. */
    seedFromKey(key: string): number;
    /** Global seed for an entity (consistent across all scenes). */
    entitySeed(entityId: string): number;
    /** Scene-specific seed (adds variation while keeping entity identity). */
    sceneSeed(entityId: string, sceneId: string): number;
    /** Variation seed (for slight differences — pose, angle, not identity). */
    variationSeed(entityId: string, variationIndex: number): number;
    /** Map seeds for specific providers. */
    providerSeedMap(entityId: string): Record<string, number>;
    /** Get the global base seed. */
    getBaseSeed(): number;
    private static generateBaseSeed;
}
//# sourceMappingURL=seed-manager.d.ts.map