import type { CreatorSuccessPackage } from './creator.types';
export interface CreatorValidationResult {
    valid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
}
export declare class CreatorValidator {
    static validate(pkg: CreatorSuccessPackage): CreatorValidationResult;
}
//# sourceMappingURL=creator-validator.d.ts.map