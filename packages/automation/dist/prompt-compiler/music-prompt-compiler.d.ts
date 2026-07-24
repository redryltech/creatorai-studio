export interface MusicPromptSpec {
    mood: string;
    genre: string;
    energy: number;
    tempo: number;
    duration: number;
    provider: string;
}
export declare class MusicPromptCompiler {
    static compile(mood: string, category: string, duration: number): Record<string, MusicPromptSpec>;
}
//# sourceMappingURL=music-prompt-compiler.d.ts.map