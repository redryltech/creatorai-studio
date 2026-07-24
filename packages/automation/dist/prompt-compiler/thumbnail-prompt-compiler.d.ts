export interface ThumbnailPromptSpec {
    prompt: string;
    textOverlay: string;
    platform: string;
    aspectRatio: string;
}
export declare class ThumbnailPromptCompiler {
    static compile(topic: string, bestFrame: string): Record<string, ThumbnailPromptSpec>;
}
//# sourceMappingURL=thumbnail-prompt-compiler.d.ts.map