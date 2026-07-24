// ============================================================
// CreatorAI Studio — Music Mixer
// ============================================================
// Handles audio ducking, fade effects, volume normalization,
// and final mix of voice + music + video into a polished MP4.
//
// Audio ducking:
//   Voice speaking → music drops to 20% (configurable)
//   Voice pauses  → music returns to 100%
//   Smooth fade transitions (no sudden jumps)
//
// Uses FFmpeg filters: sidechaincompress, volume, afade, aloop
// ============================================================
import { Logger } from '@creatorai/agents';
import { existsSync, statSync } from 'fs';
import { execFileSync } from 'child_process';
const log = Logger.for('MusicMixer');
/**
 * Default mix configuration — optimized for YouTube Shorts.
 */
export const DEFAULT_MIX_CONFIG = {
    enabled: true,
    autoSelect: true,
    randomTrack: false,
    loopMusic: true,
    musicVolume: 0.15, // 15% base music volume
    voiceVolume: 1.0, // 100% voice
    duckingEnabled: true,
    duckingLevel: 0.08, // Drop to 8% during narration
    fadeInDuration: 2.0, // 2s fade in
    fadeOutDuration: 3.0, // 3s fade out
    crossfadeDuration: 1.0, // 1s crossfade for loops
};
export class MusicMixer {
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
    static mix(input) {
        const startTime = performance.now();
        const { videoPath, voicePaths, voiceDurations, musicTrack, totalDuration, config, outputPath } = input;
        log.info('Music mixing starting', {
            videoPath,
            voiceFiles: voicePaths.length,
            musicTrack: musicTrack.name,
            totalDuration,
            musicVolume: config.musicVolume,
            ducking: config.duckingEnabled,
        });
        // Validate inputs
        if (!existsSync(videoPath)) {
            return MusicMixer.failResult(outputPath, 'Video file not found');
        }
        if (!existsSync(musicTrack.path)) {
            return MusicMixer.failResult(outputPath, `Music file not found: ${musicTrack.path}`);
        }
        for (const vp of voicePaths) {
            if (!existsSync(vp)) {
                return MusicMixer.failResult(outputPath, `Voice file not found: ${vp}`);
            }
        }
        // Build the FFmpeg command
        const ffmpegArgs = MusicMixer.buildFFmpegCommand(input);
        try {
            execFileSync('ffmpeg', ffmpegArgs, {
                timeout: 120000,
                stdio: 'pipe',
            });
            // Verify output
            if (!existsSync(outputPath)) {
                return MusicMixer.failResult(outputPath, 'Output file was not created');
            }
            const stat = statSync(outputPath);
            const probeOutput = execFileSync('ffprobe', [
                '-v', 'quiet', '-show_entries', 'format=duration',
                '-of', 'csv=p=0', outputPath,
            ], { timeout: 5000, encoding: 'utf8' });
            const actualDuration = parseFloat(probeOutput.trim()) || 0;
            const elapsedMs = Math.round(performance.now() - startTime);
            log.info('Music mixing complete', {
                outputPath,
                durationSec: actualDuration,
                sizeKB: Math.round(stat.size / 1024),
                elapsedMs,
                ducking: config.duckingEnabled,
            });
            return {
                success: true,
                outputPath,
                durationSec: actualDuration,
                sizeBytes: stat.size,
                musicTrack: musicTrack.name,
                voiceLevelDb: 0, // 0dB = reference level
                musicLevelDb: Math.round(20 * Math.log10(config.musicVolume)),
                duckingApplied: config.duckingEnabled,
                fadeApplied: config.fadeInDuration > 0 || config.fadeOutDuration > 0,
                looped: config.loopMusic && musicTrack.duration < totalDuration,
                ffmpegCommand: `ffmpeg ${ffmpegArgs.join(' ')}`,
                error: null,
            };
        }
        catch (err) {
            const errMsg = err.message?.slice(0, 300) ?? 'Unknown error';
            log.error('Music mixing failed', { error: errMsg });
            return MusicMixer.failResult(outputPath, errMsg);
        }
    }
    /**
     * Build the FFmpeg command for mixing.
     */
    static buildFFmpegCommand(input) {
        const { videoPath, voicePaths, voiceDurations, musicTrack, totalDuration, config, outputPath } = input;
        const args = ['-y'];
        // Input 0: Video
        args.push('-i', videoPath);
        // Input 1..N: Voice files
        for (const vp of voicePaths) {
            args.push('-i', vp);
        }
        // Input N+1: Music
        args.push('-i', musicTrack.path);
        const voiceCount = voicePaths.length;
        const musicInputIdx = voiceCount + 1;
        // Build filter complex
        const filters = [];
        // ── Voice: concat all voice files into one stream ──
        if (voiceCount > 1) {
            const voiceLabels = Array.from({ length: voiceCount }, (_, i) => `[${i + 1}:a]`).join('');
            filters.push(`${voiceLabels}concat=n=${voiceCount}:v=0:a=1[voice_raw]`);
        }
        else {
            filters.push(`[1:a]acopy[voice_raw]`);
        }
        // Normalize voice volume
        filters.push(`[voice_raw]volume=${config.voiceVolume}[voice]`);
        // ── Music: trim/loop, fade, set volume ──
        let musicLabel = `[${musicInputIdx}:a]`;
        // Loop music if needed
        const needsLoop = config.loopMusic && musicTrack.duration < totalDuration;
        if (needsLoop) {
            const loopCount = Math.ceil(totalDuration / musicTrack.duration);
            filters.push(`${musicLabel}aloop=loop=${loopCount}:size=${Math.round(musicTrack.duration * musicTrack.sampleRate)}[music_looped]`);
            musicLabel = '[music_looped]';
        }
        // Trim to video duration
        filters.push(`${musicLabel}atrim=0:${totalDuration},asetpts=PTS-STARTPTS[music_trimmed]`);
        // Apply fade in/out
        let musicFadeLabel = '[music_trimmed]';
        if (config.fadeInDuration > 0 || config.fadeOutDuration > 0) {
            let fadeFilter = `${musicFadeLabel}`;
            if (config.fadeInDuration > 0) {
                fadeFilter += `afade=t=in:d=${config.fadeInDuration}`;
                if (config.fadeOutDuration > 0) {
                    fadeFilter += `,afade=t=out:st=${Math.max(0, totalDuration - config.fadeOutDuration)}:d=${config.fadeOutDuration}`;
                }
            }
            else if (config.fadeOutDuration > 0) {
                fadeFilter += `afade=t=out:st=${Math.max(0, totalDuration - config.fadeOutDuration)}:d=${config.fadeOutDuration}`;
            }
            fadeFilter += '[music_faded]';
            filters.push(fadeFilter);
            musicFadeLabel = '[music_faded]';
        }
        // Set music volume
        filters.push(`${musicFadeLabel}volume=${config.musicVolume}[music_vol]`);
        // ── Audio Ducking ──
        if (config.duckingEnabled) {
            // Use sidechaincompress: voice controls music volume
            // When voice is loud → music is compressed (ducked)
            // Parameters tuned for natural-sounding ducking
            filters.push(`[music_vol][voice]sidechaincompress=` +
                `threshold=0.02:` + // Very low threshold — duck on any voice
                `ratio=10:` + // Heavy compression
                `attack=200:` + // 200ms attack (smooth duck-down)
                `release=800:` + // 800ms release (smooth duck-up)
                `makeup=1:` + // No makeup gain
                `level_in=1:` + // Input level
                `level_sc=1` + // Sidechain level
                `[music_ducked]`);
            // Mix ducked music + voice
            filters.push(`[music_ducked][voice]amix=inputs=2:duration=first:dropout_transition=2[audio_out]`);
        }
        else {
            // Simple mix without ducking
            filters.push(`[music_vol][voice]amix=inputs=2:duration=first:dropout_transition=2[audio_out]`);
        }
        // Final audio normalization — prevent clipping
        filters.push(`[audio_out]dynaudnorm=f=150:g=15:p=0.95[audio_final]`);
        const filterComplex = filters.join(';\n');
        args.push('-filter_complex', filterComplex);
        args.push('-map', '0:v'); // Video from input 0
        args.push('-map', '[audio_final]'); // Mixed audio
        // Output encoding
        args.push('-c:v', 'copy', // Copy video (no re-encode)
        '-c:a', 'aac', '-ar', '44100', '-ac', '2', '-b:a', '192k', '-movflags', '+faststart', '-shortest', outputPath);
        return args;
    }
    static failResult(outputPath, error) {
        return {
            success: false, outputPath, durationSec: 0, sizeBytes: 0,
            musicTrack: '', voiceLevelDb: 0, musicLevelDb: 0,
            duckingApplied: false, fadeApplied: false, looped: false,
            ffmpegCommand: '', error,
        };
    }
}
//# sourceMappingURL=music-mixer.js.map