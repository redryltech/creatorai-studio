export type AssetCategory = 'character' | 'vehicle' | 'animal' | 'product' | 'building' | 'prop' | 'weapon' | 'logo' | 'icon' | 'font' | 'music' | 'voice' | 'sound_effect' | 'environment' | 'transition' | 'intro' | 'outro' | 'thumbnail_template' | 'overlay_template' | 'brand_element' | 'prompt_template';
export interface AssetRecord {
    assetId: string;
    uuid: string;
    name: string;
    category: AssetCategory;
    subcategory: string;
    version: string;
    createdAt: string;
    modifiedAt: string;
    projectOrigin: string;
    tags: string[];
    description: string;
    previewMetadata: Record<string, unknown>;
    usageCount: number;
    favorite: boolean;
    archived: boolean;
    data: Record<string, unknown>;
}
export interface CharacterAsset {
    referenceIdentity: string;
    appearance: string;
    preferredSeed: number;
    referenceImagesMeta: string[];
    identityBlock: string;
    clothing: string;
    accessories: string[];
    voice: string;
    expressions: string[];
    forbiddenChanges: string[];
}
export interface VehicleAsset {
    manufacturer: string;
    model: string;
    variant: string;
    color: string;
    wheelDesign: string;
    exhaust: string;
    decals: string[];
    preferredCameraAngles: string[];
    preferredLighting: string[];
    referenceIdentity: string;
}
export interface EnvironmentAsset {
    location: string;
    terrain: string;
    roadType: string;
    buildings: string;
    sky: string;
    weather: string;
    lighting: string;
    atmosphere: string;
    cameraPresets: string[];
}
export interface BrandKit {
    id: string;
    brandName: string;
    primaryColors: string[];
    secondaryColors: string[];
    accentColors: string[];
    typography: {
        heading: string;
        body: string;
        accent: string;
    };
    logoMeta: {
        name: string;
        variants: string[];
        placement: string;
    };
    watermark: string;
    animationStyle: string;
    introStyle: string;
    outroStyle: string;
    thumbnailStyle: string;
    socialTemplates: Record<string, string>;
    createdAt: string;
    modifiedAt: string;
}
export interface StyleGuide {
    id: string;
    visualStyle: string;
    colorGrading: string;
    cameraStyle: string;
    lightingStyle: string;
    motionStyle: string;
    transitionStyle: string;
    musicStyle: string;
    narrationStyle: string;
    editingStyle: string;
    createdAt: string;
}
export type PromptTemplateCategory = 'commercial' | 'cinematic' | 'documentary' | 'luxury' | 'travel' | 'sports' | 'tech' | 'education' | 'motivational' | 'product_review' | 'podcast' | 'youtube_shorts';
export interface PromptTemplate {
    id: string;
    name: string;
    category: PromptTemplateCategory;
    imagePromptTemplate: string;
    videoPromptTemplate: string;
    negativePromptTemplate: string;
    styleSuffix: string;
    variables: string[];
    usageCount: number;
    createdAt: string;
}
export interface AssetReference {
    id: string;
    sourceAssetId: string;
    targetAssetId: string;
    relationship: 'parent' | 'child' | 'depends_on' | 'variant_of' | 'used_with';
    createdAt: string;
}
export interface EmbeddingRecord {
    id: string;
    assetId: string;
    type: 'visual' | 'audio' | 'style' | 'character' | 'environment';
    placeholder: string;
    providerHints: Record<string, string>;
    createdAt: string;
}
export interface VersionEntry {
    version: string;
    assetId: string;
    changes: string;
    data: Record<string, unknown>;
    createdAt: string;
}
export interface AssetMemoryPackage {
    id: string;
    productionTitle: string;
    assets: AssetRecord[];
    brandKit: BrandKit | null;
    styleGuide: StyleGuide | null;
    promptTemplates: PromptTemplate[];
    references: AssetReference[];
    embeddings: EmbeddingRecord[];
    recommendations: Array<{
        type: string;
        assetId: string;
        reason: string;
        score: number;
    }>;
    metadata: {
        totalAssets: number;
        categories: Record<string, number>;
        generatedAt: string;
        engine: string;
        processingTimeMs: number;
    };
}
export interface AssetExportFormats {
    assetLibraryJson: AssetRecord[];
    brandKitJson: BrandKit | null;
    styleGuideJson: StyleGuide | null;
    promptTemplatePackage: PromptTemplate[];
    referencePackage: AssetReference[];
    debugPackage: {
        totalAssets: number;
        categories: Record<string, number>;
        orphans: string[];
    };
}
export interface AssetMemoryEntry {
    id: string;
    productionTitle: string;
    packageId: string;
    assetCount: number;
    hasBrandKit: boolean;
    createdAt: string;
}
//# sourceMappingURL=asset.types.d.ts.map