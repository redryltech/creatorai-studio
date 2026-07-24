import type { ImageStyleSpec, ImageStyle } from './image.types';
import type { DirectorPlan } from '../director/director.types';

const STYLE_MAP: Record<string, ImageStyle> = {
  'premium automotive commercial': 'cinematic', 'automotive': 'cinematic', 'luxury': 'editorial',
  'motivational': 'cinematic', 'technology': 'hyperrealistic', 'documentary': 'documentary',
  'horror': 'cinematic', 'sports': 'photorealistic', 'anime': 'anime', 'default': 'photorealistic',
};

export class StyleEngine {
  static analyze(directorPlan?: DirectorPlan, category?: string): ImageStyleSpec {
    const style = directorPlan?.globalStyle?.toLowerCase() ?? '';
    const primary: ImageStyle = STYLE_MAP[style] ?? STYLE_MAP[category ?? ''] ?? 'photorealistic';
    return {
      primary, secondary: primary === 'cinematic' ? 'photorealistic' : null,
      renderQuality: primary === 'cinematic' || primary === 'hyperrealistic' ? 'ultra' : 'high',
      filmGrain: primary === 'cinematic' ? 0.15 : primary === 'documentary' ? 0.2 : 0,
      chromatic: primary === 'cinematic' ? 0.05 : 0,
      vignette: primary === 'cinematic' ? 0.2 : primary === 'editorial' ? 0.1 : 0,
      stylePrompt: `${primary.replace(/_/g, ' ')} style, professional quality, ${primary === 'cinematic' ? 'anamorphic lens, film grain' : primary === 'photorealistic' ? 'sharp focus, 8k detail' : 'artistic rendering'}`,
    };
  }
}
