// ============================================================
// CreatorAI Studio — Trend Monitor
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger, CostTracker } from '@creatorai/agents';
import { ProviderRegistry } from '@creatorai/providers';
const log = Logger.for('TrendMonitor');
export class TrendMonitorAgent {
    agentId = 'intelligence.trends';
    agentName = 'Trend Monitor';
    stage = 'trends';
    validate(input) { return { valid: !!input.niche, errors: input.niche ? [] : ['Niche required'] }; }
    estimateCost() { return { costUsd: 0.03, breakdown: ['LLM trend analysis: $0.03'] }; }
    async healthCheck() { const llm = await ProviderRegistry.getInstance().getPrimary('llm'); return { healthy: !!llm, details: llm ? 'Ready' : 'No LLM' }; }
    async execute(input, onProgress, cancellation) {
        onProgress(20, 'Scanning trends');
        const llm = await ProviderRegistry.getInstance().getPrimary('llm');
        if (!llm)
            throw new Error('No LLM');
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
        onProgress(50, 'Analyzing trend data');
        const response = await llm.complete({
            systemPrompt: 'You are a trend analyst. Identify emerging trends, breaking topics, and viral opportunities. JSON only.',
            messages: [{ role: 'user', content: `Identify trends in "${input.niche}" for ${input.platforms.join(', ')}.

JSON: {"emergingTrends":[{"topic":"string","platform":"string","velocity":0,"relevance":0,"source":"string"}],"breakingTopics":[{"topic":"string","urgency":"high|medium|low","window":"string"}],"viralOpportunities":[{"topic":"string","estimatedReach":"string","competition":"string","suggestedAngle":"string"}],"nicheInsights":["string"]}` }],
            temperature: 0.5, maxTokens: 2048, responseFormat: 'json',
        });
        CostTracker.getInstance().trackLLMUsage({ userId: input.userId, projectId: null, pipelineId: null, agentId: this.agentId, providerId: llm.id, model: response.model, tokens: response.usage });
        let parsed = {};
        try {
            parsed = JSON.parse(response.content);
        }
        catch { /* defaults */ }
        onProgress(100, 'Trend report ready');
        return { id: generateId(ID_PREFIXES.step), userId: input.userId, generatedAt: new Date(), emergingTrends: parsed.emergingTrends ?? [], breakingTopics: parsed.breakingTopics ?? [], viralOpportunities: parsed.viralOpportunities ?? [], nicheInsights: parsed.nicheInsights ?? [] };
    }
}
//# sourceMappingURL=trend-monitor.js.map