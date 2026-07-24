// ============================================================
// CreatorAI Studio — Trend Analyzer
// ============================================================
// Analyzes trending patterns across platforms using heuristic
// signals derived from topic keywords and category profiles.
// Provider-independent — no external API calls.
// ============================================================

import { Logger } from '@creatorai/agents';
import type { TrendAnalysis, TrendSignal, ContentCategory, Platform } from './research.types';

const log = Logger.for('TrendAnalyzer');

/** Category → platform affinity scores (0-100). */
const PLATFORM_AFFINITY: Record<ContentCategory, Partial<Record<Platform, number>>> = {
  automotive:    { youtube_shorts: 85, instagram_reels: 75, tiktok: 70, youtube: 90 },
  technology:    { youtube_shorts: 80, youtube: 95, linkedin: 60, tiktok: 55 },
  motivational:  { youtube_shorts: 95, instagram_reels: 90, tiktok: 85, facebook: 60 },
  sports:        { youtube_shorts: 85, tiktok: 90, instagram_reels: 80, youtube: 75 },
  luxury:        { instagram_reels: 90, youtube_shorts: 75, youtube: 80, tiktok: 60 },
  travel:        { instagram_reels: 95, youtube_shorts: 85, tiktok: 80, youtube: 90 },
  food:          { tiktok: 95, instagram_reels: 90, youtube_shorts: 80, youtube: 85 },
  education:     { youtube: 95, youtube_shorts: 75, linkedin: 70, tiktok: 50 },
  entertainment: { tiktok: 95, youtube_shorts: 90, instagram_reels: 85, youtube: 80 },
  gaming:        { youtube: 95, tiktok: 80, youtube_shorts: 75 },
  fashion:       { instagram_reels: 95, tiktok: 90, youtube_shorts: 70 },
  health:        { youtube_shorts: 80, youtube: 85, instagram_reels: 75, tiktok: 70 },
  finance:       { youtube: 90, youtube_shorts: 75, linkedin: 80, instagram_reels: 50 },
  news:          { youtube_shorts: 70, x: 90, youtube: 75, facebook: 65 },
  music:         { tiktok: 95, youtube_shorts: 90, instagram_reels: 85, youtube: 95 },
  comedy:        { tiktok: 95, youtube_shorts: 90, instagram_reels: 85 },
  science:       { youtube: 90, youtube_shorts: 70, tiktok: 55 },
  documentary:   { youtube: 95, youtube_shorts: 60, facebook: 50 },
  horror:        { youtube_shorts: 80, tiktok: 75, youtube: 85 },
  beauty:        { tiktok: 90, instagram_reels: 95, youtube_shorts: 80 },
  pets:          { tiktok: 95, instagram_reels: 90, youtube_shorts: 85 },
  real_estate:   { youtube: 85, instagram_reels: 75, youtube_shorts: 65 },
  crypto:        { youtube: 85, x: 90, tiktok: 60, youtube_shorts: 70 },
  spiritual:     { youtube: 80, youtube_shorts: 75, instagram_reels: 65 },
  diy:           { youtube: 90, tiktok: 80, youtube_shorts: 75 },
  general:       { youtube_shorts: 70, instagram_reels: 65, tiktok: 65, youtube: 70 },
};

/** Trend velocity keywords (presence in topic boosts score). */
const VIRAL_KEYWORDS = ['new', 'latest', 'breaking', 'first', 'reveal', 'secret', 'shocking', 'best', 'top', 'vs', 'review', 'unboxing', 'tutorial', 'hack', 'trick', 'challenge'];
const EVERGREEN_KEYWORDS = ['how to', 'what is', 'guide', 'tips', 'learn', 'basics', 'beginner', 'explained', 'complete', 'ultimate'];

export class TrendAnalyzer {
  /**
   * Analyze trends for a topic within a category.
   * @param topic — The content topic
   * @param category — Detected content category
   * @returns TrendAnalysis with signals, scores, and recommendations
   */
  static analyze(topic: string, category: ContentCategory): TrendAnalysis {
    const topicLower = topic.toLowerCase();
    const affinity = PLATFORM_AFFINITY[category] ?? PLATFORM_AFFINITY.general!;

    // ── Generate trend signals per platform ──
    const signals: TrendSignal[] = [];
    const platforms: Platform[] = ['youtube_shorts', 'instagram_reels', 'tiktok', 'youtube', 'facebook', 'linkedin', 'x'];

    for (const platform of platforms) {
      const platformScore = affinity[platform] ?? 40;
      if (platformScore < 30) continue; // Skip irrelevant platforms

      // Viral keyword boost
      const viralBoost = VIRAL_KEYWORDS.filter((kw) => topicLower.includes(kw)).length * 8;
      const evergreenBoost = EVERGREEN_KEYWORDS.filter((kw) => topicLower.includes(kw)).length * 5;

      const score = Math.min(100, platformScore + viralBoost + evergreenBoost);
      const velocity: TrendSignal['velocity'] =
        viralBoost > 15 ? 'viral' :
        viralBoost > 8 ? 'rising' :
        evergreenBoost > 10 ? 'stable' :
        score > 70 ? 'rising' : 'stable';

      signals.push({
        platform,
        topic,
        score,
        velocity,
        volume: score > 80 ? 'massive' : score > 60 ? 'high' : score > 40 ? 'medium' : 'low',
        timeframe: velocity === 'viral' ? 'last_24h' : velocity === 'rising' ? 'last_7d' : 'last_30d',
        confidence: Math.min(0.95, (platformScore / 100) * 0.7 + 0.25),
      });
    }

    // ── Google search signal ──
    const searchScore = Math.min(100, 50 + VIRAL_KEYWORDS.filter((kw) => topicLower.includes(kw)).length * 10 + EVERGREEN_KEYWORDS.filter((kw) => topicLower.includes(kw)).length * 8);
    signals.push({
      platform: 'google_search' as any,
      topic,
      score: searchScore,
      velocity: searchScore > 70 ? 'rising' : 'stable',
      volume: searchScore > 70 ? 'high' : 'medium',
      timeframe: 'last_30d',
      confidence: 0.75,
    });

    // ── Seasonal signal ──
    const month = new Date().getMonth();
    const seasonalBoosts: Record<string, number[]> = {
      christmas: [10, 11], diwali: [9, 10], summer: [4, 5, 6], winter: [11, 0, 1],
      new_year: [11, 0], valentine: [1], halloween: [9],
    };
    let seasonalRelevance = 0.3;
    for (const [event, months] of Object.entries(seasonalBoosts)) {
      if (months.includes(month) && topicLower.includes(event.replace('_', ' '))) {
        seasonalRelevance = 0.9;
      }
    }

    // ── Aggregate ──
    const overallTrendScore = Math.round(signals.reduce((s, sig) => s + sig.score, 0) / signals.length);
    const sortedByScore = [...signals].filter((s) => s.platform !== 'google_search' && s.platform !== 'seasonal').sort((a, b) => b.score - a.score);
    const bestPlatform = (sortedByScore[0]?.platform ?? 'youtube_shorts') as Platform;
    const viralPotential = Math.min(100, Math.round(overallTrendScore * 0.6 + (VIRAL_KEYWORDS.filter((kw) => topicLower.includes(kw)).length * 10)));

    const trendSummary = `Topic "${topic}" has ${overallTrendScore > 70 ? 'strong' : overallTrendScore > 50 ? 'moderate' : 'emerging'} trend signals. ` +
      `Best platform: ${bestPlatform.replace(/_/g, ' ')}. Viral potential: ${viralPotential}/100. ` +
      `${seasonalRelevance > 0.5 ? 'Seasonal relevance detected.' : 'No seasonal factors.'}`;

    log.info('Trend analysis complete', { topic: topic.slice(0, 40), overallScore: overallTrendScore, bestPlatform, viralPotential });

    return {
      signals,
      overallTrendScore,
      bestPlatform,
      peakTimingHint: TrendAnalyzer.getPeakTiming(bestPlatform),
      seasonalRelevance,
      viralPotential,
      trendSummary,
    };
  }

  /** Platform-specific peak posting times (IST-oriented for Indian creators). */
  private static getPeakTiming(platform: Platform): string {
    const timings: Record<Platform, string> = {
      youtube_shorts: '6-9 AM and 7-10 PM IST',
      youtube: '2-5 PM IST',
      instagram_reels: '11 AM-1 PM and 7-9 PM IST',
      tiktok: '7-9 AM and 7-11 PM IST',
      facebook: '1-3 PM IST',
      linkedin: '8-10 AM IST (weekdays)',
      x: '12-3 PM IST',
    };
    return timings[platform] ?? '7-10 PM IST';
  }
}
