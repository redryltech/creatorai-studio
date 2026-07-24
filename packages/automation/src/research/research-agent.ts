// ============================================================
// CreatorAI Studio — Research Agent
// ============================================================
// Researches topics before content creation.
// Uses an LLM to synthesize research from available data
// and research provider plugins.
//
// The Research Agent does NOT call external APIs directly.
// It uses IResearchProvider plugins registered in the
// AutomationRegistry. Adding a new data source = registering
// a new provider.
//
// For MVP: Uses LLM-based research (GPT-4o synthesizes
// knowledge about trends, competitors, audience).
// Future: Plugs in Google Trends, YouTube Data API, Reddit API.
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger, CostTracker, PromptManager } from '@creatorai/agents';
import type { ILLMProvider } from '@creatorai/providers';
import { ProviderRegistry } from '@creatorai/providers';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationRequest, ResearchReport } from '../types/automation.types';
import { AutomationStage } from '../types/automation.types';
import { AutomationRegistry } from '../registry/automation-registry';

const log = Logger.for('ResearchAgent');

interface ResearchInput {
  request: AutomationRequest;
}

export class ResearchAgent implements IAutomationAgent<ResearchInput, ResearchReport> {
  readonly agentId = 'automation.research';
  readonly agentName = 'Research Agent';
  readonly stage = AutomationStage.RESEARCH;

  validate(input: ResearchInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.request?.topic || input.request.topic.length < 2) {
      errors.push('Topic is required (min 2 characters)');
    }
    return { valid: errors.length === 0, errors };
  }

  estimateCost(input: ResearchInput): { costUsd: number; breakdown: string[] } {
    return {
      costUsd: 0.03,
      breakdown: ['LLM research synthesis: ~3000 tokens output @ $0.01/1K = $0.03'],
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; details: string }> {
    const llm = await ProviderRegistry.getInstance().getPrimary<ILLMProvider>('llm');
    return { healthy: !!llm, details: llm ? `LLM provider: ${llm.id}` : 'No LLM provider available' };
  }

  async execute(
    input: ResearchInput,
    onProgress: ProgressCallback,
    cancellation: CancellationToken,
  ): Promise<ResearchReport> {
    const startTime = performance.now();
    const { request } = input;

    log.info('Research starting', { topic: request.topic, platform: request.platform });
    onProgress(5, 'Preparing research query');

    // Get LLM provider
    const llm = await ProviderRegistry.getInstance().getPrimary<ILLMProvider>('llm');
    if (!llm) throw new Error('No LLM provider available for research');

    if (cancellation.isCancelled) throw new Error('Research cancelled');

    onProgress(15, 'Analyzing topic trends and competition');

    // Query available research providers for supplementary data
    const registry = AutomationRegistry.getInstance();
    const providers = registry.getResearchProviders();
    const providerData: Record<string, unknown>[] = [];

    for (const provider of providers) {
      try {
        if (await provider.isAvailable()) {
          const data = await provider.research(request.topic, { platform: request.platform });
          providerData.push({ source: provider.providerName, data });
        }
      } catch (error) {
        log.warn('Research provider failed', { providerId: provider.providerId, error: (error as Error).message });
      }
    }

    onProgress(40, 'Synthesizing research with AI');

    // LLM-based research synthesis
    const systemPrompt = `You are an expert content strategist and market researcher. Analyze the given topic for social media content creation. Provide deep, actionable insights. Respond ONLY with valid JSON.`;

    const userPrompt = `Research this topic for ${request.platform.replace(/_/g, ' ')} content creation:

Topic: "${request.topic}"
Target audience: ${request.audience || 'general'}
Language: ${request.language}
Video count needed: ${request.videoCount}

${providerData.length > 0 ? `Additional data from research providers:\n${JSON.stringify(providerData, null, 2)}` : ''}

Provide a comprehensive research report as JSON:
{
  "trends": [{"query":"string","volume":0,"growth":0,"timeframe":"string","platform":"string","relatedQueries":["string"]}],
  "keywords": [{"term":"string","searchVolume":0,"competition":"low|medium|high","relevanceScore":0,"intent":"informational|navigational|transactional|commercial"}],
  "competitors": [{"name":"string","platform":"string","subscriberCount":null,"recentVideoCount":0,"averageViews":0,"topPerformingTopics":["string"],"contentGaps":["string"],"strengths":["string"],"weaknesses":["string"]}],
  "audience": {"primaryAge":"string","interests":["string"],"painPoints":["string"],"contentPreferences":["string"],"activePlatforms":["string"],"peakActivityHours":["string"],"languagePreferences":["string"]},
  "topAngles": ["string - unique content angles nobody is covering"],
  "contentGaps": ["string - topics the audience wants but creators aren't making"],
  "references": [{"title":"string","url":"string","source":"string","relevance":0}],
  "scores": {"trendScore":0,"difficultyScore":0,"opportunityScore":0,"confidenceScore":0}
}`;

    if (cancellation.isCancelled) throw new Error('Research cancelled');

    const response = await llm.complete({
      systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.4,
      maxTokens: 4096,
      responseFormat: 'json',
    });

    onProgress(80, 'Parsing research results');

    // Track cost
    CostTracker.getInstance().trackLLMUsage({
      userId: 'system',
      projectId: null,
      pipelineId: null,
      agentId: this.agentId,
      providerId: llm.id,
      model: response.model,
      tokens: response.usage,
    });

    // Parse response
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(response.content);
    } catch {
      throw new Error('Research LLM returned invalid JSON');
    }

    const processingTimeMs = Math.round(performance.now() - startTime);

    const report: ResearchReport = {
      id: generateId(ID_PREFIXES.step),
      requestId: '',
      topic: request.topic,
      platform: request.platform,
      trends: (parsed.trends as ResearchReport['trends']) ?? [],
      keywords: (parsed.keywords as ResearchReport['keywords']) ?? [],
      competitors: (parsed.competitors as ResearchReport['competitors']) ?? [],
      audience: (parsed.audience as ResearchReport['audience']) ?? { primaryAge: '18-35', interests: [], painPoints: [], contentPreferences: [], activePlatforms: [], peakActivityHours: [], languagePreferences: [request.language] },
      topAngles: (parsed.topAngles as string[]) ?? [],
      contentGaps: (parsed.contentGaps as string[]) ?? [],
      references: (parsed.references as ResearchReport['references']) ?? [],
      scores: {
        trendScore: (parsed.scores as any)?.trendScore ?? 50,
        difficultyScore: (parsed.scores as any)?.difficultyScore ?? 50,
        opportunityScore: (parsed.scores as any)?.opportunityScore ?? 50,
        confidenceScore: (parsed.scores as any)?.confidenceScore ?? 70,
      },
      metadata: {
        sourcesQueried: providers.length + 1,
        processingTimeMs,
        generatedAt: new Date(),
      },
    };

    onProgress(100, 'Research complete');

    log.info('Research completed', {
      topic: request.topic,
      trendScore: report.scores.trendScore,
      opportunityScore: report.scores.opportunityScore,
      keywordCount: report.keywords.length,
      competitorCount: report.competitors.length,
      processingTimeMs,
    });

    return report;
  }
}
