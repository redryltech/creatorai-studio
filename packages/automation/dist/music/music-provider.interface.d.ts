/**
 * A single music track with full metadata.
 */
export interface MusicTrack {
    id: string;
    name: string;
    filename: string;
    category: string;
    mood: string;
    energy: number;
    bpm: number;
    duration: number;
    volume: number;
    sampleRate: number;
    channels: number;
    format: string;
    bitrate: number;
    sizeBytes: number;
    tags: string[];
    license: string;
    path: string;
    favorite: boolean;
    usageCount: number;
    lastUsed: string | null;
}
/**
 * Request for selecting/searching music.
 */
export interface MusicSearchRequest {
    /** Script topic for AI category matching */
    topic?: string;
    /** Desired mood */
    mood?: string;
    /** Desired category */
    category?: string;
    /** Minimum energy level (1-10) */
    minEnergy?: number;
    /** Maximum energy level */
    maxEnergy?: number;
    /** Target BPM range */
    bpmRange?: {
        min: number;
        max: number;
    };
    /** Tags to match */
    tags?: string[];
    /** Video duration in seconds (for selecting tracks long enough) */
    videoDuration?: number;
    /** Emotions from the script scenes */
    emotions?: string[];
}
/**
 * Result of a music selection.
 */
export interface MusicSelectionResult {
    success: boolean;
    track: MusicTrack | null;
    /** Why this track was chosen */
    reason: string;
    /** How well the track matches (0-100) */
    matchScore: number;
    /** Alternative tracks that also matched */
    alternatives: MusicTrack[];
    error: string | null;
}
/**
 * Music mixing configuration.
 */
export interface MusicMixConfig {
    /** Enable background music */
    enabled: boolean;
    /** Auto-select category from script */
    autoSelect: boolean;
    /** Manual category override */
    manualCategory?: string;
    /** Use random track from category */
    randomTrack: boolean;
    /** Loop music if shorter than video */
    loopMusic: boolean;
    /** Music volume (0.0-1.0) */
    musicVolume: number;
    /** Voice volume (0.0-1.0) */
    voiceVolume: number;
    /** Enable audio ducking */
    duckingEnabled: boolean;
    /** Ducking level — music volume during narration (0.0-1.0) */
    duckingLevel: number;
    /** Fade in duration (seconds) */
    fadeInDuration: number;
    /** Fade out duration (seconds) */
    fadeOutDuration: number;
    /** Crossfade between loops (seconds) */
    crossfadeDuration: number;
}
/**
 * Provider capabilities.
 */
export interface MusicProviderCapabilities {
    totalTracks: number;
    categories: string[];
    supportedFormats: string[];
    supportsSearch: boolean;
    supportsPreview: boolean;
    supportsStreaming: boolean;
    maxDuration: number;
    costPerTrack: number;
}
export interface IMusicProvider {
    readonly providerId: string;
    readonly providerName: string;
    readonly priority: number;
    /** Get a specific track by ID. */
    getTrack(trackId: string): Promise<MusicTrack | null>;
    /** Search tracks by criteria. */
    searchTracks(request: MusicSearchRequest): Promise<MusicTrack[]>;
    /** AI-powered selection — returns the best track for a script. */
    selectTrack(request: MusicSearchRequest): Promise<MusicSelectionResult>;
    /** Get a random track (optionally from a category). */
    getRandomTrack(category?: string): Promise<MusicTrack | null>;
    /** Validate that a track file exists and is playable. */
    validate(track: MusicTrack): Promise<{
        valid: boolean;
        error?: string;
    }>;
    /** Get provider capabilities. */
    getCapabilities(): MusicProviderCapabilities;
    /** Check availability. */
    isAvailable(): Promise<boolean>;
}
//# sourceMappingURL=music-provider.interface.d.ts.map