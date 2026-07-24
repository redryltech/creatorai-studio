import type { AssetMemoryPackage } from './asset.types';
export interface AssetValidationResult {
    valid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
}
export declare class AssetValidator {
    static validate(pkg: AssetMemoryPackage): AssetValidationResult;
}
//# sourceMappingURL=asset-validator.d.ts.map