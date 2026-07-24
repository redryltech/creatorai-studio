// ============================================================
// CreatorAI Studio — Performance Predictor
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger, CostTracker } from '@creatorai/agents';
import type { ILLMProvider } from '@creatorai/providers';
import { ProviderRegistry } from '@creatorai/providers';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { PerformancePrediction, LearningMemory, AnalyticsPlatform } from '../types/intelligence.types';

const log = Logger.for('PerformancePredictor');

interface PredictorInput {
  request: Record<string, unknown>;
  userId: string;
  title: string;
  hookText: string;
  platform: AnalyticsPlatform;
  duration: number;
  learnings: LearningMemory[];
}

export class PerformancePredictorAgent implements IAutomationAgent<PredictorInput, PerformancePrediction> {
  readonly agentId = 'intelligence.predictor';
  readonly agentName = 'Performance Predictor';
  readonly stage = 'prediction';

  validate(input: PredictorInput): { valid: boolean; errors: string[] } {
    return { valid: !!input.title && !!input.platform, errors: [] };
  }

  estimateCost(): { costUsd: number; breakdown: string[] } {
    return { costUsd: 0.02, breakdown: ['LLM prediction: $0.02'] };
  }

  async healthCheck(): Promise<{ healthy: boolean; details: string }> {
    const llm = await ProviderRegistry.getInstance().getPrimary<ILLMProvider>('llm');
    return { healthy: !!llm, details: llm ? 'Ready' : 'No LLM' };
  }

  async execute(input: PredictorInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<PerformancePrediction> {
    log.info('Predicting performance', { title: input.title, platform: input.platform });
    onProgress(20, 'Analyzing content factors');

    const llm = await ProviderRegistry.getInstance().getPrimary<ILLMProvider>('llm');
    if (!llm) throw new Error('No LLM');
    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(50, 'Running prediction model');

    const response = await llm.complete({
      systemPrompt: 'You are a content performance analyst. Predict video performance based on historical patterns. JSON only.',
      messages: [{ role: 'user', content: `Predict performance for: "${input.title}" on ${input.platform}.

Hook: "${input.hookText}"
Duration: ${input.duration}s
Historical patterns: ${input.learnings.slice(0, 5).map((l) => `${l.category}: ${l.pattern}`).join('; ')}

JSON: {"predictedViews":{"low":0,"mid":0,"high":0},"predictedCtr":0,"predictedWatchTime":0,"predictedEngagement":0,"viralityScore":0,"confidence":0,"factors":[{"factor":"description","impact":"positive|negative|neutral","weight":0}]}` }],
      temperature: 0.4, maxTokens: 1024, responseFormat: 'json',
    });

    CostTracker.getInstance().trackLLMUsage({
      userId: input.userId, projectId: null, pipelineId: null,
      agentId: this.agentId, providerId: llm.id, model: response.model, tokens: response.usage,
    });

    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(response.content); } catch { /* defaults */ }

    onProgress(100, 'Prediction complete');

    return {
      contentId: generateId(ID_PREFIXES.step),
      platform: input.platform,
      predictedViews: (parsed.predictedViews as PerformancePrediction['predictedViews']) ?? { low: 100, mid: 1000, high: 10000 },
      predictedCtr: (parsed.predictedCtr as number) ?? 5.0,
      predictedWatchTime: (parsed.predictedWatchTime as number) ?? input.duration * 0.6,
      predictedEngagement: (parsed.predictedEngagement as number) ?? 3.0,
      viralityScore: (parsed.viralityScore as number) ?? 30,
      confidence: (parsed.confidence as number) ?? 0.5,
      factors: (parsed.factors as PerformancePrediction['factors']) ?? [],
      predictedAt: new Date(),
    };
  }
}
