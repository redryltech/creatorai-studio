import type { CompiledPromptPackage } from './prompt.types';
export interface PromptValidationResult {
    valid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
}
export declare class PromptValidator {
    static validate(pkg: CompiledPromptPackage): PromptValidationResult;
}
//# sourceMappingURL=prompt-validator.d.ts.map