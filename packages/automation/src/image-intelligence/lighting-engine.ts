import type { ImageLighting } from './image.types';
import type { DirectorScenePlan } from '../director/director.types';
import type { WorldSnapshot } from '../world-state/world-state.types';

const PRESETS: Record<string, Partial<ImageLighting>> = {
  golden_hour: { keyLight: { type: 'sun', intensity: 0.8, angle: '15° elevation', color: '#FFB347' }, fillLight: { type: 'sky', intensity: 0.3, color: '#87CEEB' }, backLight: { type: 'sun rim', intensity: 0.5, color: '#FFA500' }, ambientLight: 0.4, shadowHardness: 0.4, lightingMood: 'warm, golden, romantic' },
  dramatic: { keyLight: { type: 'spot', intensity: 1.0, angle: '45° side', color: '#FFFFFF' }, fillLight: { type: 'bounce', intensity: 0.2, color: '#B0C4DE' }, backLight: { type: 'rim', intensity: 0.6, color: '#E0E0E0' }, ambientLight: 0.15, shadowHardness: 0.8, lightingMood: 'intense, contrasty, moody' },
  rim_light: { keyLight: { type: 'soft', intensity: 0.6, angle: 'front', color: '#F0F0F0' }, fillLight: { type: 'bounce', intensity: 0.3, color: '#E0E0E0' }, backLight: { type: 'rim', intensity: 0.9, angle: 'behind', color: '#FFFFFF' }, ambientLight: 0.2, shadowHardness: 0.5, lightingMood: 'separated, defined edges' },
  studio: { keyLight: { type: 'softbox', intensity: 1.0, angle: '45° front-side', color: '#FAFAFA' }, fillLight: { type: 'reflector', intensity: 0.4, color: '#F5F5F5' }, backLight: { type: 'hair light', intensity: 0.5, color: '#FFFFFF' }, ambientLight: 0.3, shadowHardness: 0.3, lightingMood: 'clean, professional, controlled' },
  neon: { keyLight: { type: 'neon', intensity: 0.7, angle: 'side', color: '#FF00FF' }, fillLight: { type: 'neon', intensity: 0.5, color: '#00FFFF' }, backLight: { type: 'neon', intensity: 0.4, color: '#FF1493' }, ambientLight: 0.1, shadowHardness: 0.6, lightingMood: 'cyberpunk, vibrant, electric' },
  moonlight: { keyLight: { type: 'moon', intensity: 0.3, angle: 'high', color: '#B0C4DE' }, fillLight: { type: 'ambient', intensity: 0.1, color: '#1C1C3A' }, backLight: { type: 'none', intensity: 0, color: '#000' }, ambientLight: 0.05, shadowHardness: 0.7, lightingMood: 'mysterious, cold, ethereal' },
  natural: { keyLight: { type: 'sun', intensity: 0.9, angle: '45° elevation', color: '#FFFDE0' }, fillLight: { type: 'sky', intensity: 0.4, color: '#87CEEB' }, backLight: { type: 'bounce', intensity: 0.2, color: '#F0F0F0' }, ambientLight: 0.5, shadowHardness: 0.4, lightingMood: 'balanced, true-to-life' },
};

export class LightingEngine {
  static analyze(dirScene?: DirectorScenePlan, worldSnap?: WorldSnapshot): ImageLighting {
    const lightingKey = dirScene?.lighting ?? 'natural';
    const preset = PRESETS[lightingKey] ?? PRESETS.natural!;
    const intensity = dirScene?.lightingIntensity === 'high' ? 1.2 : dirScene?.lightingIntensity === 'low' ? 0.5 : 1.0;
    return {
      keyLight: { type: preset.keyLight?.type ?? 'sun', intensity: (preset.keyLight?.intensity ?? 0.8) * intensity, angle: preset.keyLight?.angle ?? 'front', color: preset.keyLight?.color ?? '#FFF' },
      fillLight: { type: preset.fillLight?.type ?? 'ambient', intensity: (preset.fillLight?.intensity ?? 0.3) * intensity, color: preset.fillLight?.color ?? '#EEE' },
      backLight: { type: preset.backLight?.type ?? 'rim', intensity: (preset.backLight?.intensity ?? 0.4) * intensity, color: preset.backLight?.color ?? '#FFF' },
      ambientLight: (preset.ambientLight ?? 0.3) * intensity,
      shadowHardness: preset.shadowHardness ?? 0.5,
      lightingMood: preset.lightingMood ?? 'natural',
      timeOfDay: dirScene?.timeOfDay?.replace(/_/g, ' ') ?? 'afternoon',
      lightingSummary: `${lightingKey.replace(/_/g, ' ')} lighting, ${dirScene?.lightingIntensity ?? 'medium'} intensity, ${dirScene?.shadowStyle ?? 'soft'} shadows`,
    };
  }
}
