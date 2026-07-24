// ============================================================
// CreatorAI Studio — Research Intelligence Engine Unit Tests
// ============================================================

import { ResearchPlanner } from '../research-intelligence/research-planner';
import { TrendAnalyzer } from '../research-intelligence/trend-analyzer';
import { KeywordEngine } from '../research-intelligence/keyword-engine';
import { CompetitorAnalyzer } from '../research-intelligence/competitor-analyzer';
import { AudienceAnalyzer } from '../research-intelligence/audience-analyzer';
import { TopicDiscoveryEngine } from '../research-intelligence/topic-discovery';
import { ContentGapAnalyzer } from '../research-intelligence/content-gap-analyzer';
import { ResearchValidator } from '../research-intelligence/research-validator';
import { ResearchExporter } from '../research-intelligence/research-exporter';
import { ResearchMemory } from '../research-intelligence/research-memory';
import { ResearchRegistry } from '../research-intelligence/research-registry';

// ═══════════════════════════════════════════════════════════

describe('ResearchPlanner', () => {
  test('produces a complete research package', () => {
    const pkg = ResearchPlanner.research('Kawasaki Ninja 300 Review');
    expect(pkg.id).toBeTruthy();
    expect(pkg.topic).toBe('Kawasaki Ninja 300 Review');
    expect(pkg.category).toBe('automotive');
    expect(pkg.keywords.primary.length).toBeGreaterThan(0);
    expect(pkg.competitors.competitors.length).toBeGreaterThan(0);
    expect(pkg.trends.signals.length).toBeGreaterThan(0);
    expect(pkg.audience.primaryAudience).toBeTruthy();
    expect(pkg.contentGaps.gaps.length).toBeGreaterThan(0);
    expect(pkg.contentIdeas.length).toBeGreaterThan(0);
    expect(pkg.recommendedPlatforms.length).toBeGreaterThan(0);
    expect(pkg.confidenceScore).toBeGreaterThan(0);
    expect(pkg.qualityMetrics.overallQuality).toBeGreaterThan(0);
  });

  test('classifies automotive category correctly', () => {
    expect(ResearchPlanner.classifyCategory('Kawasaki Ninja 300')).toBe('automotive');
    expect(ResearchPlanner.classifyCategory('Honda CBR 650R motorcycle review')).toBe('automotive');
  });

  test('classifies technology category correctly', () => {
    expect(ResearchPlanner.classifyCategory('Best AI tools for 2024')).toBe('technology');
    expect(ResearchPlanner.classifyCategory('iPhone 16 Pro review')).toBe('technology');
  });

  test('classifies motivational category correctly', () => {
    expect(ResearchPlanner.classifyCategory('Why winners never quit')).toBe('motivational');
    expect(ResearchPlanner.classifyCategory('Success mindset discipline')).toBe('motivational');
  });

  test('classifies food category correctly', () => {
    expect(ResearchPlanner.classifyCategory('Best street food in India')).toBe('food');
  });

  test('defaults to general for unknown topics', () => {
    expect(ResearchPlanner.classifyCategory('random something xyz')).toBe('general');
  });
});

describe('TrendAnalyzer', () => {
  test('generates trend signals for automotive', () => {
    const trends = TrendAnalyzer.analyze('Kawasaki Ninja 300', 'automotive');
    expect(trends.signals.length).toBeGreaterThan(3);
    expect(trends.overallTrendScore).toBeGreaterThan(0);
    expect(trends.bestPlatform).toBeTruthy();
    expect(trends.trendSummary.length).toBeGreaterThan(20);
  });

  test('viral keywords boost trend score', () => {
    const withViral = TrendAnalyzer.analyze('Best new review reveal motorcycle', 'automotive');
    const withoutViral = TrendAnalyzer.analyze('motorcycle overview', 'automotive');
    expect(withViral.viralPotential).toBeGreaterThanOrEqual(withoutViral.viralPotential);
  });

  test('provides peak timing hints', () => {
    const trends = TrendAnalyzer.analyze('Test topic', 'motivational');
    expect(trends.peakTimingHint).toContain('IST');
  });
});

describe('KeywordEngine', () => {
  test('generates all keyword types', () => {
    const kw = KeywordEngine.generate('Kawasaki Ninja 300', 'automotive');
    expect(kw.primary.length).toBeGreaterThan(0);
    expect(kw.secondary.length).toBeGreaterThan(0);
    expect(kw.longTail.length).toBeGreaterThan(0);
    expect(kw.semantic.length).toBeGreaterThan(0);
    expect(kw.overallSeoScore).toBeGreaterThan(30);
    expect(kw.titleSuggestions.length).toBeGreaterThanOrEqual(3);
    expect(kw.hashtagSuggestions.length).toBeGreaterThanOrEqual(3);
  });

  test('primary keywords include topic', () => {
    const kw = KeywordEngine.generate('Kawasaki Ninja 300', 'automotive');
    expect(kw.primary.some((k) => k.keyword.includes('kawasaki'))).toBe(true);
  });

  test('long-tail keywords contain topic + modifier', () => {
    const kw = KeywordEngine.generate('Kawasaki Ninja 300', 'automotive');
    expect(kw.longTail[0]!.keyword).toContain('kawasaki ninja 300');
    expect(kw.longTail[0]!.type).toBe('long_tail');
  });
});

describe('CompetitorAnalyzer', () => {
  test('generates competitor profiles', () => {
    const comp = CompetitorAnalyzer.analyze('Kawasaki Ninja 300', 'automotive');
    expect(comp.competitors.length).toBeGreaterThanOrEqual(2);
    expect(comp.marketSaturation).toBeTruthy();
    expect(comp.differentiationOpportunities.length).toBeGreaterThan(0);
    expect(comp.contentStrategyInsights.length).toBeGreaterThan(0);
  });

  test('competitors have strengths and weaknesses', () => {
    const comp = CompetitorAnalyzer.analyze('AI tools', 'technology');
    for (const c of comp.competitors) {
      expect(c.strengths.length).toBeGreaterThan(0);
      expect(c.weaknesses.length).toBeGreaterThan(0);
    }
  });
});

describe('AudienceAnalyzer', () => {
  test('identifies primary audience', () => {
    const aud = AudienceAnalyzer.analyze('Kawasaki Ninja 300', 'automotive');
    expect(aud.primaryAudience.name).toBeTruthy();
    expect(aud.primaryAudience.ageRange).toBeTruthy();
    expect(aud.primaryAudience.interests.length).toBeGreaterThan(0);
    expect(aud.primaryAudience.preferredPlatforms.length).toBeGreaterThan(0);
    expect(aud.engagementPrediction).toBeGreaterThan(0);
    expect(aud.audienceSummary.length).toBeGreaterThan(20);
  });

  test('provides secondary audiences', () => {
    const aud = AudienceAnalyzer.analyze('Test', 'motivational');
    expect(aud.secondaryAudiences.length).toBeGreaterThan(0);
  });
});

describe('TopicDiscoveryEngine', () => {
  test('discovers related topics', () => {
    const disc = TopicDiscoveryEngine.discover('Kawasaki Ninja 300', 'automotive');
    expect(disc.relatedTopics.length).toBeGreaterThan(0);
    expect(disc.subtopics.length).toBeGreaterThan(0);
    expect(disc.faqs.length).toBeGreaterThan(0);
    expect(disc.contentCalendarSuggestions.length).toBeGreaterThanOrEqual(3);
  });

  test('topic ideas contain the original topic', () => {
    const disc = TopicDiscoveryEngine.discover('Kawasaki Ninja 300', 'automotive');
    expect(disc.relatedTopics.some((t) => t.title.includes('Kawasaki Ninja 300'))).toBe(true);
  });
});

describe('ContentGapAnalyzer', () => {
  test('finds content gaps', () => {
    const gaps = ContentGapAnalyzer.analyze('Kawasaki Ninja 300', 'automotive');
    expect(gaps.gaps.length).toBeGreaterThan(0);
    expect(gaps.topOpportunity).toBeTruthy();
    expect(gaps.gapSummary.length).toBeGreaterThan(20);
    expect(gaps.gaps[0]!.priority).toBeTruthy();
  });
});

describe('ResearchValidator', () => {
  test('validates a correct package', () => {
    const pkg = ResearchPlanner.research('Kawasaki Ninja 300 Review');
    const result = ResearchValidator.validate(pkg);
    expect(result.valid).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.errors).toHaveLength(0);
  });

  test('detects missing topic', () => {
    const pkg = ResearchPlanner.research('Kawasaki Ninja 300');
    pkg.topic = '';
    const result = ResearchValidator.validate(pkg);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('topic'))).toBe(true);
  });
});

describe('ResearchExporter', () => {
  test('exports all formats', () => {
    const pkg = ResearchPlanner.research('Kawasaki Ninja 300');
    const exp = ResearchExporter.export(pkg);
    expect(exp.fullJson).toBe(pkg);
    expect(exp.compactJson.topic).toBe(pkg.topic);
    expect(exp.markdown).toContain('# Research:');
    expect(exp.markdown).toContain('Kawasaki Ninja 300');
    expect(exp.debugPackage.metrics.overallQuality).toBeGreaterThan(0);
  });
});

describe('ResearchMemory', () => {
  beforeEach(() => ResearchMemory.resetInstance());

  test('records and retrieves entries', () => {
    const mem = ResearchMemory.getInstance();
    mem.record({ topic: 'Kawasaki Ninja 300', category: 'automotive', packageId: 'p1', confidenceScore: 85, qualityScore: 90 });
    expect(mem.size).toBe(1);
    expect(mem.getAll()[0]!.topic).toBe('Kawasaki Ninja 300');
  });

  test('finds similar topics', () => {
    const mem = ResearchMemory.getInstance();
    mem.record({ topic: 'Kawasaki Ninja 300 review', category: 'automotive', packageId: 'p1', confidenceScore: 85, qualityScore: 90 });
    mem.record({ topic: 'Python programming tutorial', category: 'technology', packageId: 'p2', confidenceScore: 80, qualityScore: 85 });
    const similar = mem.findSimilar('Kawasaki bike');
    expect(similar.length).toBeGreaterThan(0);
    expect(similar[0]!.topic).toContain('Kawasaki');
  });
});

describe('ResearchRegistry', () => {
  beforeEach(() => ResearchRegistry.resetInstance());

  test('registers and lists strategies', () => {
    const reg = ResearchRegistry.getInstance();
    reg.register({ strategyId: 'auto', strategyName: 'Automotive', canHandle: (c) => c === 'automotive' });
    expect(reg.size).toBe(1);
    expect(reg.getStrategy('automotive')?.strategyId).toBe('auto');
    expect(reg.getStrategy('food')).toBeNull();
  });
});
