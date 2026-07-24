import type { CharacterDatabase } from '../character/character.types';
import type { NegativePromptSpec } from './prompt.types';
export declare class NegativePromptEngine {
    /**
     * Build a negative prompt spec for a scene.
     */
    static build(sceneId: string, charDb: CharacterDatabase, currentVehicleColor?: string): NegativePromptSpec;
    /**
     * Get a provider-optimized negative prompt.
     */
    static forProvider(spec: NegativePromptSpec, providerId: string): string;
}
//# sourceMappingURL=negative-prompt-engine.d.ts.map