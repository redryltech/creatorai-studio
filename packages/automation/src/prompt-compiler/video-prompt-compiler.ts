import type { ImageScenePlan } from '../image-intelligence/image.types';

const VIDEO_PROVIDERS: Record<string, { maxTokens: number; supportsDuration: boolean; supportsCamera: boolean; suffix: string }> = {
  veo: { maxTokens: 2048, supportsDuration: true, supportsCamera: true, suffix: ', cinematic quality, professional' },
  runway: { maxTokens: 1500, supportsDuration: true, supportsCamera: true, suffix: ', high quality video' },
  kling: { maxTokens: 2000, supportsDuration: true, supportsCamera: true, suffix: ', professional cinematography' },
  luma: { maxTokens: 1500, supportsDuration: true, supportsCamera: false, suffix: ', dream machine quality' },
  pika: { maxTokens: 1000, supportsDuration: true, supportsCamera: false, suffix: ', high quality' },
  hunyuan: { maxTokens: 2000, supportsDuration: true, supportsCamera: true, suffix: ', high fidelity' },
  seedance: { maxTokens: 1500, supportsDuration: true, supportsCamera: true, suffix: ', smooth motion' },
};

export class VideoPromptCompiler {
  static compile(plan: ImageScenePlan, providerId: string, duration: number): { prompt: string; negative: string; seed: number; duration: number; settings: Record<string, unknown> } {
    const cfg = VIDEO_PROVIDERS[providerId] ?? { maxTokens: 1000, supportsDuration: true, supportsCamera: false, suffix: '' };
    const motion = `${plan.camera.motion} camera movement, ${plan.camera.tracking}`;
    const words = (plan.masterPrompt + ', ' + motion).split(/\s+/);
    const limit = Math.min(words.length, Math.floor(cfg.maxTokens / 1.5));
    const prompt = words.slice(0, limit).join(' ') + cfg.suffix;
    return { prompt, negative: plan.negativePrompt, seed: plan.seed, duration, settings: { aspectRatio: plan.aspectRatio, fps: 24, resolution: plan.resolution, camera: cfg.supportsCamera ? { lens: plan.camera.lens, angle: plan.camera.angle, motion: plan.camera.motion } : undefined } };
  }

  static compileAll(plan: ImageScenePlan, duration: number): Record<string, { prompt: string; duration: number }> {
    const result: Record<string, { prompt: string; duration: number }> = {};
    for (const pid of Object.keys(VIDEO_PROVIDERS)) { const c = VideoPromptCompiler.compile(plan, pid, duration); result[pid] = { prompt: c.prompt, duration }; }
    return result;
  }
}
