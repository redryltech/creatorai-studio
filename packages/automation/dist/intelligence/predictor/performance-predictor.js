// ============================================================
// CreatorAI Studio — Performance Predictor
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger, CostTracker } from '@creatorai/agents';
import { ProviderRegistry } from '@creatorai/providers';
const log = Logger.for('PerformancePredictor');
export class PerformancePredictorAgent {
    agentId = 'intelligence.predictor';
    agentName = 'Performance Predictor';
    stage = 'prediction';
    validate(input) {
        return { valid: !!input.title && !!input.platform, errors: [] };
    }
    estimateCost() {
        return { costUsd: 0.02, breakdown: ['LLM prediction: $0.02'] };
    }
    async healthCheck() {
        const llm = await ProviderRegistry.getInstance().getPrimary('llm');
        return { healthy: !!llm, details: llm ? 'Ready' : 'No LLM' };
    }
    async execute(input, onProgress, cancellation) {
        log.info('Predicting performance', { title: input.title, platform: input.platform });
        onProgress(20, 'Analyzing content factors');
        const llm = await ProviderRegistry.getInstance().getPrimary('llm');
        if (!llm)
            throw new Error('No LLM');
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
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
        let parsed = {};
        try {
            parsed = JSON.parse(response.content);
        }
        catch { /* defaults */ }
        onProgress(100, 'Prediction complete');
        return {
            contentId: generateId(ID_PREFIXES.step),
            platform: input.platform,
            predictedViews: parsed.predictedViews ?? { low: 100, mid: 1000, high: 10000 },
            predictedCtr: parsed.predictedCtr ?? 5.0,
            predictedWatchTime: parsed.predictedWatchTime ?? input.duration * 0.6,
            predictedEngagement: parsed.predictedEngagement ?? 3.0,
            viralityScore: parsed.viralityScore ?? 30,
            confidence: parsed.confidence ?? 0.5,
            factors: parsed.factors ?? [],
            predictedAt: new Date(),
        };
    }
}
//# sourceMappingURL=performance-predictor.js.map