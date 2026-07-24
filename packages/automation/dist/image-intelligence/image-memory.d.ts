import type { ImageMemoryEntry } from './image.types';
export declare class ImageMemory {
    private static instance;
    private entries;
    private constructor();
    static getInstance(): ImageMemory;
    static resetInstance(): void;
    record(input: {
        productionTitle: string;
        packageId: string;
        avgQuality: number;
        avgConfidence: number;
    }): void;
    getAll(): ImageMemoryEntry[];
    get size(): number;
}
//# sourceMappingURL=image-memory.d.ts.map