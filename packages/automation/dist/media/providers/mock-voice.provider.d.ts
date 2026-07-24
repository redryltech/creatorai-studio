import type { IMediaProvider, ProviderResponse } from '../types/media.types';
export declare class MockVoiceProvider implements IMediaProvider {
    readonly providerId = "mock_voice";
    readonly providerName = "Mock Voice (Dev Mode)";
    readonly mediaType: "voice";
    readonly priority = 99;
    isAvailable(): Promise<boolean>;
    estimateCost(): number;
    healthCheck(): Promise<{
        healthy: boolean;
        latencyMs: number;
    }>;
    generate(request: Record<string, unknown>): Promise<ProviderResponse>;
}
//# sourceMappingURL=mock-voice.provider.d.ts.map