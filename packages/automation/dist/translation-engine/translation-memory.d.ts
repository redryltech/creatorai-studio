import type { TranslationMemoryEntry } from './translation.types';
export declare class TranslationMemory {
    private static instance;
    private entries;
    private constructor();
    static getInstance(): TranslationMemory;
    static resetInstance(): void;
    record(input: {
        productionTitle: string;
        packageId: string;
        languageCount: number;
    }): void;
    getAll(): TranslationMemoryEntry[];
    get size(): number;
}
//# sourceMappingURL=translation-memory.d.ts.map