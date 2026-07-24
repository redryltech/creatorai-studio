import type { WorldStateMemoryEntry } from './world-state.types';
export declare class WorldStateMemory {
    private static instance;
    private entries;
    private constructor();
    static getInstance(): WorldStateMemory;
    static resetInstance(): void;
    record(input: {
        productionTitle: string;
        packageId: string;
        continuityScore: number;
        overallScore: number;
    }): void;
    getAll(): WorldStateMemoryEntry[];
    get size(): number;
}
//# sourceMappingURL=world-state-memory.d.ts.map