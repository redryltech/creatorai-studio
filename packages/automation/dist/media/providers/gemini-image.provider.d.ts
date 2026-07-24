import type { IMediaProvider, ProviderResponse } from '../types/media.types';
export interface GeminiImageConfig {
    /** Gemini API key */
    apiKey: string;
    /** Preferred model (default: auto-detect from chain) */
    preferredModel?: string;
    /** Target width (default 1080) */
    targetWidth?: number;
    /** Target height (default 1920) */
    targetHeight?: number;
    /** Timeout per image in ms (default 90000) */
    timeoutMs?: number;
    /** Output directory for images */
    outputDir?: string;
}
export declare class GeminiImageProvider implements IMediaProvider {
    readonly providerId = "gemini_image";
    readonly providerName = "Google Gemini Image";
    readonly mediaType: "image";
    readonly priority = 5;
    private readonly apiKey;
    private readonly preferredModel;
    private readonly targetWidth;
    private readonly targetHeight;
    private readonly timeoutMs;
    private readonly outputDir;
    private imageCounter;
    constructor(config: GeminiImageConfig);
    isAvailable(): Promise<boolean>;
    estimateCost(_request: Record<string, unknown>): number;
    healthCheck(): Promise<{
        healthy: boolean;
        latencyMs: number;
    }>;
    /**
     * Generate a real AI image using the Gemini Image API.
     */
    generate(request: Record<string, unknown>): Promise<ProviderResponse>;
    private buildPrompt;
    private callGeminiImageAPI;
    private postProcessImage;
    private safeUnlink;
    private failureResponse;
}
//# sourceMappingURL=gemini-image.provider.d.ts.map