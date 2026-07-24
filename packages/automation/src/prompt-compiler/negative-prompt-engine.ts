// ============================================================
// CreatorAI Studio — Negative Prompt Engine
// ============================================================

import type { CharacterDatabase } from '../character/character.types';
import type { NegativePromptSpec } from './prompt.types';

const BASE_ARTIFACTS = ['jpeg artifacts', 'compression artifacts', 'aliasing', 'banding', 'moiré pattern'];
const BASE_QUALITY = ['blurry', 'low quality', 'low resolution', 'pixelated', 'grainy', 'noisy', 'overexposed', 'underexposed'];
const BASE_OBJECTS = ['watermark', 'text overlay', 'logo overlay', 'banner', 'border', 'frame', 'signature'];
const BASE_ANATOMY = ['extra limbs', 'extra fingers', 'deformed', 'mutated', 'bad anatomy', 'disfigured', 'malformed', 'ugly', 'duplicate'];
const BASE_PERSPECTIVE = ['wrong perspective', 'inconsistent perspective', 'floating objects', 'impossible geometry'];

export class NegativePromptEngine {
  /**
   * Build a negative prompt spec for a scene.
   */
  static build(
    sceneId: string,
    charDb: CharacterDatabase,
    currentVehicleColor?: string,
  ): NegativePromptSpec {
    const forbiddenObjects = [...BASE_OBJECTS];
    const forbiddenColors: string[] = [];
    const forbiddenClothing: string[] = [];
    const forbiddenVehicles: string[] = [];

    // Entity-specific negatives from character database
    for (const entity of charDb.entities) {
      if (!entity.scenePresence.includes(sceneId)) continue;

      // Forbidden changes from appearance memory
      for (const rule of entity.appearance.forbiddenChanges) {
        const lower = rule.toLowerCase();
        if (lower.includes('color')) {
          // Add wrong colors for vehicles
          if (entity.category === 'vehicle' && entity.vehicleProfile) {
            const rightColor = entity.vehicleProfile.primaryColor.toLowerCase();
            const wrongColors = ['red', 'blue', 'white', 'silver', 'orange', 'yellow', 'pink', 'purple'].filter((c) => c !== rightColor);
            forbiddenColors.push(...wrongColors.map((c) => `${c} vehicle`));
          }
        }
        if (lower.includes('clothing') || lower.includes('outfit')) {
          forbiddenClothing.push('wrong outfit', 'different clothing', 'casual wear when riding gear expected');
        }
        if (lower.includes('model') || lower.includes('vehicle')) {
          forbiddenVehicles.push('wrong motorcycle model', 'different vehicle', 'car instead of motorcycle');
        }
      }
    }

    // Compile all sections
    const allParts = [
      ...BASE_QUALITY,
      ...BASE_ANATOMY,
      ...BASE_ARTIFACTS,
      ...BASE_PERSPECTIVE,
      ...forbiddenObjects,
      ...forbiddenColors,
      ...forbiddenClothing,
      ...forbiddenVehicles,
    ];

    // Deduplicate
    const unique = [...new Set(allParts)];

    return {
      forbiddenObjects,
      forbiddenColors,
      forbiddenClothing,
      forbiddenVehicles,
      artifacts: BASE_ARTIFACTS,
      quality: BASE_QUALITY,
      perspective: BASE_PERSPECTIVE,
      compiled: unique.join(', '),
    };
  }

  /**
   * Get a provider-optimized negative prompt.
   */
  static forProvider(spec: NegativePromptSpec, providerId: string): string {
    // Some providers have limited negative prompt support
    switch (providerId) {
      case 'midjourney':
        return `--no ${spec.compiled.split(', ').slice(0, 10).join(', ')}`;
      case 'dall_e':
        // DALL-E doesn't support negative prompts — return empty
        return '';
      default:
        return spec.compiled;
    }
  }
}
