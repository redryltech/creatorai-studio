import type { CreatorMemoryEntry } from './creator.types';
export declare class CreatorMemory {
    private static instance;
    private entries;
    private constructor();
    static getInstance(): CreatorMemory;
    static resetInstance(): void;
    record(input: {
        productionTitle: string;
        packageId: string;
        creatorScore: number;
        seoScore: number;
        hookScore: number;
    }): void;
    getAll(): CreatorMemoryEntry[];
    getAverageScore(): number;
    get size(): number;
}
//# sourceMappingURL=creator-memory.d.ts.map