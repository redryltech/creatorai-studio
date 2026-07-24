import type { ImageScenePlan } from '../image-intelligence/image.types';

const PROVIDER_LIMITS: Record<string, { maxTokens: number; supportsNegative: boolean; suffix: string }> = {
  pollinations: { maxTokens: 800, supportsNegative: false, suffix: ', photorealistic, 8k quality' },
  flux: { maxTokens: 1000, supportsNegative: false, suffix: ', photorealistic, 8k' },
  replicate: { maxTokens: 1500, supportsNegative: true, suffix: ', high quality, detailed' },
  openai: { maxTokens: 4000, supportsNegative: false, suffix: '' },
  dall_e: { maxTokens: 4000, supportsNegative: false, suffix: ', photographic quality' },
  imagen: { maxTokens: 1500, supportsNegative: true, suffix: ', photographic quality' },
  midjourney: { maxTokens: 500, supportsNegative: true, suffix: ' --ar 9:16 --v 6 --style raw' },
};

export class ImagePromptCompiler {
  static compile(plan: ImageScenePlan, providerId: string): { prompt: string; negative: string; seed: number; settings: Record<string, unknown> } {
    const cfg = PROVIDER_LIMITS[providerId] ?? { maxTokens: 1000, supportsNegative: true, suffix: '' };
    const words = plan.masterPrompt.split(/\s+/);
    const limit = Math.min(words.length, Math.floor(cfg.maxTokens / 1.5));
    const prompt = words.slice(0, limit).join(' ') + cfg.suffix;
    return {
      prompt,
      negative: cfg.supportsNegative ? plan.negativePrompt : '',
      seed: plan.seed,
      settings: { aspectRatio: plan.aspectRatio, resolution: plan.resolution, style: plan.style.primary, quality: plan.style.renderQuality },
    };
  }

  static compileAll(plan: ImageScenePlan): Record<string, { prompt: string; negative: string; seed: number }> {
    const result: Record<string, { prompt: string; negative: string; seed: number }> = {};
    for (const pid of Object.keys(PROVIDER_LIMITS)) result[pid] = ImagePromptCompiler.compile(plan, pid);
    return result;
  }
}
