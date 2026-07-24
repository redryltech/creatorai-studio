import type { Storyboard } from './storyboard.types';
export interface StoryboardValidationResult {
    valid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
}
export declare class StoryboardValidator {
    static validate(storyboard: Storyboard): StoryboardValidationResult;
}
//# sourceMappingURL=storyboard-validator.d.ts.map