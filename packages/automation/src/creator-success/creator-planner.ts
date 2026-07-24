// ============================================================
// CreatorAI Studio — Creator Success Planner
// ============================================================
// Orchestrates all 13 analyzers to produce a complete
// CreatorSuccessPackage from upstream pipeline data.
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { CreatorSuccessPackage } from './creator.types';
import { SeoEngine } from './seo-engine';
import { TitleEngine } from './title-engine';
import { DescriptionEngine } from './description-engine';
import { ThumbnailEngine } from './thumbnail-engine';
import { HookEngine } from './hook-engine';
import { RetentionEngine } from './retention-engine';
import { EngagementEngine } from './engagement-engine';
import { HashtagEngine } from './hashtag-engine';
import { PublishingEngine } from './publishing-engine';
import { PlatformEngine } from './platform-engine';
import { CreatorAnalyticsEngine } from './analytics-engine';
import { PolicyChecker } from './policy-checker';

const log = Logger.for('CreatorPlanner');

export interface CreatorPlannerInput {
  topic: string;
  category: string;
  title: string;
  hookText: string;
  fullNarration: string;
  sceneDurations: number[];
  totalDuration: number;
  keywords: string[];
  bestPlatform: string;
  audienceSize: string;
  hasThumbnailText: boolean;
  hasThumbnailSubject: boolean;
  hasThumbnailContrast: boolean;
}

export class CreatorPlanner {
  /**
   * Run all 13 analyzers and produce the CreatorSuccessPackage.
   */
  static plan(input: CreatorPlannerInput): CreatorSuccessPackage {
    const startTime = performance.now();

    log.info('Creator success planning', { topic: input.topic.slice(0, 50) });

    // ── Run all analyzers ──
    const seo = SeoEngine.analyze(input.topic, input.title, input.fullNarration, input.keywords);
    const title = TitleEngine.analyze(input.topic, input.title);
    const hashtags = HashtagEngine.generate(input.topic, input.category, input.keywords);
    const description = DescriptionEngine.generate(input.topic, input.fullNarration, input.keywords, hashtags.youtube.map((h) => h.tag));
    const thumbnail = ThumbnailEngine.analyze(input.hasThumbnailText, input.hasThumbnailSubject, input.hasThumbnailContrast);
    const hook = HookEngine.analyze(input.hookText, input.totalDuration);
    const retention = RetentionEngine.predict(input.sceneDurations, hook.attentionScore, input.totalDuration);
    const engagement = EngagementEngine.predict(hook.attentionScore, retention.estimatedRetention, seo.seoScore, input.audienceSize);
    const publishing = PublishingEngine.recommend(input.category, input.bestPlatform as any, input.totalDuration);
    const platformRecs = PlatformEngine.optimize(input.topic, input.category);
    const policyWarnings = PolicyChecker.check(input.title, input.fullNarration, input.topic);

    // ── Audience match (derived from category + platform alignment) ──
    const audienceMatch = Math.min(100, Math.round(
      (input.audienceSize === 'massive' ? 85 : input.audienceSize === 'large' ? 70 : 55) * 0.5 +
      seo.seoScore * 0.25 + hook.attentionScore * 0.25,
    ));

    // ── Analytics dashboard ──
    const analytics = CreatorAnalyticsEngine.calculate(
      seo.seoScore, thumbnail.overallScore, hook.attentionScore,
      retention.estimatedRetention, engagement.engagementScore,
      audienceMatch, publishing.readinessScore,
    );

    // ── Overall creator score ──
    const creatorScore = analytics.overallCreatorScore;

    // ── Confidence ──
    const confidence = Math.min(100, Math.round(
      seo.seoScore * 0.15 + hook.attentionScore * 0.2 + retention.estimatedRetention * 0.2 +
      engagement.engagementScore * 0.15 + thumbnail.overallScore * 0.1 + publishing.readinessScore * 0.1 +
      (100 - policyWarnings.filter((w) => w.severity === 'critical').length * 20) * 0.1,
    ));

    // ── Improvement suggestions (aggregated top priorities) ──
    const improvementSuggestions = [
      ...seo.suggestions.slice(0, 2),
      ...hook.improvements.slice(0, 2),
      ...retention.suggestions.slice(0, 2),
      ...engagement.suggestions.slice(0, 2),
      ...thumbnail.improvements.slice(0, 2),
    ].slice(0, 10);

    const processingTimeMs = Math.round(performance.now() - startTime);

    log.info('Creator success complete', {
      creatorScore,
      seoScore: seo.seoScore,
      hookScore: hook.attentionScore,
      retentionScore: retention.estimatedRetention,
      confidence,
      processingTimeMs,
    });

    return {
      id: generateId(ID_PREFIXES.pipeline),
      productionTitle: input.topic,
      creatorScore,
      seo,
      title,
      description,
      thumbnail,
      hook,
      retention,
      engagement,
      hashtags,
      publishing,
      platformRecommendations: platformRecs,
      policyWarnings,
      analytics,
      improvementSuggestions,
      confidence,
      metadata: {
        generatedAt: new Date().toISOString(),
        engine: 'creator-success-v1',
        processingTimeMs,
        analyzerCount: 13,
      },
    };
  }
}
