export type SfxCategory = 'vehicle' | 'nature' | 'ambient' | 'impact' | 'transition' | 'ui' | 'crowd' | 'weather' | 'mechanical' | 'whoosh' | 'musical' | 'notification';
export interface SoundEffect {
    id: string;
    name: string;
    category: SfxCategory;
    description: string;
    filePath: string;
    durationSec: number;
    sizeBytes: number;
    frequency: number;
    volume: number;
    fadeIn: number;
    fadeOut: number;
    generationMethod: 'ffmpeg_synth' | 'library' | 'ai_generated';
}
export interface SceneSfxPlan {
    sceneId: string;
    sceneOrder: number;
    effects: SoundEffect[];
    ambientTrack: SoundEffect | null;
    transitionEffect: SoundEffect | null;
    totalEffects: number;
}
export interface SfxPackage {
    id: string;
    productionTitle: string;
    scenePlans: SceneSfxPlan[];
    mixedOutputPath: string | null;
    metadata: {
        totalEffects: number;
        totalScenes: number;
        categories: Record<string, number>;
        generatedAt: string;
        engine: string;
        processingTimeMs: number;
    };
}
export interface SfxMemoryEntry {
    id: string;
    productionTitle: string;
    packageId: string;
    effectCount: number;
    createdAt: string;
}
//# sourceMappingURL=sfx.types.d.ts.map