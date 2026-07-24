export interface ImageComposition {
    ruleOfThirds: {
        subjectPosition: string;
        gridCell: string;
    };
    foreground: {
        element: string;
        depth: number;
        blur: number;
    };
    midground: {
        element: string;
        depth: number;
    };
    background: {
        element: string;
        depth: number;
        blur: number;
    };
    subjectPlacement: string;
    depthOfField: 'shallow' | 'medium' | 'deep' | 'infinite';
    framing: 'tight' | 'standard' | 'wide' | 'extreme_wide';
    leadingLines: string;
    negativeSpace: number;
}
export interface ImageCamera {
    angle: 'eye_level' | 'low_angle' | 'high_angle' | 'birds_eye' | 'worms_eye' | 'dutch' | 'overhead';
    lens: string;
    fov: number;
    distance: 'extreme_close' | 'close' | 'medium' | 'full' | 'wide' | 'extreme_wide';
    height: number;
    tracking: string;
    motion: string;
    zoom: 'none' | 'subtle' | 'moderate' | 'dramatic';
}
export interface ImageLighting {
    keyLight: {
        type: string;
        intensity: number;
        angle: string;
        color: string;
    };
    fillLight: {
        type: string;
        intensity: number;
        color: string;
    };
    backLight: {
        type: string;
        intensity: number;
        color: string;
    };
    ambientLight: number;
    shadowHardness: number;
    lightingMood: string;
    timeOfDay: string;
    lightingSummary: string;
}
export type ImageStyle = 'photorealistic' | 'cinematic' | 'anime' | '3d_render' | 'pixar' | 'comic' | 'oil_painting' | 'watercolor' | 'sketch' | 'hyperrealistic' | 'editorial' | 'documentary';
export interface ImageStyleSpec {
    primary: ImageStyle;
    secondary: ImageStyle | null;
    renderQuality: 'standard' | 'high' | 'ultra' | 'maximum';
    filmGrain: number;
    chromatic: number;
    vignette: number;
    stylePrompt: string;
}
export interface ImageColorSpec {
    palette: string[];
    dominantColor: string;
    contrast: 'low' | 'medium' | 'high' | 'extreme';
    saturation: 'desaturated' | 'muted' | 'natural' | 'vivid' | 'hyper';
    exposure: 'underexposed' | 'normal' | 'slightly_over' | 'overexposed';
    mood: string;
    temperature: 'cool' | 'neutral' | 'warm' | 'golden';
    gradingLut: string;
}
export interface IdentityLock {
    characterLock: Array<{
        entityId: string;
        identityBlock: string;
        seed: number;
    }>;
    vehicleLock: Array<{
        entityId: string;
        identityBlock: string;
        seed: number;
        color: string;
    }>;
    objectLock: Array<{
        name: string;
        description: string;
    }>;
    brandLock: {
        colors: string[];
        style: string;
    };
    globalSeed: number;
    sceneSeed: number;
    consistencyScore: number;
}
export interface ImageQualityMetrics {
    imageQuality: number;
    promptQuality: number;
    compositionScore: number;
    lightingScore: number;
    realismScore: number;
    consistencyScore: number;
    overallScore: number;
}
export interface ImageEnvironment {
    setting: string;
    weather: string;
    timeOfDay: string;
    atmosphere: string;
    terrain: string;
    skyCondition: string;
    particleEffects: string[];
}
export interface PoseSpec {
    bodyPose: string;
    handPosition: string;
    headDirection: string;
    eyeDirection: string;
    expression: string;
    dynamicAction: string;
}
export interface ImageScenePlan {
    sceneId: string;
    sceneOrder: number;
    composition: ImageComposition;
    camera: ImageCamera;
    lighting: ImageLighting;
    style: ImageStyleSpec;
    color: ImageColorSpec;
    environment: ImageEnvironment;
    identity: IdentityLock;
    pose: PoseSpec | null;
    quality: ImageQualityMetrics;
    seed: number;
    aspectRatio: string;
    resolution: string;
    masterPrompt: string;
    negativePrompt: string;
    referencePrompt: string;
    providerHints: Record<string, string>;
    confidence: number;
}
export interface ImagePlanningPackage {
    id: string;
    productionTitle: string;
    scenes: ImageScenePlan[];
    globalStyle: ImageStyleSpec;
    globalColor: ImageColorSpec;
    globalIdentity: IdentityLock;
    metadata: {
        totalScenes: number;
        avgQuality: number;
        avgConfidence: number;
        generatedAt: string;
        engine: string;
        processingTimeMs: number;
    };
}
export interface ImageExportFormats {
    fullJson: ImagePlanningPackage;
    compactJson: Array<{
        sceneId: string;
        quality: number;
        confidence: number;
        promptLength: number;
    }>;
    promptsOnly: Array<{
        sceneId: string;
        masterPrompt: string;
        negativePrompt: string;
        providerHints: Record<string, string>;
    }>;
    debugPackage: {
        scenes: number;
        avgQuality: number;
        identityLocks: number;
    };
}
export interface ImageMemoryEntry {
    id: string;
    productionTitle: string;
    packageId: string;
    avgQuality: number;
    avgConfidence: number;
    createdAt: string;
}
//# sourceMappingURL=image.types.d.ts.map