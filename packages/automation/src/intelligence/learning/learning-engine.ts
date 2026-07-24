// ============================================================
// CreatorAI Studio — Learning Engine
// ============================================================
// Analyzes performance data to identify patterns that correlate
// with success. Builds a LearningMemory that agents read
// before generating content.
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger, CostTracker } from '@creatorai/agents';
import type { ILLMProvider } from '@creatorai/providers';
import { ProviderRegistry } from '@creatorai/providers';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { LearningMemory, AnalyticsSnapshot, ContentScore } from '../types/intelligence.types';

const log = Logger.for('LearningEngine');

interface LearningInput {
  request: Record<string, unknown>;
  analytics: AnalyticsSnapshot[];
  userId: string;
}

export class LearningEngine implements IAutomationAgent<LearningInput, LearningMemory[]> {
  readonly agentId = 'intelligence.learning';
  readonly agentName = 'Learning Engine';
  readonly stage = 'learning';

  private memories: Map<string, LearningMemory[]> = new Map();

  validate(input: LearningInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.analytics?.length) errors.push('Analytics data required');
    return { valid: errors.length === 0, errors };
  }

  estimateCost(): { costUsd: number; breakdown: string[] } {
    return { costUsd: 0.03, breakdown: ['LLM pattern analysis: $0.03'] };
  }

  async healthCheck(): Promise<{ healthy: boolean; details: string }> {
    const llm = await ProviderRegistry.getInstance().getPrimary<ILLMProvider>('llm');
    return { healthy: !!llm, details: llm ? 'Ready' : 'No LLM' };
  }

  async execute(input: LearningInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<LearningMemory[]> {
    const { analytics, userId } = input;
    log.info('Learning from analytics', { snapshotCount: analytics.length, userId });
    onProgress(10, 'Analyzing content performance patterns');

    const llm = await ProviderRegistry.getInstance().getPrimary<ILLMProvider>('llm');
    if (!llm) throw new Error('No LLM provider');
    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(30, 'Identifying success patterns');

    // Sort by performance (views + engagement)
    const scored = analytics.map((a) => ({
      ...a,
      score: a.metrics.views * 0.5 + (a.metrics.likes + a.metrics.comments + a.metrics.shares) * 2 + a.metrics.ctr * 100,
    })).sort((a, b) => b.score - a.score);

    const topPerformers = scored.slice(0, Math.ceil(scored.length * 0.2));
    const bottomPerformers = scored.slice(-Math.ceil(scored.length * 0.2));

    onProgress(50, 'Extracting patterns via AI');

    const response = await llm.complete({
      systemPrompt: 'You are a content performance analyst. Analyze what makes content succeed or fail. JSON only.',
      messages: [{ role: 'user', content: `Analyze these content performance patterns.

Top performers (${topPerformers.length}):
${topPerformers.map((t) => `Views: ${t.metrics.views}, CTR: ${t.metrics.ctr}%, Engagement: ${t.metrics.likes + t.metrics.comments + t.metrics.shares}`).join('\n')}

Bottom performers (${bottomPerformers.length}):
${bottomPerformers.map((b) => `Views: ${b.metrics.views}, CTR: ${b.metrics.ctr}%, Engagement: ${b.metrics.likes + b.metrics.comments + b.metrics.shares}`).join('\n')}

Identify patterns in categories: hook, title, duration, publish_time, cta, visual_style, topic, hashtag.

JSON: {"patterns":[{"category":"hook|title|duration|publish_time|cta|visual_style|topic|hashtag","pattern":"description","score":0,"confidence":0}]}` }],
      temperature: 0.4, maxTokens: 2048, responseFormat: 'json',
    });

    CostTracker.getInstance().trackLLMUsage({
      userId, projectId: null, pipelineId: null,
      agentId: this.agentId, providerId: llm.id, model: response.model, tokens: response.usage,
    });

    onProgress(80, 'Building learning memories');

    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(response.content); } catch { /* use empty */ }

    const patterns = (parsed.patterns as Array<{ category: string; pattern: string; score: number; confidence: number }>) ?? [];

    const newMemories: LearningMemory[] = patterns.map((p) => ({
      id: generateId(ID_PREFIXES.step),
      userId,
      category: p.category as LearningMemory['category'],
      pattern: p.pattern,
      score: p.score,
      sampleCount: analytics.length,
      confidence: p.confidence,
      examples: topPerformers.slice(0, 3).map((t) => ({ contentId: t.platformPostId, value: '', performanceScore: t.score })),
      lastUpdated: new Date(),
    }));

    // Store
    const existing = this.memories.get(userId) ?? [];
    this.memories.set(userId, [...existing, ...newMemories]);

    onProgress(100, 'Learning complete');
    log.info('Learning complete', { patternCount: newMemories.length, userId });
    return newMemories;
  }

  /** Get all learned patterns for a user. */
  getUserMemories(userId: string): LearningMemory[] {
    return this.memories.get(userId) ?? [];
  }

  /** Get top patterns by category. */
  getTopPatterns(userId: string, category: LearningMemory['category'], limit: number = 5): LearningMemory[] {
    return this.getUserMemories(userId).filter((m) => m.category === category).sort((a, b) => b.score - a.score).slice(0, limit);
  }
}
