import type { SceneGraphPackage } from './scene-graph.types';
export interface SceneGraphValidationResult {
    valid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
}
export declare class SceneGraphValidator {
    static validate(pkg: SceneGraphPackage): SceneGraphValidationResult;
}
//# sourceMappingURL=scene-graph-validator.d.ts.map