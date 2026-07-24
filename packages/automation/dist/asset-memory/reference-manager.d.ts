import type { AssetReference } from './asset.types';
export declare class ReferenceManager {
    private refs;
    add(ref: AssetReference): void;
    getBySource(assetId: string): AssetReference[];
    getByTarget(assetId: string): AssetReference[];
    getChain(assetId: string, depth?: number): AssetReference[];
    getAll(): AssetReference[];
    get size(): number;
}
//# sourceMappingURL=reference-manager.d.ts.map