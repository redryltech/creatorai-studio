/**
 * Input for a single scene video generation request.
 */
export interface VideoGenerationRequest {
    /** Unique scene identifier (e.g. "scene-1") */
    sceneId: string;
    /** Scene order in the video (1-based) */
    sceneOrder: number;
    /** Text prompt describing the desired video motion/content */
    prompt: string;
    /** Negative prompt — things to avoid */
    negativePrompt?: string;
    /** Optional reference image URL (for image-to-video) */
    referenceImageUrl?: string;
    /** Optional reference image local path */
    referenceImagePath?: string;
    /** Desired clip duration in seconds */
    durationSec: number;
    /** Target width (default 1080) */
    width?: number;
    /** Target height (default 1920) */
    height?: number;
    /** Target FPS (default 24) */
    fps?: number;
    /** Camera movement instruction */
    cameraMovement?: string;
    /** Scene emotion/mood */
    emotion?: string;
    /** Visual style */
    style?: string;
    /** Scene narration text (for overlay/reference) */
    narration?: string;
    /** Scene visual notes from script */
    visualNotes?: string;
    /** Extra provider-specific parameters */
    providerParams?: Record<string, unknown>;
}
/**
 * Output from a video generation request.
 */
export interface VideoGenerationResult {
    /** Whether the generation succeeded */
    success: boolean;
    /** Scene ID this clip belongs to */
    sceneId: string;
    /** Scene order */
    sceneOrder: number;
    /** Local file path to the generated MP4 */
    filePath: string | null;
    /** Remote URL if applicable (e.g. Runway CDN) */
    remoteUrl: string | null;
    /** Actual clip duration in seconds */
    durationSec: number;
    /** File size in bytes */
    sizeBytes: number;
    /** Video resolution */
    width: number;
    height: number;
    /** Frames per second */
    fps: number;
    /** Video codec used */
    codec: string;
    /** Generation time in milliseconds */
    generationTimeMs: number;
    /** Cost in USD (0 for mock/free) */
    costUsd: number;
    /** Provider identifier */
    provider: string;
    /** Model used */
    model: string;
    /** Error message if failed */
    error: string | null;
    /** Provider-specific metadata */
    metadata: Record<string, unknown>;
}
/**
 * Provider capability declaration — what a provider can do.
 */
export interface VideoProviderCapabilities {
    /** Supported generation modes */
    modes: Array<'text-to-video' | 'image-to-video' | 'video-to-video'>;
    /** Max clip duration in seconds */
    maxDurationSec: number;
    /** Min clip duration in seconds */
    minDurationSec: number;
    /** Supported resolutions */
    supportedResolutions: Array<{
        width: number;
        height: number;
        label: string;
    }>;
    /** Supported aspect ratios */
    supportedAspectRatios: string[];
    /** Max FPS */
    maxFps: number;
    /** Whether the provider supports camera control */
    cameraControl: boolean;
    /** Whether the provider supports style transfer */
    styleTransfer: boolean;
    /** Whether the provider supports character consistency */
    characterConsistency: boolean;
    /** Typical generation time per second of video */
    avgGenerationTimeSec: number;
    /** Estimated cost per second of video generated */
    costPerSecondUsd: number;
}
/**
 * Provider health/status report.
 */
export interface VideoProviderStatus {
    /** Provider identifier */
    providerId: string;
    /** Whether the provider is healthy and reachable */
    healthy: boolean;
    /** Response latency in ms */
    latencyMs: number;
    /** Whether API credentials are configured */
    authenticated: boolean;
    /** Current rate limit status */
    rateLimitRemaining: number | null;
    /** Any status message */
    message: string;
}
export interface IVideoProvider {
    /** Unique identifier (e.g. "mock_video", "google_veo", "runway") */
    readonly providerId: string;
    /** Human-readable name */
    readonly providerName: string;
    /** Numeric priority (lower = tried first) */
    readonly priority: number;
    /**
     * Generate a video clip for a single scene.
     * Returns a file path to a valid MP4.
     */
    generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResult>;
    /**
     * Check provider status — is it online, authenticated, within quota?
     */
    getStatus(): Promise<VideoProviderStatus>;
    /**
     * Validate that a request can be fulfilled before generation.
     * Returns errors if the request is invalid for this provider.
     */
    validate(request: VideoGenerationRequest): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Declare what this provider can do.
     */
    getCapabilities(): VideoProviderCapabilities;
    /**
     * Check if the provider is available (has credentials, is online).
     */
    isAvailable(): Promise<boolean>;
    /**
     * Estimate USD cost for a generation request.
     */
    estimateCost(request: VideoGenerationRequest): number;
}
//# sourceMappingURL=video-provider.interface.d.ts.map