import type { PromptCompilerMemoryEntry } from './prompt.types';
export declare class PromptMemory {
    private static instance;
    private entries;
    private constructor();
    static getInstance(): PromptMemory;
    static resetInstance(): void;
    record(input: {
        productionTitle: string;
        packageId: string;
        avgScore: number;
        totalTokens: number;
    }): void;
    getAll(): PromptCompilerMemoryEntry[];
    get size(): number;
}
//# sourceMappingURL=prompt-memory.d.ts.map