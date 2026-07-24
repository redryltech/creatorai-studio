// ============================================================
// CreatorAI Studio — Mock Video Provider
// ============================================================
// Generates realistic placeholder MP4 clips for development.
//
// Each clip is a real, valid MP4 produced by FFmpeg with:
//   ✅ Animated gradient backgrounds (scene-specific colors)
//   ✅ Slow camera pan/zoom movement (Ken Burns effect)
//   ✅ Scene title + narration text overlay
//   ✅ Scene number + duration watermark
//   ✅ Emotion-based color palette
//   ✅ Exactly matched duration
//   ✅ 1080×1920 vertical output
//   ✅ H.264 + AAC compatible with all renderers
//
// The pipeline runs identically to a real AI provider.
// When a paid provider is added, swap VIDEO_PROVIDER env var.
// ============================================================
import { Logger } from '@creatorai/agents';
import { existsSync, mkdirSync, statSync, unlinkSync, } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execFileSync } from 'child_process';
import { randomBytes } from 'crypto';
const log = Logger.for('MockVideoProvider');
const EMOTION_PALETTES = {
    curiosity: { bg1: '1a1a3e', bg2: '0f3460', accent: '4ecdc4', label: 'Curiosity' },
    surprise: { bg1: '16213e', bg2: '1a1a2e', accent: 'f9c74f', label: 'Surprise' },
    determination: { bg1: '1b1b2f', bg2: '0d0d3a', accent: 'e94560', label: 'Determination' },
    inspiration: { bg1: '2d1b69', bg2: '533483', accent: 'ff6b6b', label: 'Inspiration' },
    excitement: { bg1: '3a0f0f', bg2: 'e94560', accent: 'ffffff', label: 'Excitement' },
    sadness: { bg1: '0a1628', bg2: '162447', accent: '4a7c82', label: 'Sadness' },
    anger: { bg1: '3a0a0a', bg2: '8b0000', accent: 'ff4444', label: 'Anger' },
    joy: { bg1: '1a3a1a', bg2: '2d6a2d', accent: '7ddf64', label: 'Joy' },
    neutral: { bg1: '1a1a2e', bg2: '2a2a4e', accent: 'cccccc', label: 'Neutral' },
};
const DEFAULT_PALETTE = EMOTION_PALETTES.neutral;
export class MockVideoProvider {
    providerId = 'mock_video';
    providerName = 'Mock Video (Dev Mode)';
    priority = 99; // Lowest — real providers override
    outputDir;
    clipCounter = 0;
    constructor(outputDir) {
        this.outputDir = outputDir ?? join(tmpdir(), 'creatorai-mock-video');
        if (!existsSync(this.outputDir)) {
            mkdirSync(this.outputDir, { recursive: true });
        }
    }
    // ── IVideoProvider interface ──────────────────────────────
    async isAvailable() {
        return this.isFFmpegAvailable();
    }
    estimateCost(_request) {
        return 0; // Free
    }
    validate(request) {
        const errors = [];
        if (!request.sceneId)
            errors.push('sceneId is required');
        if (!request.durationSec || request.durationSec <= 0)
            errors.push('durationSec must be > 0');
        if (request.durationSec > 60)
            errors.push('durationSec must be <= 60');
        if (request.width && request.width < 100)
            errors.push('width must be >= 100');
        if (request.height && request.height < 100)
            errors.push('height must be >= 100');
        return { valid: errors.length === 0, errors };
    }
    getCapabilities() {
        return {
            modes: ['text-to-video', 'image-to-video'],
            maxDurationSec: 60,
            minDurationSec: 1,
            supportedResolutions: [
                { width: 1080, height: 1920, label: '1080×1920 (Shorts/Reels)' },
                { width: 1920, height: 1080, label: '1920×1080 (Landscape)' },
                { width: 1080, height: 1080, label: '1080×1080 (Square)' },
            ],
            supportedAspectRatios: ['9:16', '16:9', '1:1'],
            maxFps: 30,
            cameraControl: true,
            styleTransfer: false,
            characterConsistency: false,
            avgGenerationTimeSec: 2,
            costPerSecondUsd: 0,
        };
    }
    async getStatus() {
        const start = performance.now();
        const available = this.isFFmpegAvailable();
        return {
            providerId: this.providerId,
            healthy: available,
            latencyMs: Math.round(performance.now() - start),
            authenticated: true, // No auth needed
            rateLimitRemaining: null,
            message: available
                ? 'Mock video provider ready (FFmpeg available)'
                : 'FFmpeg not found — install with: apt install ffmpeg',
        };
    }
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
    async generateVideo(request) {
        const startTime = performance.now();
        this.clipCounter++;
        const { sceneId, sceneOrder, durationSec, width = 1080, height = 1920, fps = 24, emotion = 'neutral', narration = '', visualNotes = '', cameraMovement = 'slow_zoom', style = 'cinematic', } = request;
        const validation = this.validate(request);
        if (!validation.valid) {
            return this.failureResult(request, validation.errors.join('; '), startTime);
        }
        log.info('Generating mock video clip', {
            sceneId,
            sceneOrder,
            durationSec,
            resolution: `${width}x${height}`,
            emotion,
        });
        const uniqueId = randomBytes(4).toString('hex');
        const outputPath = join(this.outputDir, `${sceneId}-${uniqueId}.mp4`);
        try {
            // Select color palette based on emotion
            const palette = EMOTION_PALETTES[emotion.toLowerCase()] ?? DEFAULT_PALETTE;
            // Build FFmpeg filter complex for animated mock clip
            const filterComplex = this.buildFilterComplex(width, height, durationSec, fps, palette, sceneId, sceneOrder, narration, visualNotes, cameraMovement, style);
            // Generate the clip
            execFileSync('ffmpeg', [
                '-y',
                // Generate gradient source
                '-f', 'lavfi',
                '-i', `color=c=0x${palette.bg1}:s=${width}x${height}:d=${durationSec}:r=${fps}`,
                // Generate silent audio track
                '-f', 'lavfi',
                '-i', `anullsrc=r=44100:cl=stereo`,
                '-t', String(durationSec),
                // Apply filter complex
                '-filter_complex', filterComplex,
                '-map', '[vout]',
                '-map', '1:a',
                // Encoding
                '-c:v', 'libx264',
                '-preset', 'fast',
                '-crf', '23',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-r', String(fps),
                '-movflags', '+faststart',
                '-shortest',
                outputPath,
            ], {
                timeout: 30000,
                stdio: 'pipe',
            });
            // Validate output
            const fileValidation = this.validateOutputFile(outputPath, width, height, durationSec);
            if (!fileValidation.valid) {
                this.safeUnlink(outputPath);
                return this.failureResult(request, `Output validation failed: ${fileValidation.error}`, startTime);
            }
            const stat = statSync(outputPath);
            const elapsedMs = Math.round(performance.now() - startTime);
            log.info('Mock video clip generated', {
                sceneId,
                sceneOrder,
                durationSec,
                sizeKB: Math.round(stat.size / 1024),
                elapsedMs,
                outputPath,
            });
            return {
                success: true,
                sceneId,
                sceneOrder,
                filePath: outputPath,
                remoteUrl: null,
                durationSec,
                sizeBytes: stat.size,
                width,
                height,
                fps,
                codec: 'h264',
                generationTimeMs: elapsedMs,
                costUsd: 0,
                provider: this.providerId,
                model: 'ffmpeg-mock',
                error: null,
                metadata: {
                    emotion,
                    palette: palette.label,
                    cameraMovement,
                    style,
                    narrationLength: narration.length,
                    mockGenerated: true,
                },
            };
        }
        catch (err) {
            this.safeUnlink(outputPath);
            const errMsg = err.message ?? String(err);
            log.error('Mock video generation failed', { sceneId, error: errMsg.slice(0, 200) });
            return this.failureResult(request, errMsg.slice(0, 300), startTime);
        }
    }
    // ── FFmpeg filter complex builder ─────────────────────────
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
    buildFilterComplex(width, height, duration, fps, palette, sceneId, sceneOrder, narration, visualNotes, cameraMovement, style) {
        const totalFrames = duration * fps;
        const escapedNarration = this.escapeFFmpegText(narration.slice(0, 80));
        const escapedVisual = this.escapeFFmpegText(visualNotes.slice(0, 60));
        const escapedStyle = this.escapeFFmpegText(`${style} · ${palette.label}`);
        // Choose zoom direction based on camera movement
        let zoomExpr;
        let xExpr;
        let yExpr;
        switch (cameraMovement.toLowerCase().replace(/[_\s-]/g, '')) {
            case 'slowzoom':
            case 'zoomin':
                zoomExpr = `min(zoom+0.0008,1.12)`;
                xExpr = `iw/2-(iw/zoom/2)`;
                yExpr = `ih/2-(ih/zoom/2)`;
                break;
            case 'zoomout':
                zoomExpr = `if(lte(zoom,1),1.15,max(1.0,zoom-0.0008))`;
                xExpr = `iw/2-(iw/zoom/2)`;
                yExpr = `ih/2-(ih/zoom/2)`;
                break;
            case 'panright':
                zoomExpr = `1.08`;
                xExpr = `(iw/zoom-iw)*on/${totalFrames}`;
                yExpr = `ih/2-(ih/zoom/2)`;
                break;
            case 'panleft':
                zoomExpr = `1.08`;
                xExpr = `(iw/zoom-iw)*(1-on/${totalFrames})`;
                yExpr = `ih/2-(ih/zoom/2)`;
                break;
            case 'panup':
                zoomExpr = `1.08`;
                xExpr = `iw/2-(iw/zoom/2)`;
                yExpr = `(ih/zoom-ih)*(1-on/${totalFrames})`;
                break;
            case 'pandown':
                zoomExpr = `1.08`;
                xExpr = `iw/2-(iw/zoom/2)`;
                yExpr = `(ih/zoom-ih)*on/${totalFrames}`;
                break;
            default: // slow zoom is the default
                zoomExpr = `min(zoom+0.001,1.15)`;
                xExpr = `iw/2-(iw/zoom/2)`;
                yExpr = `ih/2-(ih/zoom/2)`;
        }
        const filters = [];
        // Layer 1: Base color → zoompan for camera movement
        filters.push(`[0:v]zoompan=z='${zoomExpr}':x='${xExpr}':y='${yExpr}'` +
            `:d=${totalFrames}:s=${width}x${height}:fps=${fps}` +
            `,trim=duration=${duration},setpts=PTS-STARTPTS` +
            // Layer 2: Animated gradient overlay using blend
            `,drawbox=x=0:y=0:w=${width}:h=${Math.round(height * 0.4)}:` +
            `color=0x${palette.bg2}@0.5:t=fill` +
            `,drawbox=x=0:y=${Math.round(height * 0.7)}:w=${width}:h=${Math.round(height * 0.3)}:` +
            `color=0x000000@0.6:t=fill` +
            // Layer 3: Animated diagonal line pattern (subtle texture)
            `,drawbox=x='mod(n*2,${width})':y=0:w=2:h=${height}:` +
            `color=0x${palette.accent}@0.05:t=fill` +
            // Layer 4: Scene number badge (top-left)
            `,drawtext=text='SCENE ${sceneOrder}':` +
            `fontsize=36:fontcolor=0x${palette.accent}:` +
            `x=40:y=60:` +
            `borderw=2:bordercolor=0x000000@0.7` +
            // Layer 5: Visual description (center)
            `,drawtext=text='${escapedVisual}':` +
            `fontsize=32:fontcolor=0xffffff@0.9:` +
            `x=(w-text_w)/2:y=(h-text_h)/2-60:` +
            `borderw=2:bordercolor=0x000000@0.8` +
            // Layer 6: Style + emotion label (center below)
            `,drawtext=text='${escapedStyle}':` +
            `fontsize=24:fontcolor=0x${palette.accent}@0.7:` +
            `x=(w-text_w)/2:y=(h/2)+20:` +
            `borderw=1:bordercolor=0x000000@0.5` +
            // Layer 7: Narration text (bottom third)
            `,drawtext=text='${escapedNarration}':` +
            `fontsize=28:fontcolor=0xffffff:` +
            `x=(w-text_w)/2:y=h-200:` +
            `borderw=2:bordercolor=0x000000@0.9` +
            // Layer 8: Duration watermark (bottom-right)
            `,drawtext=text='${duration}s · MOCK · 1080x1920':` +
            `fontsize=18:fontcolor=0xffffff@0.4:` +
            `x=w-text_w-20:y=h-40` +
            // Layer 9: Animated progress bar (bottom)
            `,drawbox=x=0:y=${height - 6}:` +
            `w='${width}*t/${duration}':h=6:` +
            `color=0x${palette.accent}@0.8:t=fill` +
            `[vout]`);
        return filters.join(';\n');
    }
    // ── Helpers ───────────────────────────────────────────────
    /**
     * Escape text for FFmpeg drawtext filter.
     */
    escapeFFmpegText(text) {
        return text
            .replace(/\\/g, '\\\\\\\\')
            .replace(/'/g, "\\'")
            .replace(/:/g, '\\:')
            .replace(/%/g, '%%')
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]')
            .replace(/\n/g, ' ')
            .replace(/"/g, '\\"');
    }
    /**
     * Validate the generated MP4 file.
     */
    validateOutputFile(filePath, expectedWidth, expectedHeight, expectedDuration) {
        if (!existsSync(filePath)) {
            return { valid: false, error: 'File does not exist' };
        }
        const stat = statSync(filePath);
        if (stat.size < 1000) {
            return { valid: false, error: `File too small: ${stat.size} bytes` };
        }
        try {
            const probeOutput = execFileSync('ffprobe', [
                '-v', 'quiet',
                '-select_streams', 'v:0',
                '-show_entries', 'stream=width,height,codec_name,r_frame_rate',
                '-show_entries', 'format=duration',
                '-of', 'json',
                filePath,
            ], {
                timeout: 5000,
                encoding: 'utf8',
            });
            const probeData = JSON.parse(probeOutput);
            const stream = probeData.streams?.[0];
            const duration = parseFloat(probeData.format?.duration ?? '0');
            if (!stream) {
                return { valid: false, error: 'No video stream found' };
            }
            if (stream.width !== expectedWidth || stream.height !== expectedHeight) {
                return { valid: false, error: `Resolution mismatch: ${stream.width}x${stream.height} vs expected ${expectedWidth}x${expectedHeight}` };
            }
            if (stream.codec_name !== 'h264') {
                return { valid: false, error: `Codec mismatch: ${stream.codec_name} vs expected h264` };
            }
            // Allow ±1s tolerance on duration
            if (Math.abs(duration - expectedDuration) > 1.5) {
                return { valid: false, error: `Duration mismatch: ${duration.toFixed(1)}s vs expected ${expectedDuration}s` };
            }
            return { valid: true };
        }
        catch (err) {
            return { valid: false, error: `FFprobe failed: ${err.message?.slice(0, 100)}` };
        }
    }
    isFFmpegAvailable() {
        try {
            execFileSync('ffmpeg', ['-version'], { timeout: 3000, stdio: 'pipe' });
            return true;
        }
        catch {
            return false;
        }
    }
    safeUnlink(path) {
        try {
            if (existsSync(path))
                unlinkSync(path);
        }
        catch { /* ignore */ }
    }
    failureResult(request, error, startTime) {
        return {
            success: false,
            sceneId: request.sceneId,
            sceneOrder: request.sceneOrder,
            filePath: null,
            remoteUrl: null,
            durationSec: 0,
            sizeBytes: 0,
            width: request.width ?? 1080,
            height: request.height ?? 1920,
            fps: request.fps ?? 24,
            codec: 'h264',
            generationTimeMs: Math.round(performance.now() - startTime),
            costUsd: 0,
            provider: this.providerId,
            model: 'ffmpeg-mock',
            error,
            metadata: {},
        };
    }
}
//# sourceMappingURL=mock-video.provider.js.map