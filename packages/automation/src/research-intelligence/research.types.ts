// ============================================================
// CreatorAI Studio — Research Intelligence Engine Types
// ============================================================
// Comprehensive market research, trend analysis, keyword
// engineering, competitor mapping, and audience profiling.
// ============================================================

// ── Content Categories ────────────────────────────────────

export type ContentCategory =
  | 'automotive' | 'technology' | 'motivational' | 'sports' | 'luxury'
  | 'travel' | 'food' | 'education' | 'entertainment' | 'gaming'
  | 'fashion' | 'health' | 'finance' | 'news' | 'music' | 'comedy'
  | 'science' | 'documentary' | 'horror' | 'beauty' | 'pets'
  | 'real_estate' | 'crypto' | 'spiritual' | 'diy' | 'general';

// ── Platform Types ────────────────────────────────────────

export type Platform = 'youtube_shorts' | 'youtube' | 'instagram_reels' | 'tiktok' | 'facebook' | 'linkedin' | 'x';

// ── Trend Data ────────────────────────────────────────────

/** A single trend signal from a platform or search engine. */
export interface TrendSignal {
  platform: Platform | 'google_search' | 'seasonal';
  topic: string;
  score: number;        // 0-100
  velocity: 'rising' | 'stable' | 'falling' | 'viral' | 'emerging';
  volume: 'low' | 'medium' | 'high' | 'massive';
  timeframe: 'last_24h' | 'last_7d' | 'last_30d' | 'last_90d';
  confidence: number;   // 0-1
}

/** Aggregated trend analysis across all platforms. */
export interface TrendAnalysis {
  signals: TrendSignal[];
  overallTrendScore: number;          // 0-100
  bestPlatform: Platform;
  peakTimingHint: string;
  seasonalRelevance: number;          // 0-1
  viralPotential: number;             // 0-100
  trendSummary: string;
}

// ── Keywords ──────────────────────────────────────────────

export interface KeywordData {
  keyword: string;
  type: 'primary' | 'secondary' | 'long_tail' | 'semantic';
  searchVolume: 'low' | 'medium' | 'high' | 'very_high';
  competition: 'low' | 'medium' | 'high';
  seoScore: number;                   // 0-100
  relevance: number;                  // 0-1
}

export interface KeywordPackage {
  primary: KeywordData[];
  secondary: KeywordData[];
  longTail: KeywordData[];
  semantic: KeywordData[];
  overallSeoScore: number;
  titleSuggestions: string[];
  hashtagSuggestions: string[];
}

// ── Competitor Analysis ───────────────────────────────────

export interface CompetitorProfile {
  name: string;
  platform: Platform;
  estimatedSubscribers: string;
  contentStyle: string;
  postingFrequency: string;
  strengths: string[];
  weaknesses: string[];
  topPerformingContent: string[];
  avgEngagement: 'low' | 'medium' | 'high' | 'very_high';
}

export interface CompetitorAnalysis {
  competitors: CompetitorProfile[];
  marketSaturation: 'low' | 'medium' | 'high' | 'oversaturated';
  differentiationOpportunities: string[];
  contentStrategyInsights: string[];
  improvementAreas: string[];
}

// ── Audience Analysis ─────────────────────────────────────

export interface AudienceSegment {
  name: string;
  ageRange: string;
  gender: 'male' | 'female' | 'all';
  interests: string[];
  watchBehavior: string;
  preferredPlatforms: Platform[];
  peakActiveHours: string;
  contentPreferences: string[];
  size: 'niche' | 'medium' | 'large' | 'massive';
}

export interface AudienceAnalysis {
  primaryAudience: AudienceSegment;
  secondaryAudiences: AudienceSegment[];
  totalAddressableMarket: string;
  engagementPrediction: number;       // 0-100
  retentionPrediction: number;        // 0-100
  audienceSummary: string;
}

// ── Topic Discovery ───────────────────────────────────────

export interface TopicIdea {
  title: string;
  angle: string;
  estimatedInterest: number;          // 0-100
  competition: 'low' | 'medium' | 'high';
  type: 'related' | 'subtopic' | 'faq' | 'future' | 'trending' | 'evergreen';
}

export interface TopicDiscovery {
  relatedTopics: TopicIdea[];
  subtopics: TopicIdea[];
  faqs: TopicIdea[];
  futureIdeas: TopicIdea[];
  contentCalendarSuggestions: string[];
}

// ── Content Gap Analysis ──────────────────────────────────

export interface ContentGap {
  gap: string;
  opportunity: string;
  competition: 'none' | 'low' | 'medium';
  estimatedDemand: number;            // 0-100
  suggestedAngle: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface ContentGapAnalysis {
  gaps: ContentGap[];
  totalOpportunities: number;
  topOpportunity: ContentGap | null;
  gapSummary: string;
}

// ── Quality Metrics ───────────────────────────────────────

export interface ResearchQualityMetrics {
  completeness: number;               // 0-100
  confidence: number;                 // 0-100
  consistency: number;                // 0-100
  depth: number;                      // 0-100
  actionability: number;              // 0-100
  overallQuality: number;             // 0-100
}

// ════════════════════════════════════════════════════════════
// Research Package — the complete output
// ════════════════════════════════════════════════════════════

export interface ResearchPackage {
  id: string;
  topic: string;
  category: ContentCategory;
  keywords: KeywordPackage;
  competitors: CompetitorAnalysis;
  trends: TrendAnalysis;
  audience: AudienceAnalysis;
  topicDiscovery: TopicDiscovery;
  contentGaps: ContentGapAnalysis;
  contentIdeas: TopicIdea[];
  recommendedPlatforms: Platform[];
  recommendedDuration: { min: number; max: number; optimal: number };
  researchSummary: string;
  confidenceScore: number;
  qualityMetrics: ResearchQualityMetrics;
  metadata: {
    generatedAt: string;
    engine: string;
    processingTimeMs: number;
    dataSourceCount: number;
  };
}

// ── Export Formats ─────────────────────────────────────────

export interface ResearchExportFormats {
  fullJson: ResearchPackage;
  compactJson: { topic: string; category: string; keywordCount: number; competitorCount: number; trendScore: number; confidence: number };
  markdown: string;
  debugPackage: { metrics: ResearchQualityMetrics; gapCount: number; ideaCount: number };
}

// ── Memory ────────────────────────────────────────────────

export interface ResearchMemoryEntry {
  id: string;
  topic: string;
  category: ContentCategory;
  packageId: string;
  confidenceScore: number;
  qualityScore: number;
  createdAt: string;
}
