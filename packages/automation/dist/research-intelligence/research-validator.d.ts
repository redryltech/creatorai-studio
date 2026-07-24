import type { ResearchPackage } from './research.types';
/** Validation result for a research package. */
export interface ResearchValidationResult {
    valid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
}
/**
 * Validates a ResearchPackage for completeness,
 * confidence, consistency, and quality.
 */
export declare class ResearchValidator {
    static validate(pkg: ResearchPackage): ResearchValidationResult;
}
//# sourceMappingURL=research-validator.d.ts.map