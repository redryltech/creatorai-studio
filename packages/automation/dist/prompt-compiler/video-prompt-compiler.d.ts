import type { ImageScenePlan } from '../image-intelligence/image.types';
export declare class VideoPromptCompiler {
    static compile(plan: ImageScenePlan, providerId: string, duration: number): {
        prompt: string;
        negative: string;
        seed: number;
        duration: number;
        settings: Record<string, unknown>;
    };
    static compileAll(plan: ImageScenePlan, duration: number): Record<string, {
        prompt: string;
        duration: number;
    }>;
}
//# sourceMappingURL=video-prompt-compiler.d.ts.map