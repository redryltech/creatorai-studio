import type { SfxMemoryEntry } from './sfx.types';
export declare class SfxMemory {
    private static instance;
    private entries;
    private constructor();
    static getInstance(): SfxMemory;
    static resetInstance(): void;
    record(input: {
        productionTitle: string;
        packageId: string;
        effectCount: number;
    }): void;
    getAll(): SfxMemoryEntry[];
    get size(): number;
}
//# sourceMappingURL=sfx-memory.d.ts.map