// ============================================================
// CreatorAI Studio — Content Strategist Agent
// ============================================================
// Generates actionable recommendations based on analytics,
// learning patterns, and trend data.
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger, CostTracker } from '@creatorai/agents';
import { ProviderRegistry } from '@creatorai/providers';
const log = Logger.for('ContentStrategist');
export class ContentStrategistAgent {
    agentId = 'intelligence.strategist';
    agentName = 'Content Strategist';
    stage = 'strategy';
    validate(input) {
        return { valid: !!input.userId, errors: input.userId ? [] : ['userId required'] };
    }
    estimateCost() {
        return { costUsd: 0.03, breakdown: ['LLM strategy generation: $0.03'] };
    }
    async healthCheck() {
        const llm = await ProviderRegistry.getInstance().getPrimary('llm');
        return { healthy: !!llm, details: llm ? 'Ready' : 'No LLM' };
    }
    async execute(input, onProgress, cancellation) {
        const { userId, learnings, recentAnalytics, trendReport } = input;
        log.info('Generating strategy recommendations', { userId, analyticsCount: recentAnalytics.length });
        onProgress(15, 'Analyzing performance data');
        const llm = await ProviderRegistry.getInstance().getPrimary('llm');
        if (!llm)
            throw new Error('No LLM');
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
        onProgress(40, 'Generating AI-powered recommendations');
        const response = await llm.complete({
            systemPrompt: 'You are an elite content strategist. Generate actionable recommendations. JSON only.',
            messages: [{ role: 'user', content: `Generate content strategy recommendations.

Learned patterns: ${learnings.slice(0, 10).map((l) => `${l.category}: ${l.pattern} (score: ${l.score})`).join('; ')}
Recent content count: ${recentAnalytics.length}
Average CTR: ${recentAnalytics.length > 0 ? (recentAnalytics.reduce((s, a) => s + a.metrics.ctr, 0) / recentAnalytics.length).toFixed(1) : 'N/A'}%
Emerging trends: ${trendReport?.emergingTrends.slice(0, 5).map((t) => t.topic).join(', ') ?? 'none'}

JSON: {"recommendations":[{"type":"topic|timing|style|platform|format|improvement|warning","priority":"high|medium|low","title":"short title","description":"actionable description","expectedImpact":"what will improve","confidence":0,"actionable":true,"action":"specific action to take"}]}` }],
            temperature: 0.5, maxTokens: 2048, responseFormat: 'json',
        });
        CostTracker.getInstance().trackLLMUsage({
            userId, projectId: null, pipelineId: null,
            agentId: this.agentId, providerId: llm.id, model: response.model, tokens: response.usage,
        });
        onProgress(80, 'Processing recommendations');
        let parsed = {};
        try {
            parsed = JSON.parse(response.content);
        }
        catch { /* empty */ }
        const recs = (parsed.recommendations ?? []).map((r) => ({
            id: generateId(ID_PREFIXES.step),
            userId,
            type: r.type ?? 'improvement',
            priority: r.priority ?? 'medium',
            title: r.title ?? '',
            description: r.description ?? '',
            expectedImpact: r.expectedImpact ?? '',
            confidence: r.confidence ?? 0.5,
            actionable: r.actionable ?? true,
            action: r.action ?? null,
            data: {},
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 86400000),
        }));
        onProgress(100, 'Strategy recommendations ready');
        log.info('Strategy generated', { recommendationCount: recs.length });
        return recs;
    }
}
//# sourceMappingURL=content-strategist.js.map