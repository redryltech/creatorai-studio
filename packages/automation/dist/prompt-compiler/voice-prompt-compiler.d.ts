export interface VoicePromptSpec {
    text: string;
    language: string;
    voice: string;
    speed: number;
    emotion: string;
    provider: string;
}
export declare class VoicePromptCompiler {
    static compile(narration: string, emotion: string, language?: string): Record<string, VoicePromptSpec>;
}
//# sourceMappingURL=voice-prompt-compiler.d.ts.map