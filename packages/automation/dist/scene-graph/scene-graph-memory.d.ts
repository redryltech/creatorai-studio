import type { SceneGraphMemoryEntry } from './scene-graph.types';
export declare class SceneGraphMemory {
    private static instance;
    private entries;
    private constructor();
    static getInstance(): SceneGraphMemory;
    static resetInstance(): void;
    record(input: {
        productionTitle: string;
        packageId: string;
        sceneCount: number;
        avgComplexity: number;
    }): void;
    getAll(): SceneGraphMemoryEntry[];
    get size(): number;
}
//# sourceMappingURL=scene-graph-memory.d.ts.map