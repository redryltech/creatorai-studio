export interface ThumbnailPromptSpec { prompt: string; textOverlay: string; platform: string; aspectRatio: string; }

export class ThumbnailPromptCompiler {
  static compile(topic: string, bestFrame: string): Record<string, ThumbnailPromptSpec> {
    const base = `${bestFrame}, dramatic hero shot, bold composition, eye-catching, high contrast, professional thumbnail`;
    return {
      youtube: { prompt: `${base}, YouTube thumbnail style, 1280x720`, textOverlay: topic.slice(0, 30), platform: 'youtube', aspectRatio: '16:9' },
      instagram: { prompt: `${base}, Instagram cover, square crop`, textOverlay: topic.slice(0, 20), platform: 'instagram', aspectRatio: '1:1' },
      tiktok: { prompt: `${base}, TikTok cover, vertical`, textOverlay: topic.slice(0, 15), platform: 'tiktok', aspectRatio: '9:16' },
    };
  }
}
