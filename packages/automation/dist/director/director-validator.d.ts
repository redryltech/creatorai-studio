import type { DirectorPlan, DirectorScenePlan } from './director.types';
export interface ValidationResult {
    valid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
}
export declare class DirectorValidator {
    /**
     * Validate a DirectorPlan for production readiness.
     */
    static validate(plan: DirectorPlan): ValidationResult;
    /**
     * Quick validation of a single scene.
     */
    static validateScene(scene: DirectorScenePlan): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=director-validator.d.ts.map