import type { CharacterDatabase } from './character.types';
export interface CharacterValidationResult {
    valid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
}
export declare class CharacterValidator {
    static validate(database: CharacterDatabase): CharacterValidationResult;
}
//# sourceMappingURL=character-validator.d.ts.map