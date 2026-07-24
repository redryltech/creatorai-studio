import type { IVideoProvider, VideoGenerationRequest, VideoGenerationResult, VideoProviderStatus, VideoProviderCapabilities } from './video-provider.interface';
export declare class MockVideoProvider implements IVideoProvider {
    readonly providerId = "mock_video";
    readonly providerName = "Mock Video (Dev Mode)";
    readonly priority = 99;
    private readonly outputDir;
    private clipCounter;
    constructor(outputDir?: string);
    isAvailable(): Promise<boolean>;
    estimateCost(_request: VideoGenerationRequest): number;
    validate(request: VideoGenerationRequest): {
        valid: boolean;
        errors: string[];
    };
    getCapabilities(): VideoProviderCapabilities;
    getStatus(): Promise<VideoProviderStatus>;
    /**
     * Generate a realistic mock video clip for a single scene.
     *
     * Produces a real MP4 with:
     * - Animated gradient background matching the scene emotion
     * - Slow pan/zoom camera movement
     * - Scene title text overlay
     * - Narration text at bottom
     * - Scene number + duration watermark
     */
    generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResult>;
    /**
     * Build an FFmpeg filter complex that creates an animated mock clip:
     *
     * 1. Base layer: solid color from emotion palette
     * 2. Gradient overlay: animated vertical gradient (bg1 → bg2)
     * 3. Camera movement: slow zoom-in via zoompan filter
     * 4. Text overlays:
     *    - Scene number badge (top-left)
     *    - Visual notes / title (center)
     *    - Narration text (bottom third)
     *    - Duration + provider watermark (bottom-right)
     *    - Animated progress bar (bottom)
     */
    private buildFilterComplex;
    /**
     * Escape text for FFmpeg drawtext filter.
     */
    private escapeFFmpegText;
    /**
     * Validate the generated MP4 file.
     */
    private validateOutputFile;
    private isFFmpegAvailable;
    private safeUnlink;
    private failureResult;
}
//# sourceMappingURL=mock-video.provider.d.ts.map