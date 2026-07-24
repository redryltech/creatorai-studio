// ============================================================
// CreatorAI Studio — Video Quality Checker
// ============================================================
// Validates the rendered video and its components for common
// issues before marking the video as complete.
// ============================================================
import { Logger } from '@creatorai/agents';
const log = Logger.for('QualityChecker');
export class QualityCheckerAgent {
    agentId = 'automation.quality_check';
    agentName = 'Quality Checker';
    stage = 'quality';
    validate(input) {
        const errors = [];
        if (!input.timeline)
            errors.push('Timeline required');
        if (!input.renderResult)
            errors.push('Render result required');
        return { valid: errors.length === 0, errors };
    }
    estimateCost() {
        return { costUsd: 0, breakdown: ['Quality check: CPU-only'] };
    }
    async healthCheck() {
        return { healthy: true, details: 'CPU-only' };
    }
    async execute(input, onProgress, _cancellation) {
        const { timeline, captions, renderResult, images, voiceovers } = input;
        const checks = [];
        log.info('Running quality checks');
        onProgress(10, 'Checking video completeness');
        // ---- Check 1: Render output exists ----
        checks.push({
            name: 'Render output',
            passed: !!renderResult.videoUrl && renderResult.sizeBytes > 0,
            severity: 'error',
            message: renderResult.videoUrl ? 'Video file generated successfully' : 'No video file generated',
        });
        onProgress(20, 'Checking scene coverage');
        // ---- Check 2: All scenes have visuals ----
        const visualTrack = timeline.tracks.find((t) => t.type === 'image');
        const sceneCount = timeline.metadata.sceneCount;
        const visualCount = visualTrack?.layers.length ?? 0;
        checks.push({
            name: 'Scene visual coverage',
            passed: visualCount >= sceneCount,
            severity: visualCount === 0 ? 'error' : visualCount < sceneCount ? 'warning' : 'info',
            message: `${visualCount}/${sceneCount} scenes have visuals`,
        });
        onProgress(35, 'Checking audio coverage');
        // ---- Check 3: All scenes have audio ----
        const voiceTrack = timeline.tracks.find((t) => t.type === 'voice');
        const audioCount = voiceTrack?.layers.filter((l) => l.sourceUrl).length ?? 0;
        checks.push({
            name: 'Scene audio coverage',
            passed: audioCount >= sceneCount,
            severity: audioCount === 0 ? 'error' : audioCount < sceneCount ? 'warning' : 'info',
            message: `${audioCount}/${sceneCount} scenes have voiceover`,
        });
        onProgress(50, 'Checking timing synchronization');
        // ---- Check 4: Audio-visual timing sync ----
        let timingMismatch = false;
        if (visualTrack && voiceTrack) {
            for (let i = 0; i < Math.min(visualTrack.layers.length, voiceTrack.layers.length); i++) {
                const vl = visualTrack.layers[i];
                const al = voiceTrack.layers[i];
                if (Math.abs(vl.durationMs - al.durationMs) > 500) {
                    timingMismatch = true;
                    break;
                }
            }
        }
        checks.push({
            name: 'Audio-visual sync',
            passed: !timingMismatch,
            severity: timingMismatch ? 'warning' : 'info',
            message: timingMismatch ? 'Some scenes have >500ms timing mismatch' : 'Audio and visual tracks are synchronized',
        });
        onProgress(65, 'Checking resolution');
        // ---- Check 5: Resolution ----
        const minRes = Math.min(renderResult.resolution.width, renderResult.resolution.height);
        checks.push({
            name: 'Resolution',
            passed: minRes >= 720,
            severity: minRes < 480 ? 'error' : minRes < 720 ? 'warning' : 'info',
            message: `${renderResult.resolution.width}×${renderResult.resolution.height} (${minRes < 720 ? 'below recommended' : 'acceptable'})`,
        });
        onProgress(75, 'Checking captions');
        // ---- Check 6: Captions ----
        checks.push({
            name: 'Captions',
            passed: captions.segments.length > 0,
            severity: captions.segments.length === 0 ? 'warning' : 'info',
            message: captions.segments.length > 0 ? `${captions.segments.length} caption segments generated` : 'No captions generated',
        });
        onProgress(85, 'Checking duration');
        // ---- Check 7: Duration reasonable ----
        const durationSec = renderResult.duration;
        checks.push({
            name: 'Duration',
            passed: durationSec >= 3 && durationSec <= 600,
            severity: durationSec < 3 ? 'error' : durationSec > 600 ? 'warning' : 'info',
            message: `${durationSec.toFixed(1)}s (${durationSec < 3 ? 'too short' : durationSec > 180 ? 'long — consider shorter for Shorts' : 'good length'})`,
        });
        onProgress(95, 'Calculating quality score');
        // ---- Calculate score ----
        const errorCount = checks.filter((c) => !c.passed && c.severity === 'error').length;
        const warningCount = checks.filter((c) => !c.passed && c.severity === 'warning').length;
        const score = Math.max(0, 100 - errorCount * 25 - warningCount * 10);
        // ---- Suggestions ----
        const suggestions = [];
        if (errorCount > 0)
            suggestions.push('Fix all error-level issues before publishing');
        if (!timeline.metadata.hasMusic)
            suggestions.push('Adding background music improves engagement by ~20%');
        if (durationSec > 90)
            suggestions.push('Videos under 60s perform best on Shorts/Reels/TikTok');
        if (captions.segments.length === 0)
            suggestions.push('Adding captions increases watch time by ~15%');
        const report = {
            score,
            passed: errorCount === 0,
            checks,
            suggestions,
        };
        onProgress(100, `Quality score: ${score}/100`);
        log.info('Quality check complete', { score, passed: report.passed, errors: errorCount, warnings: warningCount });
        return report;
    }
}
//# sourceMappingURL=quality-checker.js.map