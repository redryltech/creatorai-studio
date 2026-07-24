import type { ImagePlanningPackage } from './image.types';
export interface ImageValidationResult {
    valid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
}
export declare class ImageValidator {
    static validate(pkg: ImagePlanningPackage): ImageValidationResult;
}
//# sourceMappingURL=image-validator.d.ts.map