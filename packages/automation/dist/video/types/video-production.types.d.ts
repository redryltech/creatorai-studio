export type TrackType = 'image' | 'video' | 'voice' | 'music' | 'subtitle' | 'overlay' | 'animation' | 'transition';
export interface TimelineLayer {
    id: string;
    type: TrackType;
    startTimeMs: number;
    endTimeMs: number;
    durationMs: number;
    sourceUrl: string;
    sourceType: 'image' | 'video' | 'audio' | 'text' | 'effect';
    properties: Record<string, unknown>;
}
export interface TimelineTrack {
    id: string;
    type: TrackType;
    label: string;
    layers: TimelineLayer[];
    muted: boolean;
    volume: number;
    locked: boolean;
}
export interface VideoTimeline {
    id: string;
    projectId: string;
    totalDurationMs: number;
    tracks: TimelineTrack[];
    resolution: {
        width: number;
        height: number;
    };
    fps: number;
    aspectRatio: string;
    metadata: {
        sceneCount: number;
        hasSubtitles: boolean;
        hasMusic: boolean;
        hasTransitions: boolean;
        createdAt: Date;
    };
}
export interface CaptionWord {
    text: string;
    startMs: number;
    endMs: number;
}
export interface CaptionSegment {
    id: string;
    sceneId: string;
    text: string;
    startMs: number;
    endMs: number;
    words: CaptionWord[];
    style: CaptionStyle;
}
export interface CaptionStyle {
    preset: 'tiktok' | 'youtube' | 'instagram' | 'minimal' | 'bold' | 'karaoke';
    fontSize: number;
    fontFamily: string;
    fontColor: string;
    strokeColor: string;
    strokeWidth: number;
    backgroundColor: string | null;
    position: 'bottom' | 'center' | 'top';
    animation: 'none' | 'word_highlight' | 'pop_in' | 'fade_in' | 'typewriter';
}
export interface CaptionPackage {
    segments: CaptionSegment[];
    srt: string;
    vtt: string;
    totalWords: number;
    totalDurationMs: number;
    style: CaptionStyle;
}
export type TransitionType = 'fade' | 'slide_left' | 'slide_right' | 'slide_up' | 'zoom_in' | 'zoom_out' | 'blur' | 'whip' | 'flash' | 'glitch' | 'smooth_cut' | 'none';
export interface Transition {
    id: string;
    type: TransitionType;
    fromSceneId: string;
    toSceneId: string;
    durationMs: number;
    easing: 'linear' | 'ease_in' | 'ease_out' | 'ease_in_out';
    parameters: Record<string, unknown>;
}
export type EffectType = 'zoom' | 'pan' | 'ken_burns' | 'camera_shake' | 'light_leak' | 'film_grain' | 'color_grade' | 'motion_blur' | 'vignette' | 'none';
export interface VideoEffect {
    id: string;
    type: EffectType;
    sceneId: string;
    startMs: number;
    endMs: number;
    intensity: number;
    parameters: Record<string, unknown>;
}
export type RenderStatus = 'queued' | 'preparing' | 'rendering' | 'encoding' | 'uploading' | 'completed' | 'failed';
export type RenderQuality = '720p' | '1080p' | '4k';
export type RenderOrientation = 'vertical' | 'horizontal' | 'square';
export interface RenderJob {
    id: string;
    timelineId: string;
    projectId: string;
    userId: string;
    status: RenderStatus;
    progress: number;
    quality: RenderQuality;
    orientation: RenderOrientation;
    renderer: string;
    startedAt: Date | null;
    completedAt: Date | null;
    estimatedDurationMs: number;
    error: string | null;
}
export interface RenderResult {
    videoUrl: string;
    storagePath: string;
    duration: number;
    resolution: {
        width: number;
        height: number;
    };
    fps: number;
    codec: string;
    format: string;
    sizeBytes: number;
    checksum: string;
    renderTimeMs: number;
    costUsd: number;
    thumbnailFrame: {
        url: string;
        timestampMs: number;
    } | null;
}
export interface FinalVideoPackage {
    id: string;
    projectId: string;
    contentIdeaId: string;
    render: RenderResult;
    captions: CaptionPackage;
    timeline: VideoTimeline;
    transitions: Transition[];
    effects: VideoEffect[];
    qualityScore: number;
    qualityIssues: string[];
    metadata: {
        sceneCount: number;
        wordCount: number;
        estimatedDuration: number;
        renderedAt: Date;
        totalCostUsd: number;
    };
}
export interface QualityReport {
    score: number;
    passed: boolean;
    checks: Array<{
        name: string;
        passed: boolean;
        severity: 'error' | 'warning' | 'info';
        message: string;
    }>;
    suggestions: string[];
}
//# sourceMappingURL=video-production.types.d.ts.map