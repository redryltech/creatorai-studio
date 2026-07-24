import type { IMediaProvider, ProviderResponse } from '../types/media.types';
export interface PollinationsImageConfig {
    /** Target width (default 1080) */
    targetWidth?: number;
    /** Target height (default 1920) */
    targetHeight?: number;
    /** Timeout per image in ms (default 90000) */
    timeoutMs?: number;
    /** Max retry attempts (default 3) */
    maxRetries?: number;
    /** Base seed for deterministic generation (default: random) */
    baseSeed?: number;
    /** Output directory for images (default: os tmpdir) */
    outputDir?: string;
    /** Whether to enhance prompts with quality suffixes (default true) */
    enhancePrompts?: boolean;
    /** Flux model variant: 'flux' | 'flux-realism' | 'flux-anime' | 'flux-3d' | 'turbo' */
    model?: string;
}
export declare class PollinationsImageProvider implements IMediaProvider {
    readonly providerId = "pollinations_image";
    readonly providerName = "Pollinations.ai (Flux)";
    readonly mediaType: "image";
    readonly priority = 10;
    private readonly targetWidth;
    private readonly targetHeight;
    private readonly timeoutMs;
    private readonly maxRetries;
    private readonly baseSeed;
    private readonly outputDir;
    private readonly enhancePrompts;
    private readonly model;
    private imageCounter;
    constructor(config?: PollinationsImageConfig);
    isAvailable(): Promise<boolean>;
    estimateCost(_request: Record<string, unknown>): number;
    healthCheck(): Promise<{
        healthy: boolean;
        latencyMs: number;
    }>;
    /**
     * Generate a real AI image using Pollinations.ai (Flux model).
     *
     * @param request Must include: prompt.
     *   Optional: width, height, negativePrompt, seed, style, sceneId, sceneOrder.
     * @returns ProviderResponse with the generated image file path.
     */
    generate(request: Record<string, unknown>): Promise<ProviderResponse>;
    /**
     * Enhance the raw scene prompt for optimal Flux model output.
     * Adds quality modifiers, style consistency, composition direction,
     * and negative prompt embedding.
     */
    private enhancePrompt;
    /**
     * Download a single image from Pollinations.ai and post-process it.
     */
    private generateSingleImage;
    /**
     * Post-process image using FFmpeg:
     *  1. Upscale to target resolution using high-quality lanczos filter
     *  2. Pad if aspect ratio doesn't match (with black bars)
     *  3. Convert to PNG for maximum quality
     */
    private postProcessImage;
    /**
     * Validate an image file:
     *  - Exists on disk
     *  - Is a valid image (JPEG or PNG)
     *  - Meets resolution requirements (if specified)
     *  - Not corrupted (can be decoded by FFmpeg)
     */
    private validateImage;
    /**
     * Check if FFmpeg is available on the system.
     */
    private isFFmpegAvailable;
    /**
     * Safely delete a file without throwing.
     */
    private safeUnlink;
    /**
     * Construct a standardized failure response.
     */
    private failureResponse;
}
//# sourceMappingURL=pollinations-image.provider.d.ts.map