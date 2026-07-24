// ============================================================
// CreatorAI Studio — AI Thumbnail Planner
// ============================================================
// Generates multiple thumbnail variants using AI images,
// adds text overlays via FFmpeg, scores each for CTR,
// and recommends the best one.
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import { existsSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execFileSync } from 'child_process';
const log = Logger.for('ThumbnailPlanner');
// ── Platform specs ──
const PLATFORM_SPECS = {
    youtube: { width: 1280, height: 720, aspectRatio: '16:9' },
    instagram: { width: 1080, height: 1080, aspectRatio: '1:1' },
    tiktok: { width: 1080, height: 1920, aspectRatio: '9:16' },
    facebook: { width: 1200, height: 630, aspectRatio: '1.91:1' },
    linkedin: { width: 1200, height: 627, aspectRatio: '1.91:1' },
};
// ── Text overlay templates ──
const TEXT_TEMPLATES = [
    { position: 'center', fontSize: 72, style: 'bold_white_stroke' },
    { position: 'bottom', fontSize: 64, style: 'bold_yellow' },
    { position: 'top', fontSize: 60, style: 'white_shadow' },
];
export class ThumbnailPlanner {
    /**
     * Generate a complete thumbnail package.
     *
     * Strategy:
     * 1. Extract best frame from video (if available)
     * 2. Generate AI images optimized for thumbnails
     * 3. Add text overlays via FFmpeg
     * 4. Score each variant for CTR
     * 5. Select best and create A/B test variants
     */
    static async plan(topic, videoPath, bestFrameTimeSec, colorPalette, category, outputDir) {
        const startTime = performance.now();
        const dir = outputDir ?? join(tmpdir(), 'creatorai-thumbnails');
        if (!existsSync(dir))
            mkdirSync(dir, { recursive: true });
        log.info('Thumbnail generation starting', { topic: topic.slice(0, 50), category });
        const thumbnails = [];
        const shortTitle = ThumbnailPlanner.generateShortTitle(topic);
        // ── Method 1: Extract best frame from video + enhance ──
        if (videoPath && existsSync(videoPath)) {
            try {
                const framePath = join(dir, 'frame-extract.jpg');
                execFileSync('ffmpeg', [
                    '-y', '-ss', String(bestFrameTimeSec || 3),
                    '-i', videoPath, '-frames:v', '1', '-q:v', '1', framePath,
                ], { timeout: 10000, stdio: 'pipe' });
                if (existsSync(framePath)) {
                    // Resize to YouTube thumbnail size
                    const ytThumbPath = join(dir, 'thumb-yt-frame.jpg');
                    execFileSync('ffmpeg', [
                        '-y', '-i', framePath,
                        '-vf', `scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720`,
                        '-q:v', '2', ytThumbPath,
                    ], { timeout: 10000, stdio: 'pipe' });
                    // Add text overlay
                    const withTextPath = join(dir, 'thumb-yt-frame-text.jpg');
                    const escapedTitle = shortTitle.replace(/'/g, "\\'").replace(/:/g, "\\:");
                    execFileSync('ffmpeg', [
                        '-y', '-i', ytThumbPath,
                        '-vf', [
                            `drawbox=x=0:y=ih*0.65:w=iw:h=ih*0.35:color=black@0.6:t=fill`,
                            `drawtext=text='${escapedTitle}':fontsize=64:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-h*0.22`,
                        ].join(','),
                        '-q:v', '2', withTextPath,
                    ], { timeout: 10000, stdio: 'pipe' });
                    if (existsSync(withTextPath)) {
                        const stat = statSync(withTextPath);
                        thumbnails.push({
                            id: generateId(ID_PREFIXES.asset),
                            platform: 'youtube',
                            filePath: withTextPath,
                            width: 1280, height: 720,
                            sizeBytes: stat.size,
                            prompt: `Frame extract from video at ${bestFrameTimeSec}s + text overlay`,
                            ctrPrediction: 0,
                            textOverlay: shortTitle,
                            generationMethod: 'frame_extract_enhanced',
                            metadata: { sourceFrame: bestFrameTimeSec },
                        });
                        log.info('Frame-based thumbnail created', { path: withTextPath, size: stat.size });
                    }
                }
            }
            catch (err) {
                log.warn('Frame extraction failed', { error: err.message?.slice(0, 100) });
            }
        }
        // ── Method 2: Generate AI thumbnails via Pollinations ──
        const thumbPrompts = ThumbnailPlanner.generatePrompts(topic, category, colorPalette);
        for (let i = 0; i < thumbPrompts.length; i++) {
            try {
                const prompt = thumbPrompts[i];
                const encoded = encodeURIComponent(prompt);
                const url = `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&seed=${42 + i}&nologo=true&model=flux`;
                const rawPath = join(dir, `thumb-ai-raw-${i}.jpg`);
                const finalPath = join(dir, `thumb-ai-${i}.jpg`);
                // Download AI image
                const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
                if (!response.ok)
                    continue;
                const buffer = Buffer.from(await response.arrayBuffer());
                if (buffer.length < 1000)
                    continue;
                const { writeFileSync } = await import('fs');
                writeFileSync(rawPath, buffer);
                // Resize + add text overlay
                const escapedTitle = shortTitle.replace(/'/g, "\\'").replace(/:/g, "\\:");
                execFileSync('ffmpeg', [
                    '-y', '-i', rawPath,
                    '-vf', [
                        `scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720`,
                        `drawbox=x=0:y=ih*0.6:w=iw:h=ih*0.4:color=black@0.55:t=fill`,
                        `drawtext=text='${escapedTitle}':fontsize=60:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-h*0.25`,
                    ].join(','),
                    '-q:v', '2', finalPath,
                ], { timeout: 15000, stdio: 'pipe' });
                // Clean raw
                try {
                    const { unlinkSync } = await import('fs');
                    unlinkSync(rawPath);
                }
                catch { /* ignore */ }
                if (existsSync(finalPath)) {
                    const stat = statSync(finalPath);
                    thumbnails.push({
                        id: generateId(ID_PREFIXES.asset),
                        platform: 'youtube',
                        filePath: finalPath,
                        width: 1280, height: 720,
                        sizeBytes: stat.size,
                        prompt,
                        ctrPrediction: 0,
                        textOverlay: shortTitle,
                        generationMethod: 'ai_generated',
                        metadata: { promptIndex: i, seed: 42 + i },
                    });
                    log.info('AI thumbnail created', { index: i, path: finalPath, size: stat.size });
                }
            }
            catch (err) {
                log.warn('AI thumbnail generation failed', { index: i, error: err.message?.slice(0, 80) });
            }
        }
        // ── Score all thumbnails ──
        for (const thumb of thumbnails) {
            thumb.ctrPrediction = ThumbnailPlanner.predictCtr(thumb);
        }
        // Sort by CTR prediction
        thumbnails.sort((a, b) => b.ctrPrediction - a.ctrPrediction);
        const bestThumbnail = thumbnails[0] ?? null;
        const abTestVariants = thumbnails.slice(0, 3);
        // ── Overall analysis ──
        const analysis = ThumbnailPlanner.analyzeAll(thumbnails, shortTitle);
        const processingTimeMs = Math.round(performance.now() - startTime);
        log.info('Thumbnail generation complete', {
            total: thumbnails.length,
            bestCtr: bestThumbnail?.ctrPrediction ?? 0,
            processingTimeMs,
        });
        return {
            id: generateId(ID_PREFIXES.pipeline),
            productionTitle: topic,
            thumbnails,
            bestThumbnail,
            analysis,
            abTestVariants,
            metadata: {
                totalGenerated: thumbnails.length,
                bestCtrPrediction: bestThumbnail?.ctrPrediction ?? 0,
                generatedAt: new Date().toISOString(),
                engine: 'thumbnail-engine-v1',
                processingTimeMs,
            },
        };
    }
    // ── Prompt generation ──
    static generatePrompts(topic, category, colors) {
        const base = topic.split('–')[0]?.trim().split('-')[0]?.trim() ?? topic;
        const color = colors[0] ?? '#FF6347';
        const templates = {
            automotive: [
                `${base}, dramatic studio shot, dark background, rim lighting, high contrast, professional thumbnail, bold composition, 8k`,
                `${base} on mountain road at sunset, golden hour, aerial view, breathtaking landscape, thumbnail composition, vibrant`,
                `${base} close-up detail shot, engine, chrome, dramatic lighting, dark moody background, professional product photography`,
            ],
            technology: [
                `${base}, sleek product shot, neon lighting, dark background, futuristic, thumbnail style, high contrast`,
                `${base}, holographic display, tech aesthetic, clean minimal background, professional thumbnail`,
            ],
            motivational: [
                `Silhouette of person on mountain peak at sunrise, epic sky, dramatic, motivational thumbnail, bold`,
                `Determined athlete in dramatic lighting, dark background, powerful pose, high contrast thumbnail`,
            ],
            default: [
                `${base}, dramatic professional thumbnail, bold composition, high contrast, eye-catching, 8k quality`,
                `${base}, cinematic composition, vibrant colors, professional thumbnail photography`,
            ],
        };
        return templates[category] ?? templates.default;
    }
    // ── CTR prediction ──
    static predictCtr(thumb) {
        let score = 50;
        // Text overlay present
        if (thumb.textOverlay && thumb.textOverlay.length > 0)
            score += 15;
        if (thumb.textOverlay && thumb.textOverlay.length <= 30)
            score += 5; // Short text = better
        // AI generated tends to be more eye-catching
        if (thumb.generationMethod === 'ai_generated')
            score += 10;
        if (thumb.generationMethod === 'frame_extract_enhanced')
            score += 5;
        // File size indicates detail (larger = more detailed)
        if (thumb.sizeBytes > 100000)
            score += 5;
        if (thumb.sizeBytes > 200000)
            score += 5;
        // Correct dimensions
        if (thumb.width === 1280 && thumb.height === 720)
            score += 5;
        // Cap at 95
        return Math.min(95, Math.max(20, score));
    }
    // ── Analysis ──
    static analyzeAll(thumbnails, title) {
        const hasText = thumbnails.some((t) => t.textOverlay.length > 0);
        const hasAi = thumbnails.some((t) => t.generationMethod === 'ai_generated');
        const avgCtr = thumbnails.length > 0
            ? Math.round(thumbnails.reduce((s, t) => s + t.ctrPrediction, 0) / thumbnails.length)
            : 0;
        const improvements = [];
        if (!hasText)
            improvements.push('Add bold text overlay (3-5 words max)');
        if (!hasAi)
            improvements.push('Generate AI-specific thumbnail image');
        if (title.length > 30)
            improvements.push('Shorten thumbnail text to under 30 characters');
        improvements.push('Use bright contrasting colors (yellow text on dark background)');
        improvements.push('Include a face or eyes for 38% higher CTR');
        improvements.push('Test 3 thumbnail variants with YouTube A/B testing');
        return {
            textReadability: hasText ? 80 : 30,
            visualContrast: hasAi ? 75 : 55,
            subjectClarity: 70,
            emotionalImpact: hasText ? 70 : 40,
            colorVibrancy: 65,
            compositionBalance: 70,
            ctrPrediction: avgCtr,
            overallScore: Math.round((hasText ? 80 : 30) * 0.2 + (hasAi ? 75 : 55) * 0.15 + 70 * 0.15 + avgCtr * 0.25 + 65 * 0.1 + 70 * 0.15),
            improvements,
        };
    }
    // ── Short title for overlay ──
    static generateShortTitle(topic) {
        // Take first meaningful part, max 30 chars
        const base = topic.split('–')[0]?.trim().split('-')[0]?.trim() ?? topic;
        if (base.length <= 30)
            return base.toUpperCase();
        // Take first 4-5 words
        const words = base.split(/\s+/).slice(0, 5).join(' ');
        return words.length <= 30 ? words.toUpperCase() : words.slice(0, 27).toUpperCase() + '...';
    }
}
//# sourceMappingURL=thumbnail-planner.js.map