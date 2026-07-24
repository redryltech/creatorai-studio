import type { ImageScenePlan } from '../image-intelligence/image.types';
export declare class ImagePromptCompiler {
    static compile(plan: ImageScenePlan, providerId: string): {
        prompt: string;
        negative: string;
        seed: number;
        settings: Record<string, unknown>;
    };
    static compileAll(plan: ImageScenePlan): Record<string, {
        prompt: string;
        negative: string;
        seed: number;
    }>;
}
//# sourceMappingURL=image-prompt-compiler.d.ts.map