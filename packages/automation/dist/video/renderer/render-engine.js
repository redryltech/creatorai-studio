// ============================================================
// CreatorAI Studio — Render Engine Agent
// ============================================================
// Reads a VideoTimeline + CaptionPackage and produces a real
// MP4 video file using FFmpeg.
//
// Flow:
// 1. Validate timeline and captions
// 2. Call FFmpeg renderer (downloads assets, builds filter graph,
//    executes FFmpeg, extracts thumbnail, computes checksum)
// 3. Report progress via SSE
// 4. Return RenderResult with file paths
//
// The actual FFmpeg execution is in ffmpeg-renderer.ts.
// This agent handles lifecycle, validation, cost tracking.
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger, CostTracker } from '@creatorai/agents';
import { join } from 'path';
import { tmpdir } from 'os';
import { renderWithFFmpeg } from './ffmpeg-renderer';
const log = Logger.for('RenderEngine');
const RESOLUTIONS = {
    '720p': { vertical: { width: 720, height: 1280 }, horizontal: { width: 1280, height: 720 }, square: { width: 720, height: 720 } },
    '1080p': { vertical: { width: 1080, height: 1920 }, horizontal: { width: 1920, height: 1080 }, square: { width: 1080, height: 1080 } },
    '4k': { vertical: { width: 2160, height: 3840 }, horizontal: { width: 3840, height: 2160 }, square: { width: 2160, height: 2160 } },
};
export class RenderEngineAgent {
    agentId = 'automation.render';
    agentName = 'Render Engine';
    stage = 'rendering';
    validate(input) {
        const errors = [];
        if (!input.timeline?.tracks?.length)
            errors.push('Timeline with tracks required');
        if (input.timeline?.totalDurationMs <= 0)
            errors.push('Timeline duration must be positive');
        return { valid: errors.length === 0, errors };
    }
    estimateCost(input) {
        const durationSec = (input.timeline?.totalDurationMs ?? 0) / 1000;
        const cost = durationSec * 0.001;
        return { costUsd: cost, breakdown: [`${durationSec}s × $0.001/s = $${cost.toFixed(4)}`] };
    }
    async healthCheck() {
        try {
            const { execFileSync } = await import('child_process');
            const version = execFileSync('ffmpeg', ['-version'], { timeout: 5000 }).toString().split('\n')[0];
            return { healthy: true, details: `FFmpeg: ${version}` };
        }
        catch {
            return { healthy: false, details: 'FFmpeg binary not found' };
        }
    }
    async execute(input, onProgress, cancellation) {
        const { timeline, captions, quality = '1080p', orientation = 'vertical' } = input;
        const resolution = RESOLUTIONS[quality]?.[orientation] ?? { width: 1080, height: 1920 };
        log.info('Render starting', {
            durationMs: timeline.totalDurationMs,
            trackCount: timeline.tracks.length,
            quality, orientation,
            resolution: `${resolution.width}x${resolution.height}`,
            captionSegments: captions.segments.length,
        });
        // Create temp directory for this render
        const renderId = generateId(ID_PREFIXES.asset);
        const outputDir = join(tmpdir(), 'creatorai-render', renderId);
        try {
            // ---- Execute real FFmpeg rendering ----
            const result = await renderWithFFmpeg(timeline, captions, {
                outputDir,
                quality,
                orientation,
                fps: timeline.fps,
                codec: 'h264',
            }, (percent, message) => onProgress(percent, message), () => cancellation.isCancelled);
            // Track cost
            const durationSec = result.durationSec;
            const costUsd = durationSec * 0.001;
            CostTracker.getInstance().record('render.cost', costUsd, 'usd', { agentId: this.agentId });
            const projectId = input.request.projectId ?? 'unknown';
            const userId = input.request.userId ?? 'unknown';
            const renderResult = {
                videoUrl: result.outputPath, // Local path — upload to storage separately
                storagePath: `users/${userId}/projects/${projectId}/renders/${renderId}.mp4`,
                duration: result.durationSec,
                resolution,
                fps: timeline.fps,
                codec: 'h264',
                format: 'mp4',
                sizeBytes: result.sizeBytes,
                checksum: result.checksum,
                renderTimeMs: result.renderTimeMs,
                costUsd,
                thumbnailFrame: result.thumbnailPath
                    ? { url: result.thumbnailPath, timestampMs: Math.round(result.durationSec * 150) }
                    : null,
            };
            log.info('Render complete', {
                renderId,
                durationSec: result.durationSec,
                sizeBytes: result.sizeBytes,
                renderTimeMs: result.renderTimeMs,
                checksum: result.checksum,
            });
            return renderResult;
        }
        catch (error) {
            log.error('Render failed', { renderId }, error instanceof Error ? error : undefined);
            throw error;
        }
    }
}
//# sourceMappingURL=render-engine.js.map