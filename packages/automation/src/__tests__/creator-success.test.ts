import { CreatorPlanner, type CreatorPlannerInput } from '../creator-success/creator-planner';
import { SeoEngine } from '../creator-success/seo-engine';
import { TitleEngine } from '../creator-success/title-engine';
import { DescriptionEngine } from '../creator-success/description-engine';
import { ThumbnailEngine } from '../creator-success/thumbnail-engine';
import { HookEngine } from '../creator-success/hook-engine';
import { RetentionEngine } from '../creator-success/retention-engine';
import { EngagementEngine } from '../creator-success/engagement-engine';
import { HashtagEngine } from '../creator-success/hashtag-engine';
import { PublishingEngine } from '../creator-success/publishing-engine';
import { PlatformEngine } from '../creator-success/platform-engine';
import { CreatorAnalyticsEngine } from '../creator-success/analytics-engine';
import { PolicyChecker } from '../creator-success/policy-checker';
import { CreatorValidator } from '../creator-success/creator-validator';
import { CreatorExporter } from '../creator-success/creator-exporter';
import { CreatorMemory } from '../creator-success/creator-memory';
import { CreatorRegistry } from '../creator-success/creator-registry';

const INPUT: CreatorPlannerInput = {
  topic: 'Kawasaki Ninja 300 – Features, Performance & Why Riders Love It',
  category: 'automotive',
  title: 'Is the Kawasaki Ninja 300 The Best Beginner Sportbike? 🏍️🔥',
  hookText: 'Looking for a sport bike that perfectly balances performance, style, and everyday usability?',
  fullNarration: 'Looking for a sport bike that perfectly balances performance, style, and everyday usability? Meet the Kawasaki Ninja 300. Under the hood sits a 296cc parallel twin engine.',
  sceneDurations: [9.7, 10.7, 11.1, 12.1, 13.5],
  totalDuration: 57,
  keywords: ['kawasaki', 'ninja 300', 'sportbike', 'beginner', 'motorcycle', 'review', 'performance', 'ABS'],
  bestPlatform: 'youtube_shorts',
  audienceSize: 'large',
  hasThumbnailText: true,
  hasThumbnailSubject: true,
  hasThumbnailContrast: true,
};

describe('CreatorPlanner', () => {
  test('produces complete CreatorSuccessPackage', () => {
    const pkg = CreatorPlanner.plan(INPUT);
    expect(pkg.id).toBeTruthy();
    expect(pkg.creatorScore).toBeGreaterThan(0);
    expect(pkg.seo.seoScore).toBeGreaterThan(0);
    expect(pkg.title.bestTitle).toBeTruthy();
    expect(pkg.hook.attentionScore).toBeGreaterThan(0);
    expect(pkg.retention.estimatedRetention).toBeGreaterThan(0);
    expect(pkg.engagement.engagementScore).toBeGreaterThan(0);
    expect(pkg.hashtags.totalCount).toBeGreaterThan(0);
    expect(pkg.publishing.readinessScore).toBeGreaterThan(0);
    expect(pkg.platformRecommendations.length).toBe(6);
    expect(pkg.analytics.overallCreatorScore).toBeGreaterThan(0);
    expect(pkg.confidence).toBeGreaterThan(0);
    expect(pkg.improvementSuggestions.length).toBeGreaterThan(0);
    expect(pkg.metadata.analyzerCount).toBe(13);
  });
});

describe('SeoEngine', () => {
  test('analyzes SEO with keywords', () => {
    const seo = SeoEngine.analyze('Kawasaki Ninja 300', 'Kawasaki Ninja 300 Review 🔥', 'Review of the Ninja 300 motorcycle', ['kawasaki', 'ninja', 'motorcycle']);
    expect(seo.seoScore).toBeGreaterThan(40);
    expect(seo.primaryKeywords.length).toBeGreaterThan(0);
    expect(seo.titleOptimization).toBeGreaterThan(30);
  });
  test('suggests improvements for weak SEO', () => {
    const seo = SeoEngine.analyze('Kawasaki', 'Video', 'Short', []);
    expect(seo.suggestions.length).toBeGreaterThan(0);
    expect(seo.seoScore).toBeLessThan(seo.titleOptimization + 50);
  });
});

describe('TitleEngine', () => {
  test('generates and scores title variations', () => {
    const t = TitleEngine.analyze('Kawasaki Ninja 300', 'Test Title');
    expect(t.variations.length).toBeGreaterThanOrEqual(5);
    expect(t.bestTitle).toBeTruthy();
    expect(t.bestScore).toBeGreaterThan(0);
    expect(t.averageScore).toBeGreaterThan(0);
  });
  test('detects too-long titles', () => {
    const t = TitleEngine.analyze('Kawasaki', 'A'.repeat(80));
    expect(t.variations[0]!.lengthStatus).toBe('too_long');
  });
});

describe('ThumbnailEngine', () => {
  test('scores good thumbnails high', () => {
    const good = ThumbnailEngine.analyze(true, true, true);
    const bad = ThumbnailEngine.analyze(false, false, false);
    expect(good.overallScore).toBeGreaterThan(bad.overallScore);
    expect(good.ctrPrediction).toBeGreaterThan(60);
  });
  test('gives improvement suggestions', () => {
    const t = ThumbnailEngine.analyze(false, false, false);
    expect(t.improvements.length).toBeGreaterThan(2);
  });
});

describe('HookEngine', () => {
  test('scores strong hooks high', () => {
    const strong = HookEngine.analyze('Want to know the secret to never quitting? Here are 5 proven strategies.', 30);
    const weak = HookEngine.analyze('Hello everyone welcome to my video today', 30);
    expect(strong.attentionScore).toBeGreaterThan(weak.attentionScore);
  });
  test('suggests improvements for weak hooks', () => {
    const h = HookEngine.analyze('Hello', 30);
    expect(h.improvements.length).toBeGreaterThan(0);
  });
});

describe('RetentionEngine', () => {
  test('predicts retention based on pacing', () => {
    const r = RetentionEngine.predict([8, 10, 11, 12, 13], 70, 54);
    expect(r.estimatedRetention).toBeGreaterThan(30);
    expect(r.estimatedWatchTimeSec).toBeGreaterThan(10);
    expect(r.pacingScore).toBeGreaterThan(0);
  });
  test('detects drop-off points', () => {
    const r = RetentionEngine.predict([3, 3, 30, 3, 3], 40, 42);
    expect(r.dropOffPoints.length).toBeGreaterThan(0);
  });
});

describe('EngagementEngine', () => {
  test('predicts engagement scores', () => {
    const e = EngagementEngine.predict(80, 70, 75, 'large');
    expect(e.engagementScore).toBeGreaterThan(30);
    expect(e.likePrediction).toBeGreaterThan(0);
    expect(e.suggestions.length).toBeGreaterThan(0);
  });
  test('scales with audience size', () => {
    const large = EngagementEngine.predict(70, 70, 70, 'massive');
    const small = EngagementEngine.predict(70, 70, 70, 'niche');
    expect(large.engagementScore).toBeGreaterThanOrEqual(small.engagementScore);
  });
});

describe('HashtagEngine', () => {
  test('generates platform-specific hashtags', () => {
    const h = HashtagEngine.generate('Kawasaki Ninja 300', 'automotive', ['motorcycle', 'review']);
    expect(h.youtube.length).toBeGreaterThan(3);
    expect(h.instagram.length).toBeGreaterThan(5);
    expect(h.tiktok.length).toBeGreaterThan(3);
    expect(h.totalCount).toBeGreaterThan(15);
  });
});

describe('PublishingEngine', () => {
  test('recommends publishing schedule', () => {
    const p = PublishingEngine.recommend('automotive', 'youtube_shorts', 57);
    expect(p.bestUploadTime).toContain('IST');
    expect(p.bestDay).toBeTruthy();
    expect(p.publishingChecklist.length).toBeGreaterThan(3);
    expect(p.readinessScore).toBeGreaterThan(0);
    expect(p.exportProfile.aspectRatio).toBe('9:16');
  });
});

describe('PlatformEngine', () => {
  test('optimizes for all 6 platforms', () => {
    const recs = PlatformEngine.optimize('Kawasaki Ninja 300', 'automotive');
    expect(recs.length).toBe(6);
    for (const r of recs) {
      expect(r.recommendations.length).toBeGreaterThan(0);
      expect(r.bestPostingTime).toContain('IST');
    }
  });
});

describe('PolicyChecker', () => {
  test('detects trademark mentions', () => {
    const w = PolicyChecker.check('Nike Review', 'This is about Nike shoes', 'Nike');
    expect(w.some(p => p.type === 'trademark')).toBe(true);
  });
  test('detects misleading claims', () => {
    const w = PolicyChecker.check('Guaranteed Results', 'Get rich guaranteed 100%', 'Money');
    expect(w.some(p => p.type === 'misleading')).toBe(true);
  });
  test('clean content has no warnings', () => {
    const w = PolicyChecker.check('Kawasaki Ninja 300 Review', 'Great motorcycle for beginners', 'Motorcycle review');
    expect(w.filter(p => p.severity === 'critical').length).toBe(0);
  });
});

describe('CreatorAnalyticsEngine', () => {
  test('calculates dashboard', () => {
    const d = CreatorAnalyticsEngine.calculate(80, 70, 75, 65, 60, 70, 85);
    expect(d.overallCreatorScore).toBeGreaterThan(50);
    expect(Object.keys(d.radarChart).length).toBeGreaterThanOrEqual(5);
    expect(d.improvementPriorities.length).toBeGreaterThanOrEqual(0);
  });
});

describe('CreatorValidator', () => {
  test('validates correct package', () => {
    const pkg = CreatorPlanner.plan(INPUT);
    const v = CreatorValidator.validate(pkg);
    expect(v.valid).toBe(true);
    expect(v.score).toBeGreaterThanOrEqual(70);
  });
});

describe('CreatorExporter', () => {
  test('exports all formats', () => {
    const pkg = CreatorPlanner.plan(INPUT);
    const exp = CreatorExporter.export(pkg);
    expect(exp.fullJson).toBe(pkg);
    expect(exp.compactJson.creatorScore).toBe(pkg.creatorScore);
    expect(exp.markdown).toContain('# Creator Success Report');
    expect(exp.analyticsReport.overallCreatorScore).toBeGreaterThan(0);
  });
});

describe('CreatorMemory', () => {
  beforeEach(() => CreatorMemory.resetInstance());
  test('records and retrieves', () => {
    const m = CreatorMemory.getInstance();
    m.record({ productionTitle: 'Test', packageId: 'p1', creatorScore: 85, seoScore: 70, hookScore: 80 });
    expect(m.size).toBe(1);
    expect(m.getAverageScore()).toBe(85);
  });
});

describe('CreatorRegistry', () => {
  beforeEach(() => CreatorRegistry.resetInstance());
  test('registers strategies', () => {
    const r = CreatorRegistry.getInstance();
    r.register({ strategyId: 'yt', strategyName: 'YouTube', canHandle: (p) => p === 'youtube' });
    expect(r.size).toBe(1);
    expect(r.getStrategy('youtube')?.strategyId).toBe('yt');
  });
});
