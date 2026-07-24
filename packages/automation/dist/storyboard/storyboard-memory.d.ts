import type { StoryboardMemoryEntry } from './storyboard.types';
export declare class StoryboardMemory {
    private static instance;
    private entries;
    private constructor();
    static getInstance(): StoryboardMemory;
    static resetInstance(): void;
    record(input: {
        title: string;
        storyboardId: string;
        frameCount: number;
        category: string;
        style: string;
    }): void;
    updateQuality(storyboardId: string, score: number): void;
    getAll(): StoryboardMemoryEntry[];
    get size(): number;
}
//# sourceMappingURL=storyboard-memory.d.ts.map