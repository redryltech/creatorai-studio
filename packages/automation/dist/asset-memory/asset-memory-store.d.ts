import type { AssetMemoryEntry, AssetRecord } from './asset.types';
export declare class AssetMemoryStore {
    private static instance;
    private entries;
    private globalAssetLibrary;
    private constructor();
    static getInstance(): AssetMemoryStore;
    static resetInstance(): void;
    record(input: {
        productionTitle: string;
        packageId: string;
        assetCount: number;
        hasBrandKit: boolean;
    }): void;
    addToGlobalLibrary(assets: AssetRecord[]): void;
    searchGlobal(query: string): AssetRecord[];
    getAll(): AssetMemoryEntry[];
    getGlobalLibrary(): AssetRecord[];
    get size(): number;
}
//# sourceMappingURL=asset-memory-store.d.ts.map