import type { ImageQualityMetrics, ImageScenePlan } from './image.types';
export declare class QualityEngine {
    static score(plan: Omit<ImageScenePlan, 'quality' | 'confidence'>): ImageQualityMetrics;
}
//# sourceMappingURL=quality-engine.d.ts.map