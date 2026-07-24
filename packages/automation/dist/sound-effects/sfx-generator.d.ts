import type { SoundEffect, SfxCategory } from './sfx.types';
export declare class SfxGenerator {
    /**
     * Generate a sound effect from a recipe.
     */
    static generate(recipeName: string, outputDir: string): SoundEffect | null;
    /**
     * Auto-select sound effects for a scene based on content.
     */
    static selectForScene(sceneText: string, sceneOrder: number): {
        effects: string[];
        ambient: string | null;
        transition: string | null;
    };
    /** Get all available SFX names. */
    static getLibrary(): string[];
    /** Get SFX by category. */
    static getByCategory(category: SfxCategory): string[];
}
//# sourceMappingURL=sfx-generator.d.ts.map