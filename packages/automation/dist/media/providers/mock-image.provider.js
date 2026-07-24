// ============================================================
// CreatorAI Studio — Mock Image Provider (Development Mode)
// ============================================================
// Generates placeholder images using SVG data URIs when
// no image generation API key is configured.
//
// Each "image" is a colored SVG with the scene info overlaid.
// This allows the full pipeline (timeline → render → MP4)
// to execute without any paid API.
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
const log = Logger.for('MockImageProvider');
const COLORS = ['#4263eb', '#f59f00', '#51cf66', '#ff6b6b', '#cc5de8', '#20c997', '#fd7e14', '#339af0'];
export class MockImageProvider {
    providerId = 'mock_image';
    providerName = 'Mock Image (Dev Mode)';
    mediaType = 'image';
    priority = 99; // Low priority — real providers override
    async isAvailable() { return true; }
    estimateCost() { return 0; }
    async healthCheck() { return { healthy: true, latencyMs: 0 }; }
    async generate(request) {
        const prompt = request.prompt ?? 'Development mode placeholder';
        const width = request.width ?? 1080;
        const height = request.height ?? 1920;
        const sceneId = request.sceneId ?? 'scene';
        const color = COLORS[Math.abs(hashCode(prompt)) % COLORS.length];
        const shortPrompt = prompt.slice(0, 60).replace(/[<>&"']/g, '');
        log.info('Mock image generated', { width, height, prompt: shortPrompt });
        // Generate a real PNG file using FFmpeg (if available) or a simple colored file
        const outDir = join(tmpdir(), 'creatorai-mock-images');
        if (!existsSync(outDir))
            mkdirSync(outDir, { recursive: true });
        const filePath = join(outDir, `${generateId(ID_PREFIXES.asset)}.png`);
        try {
            // Try FFmpeg for a real PNG
            const { execSync } = await import('child_process');
            execSync(`ffmpeg -y -f lavfi -i "color=c=${color.replace('#', '0x')}:s=${width}x${height}:d=1" -frames:v 1 "${filePath}" 2>/dev/null`, { timeout: 5000 });
        }
        catch {
            // Fallback: write a minimal 1x1 PNG and note it
            const minimalPNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
            writeFileSync(filePath, minimalPNG);
        }
        return {
            success: true,
            url: `file://${filePath}`,
            buffer: null,
            duration: null,
            metadata: { mockGenerated: true, width, height, color, prompt: shortPrompt, sceneId },
            costUsd: 0,
            provider: this.providerId,
            model: 'mock-placeholder',
            error: null,
        };
    }
}
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return hash;
}
//# sourceMappingURL=mock-image.provider.js.map