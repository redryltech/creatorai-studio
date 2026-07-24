// ============================================================
// CreatorAI Studio — Competitor Analyzer
// ============================================================
// Generates competitor profiles, market saturation assessment,
// differentiation opportunities, and content strategy insights.
// ============================================================

import { Logger } from '@creatorai/agents';
import type { CompetitorAnalysis, CompetitorProfile, ContentCategory, Platform } from './research.types';

const log = Logger.for('CompetitorAnalyzer');

/** Category → typical competitor archetypes. */
const COMPETITOR_ARCHETYPES: Record<string, Array<{ name: string; style: string; strengths: string[]; weaknesses: string[] }>> = {
  automotive: [
    { name: 'Large Auto Review Channel', style: 'Professional reviews with test rides', strengths: ['High production', 'Brand deals', 'Test ride access'], weaknesses: ['Long format', 'Slow uploads', 'Less personal'] },
    { name: 'Enthusiast Vlogger', style: 'Personal riding experiences', strengths: ['Authentic', 'Community', 'Regular uploads'], weaknesses: ['Lower production', 'Limited access', 'Niche audience'] },
    { name: 'Dealership Channel', style: 'Walkaround and specs', strengths: ['Access to bikes', 'Official specs', 'Multiple models'], weaknesses: ['Sales-focused', 'Less engaging', 'No riding footage'] },
  ],
  technology: [
    { name: 'Tech Giant Channel', style: 'Detailed reviews and benchmarks', strengths: ['Early access', 'Detailed testing', 'Large audience'], weaknesses: ['Slow to publish', 'Over-technical', 'Sponsored bias'] },
    { name: 'Tech Shorts Creator', style: 'Quick tips and comparisons', strengths: ['Fast content', 'Viral hooks', 'High volume'], weaknesses: ['Shallow depth', 'Clickbait tendency', 'Low retention'] },
  ],
  motivational: [
    { name: 'Motivational Speaker', style: 'Inspirational monologues', strengths: ['Powerful delivery', 'Emotional connection', 'Brand recognition'], weaknesses: ['Repetitive themes', 'Over-produced', 'Less relatable'] },
    { name: 'Daily Motivation Page', style: 'Quote graphics with music', strengths: ['Consistent posting', 'Easy to produce', 'Shareable'], weaknesses: ['Low originality', 'No personal brand', 'Algorithm dependent'] },
  ],
};

const DEFAULT_ARCHETYPES = [
  { name: 'Established Creator', style: 'Professional content', strengths: ['Large audience', 'Brand deals'], weaknesses: ['Slow innovation', 'High competition'] },
  { name: 'Rising Creator', style: 'Fresh perspective', strengths: ['Innovative format', 'Engaged community'], weaknesses: ['Small audience', 'Limited resources'] },
];

export class CompetitorAnalyzer {
  /**
   * Analyze the competitive landscape for a topic.
   */
  static analyze(topic: string, category: ContentCategory): CompetitorAnalysis {
    const archetypes = COMPETITOR_ARCHETYPES[category] ?? DEFAULT_ARCHETYPES;
    const topicLower = topic.toLowerCase();

    // Build competitor profiles
    const competitors: CompetitorProfile[] = archetypes.map((arch, i) => ({
      name: arch.name,
      platform: (i === 0 ? 'youtube' : i === 1 ? 'youtube_shorts' : 'instagram_reels') as Platform,
      estimatedSubscribers: i === 0 ? '100K-1M' : i === 1 ? '10K-100K' : '5K-50K',
      contentStyle: arch.style,
      postingFrequency: i === 0 ? '2-3 times/week' : '5-7 times/week',
      strengths: arch.strengths,
      weaknesses: arch.weaknesses,
      topPerformingContent: [
        `${topic} — Complete Review`,
        `Top 5 Things About ${topic}`,
        `${topic} vs Competitors`,
      ],
      avgEngagement: (i === 0 ? 'medium' : i === 1 ? 'high' : 'medium') as CompetitorProfile['avgEngagement'],
    }));

    // Market saturation assessment
    const saturationScore = competitors.length;
    const marketSaturation: CompetitorAnalysis['marketSaturation'] =
      saturationScore >= 4 ? 'oversaturated' :
      saturationScore >= 3 ? 'high' :
      saturationScore >= 2 ? 'medium' : 'low';

    // Differentiation opportunities
    const allWeaknesses = competitors.flatMap((c) => c.weaknesses);
    const differentiationOpportunities = [
      `Short-form vertical video (most competitors focus on long-form)`,
      `Consistent daily posting schedule`,
      `${category}-specific cinematic style that competitors lack`,
      ...allWeaknesses.slice(0, 3).map((w) => `Address competitor weakness: ${w}`),
    ];

    // Content strategy insights
    const contentStrategyInsights = [
      `Focus on ${topic} content that is ${topicLower.includes('review') ? 'more detailed' : 'more entertaining'} than competitors`,
      `Use vertical 9:16 format — most competitors haven't optimized for Shorts/Reels`,
      `Post at peak hours for maximum algorithmic boost`,
      `Create series content to build subscriber loyalty`,
    ];

    // Improvement areas
    const improvementAreas = [
      'Add more visual variety than text-on-screen competitors',
      'Use AI voiceover for consistent branding',
      'Include data/stats that competitors skip',
      'Respond to comments faster than large channels',
    ];

    log.info('Competitor analysis complete', { topic: topic.slice(0, 40), competitors: competitors.length, saturation: marketSaturation });

    return { competitors, marketSaturation, differentiationOpportunities, contentStrategyInsights, improvementAreas };
  }
}
