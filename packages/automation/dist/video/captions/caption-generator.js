// ============================================================
// CreatorAI Studio — Caption Generator
// ============================================================
// Generates SRT/VTT subtitles with word-level timing and
// platform-specific styling presets.
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
const log = Logger.for('CaptionGenerator');
const PLATFORM_STYLES = {
    tiktok: { preset: 'tiktok', fontSize: 52, fontFamily: 'Montserrat', fontColor: '#FFFFFF', strokeColor: '#000000', strokeWidth: 3, backgroundColor: null, position: 'center', animation: 'word_highlight' },
    youtube_shorts: { preset: 'youtube', fontSize: 48, fontFamily: 'Inter', fontColor: '#FFFFFF', strokeColor: '#000000', strokeWidth: 4, backgroundColor: null, position: 'bottom', animation: 'pop_in' },
    instagram_reels: { preset: 'instagram', fontSize: 44, fontFamily: 'Helvetica', fontColor: '#FFFFFF', strokeColor: '#000000', strokeWidth: 3, backgroundColor: 'rgba(0,0,0,0.4)', position: 'center', animation: 'fade_in' },
    default: { preset: 'bold', fontSize: 48, fontFamily: 'Inter', fontColor: '#FFFFFF', strokeColor: '#000000', strokeWidth: 3, backgroundColor: null, position: 'bottom', animation: 'none' },
};
export class CaptionGeneratorAgent {
    agentId = 'automation.caption_gen';
    agentName = 'Caption Generator';
    stage = 'captions';
    validate(input) {
        const errors = [];
        if (!input.scriptPackage?.scenes?.length)
            errors.push('Scenes required');
        if (!input.voiceovers?.length)
            errors.push('Voiceovers required for timing');
        return { valid: errors.length === 0, errors };
    }
    estimateCost() {
        return { costUsd: 0, breakdown: ['Caption generation: CPU-only'] };
    }
    async healthCheck() {
        return { healthy: true, details: 'CPU-only, always healthy' };
    }
    async execute(input, onProgress, cancellation) {
        const { scriptPackage, voiceovers, platform } = input;
        const style = { ...(PLATFORM_STYLES[platform] ?? PLATFORM_STYLES.default), ...input.style };
        log.info('Generating captions', { sceneCount: scriptPackage.scenes.length, platform, preset: style.preset });
        onProgress(10, 'Calculating word timings');
        let currentMs = 0;
        const segments = [];
        let totalWords = 0;
        for (let i = 0; i < scriptPackage.scenes.length; i++) {
            if (cancellation.isCancelled)
                throw new Error('Cancelled');
            const scene = scriptPackage.scenes[i];
            const vo = voiceovers.find((v) => v.sceneId === scene.id);
            const sceneDurationMs = Math.round((vo?.duration ?? scene.duration ?? 5) * 1000);
            const words = scene.narration.split(/\s+/).filter((w) => w.length > 0);
            totalWords += words.length;
            // Distribute timing evenly across words
            const msPerWord = words.length > 0 ? sceneDurationMs / words.length : sceneDurationMs;
            const captionWords = words.map((word, wi) => ({
                text: word,
                startMs: currentMs + Math.round(wi * msPerWord),
                endMs: currentMs + Math.round((wi + 1) * msPerWord),
            }));
            // Break into caption segments (~8 words per segment for readability)
            const chunkSize = 8;
            for (let j = 0; j < captionWords.length; j += chunkSize) {
                const chunk = captionWords.slice(j, j + chunkSize);
                if (chunk.length === 0)
                    continue;
                segments.push({
                    id: generateId(ID_PREFIXES.step),
                    sceneId: scene.id,
                    text: chunk.map((w) => w.text).join(' '),
                    startMs: chunk[0].startMs,
                    endMs: chunk[chunk.length - 1].endMs,
                    words: chunk,
                    style,
                });
            }
            currentMs += sceneDurationMs;
            onProgress(10 + Math.round((i / scriptPackage.scenes.length) * 60), `Processing scene ${i + 1}/${scriptPackage.scenes.length}`);
        }
        onProgress(80, 'Generating SRT format');
        const srt = this.generateSRT(segments);
        onProgress(90, 'Generating VTT format');
        const vtt = this.generateVTT(segments);
        onProgress(100, 'Captions generated');
        log.info('Captions generated', { segmentCount: segments.length, totalWords, totalDurationMs: currentMs });
        return { segments, srt, vtt, totalWords, totalDurationMs: currentMs, style };
    }
    generateSRT(segments) {
        return segments.map((seg, i) => `${i + 1}\n${this.formatTime(seg.startMs, ',')} --> ${this.formatTime(seg.endMs, ',')}\n${seg.text}\n`).join('\n');
    }
    generateVTT(segments) {
        const header = 'WEBVTT\n\n';
        return header + segments.map((seg) => `${this.formatTime(seg.startMs, '.')} --> ${this.formatTime(seg.endMs, '.')}\n${seg.text}\n`).join('\n');
    }
    formatTime(ms, sep) {
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        const frac = ms % 1000;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}${sep}${String(frac).padStart(3, '0')}`;
    }
}
//# sourceMappingURL=caption-generator.js.map