export interface PromptBlock {
    id: string;
    type: 'visual' | 'camera' | 'character' | 'vehicle' | 'environment' | 'motion' | 'lighting' | 'effects' | 'composition' | 'audio' | 'brand' | 'continuity';
    content: string;
    priority: number;
    tokenEstimate: number;
}
export interface CanonicalPrompt {
    sceneId: string;
    sceneOrder: number;
    sceneSummary: string;
    visualObjective: string;
    blocks: PromptBlock[];
    masterPrompt: string;
    negativePrompt: string;
    tokenCount: number;
    estimatedComplexity: number;
}
export interface NegativePromptSpec {
    forbiddenObjects: string[];
    forbiddenColors: string[];
    forbiddenClothing: string[];
    forbiddenVehicles: string[];
    artifacts: string[];
    quality: string[];
    perspective: string[];
    compiled: string;
}
export interface ProviderSettings {
    duration: number;
    aspectRatio: string;
    fps: number;
    resolution: string;
    seed: number;
    negativePrompt: string;
    cameraMetadata: Record<string, unknown>;
    styleMetadata: Record<string, unknown>;
}
export interface ProviderPrompt {
    providerId: string;
    providerName: string;
    prompt: string;
    negativePrompt: string;
    settings: ProviderSettings;
    tokenCount: number;
    estimatedCost: number;
    supportLevel: 'full' | 'partial' | 'basic';
}
export interface PromptQualityScore {
    completeness: number;
    characterQuality: number;
    sceneQuality: number;
    cameraQuality: number;
    lightingQuality: number;
    motionQuality: number;
    providerReadiness: number;
    overallScore: number;
}
export interface PromptConflict {
    type: 'brand' | 'lighting' | 'character' | 'world_state' | 'camera' | 'color' | 'length';
    severity: 'critical' | 'warning' | 'info';
    description: string;
    resolution: string;
    autoResolved: boolean;
}
export type PromptLength = 'short' | 'balanced' | 'detailed' | 'maximum_quality';
export interface CompiledPromptPackage {
    id: string;
    productionTitle: string;
    canonicalPrompts: CanonicalPrompt[];
    providerPrompts: Record<string, ProviderPrompt[]>;
    negativeSpecs: NegativePromptSpec[];
    qualityScores: PromptQualityScore[];
    conflicts: PromptConflict[];
    metadata: {
        totalScenes: number;
        totalProviders: number;
        avgTokenCount: number;
        avgQualityScore: number;
        totalConflicts: number;
        promptLength: PromptLength;
        generatedAt: string;
        engine: string;
        processingTimeMs: number;
    };
}
export interface PromptExportFormats {
    canonicalJson: CanonicalPrompt[];
    providerPackage: Record<string, ProviderPrompt[]>;
    negativePackage: NegativePromptSpec[];
    promptReport: {
        scenes: number;
        providers: number;
        avgScore: number;
        conflicts: number;
    };
    promptMetrics: {
        tokenCounts: number[];
        complexities: number[];
        scores: number[];
    };
    debugPackage: {
        conflicts: PromptConflict[];
        lowScoreScenes: string[];
    };
}
export interface PromptCompilerMemoryEntry {
    id: string;
    productionTitle: string;
    packageId: string;
    avgScore: number;
    totalTokens: number;
    createdAt: string;
}
//# sourceMappingURL=prompt.types.d.ts.map