import type { IMediaProvider, ProviderResponse } from '../types/media.types';
export interface ElevenLabsVoiceConfig {
    apiKey: string;
    defaultVoiceId?: string;
    defaultModel?: string;
    timeoutMs?: number;
}
export declare class ElevenLabsVoiceMediaProvider implements IMediaProvider {
    readonly providerId = "elevenlabs_voice";
    readonly providerName = "ElevenLabs TTS";
    readonly mediaType: "voice";
    readonly priority = 0;
    private readonly apiKey;
    private readonly defaultVoiceId;
    private readonly defaultModel;
    private readonly timeoutMs;
    constructor(config: ElevenLabsVoiceConfig);
    isAvailable(): Promise<boolean>;
    estimateCost(request: Record<string, unknown>): number;
    healthCheck(): Promise<{
        healthy: boolean;
        latencyMs: number;
    }>;
    /**
     * Generate real speech audio using the ElevenLabs TTS API.
     *
     * @param request — Must include: text.
     *   Optional: voiceId (name or ID), language, speed, stability,
     *   similarityBoost, style, outputFormat, model.
     * @returns ProviderResponse with audio buffer and metadata.
     */
    generate(request: Record<string, unknown>): Promise<ProviderResponse>;
    private failureResponse;
}
//# sourceMappingURL=elevenlabs-voice.provider.d.ts.map