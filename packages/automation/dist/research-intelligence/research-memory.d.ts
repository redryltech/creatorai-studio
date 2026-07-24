import type { ResearchMemoryEntry, ContentCategory } from './research.types';
/** Persistent memory store for research results. */
export declare class ResearchMemory {
    private static instance;
    private entries;
    private constructor();
    static getInstance(): ResearchMemory;
    static resetInstance(): void;
    /** Record a research result for future reference. */
    record(input: {
        topic: string;
        category: ContentCategory;
        packageId: string;
        confidenceScore: number;
        qualityScore: number;
    }): void;
    /** Find past research for similar topics. */
    findSimilar(topic: string, limit?: number): ResearchMemoryEntry[];
    getAll(): ResearchMemoryEntry[];
    get size(): number;
}
//# sourceMappingURL=research-memory.d.ts.map