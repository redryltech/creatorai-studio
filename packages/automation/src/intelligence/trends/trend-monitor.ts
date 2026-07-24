// ============================================================
// CreatorAI Studio — Trend Monitor
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger, CostTracker } from '@creatorai/agents';
import type { ILLMProvider } from '@creatorai/providers';
import { ProviderRegistry } from '@creatorai/providers';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { TrendReport } from '../types/intelligence.types';

const log = Logger.for('TrendMonitor');

interface TrendInput { request: Record<string, unknown>; userId: string; niche: string; platforms: string[] }

export class TrendMonitorAgent implements IAutomationAgent<TrendInput, TrendReport> {
  readonly agentId = 'intelligence.trends';
  readonly agentName = 'Trend Monitor';
  readonly stage = 'trends';

  validate(input: TrendInput): { valid: boolean; errors: string[] } { return { valid: !!input.niche, errors: input.niche ? [] : ['Niche required'] }; }
  estimateCost(): { costUsd: number; breakdown: string[] } { return { costUsd: 0.03, breakdown: ['LLM trend analysis: $0.03'] }; }
  async healthCheck(): Promise<{ healthy: boolean; details: string }> { const llm = await ProviderRegistry.getInstance().getPrimary<ILLMProvider>('llm'); return { healthy: !!llm, details: llm ? 'Ready' : 'No LLM' }; }

  async execute(input: TrendInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<TrendReport> {
    onProgress(20, 'Scanning trends');
    const llm = await ProviderRegistry.getInstance().getPrimary<ILLMProvider>('llm');
    if (!llm) throw new Error('No LLM');
    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(50, 'Analyzing trend data');
    const response = await llm.complete({
      systemPrompt: 'You are a trend analyst. Identify emerging trends, breaking topics, and viral opportunities. JSON only.',
      messages: [{ role: 'user', content: `Identify trends in "${input.niche}" for ${input.platforms.join(', ')}.

JSON: {"emergingTrends":[{"topic":"string","platform":"string","velocity":0,"relevance":0,"source":"string"}],"breakingTopics":[{"topic":"string","urgency":"high|medium|low","window":"string"}],"viralOpportunities":[{"topic":"string","estimatedReach":"string","competition":"string","suggestedAngle":"string"}],"nicheInsights":["string"]}` }],
      temperature: 0.5, maxTokens: 2048, responseFormat: 'json',
    });

    CostTracker.getInstance().trackLLMUsage({ userId: input.userId, projectId: null, pipelineId: null, agentId: this.agentId, providerId: llm.id, model: response.model, tokens: response.usage });

    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(response.content); } catch { /* defaults */ }

    onProgress(100, 'Trend report ready');
    return { id: generateId(ID_PREFIXES.step), userId: input.userId, generatedAt: new Date(), emergingTrends: (parsed.emergingTrends as TrendReport['emergingTrends']) ?? [], breakingTopics: (parsed.breakingTopics as TrendReport['breakingTopics']) ?? [], viralOpportunities: (parsed.viralOpportunities as TrendReport['viralOpportunities']) ?? [], nicheInsights: (parsed.nicheInsights as string[]) ?? [] };
  }
}
