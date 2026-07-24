import type { CharacterMemoryEntry } from './character.types';
export declare class CharacterMemory {
    private static instance;
    private entries;
    private constructor();
    static getInstance(): CharacterMemory;
    static resetInstance(): void;
    record(input: {
        productionTitle: string;
        databaseId: string;
        entityCount: number;
        continuityScore: number;
    }): void;
    getAll(): CharacterMemoryEntry[];
    get size(): number;
}
//# sourceMappingURL=character-memory.d.ts.map