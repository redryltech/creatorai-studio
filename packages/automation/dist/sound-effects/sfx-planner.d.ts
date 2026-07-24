import type { SfxPackage } from './sfx.types';
export declare class SfxPlanner {
    static generate(scenes: Array<{
        id: string;
        order: number;
        narration: string;
        visualNotes: string;
    }>, outputDir: string): SfxPackage;
}
//# sourceMappingURL=sfx-planner.d.ts.map