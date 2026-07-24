export type SocialPlatform = 'youtube' | 'instagram' | 'tiktok' | 'facebook' | 'linkedin' | 'x';
export interface SeoAnalysis {
    primaryKeywords: string[];
    secondaryKeywords: string[];
    seoScore: number;
    titleOptimization: number;
    descriptionOptimization: number;
    metadataQuality: number;
    searchVisibility: number;
    suggestions: string[];
}
export interface TitleVariation {
    title: string;
    score: number;
    clickbaitRisk: number;
    lengthStatus: 'ok' | 'too_short' | 'too_long';
    emotionalPull: number;
    clarityScore: number;
}
export interface TitleAnalysis {
    variations: TitleVariation[];
    bestTitle: string;
    bestScore: number;
    averageScore: number;
    suggestions: string[];
}
export interface DescriptionPackage {
    youtube: string;
    instagram: string;
    tiktok: string;
    facebook: string;
    linkedin: string;
    x: string;
    ctaSuggestions: string[];
    linksSection: string;
    timestampSuggestions: string[];
}
export interface ThumbnailAnalysis {
    textReadability: number;
    visualHierarchy: number;
    subjectFocus: number;
    contrast: number;
    composition: number;
    ctrPrediction: number;
    overallScore: number;
    improvements: string[];
}
export interface HookAnalysis {
    first3SecondsScore: number;
    first10SecondsScore: number;
    openingSentenceScore: number;
    visualImpactScore: number;
    attentionScore: number;
    improvements: string[];
}
export interface RetentionPrediction {
    estimatedRetention: number;
    dropOffPoints: Array<{
        timeSec: number;
        severity: 'mild' | 'moderate' | 'severe';
        reason: string;
    }>;
    pacingScore: number;
    sceneBalance: number;
    estimatedWatchTimeSec: number;
    suggestions: string[];
}
export interface EngagementPrediction {
    likePrediction: number;
    commentPrediction: number;
    sharePrediction: number;
    savePrediction: number;
    subscriberConversion: number;
    audienceInteraction: number;
    engagementScore: number;
    suggestions: string[];
}
export interface HashtagPackage {
    youtube: Array<{
        tag: string;
        relevance: number;
    }>;
    instagram: Array<{
        tag: string;
        relevance: number;
    }>;
    tiktok: Array<{
        tag: string;
        relevance: number;
    }>;
    totalCount: number;
}
export interface PublishingRecommendation {
    bestUploadTime: string;
    bestDay: string;
    bestPlatform: SocialPlatform;
    exportProfile: {
        aspectRatio: string;
        resolution: string;
        fps: number;
        codec: string;
    };
    publishingChecklist: Array<{
        item: string;
        status: 'ready' | 'needs_work' | 'missing';
    }>;
    readinessScore: number;
}
export interface PlatformRecommendation {
    platform: SocialPlatform;
    optimizationScore: number;
    recommendations: string[];
    bestPostingTime: string;
    hashtagStrategy: string;
    captionStrategy: string;
}
export interface AnalyticsDashboard {
    seoScore: number;
    thumbnailScore: number;
    hookScore: number;
    retentionScore: number;
    engagementScore: number;
    audienceMatch: number;
    publishingReadiness: number;
    overallCreatorScore: number;
    radarChart: Record<string, number>;
    improvementPriorities: Array<{
        area: string;
        currentScore: number;
        targetScore: number;
        priority: 'critical' | 'high' | 'medium' | 'low';
    }>;
}
export interface PolicyWarning {
    type: 'copyright' | 'trademark' | 'misleading' | 'unsafe_claim' | 'guideline_risk';
    severity: 'critical' | 'warning' | 'info';
    description: string;
    recommendation: string;
    platform: SocialPlatform | 'all';
}
export interface CreatorSuccessPackage {
    id: string;
    productionTitle: string;
    creatorScore: number;
    seo: SeoAnalysis;
    title: TitleAnalysis;
    description: DescriptionPackage;
    thumbnail: ThumbnailAnalysis;
    hook: HookAnalysis;
    retention: RetentionPrediction;
    engagement: EngagementPrediction;
    hashtags: HashtagPackage;
    publishing: PublishingRecommendation;
    platformRecommendations: PlatformRecommendation[];
    policyWarnings: PolicyWarning[];
    analytics: AnalyticsDashboard;
    improvementSuggestions: string[];
    confidence: number;
    metadata: {
        generatedAt: string;
        engine: string;
        processingTimeMs: number;
        analyzerCount: number;
    };
}
export interface CreatorExportFormats {
    fullJson: CreatorSuccessPackage;
    compactJson: {
        creatorScore: number;
        seoScore: number;
        hookScore: number;
        retentionScore: number;
        bestTitle: string;
        confidence: number;
    };
    markdown: string;
    debugReport: {
        scores: Record<string, number>;
        warnings: number;
        suggestions: number;
    };
    analyticsReport: AnalyticsDashboard;
}
export interface CreatorMemoryEntry {
    id: string;
    productionTitle: string;
    packageId: string;
    creatorScore: number;
    seoScore: number;
    hookScore: number;
    createdAt: string;
}
//# sourceMappingURL=creator.types.d.ts.map