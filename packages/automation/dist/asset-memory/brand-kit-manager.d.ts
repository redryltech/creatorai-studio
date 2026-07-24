import type { BrandKit } from './asset.types';
export declare class BrandKitManager {
    private kits;
    save(kit: BrandKit): void;
    get(id: string): BrandKit | undefined;
    getByName(name: string): BrandKit | undefined;
    list(): BrandKit[];
    update(id: string, updates: Partial<BrandKit>): boolean;
    delete(id: string): boolean;
    get size(): number;
}
//# sourceMappingURL=brand-kit-manager.d.ts.map