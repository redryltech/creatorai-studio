import type { IMediaProvider, ProviderResponse } from '../types/media.types';
export interface ReplicateImageConfig {
    apiToken: string;
    defaultModel?: string;
    timeoutMs?: number;
}
export declare class ReplicateImageMediaProvider implements IMediaProvider {
    readonly providerId = "replicate_image";
    readonly providerName = "Replicate (Flux)";
    readonly mediaType: "image";
    readonly priority = 0;
    private readonly apiToken;
    private readonly defaultModel;
    private readonly timeoutMs;
    constructor(config: ReplicateImageConfig);
    isAvailable(): Promise<boolean>;
    estimateCost(request: Record<string, unknown>): number;
    healthCheck(): Promise<{
        healthy: boolean;
        latencyMs: number;
    }>;
    /**
     * Generate a real image using the Replicate API.
     *
     * @param request — Must include: prompt, width, height.
     *   Optional: negativePrompt, model, style, seed, aspectRatio.
     * @returns ProviderResponse with the generated image URL.
     */
    generate(request: Record<string, unknown>): Promise<ProviderResponse>;
    private pollPrediction;
    private failureResponse;
}
//# sourceMappingURL=replicate-image.provider.d.ts.map