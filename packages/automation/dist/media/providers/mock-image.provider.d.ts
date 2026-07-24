import type { IMediaProvider, ProviderResponse } from '../types/media.types';
export declare class MockImageProvider implements IMediaProvider {
    readonly providerId = "mock_image";
    readonly providerName = "Mock Image (Dev Mode)";
    readonly mediaType: "image";
    readonly priority = 99;
    isAvailable(): Promise<boolean>;
    estimateCost(): number;
    healthCheck(): Promise<{
        healthy: boolean;
        latencyMs: number;
    }>;
    generate(request: Record<string, unknown>): Promise<ProviderResponse>;
}
//# sourceMappingURL=mock-image.provider.d.ts.map