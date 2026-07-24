export interface VoicePromptSpec { text: string; language: string; voice: string; speed: number; emotion: string; provider: string; }

export class VoicePromptCompiler {
  static compile(narration: string, emotion: string, language: string = 'en'): Record<string, VoicePromptSpec> {
    const speed = emotion === 'excitement' ? 1.1 : emotion === 'sadness' ? 0.9 : 1.0;
    return {
      elevenlabs: { text: narration, language, voice: 'adam', speed, emotion, provider: 'elevenlabs' },
      arena_tts: { text: narration, language, voice: 'masculine_narration', speed, emotion, provider: 'arena' },
      google_tts: { text: narration, language, voice: 'en-US-Neural2-D', speed, emotion, provider: 'google' },
    };
  }
}
