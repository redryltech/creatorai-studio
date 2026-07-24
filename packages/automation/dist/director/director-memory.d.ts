import type { DirectorMemoryEntry, CameraStyle, LightingType, ColorGradingStyle } from './director.types';
export declare class DirectorMemoryStore {
    private static instance;
    private memory;
    private constructor();
    static getInstance(): DirectorMemoryStore;
    static resetInstance(): void;
    /**
     * Record a director decision for future reference.
     */
    record(input: {
        topic: string;
        planId: string;
        decisions: {
            preset: string;
            colorGrading: ColorGradingStyle;
            pacing: string;
            cameraStyles: CameraStyle[];
            lighting: LightingType[];
        };
    }): void;
    /**
     * Update performance metrics for a past decision.
     */
    updatePerformance(planId: string, performance: {
        qualityScore?: number;
        viewCount?: number;
        engagement?: number;
    }): void;
    /**
     * Get past decisions for similar topics.
     */
    findSimilar(topic: string, limit?: number): DirectorMemoryEntry[];
    /**
     * Get the most successful color grading across all entries.
     */
    getBestColorGrading(): ColorGradingStyle | null;
    /** Get all entries. */
    getAll(): DirectorMemoryEntry[];
    /** Get entry count. */
    get size(): number;
}
//# sourceMappingURL=director-memory.d.ts.map