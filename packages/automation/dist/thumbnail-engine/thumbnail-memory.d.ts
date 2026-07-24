import type { ThumbnailMemoryEntry } from './thumbnail.types';
export declare class ThumbnailMemory {
    private static instance;
    private entries;
    private constructor();
    static getInstance(): ThumbnailMemory;
    static resetInstance(): void;
    record(input: {
        productionTitle: string;
        packageId: string;
        bestCtr: number;
    }): void;
    getAll(): ThumbnailMemoryEntry[];
    get size(): number;
}
//# sourceMappingURL=thumbnail-memory.d.ts.map