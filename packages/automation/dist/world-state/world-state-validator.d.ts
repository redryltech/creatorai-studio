import type { WorldStatePackage } from './world-state.types';
export interface WorldStateValidationResult {
    valid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
}
export declare class WorldStateValidator {
    static validate(pkg: WorldStatePackage): WorldStateValidationResult;
}
//# sourceMappingURL=world-state-validator.d.ts.map