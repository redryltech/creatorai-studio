import type { MusicMixConfig, MusicTrack } from './music-provider.interface';
export interface MixInput {
    /** Path to the video file (with or without audio) */
    videoPath: string;
    /** Paths to voice audio files (one per scene) */
    voicePaths: string[];
    /** Voice durations in seconds (one per scene) */
    voiceDurations: number[];
    /** Selected music track */
    musicTrack: MusicTrack;
    /** Total video duration */
    totalDuration: number;
    /** Mix configuration */
    config: MusicMixConfig;
    /** Output file path */
    outputPath: string;
}
export interface MixResult {
    success: boolean;
    outputPath: string;
    durationSec: number;
    sizeBytes: number;
    musicTrack: string;
    voiceLevelDb: number;
    musicLevelDb: number;
    duckingApplied: boolean;
    fadeApplied: boolean;
    looped: boolean;
    ffmpegCommand: string;
    error: string | null;
}
/**
 * Default mix configuration — optimized for YouTube Shorts.
 */
export declare const DEFAULT_MIX_CONFIG: MusicMixConfig;
export declare class MusicMixer {
    /**
     * Mix video + voice + music into a polished final MP4.
     *
     * FFmpeg pipeline:
     * 1. Input: video (from clips/images), concatenated voice, music track
     * 2. Music processing: trim/loop to video length, apply fade in/out
     * 3. Voice processing: normalize volume
     * 4. Audio ducking: sidechaincompress (music ducks when voice is present)
     * 5. Final mix: merge ducked music + voice, normalize output
     * 6. Mux with video: combine processed audio with video stream
     */
    static mix(input: MixInput): MixResult;
    /**
     * Build the FFmpeg command for mixing.
     */
    private static buildFFmpegCommand;
    private static failResult;
}
//# sourceMappingURL=music-mixer.d.ts.map