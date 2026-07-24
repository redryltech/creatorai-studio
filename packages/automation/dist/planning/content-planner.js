// ============================================================
// CreatorAI Studio — Content Planner Agent
// ============================================================
// Takes a ResearchReport and produces a ContentPlan.
// The planner decides WHAT to create, not HOW to create it.
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger, CostTracker } from '@creatorai/agents';
import { ProviderRegistry } from '@creatorai/providers';
import { AutomationStage } from '../types/automation.types';
const log = Logger.for('ContentPlanner');
export class ContentPlannerAgent {
    agentId = 'automation.planner';
    agentName = 'Content Planner';
    stage = AutomationStage.PLANNING;
    validate(input) {
        const errors = [];
        if (!input.request?.topic)
            errors.push('Request with topic is required');
        if (!input.research)
            errors.push('Research report is required');
        return { valid: errors.length === 0, errors };
    }
    estimateCost(_input) {
        return { costUsd: 0.02, breakdown: ['LLM content planning: ~2000 tokens @ $0.01/1K = $0.02'] };
    }
    async healthCheck() {
        const llm = await ProviderRegistry.getInstance().getPrimary('llm');
        return { healthy: !!llm, details: llm ? 'Ready' : 'No LLM provider' };
    }
    async execute(input, onProgress, cancellation) {
        const startTime = performance.now();
        const { request, research } = input;
        log.info('Content planning starting', { topic: request.topic, videoCount: request.videoCount });
        onProgress(10, 'Analyzing research for content opportunities');
        const llm = await ProviderRegistry.getInstance().getPrimary('llm');
        if (!llm)
            throw new Error('No LLM provider available');
        if (cancellation.isCancelled)
            throw new Error('Planning cancelled');
        onProgress(30, 'Generating content ideas and publishing strategy');
        const response = await llm.complete({
            systemPrompt: `You are an elite content strategist who creates viral content plans. Respond ONLY with valid JSON.`,
            messages: [{ role: 'user', content: `Create a content plan for ${request.videoCount} ${request.platform.replace(/_/g, ' ')} videos about "${request.topic}".

Research data:
- Top angles: ${research.topAngles.join(', ')}
- Content gaps: ${research.contentGaps.join(', ')}
- Top keywords: ${research.keywords.slice(0, 10).map((k) => k.term).join(', ')}
- Trend score: ${research.scores.trendScore}/100
- Opportunity score: ${research.scores.opportunityScore}/100
- Target audience: ${research.audience.primaryAge}, interests: ${research.audience.interests.join(', ')}
- Tone: ${request.tone}
- Language: ${request.language}

Respond with JSON:
{
  "ideas": [${Array.from({ length: request.videoCount }, (_, i) => `{"id":"idea-${i + 1}","title":"string","description":"string","angle":"string","targetKeywords":["string"],"estimatedViews":"string","difficulty":"easy|medium|hard","priority":${i + 1},"hook":"string","contentType":"string"}`).join(',')}],
  "publishingStrategy": {"frequency":"string","bestTimes":["string"],"platformNotes":"string","sequencing":"string"},
  "estimates": {"totalCostUsd":0,"totalDurationMinutes":0,"costPerVideo":0,"timePerVideoMinutes":0}
}` }],
            temperature: 0.6,
            maxTokens: 4096,
            responseFormat: 'json',
        });
        CostTracker.getInstance().trackLLMUsage({
            userId: 'system', projectId: null, pipelineId: null,
            agentId: this.agentId, providerId: llm.id, model: response.model, tokens: response.usage,
        });
        onProgress(80, 'Finalizing content plan');
        let parsed;
        try {
            parsed = JSON.parse(response.content);
        }
        catch {
            throw new Error('Content Planner LLM returned invalid JSON');
        }
        const plan = {
            id: generateId(ID_PREFIXES.step),
            requestId: '',
            researchReportId: research.id,
            ideas: parsed.ideas ?? [],
            publishingStrategy: parsed.publishingStrategy ?? { frequency: 'daily', bestTimes: [], platformNotes: '', sequencing: '' },
            estimates: parsed.estimates ?? { totalCostUsd: request.videoCount * 0.5, totalDurationMinutes: request.videoCount * 2, costPerVideo: 0.5, timePerVideoMinutes: 2 },
            dependencies: [],
            metadata: { plannerModel: response.model, generatedAt: new Date(), processingTimeMs: Math.round(performance.now() - startTime) },
        };
        onProgress(100, 'Content plan complete');
        log.info('Content plan created', { ideaCount: plan.ideas.length, processingTimeMs: plan.metadata.processingTimeMs });
        return plan;
    }
}
//# sourceMappingURL=content-planner.js.map