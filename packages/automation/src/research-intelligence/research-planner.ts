// ============================================================
// CreatorAI Studio — Research Planner
// ============================================================
// Orchestrates all analyzers to produce a complete
// ResearchPackage from a single topic input.
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { ResearchPackage, ContentCategory, Platform, ResearchQualityMetrics } from './research.types';
import { TrendAnalyzer } from './trend-analyzer';
import { KeywordEngine } from './keyword-engine';
import { CompetitorAnalyzer } from './competitor-analyzer';
import { AudienceAnalyzer } from './audience-analyzer';
import { TopicDiscoveryEngine } from './topic-discovery';
import { ContentGapAnalyzer } from './content-gap-analyzer';

const log = Logger.for('ResearchPlanner');

/** Topic → category detection keywords. */
const CATEGORY_RULES: Array<{ keywords: string[]; category: ContentCategory }> = [
  { keywords: ['car', 'motorcycle', 'bike', 'vehicle', 'engine', 'kawasaki', 'yamaha', 'honda', 'bmw', 'ducati', 'ferrari', 'porsche', 'ride', 'racing', 'exhaust', 'horsepower'], category: 'automotive' },
  { keywords: ['ai', 'technology', 'tech', 'software', 'app', 'computer', 'robot', 'coding', 'programming', 'startup', 'saas', 'digital', 'gadget'], category: 'technology' },
  { keywords: ['motivat', 'inspir', 'success', 'winner', 'discipline', 'mindset', 'hustle', 'grind', 'never quit', 'dream', 'goal'], category: 'motivational' },
  { keywords: ['sport', 'cricket', 'football', 'basketball', 'fitness', 'gym', 'workout', 'athlete', 'ipl', 'match'], category: 'sports' },
  { keywords: ['luxury', 'premium', 'brand', 'fashion', 'rolex', 'gucci', 'louis vuitton', 'yacht', 'mansion'], category: 'luxury' },
  { keywords: ['travel', 'destination', 'explore', 'adventure', 'tourism', 'backpack', 'wanderlust'], category: 'travel' },
  { keywords: ['food', 'recipe', 'cooking', 'restaurant', 'kitchen', 'chef', 'street food', 'baking'], category: 'food' },
  { keywords: ['learn', 'education', 'tutorial', 'course', 'study', 'exam', 'school', 'college', 'university'], category: 'education' },
  { keywords: ['money', 'invest', 'stock', 'crypto', 'finance', 'trading', 'budget', 'wealth', 'tax'], category: 'finance' },
  { keywords: ['health', 'wellness', 'yoga', 'meditation', 'diet', 'weight loss', 'nutrition', 'mental health'], category: 'health' },
  { keywords: ['game', 'gaming', 'esports', 'playstation', 'xbox', 'pc gaming', 'minecraft', 'gta', 'valorant'], category: 'gaming' },
  { keywords: ['horror', 'scary', 'ghost', 'thriller', 'creepy', 'paranormal', 'dark', 'crime'], category: 'horror' },
  { keywords: ['news', 'breaking', 'politics', 'government', 'election', 'current affairs'], category: 'news' },
  { keywords: ['comedy', 'funny', 'joke', 'meme', 'laugh', 'prank', 'standup'], category: 'comedy' },
  { keywords: ['music', 'song', 'singer', 'album', 'concert', 'rap', 'hip hop', 'bollywood'], category: 'music' },
  { keywords: ['beauty', 'makeup', 'skincare', 'cosmetics', 'tutorial', 'haul'], category: 'beauty' },
  { keywords: ['pet', 'dog', 'cat', 'animal', 'puppy', 'kitten', 'wildlife'], category: 'pets' },
  { keywords: ['real estate', 'property', 'house', 'apartment', 'flat', 'rent', 'home tour'], category: 'real_estate' },
  { keywords: ['spiritual', 'meditation', 'temple', 'prayer', 'god', 'dharma', 'karma'], category: 'spiritual' },
  { keywords: ['diy', 'craft', 'handmade', 'build', 'woodwork', 'repair', 'project'], category: 'diy' },
  { keywords: ['documentary', 'history', 'science', 'nature', 'space', 'earth', 'ocean'], category: 'documentary' },
];

export class ResearchPlanner {
  /**
   * Run complete research for a topic.
   * @param topic — The user's content idea
   * @returns ResearchPackage with all analysis results
   */
  static research(topic: string): ResearchPackage {
    const startTime = performance.now();

    log.info('Research starting', { topic: topic.slice(0, 60) });

    // ── Step 1: Classify category ──
    const category = ResearchPlanner.classifyCategory(topic);
    log.info('Category classified', { topic: topic.slice(0, 40), category });

    // ── Step 2: Run all analyzers ──
    const trends = TrendAnalyzer.analyze(topic, category);
    const keywords = KeywordEngine.generate(topic, category);
    const competitors = CompetitorAnalyzer.analyze(topic, category);
    const audience = AudienceAnalyzer.analyze(topic, category);
    const topicDiscovery = TopicDiscoveryEngine.discover(topic, category);
    const contentGaps = ContentGapAnalyzer.analyze(topic, category);

    // ── Step 3: Aggregate content ideas ──
    const contentIdeas = [
      ...topicDiscovery.relatedTopics.slice(0, 3),
      ...topicDiscovery.subtopics.slice(0, 2),
      ...topicDiscovery.faqs.slice(0, 2),
      ...topicDiscovery.futureIdeas.slice(0, 2),
    ];

    // ── Step 4: Recommended platforms ──
    const recommendedPlatforms = trends.signals
      .filter((s) => s.score > 60 && s.platform !== 'google_search' && s.platform !== 'seasonal')
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((s) => s.platform as Platform);

    if (recommendedPlatforms.length === 0) recommendedPlatforms.push('youtube_shorts');

    // ── Step 5: Recommended duration ──
    const recommendedDuration = {
      min: 30,
      max: 60,
      optimal: category === 'education' ? 45 : category === 'motivational' ? 35 : 40,
    };

    // ── Step 6: Confidence score ──
    const confidenceScore = Math.round(
      trends.overallTrendScore * 0.2 +
      keywords.overallSeoScore * 0.2 +
      audience.engagementPrediction * 0.2 +
      (100 - (competitors.marketSaturation === 'oversaturated' ? 80 : competitors.marketSaturation === 'high' ? 50 : competitors.marketSaturation === 'medium' ? 30 : 10)) * 0.2 +
      contentGaps.totalOpportunities * 5 * 0.2,
    );

    // ── Step 7: Quality metrics ──
    const qualityMetrics = ResearchPlanner.computeQualityMetrics(trends, keywords, competitors, audience, contentGaps);

    // ── Step 8: Research summary ──
    const researchSummary = `Research for "${topic}" (${category}). ` +
      `Trend score: ${trends.overallTrendScore}/100. SEO score: ${keywords.overallSeoScore}/100. ` +
      `Market: ${competitors.marketSaturation}. Audience: ${audience.primaryAudience.name} (${audience.primaryAudience.size}). ` +
      `${contentGaps.totalOpportunities} content gaps found. Best platform: ${trends.bestPlatform.replace(/_/g, ' ')}. ` +
      `Confidence: ${confidenceScore}/100.`;

    const processingTimeMs = Math.round(performance.now() - startTime);

    log.info('Research complete', { topic: topic.slice(0, 40), category, confidence: confidenceScore, quality: qualityMetrics.overallQuality, processingTimeMs });

    return {
      id: generateId(ID_PREFIXES.pipeline),
      topic,
      category,
      keywords,
      competitors,
      trends,
      audience,
      topicDiscovery,
      contentGaps,
      contentIdeas,
      recommendedPlatforms,
      recommendedDuration,
      researchSummary,
      confidenceScore: Math.min(100, confidenceScore),
      qualityMetrics,
      metadata: {
        generatedAt: new Date().toISOString(),
        engine: 'research-intelligence-v1',
        processingTimeMs,
        dataSourceCount: 6,
      },
    };
  }

  /** Classify the content category from topic text. */
  static classifyCategory(topic: string): ContentCategory {
    const lower = topic.toLowerCase();
    let bestCategory: ContentCategory = 'general';
    let bestScore = 0;

    for (const rule of CATEGORY_RULES) {
      const score = rule.keywords.filter((kw) => lower.includes(kw)).length;
      if (score > bestScore) {
        bestScore = score;
        bestCategory = rule.category;
      }
    }

    return bestCategory;
  }

  /** Compute research quality metrics. */
  private static computeQualityMetrics(
    trends: any, keywords: any, competitors: any, audience: any, contentGaps: any,
  ): ResearchQualityMetrics {
    const completeness = Math.min(100,
      (trends.signals.length > 0 ? 20 : 0) +
      (keywords.primary.length > 0 ? 20 : 0) +
      (competitors.competitors.length > 0 ? 20 : 0) +
      (audience.primaryAudience ? 20 : 0) +
      (contentGaps.gaps.length > 0 ? 20 : 0),
    );

    const confidence = Math.min(100, Math.round(
      trends.overallTrendScore * 0.3 + keywords.overallSeoScore * 0.3 + audience.engagementPrediction * 0.4,
    ));

    const consistency = 90; // Internal consistency (all analyzers use same category)
    const depth = Math.min(100, (keywords.primary.length + keywords.secondary.length + keywords.longTail.length) * 3 + competitors.competitors.length * 10);
    const actionability = Math.min(100, contentGaps.totalOpportunities * 15 + competitors.differentiationOpportunities.length * 10);
    const overallQuality = Math.round((completeness + confidence + consistency + depth + actionability) / 5);

    return { completeness, confidence, consistency, depth, actionability, overallQuality };
  }
}
