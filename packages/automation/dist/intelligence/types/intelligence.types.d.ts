export type AnalyticsPlatform = 'youtube' | 'instagram' | 'tiktok' | 'facebook' | 'linkedin' | 'x';
export interface AnalyticsSnapshot {
    id: string;
    userId: string;
    projectId: string;
    platformPostId: string;
    platform: AnalyticsPlatform;
    fetchedAt: Date;
    metrics: {
        views: number;
        impressions: number;
        ctr: number;
        watchTimeSeconds: number;
        averageViewDuration: number;
        audienceRetention: number;
        subscribers: number;
        followers: number;
        likes: number;
        comments: number;
        shares: number;
        saves: number;
        revenue: number;
        rpm: number;
        cpm: number;
    };
    demographics: {
        topCountries: Array<{
            country: string;
            percentage: number;
        }>;
        ageGroups: Array<{
            range: string;
            percentage: number;
        }>;
        genderSplit: {
            male: number;
            female: number;
            other: number;
        };
    } | null;
    trafficSources: Array<{
        source: string;
        percentage: number;
    }>;
}
export interface AnalyticsHistory {
    platformPostId: string;
    platform: AnalyticsPlatform;
    snapshots: AnalyticsSnapshot[];
    trend: {
        direction: 'growing' | 'stable' | 'declining';
        velocity: number;
    };
}
export interface LearningMemory {
    id: string;
    userId: string;
    category: 'hook' | 'title' | 'thumbnail' | 'duration' | 'publish_time' | 'cta' | 'visual_style' | 'voice_style' | 'topic' | 'hashtag';
    pattern: string;
    score: number;
    sampleCount: number;
    confidence: number;
    examples: Array<{
        contentId: string;
        value: string;
        performanceScore: number;
    }>;
    lastUpdated: Date;
}
export interface ContentScore {
    contentId: string;
    platform: AnalyticsPlatform;
    overallScore: number;
    breakdown: {
        hookScore: number;
        retentionScore: number;
        engagementScore: number;
        seoScore: number;
        viralityScore: number;
    };
    benchmarks: {
        vsChannelAverage: number;
        vsPlatformAverage: number;
        vsNicheAverage: number;
    };
}
export interface PromptVersion {
    id: string;
    userId: string;
    promptType: 'image' | 'video' | 'script' | 'seo' | 'voice';
    version: number;
    prompt: string;
    performanceScore: number | null;
    usageCount: number;
    averageContentScore: number | null;
    createdAt: Date;
    metadata: Record<string, unknown>;
}
export interface StrategyRecommendation {
    id: string;
    userId: string;
    type: 'topic' | 'timing' | 'style' | 'platform' | 'format' | 'improvement' | 'warning';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    expectedImpact: string;
    confidence: number;
    actionable: boolean;
    action: string | null;
    data: Record<string, unknown>;
    createdAt: Date;
    expiresAt: Date | null;
}
export interface PerformancePrediction {
    contentId: string;
    platform: AnalyticsPlatform;
    predictedViews: {
        low: number;
        mid: number;
        high: number;
    };
    predictedCtr: number;
    predictedWatchTime: number;
    predictedEngagement: number;
    viralityScore: number;
    confidence: number;
    factors: Array<{
        factor: string;
        impact: 'positive' | 'negative' | 'neutral';
        weight: number;
    }>;
    predictedAt: Date;
}
export interface TrendReport {
    id: string;
    userId: string;
    generatedAt: Date;
    emergingTrends: Array<{
        topic: string;
        platform: string;
        velocity: number;
        relevance: number;
        source: string;
    }>;
    breakingTopics: Array<{
        topic: string;
        urgency: 'high' | 'medium' | 'low';
        window: string;
    }>;
    viralOpportunities: Array<{
        topic: string;
        estimatedReach: string;
        competition: string;
        suggestedAngle: string;
    }>;
    nicheInsights: string[];
}
export interface KnowledgeEntry {
    id: string;
    userId: string;
    category: 'prompt' | 'thumbnail' | 'script' | 'seo' | 'schedule' | 'hook' | 'brand' | 'audience';
    title: string;
    content: string;
    performanceScore: number;
    tags: string[];
    usageCount: number;
    sourceContentId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface AudienceInsight {
    userId: string;
    platform: AnalyticsPlatform;
    totalFollowers: number;
    growthRate: number;
    topInterests: string[];
    peakActivityHours: Array<{
        hour: number;
        day: string;
        engagement: number;
    }>;
    contentPreferences: Array<{
        type: string;
        engagementRate: number;
    }>;
    demographics: {
        primaryAge: string;
        topCountries: string[];
        genderSplit: Record<string, number>;
    };
    generatedAt: Date;
}
export type ReportPeriod = 'daily' | 'weekly' | 'monthly';
export interface InsightReport {
    id: string;
    userId: string;
    period: ReportPeriod;
    startDate: Date;
    endDate: Date;
    summary: {
        totalViews: number;
        totalEngagement: number;
        totalRevenue: number;
        subscriberChange: number;
        contentPublished: number;
        bestPerformingContent: string;
        worstPerformingContent: string;
        growthTrend: 'accelerating' | 'steady' | 'slowing' | 'declining';
    };
    platformBreakdown: Record<AnalyticsPlatform, {
        views: number;
        engagement: number;
        growth: number;
    }>;
    topContent: Array<{
        id: string;
        title: string;
        views: number;
        engagement: number;
        score: number;
    }>;
    recommendations: StrategyRecommendation[];
    channelHealthScore: number;
    generatedAt: Date;
}
export interface OptimizationReport {
    userId: string;
    areas: Array<{
        area: 'schedule' | 'provider' | 'cost' | 'quality' | 'speed' | 'render';
        currentValue: string;
        suggestedValue: string;
        expectedImprovement: string;
        confidence: number;
    }>;
    costSavings: number;
    timeSavings: number;
    qualityImprovement: number;
    generatedAt: Date;
}
//# sourceMappingURL=intelligence.types.d.ts.map