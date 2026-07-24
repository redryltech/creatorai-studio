export declare enum GenerationStatus {
    PENDING = "pending",
    GENERATING = "generating",
    COMPLETED = "completed",
    FAILED = "failed",
    RETRYING = "retrying",
    CANCELLED = "cancelled"
}
export interface GenerationMetrics {
    startedAt: Date | null;
    completedAt: Date | null;
    durationMs: number | null;
    costUsd: number;
    provider: string;
    model: string;
    attempts: number;
}
export interface GenerationJob {
    id: string;
    sceneId: string;
    type: 'image' | 'video' | 'voice' | 'music';
    status: GenerationStatus;
    prompt: string;
    provider: string;
    model: string;
    output: MediaAsset | null;
    error: string | null;
    metrics: GenerationMetrics;
}
export interface MediaAsset {
    id: string;
    type: 'image' | 'video' | 'audio' | 'music';
    url: string;
    storagePath: string;
    mimeType: string;
    sizeBytes: number;
    metadata: AssetMetadata;
}
export interface AssetMetadata {
    width: number | null;
    height: number | null;
    duration: number | null;
    format: string;
    provider: string;
    model: string;
    prompt: string;
    generatedAt: Date;
}
export interface ImagePackage {
    sceneId: string;
    prompt: string;
    negativePrompt: string;
    provider: string;
    model: string;
    imageUrl: string;
    storagePath: string;
    width: number;
    height: number;
    generationTimeMs: number;
    costUsd: number;
    seed: number | null;
    metadata: Record<string, unknown>;
}
export interface VideoClipPackage {
    clipId: string;
    sceneId: string;
    videoUrl: string;
    storagePath: string;
    duration: number;
    provider: string;
    model: string;
    resolution: {
        width: number;
        height: number;
    };
    fps: number;
    generationTimeMs: number;
    costUsd: number;
    metadata: Record<string, unknown>;
}
export interface VoicePackage {
    sceneId: string;
    audioUrl: string;
    storagePath: string;
    speaker: string;
    language: string;
    speed: number;
    duration: number;
    provider: string;
    model: string;
    characterCount: number;
    costUsd: number;
    metadata: Record<string, unknown>;
}
export interface MusicPackage {
    id: string;
    genre: string;
    mood: string;
    tempo: number;
    duration: number;
    provider: string;
    audioUrl: string;
    storagePath: string;
    license: string;
    costUsd: number;
    metadata: Record<string, unknown>;
}
export interface OptimizedPrompt {
    sceneId: string;
    sceneOrder: number;
    imagePrompt: string;
    negativePrompt: string;
    videoPrompt: string;
    cameraAngle: string;
    cameraMovement: string;
    lighting: string;
    mood: string;
    colorPalette: string[];
    lens: string;
    composition: string;
    style: string;
}
export interface OptimizedPromptPackage {
    prompts: OptimizedPrompt[];
    globalStyle: string;
    consistencyNotes: string;
    metadata: {
        processingTimeMs: number;
        model: string;
        generatedAt: Date;
    };
}
export interface MediaFactoryOutput {
    images: ImagePackage[];
    videoClips: VideoClipPackage[];
    voiceovers: VoicePackage[];
    music: MusicPackage | null;
    prompts: OptimizedPromptPackage;
    metrics: {
        totalCostUsd: number;
        totalDurationMs: number;
        imageCount: number;
        clipCount: number;
        voiceoverCount: number;
    };
}
export interface IMediaProvider {
    readonly providerId: string;
    readonly providerName: string;
    readonly mediaType: 'image' | 'video' | 'voice' | 'music';
    readonly priority: number;
    generate(request: Record<string, unknown>): Promise<ProviderResponse>;
    isAvailable(): Promise<boolean>;
    estimateCost(request: Record<string, unknown>): number;
    healthCheck(): Promise<{
        healthy: boolean;
        latencyMs: number;
    }>;
}
export interface ProviderResponse {
    success: boolean;
    url: string | null;
    buffer: Buffer | null;
    duration: number | null;
    metadata: Record<string, unknown>;
    costUsd: number;
    provider: string;
    model: string;
    error: string | null;
}
//# sourceMappingURL=media.types.d.ts.map