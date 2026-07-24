// ============================================================
// CreatorAI Studio — SEO Package Generator Agent
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger, CostTracker } from '@creatorai/agents';
import type { ILLMProvider } from '@creatorai/providers';
import { ProviderRegistry } from '@creatorai/providers';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { ScriptPackage, AutomationRequest } from '../../types/automation.types';
import type { SEOPackage, SocialPlatformId } from '../types/publishing.types';
import { AutomationStage } from '../../types/automation.types';

const log = Logger.for('SEOAgent');

interface SEOInput {
  request: AutomationRequest;
  scriptPackage: ScriptPackage;
}

export class SEOGeneratorAgent implements IAutomationAgent<SEOInput, SEOPackage> {
  readonly agentId = 'automation.seo_gen';
  readonly agentName = 'SEO Generator';
  readonly stage = AutomationStage.SEO;

  validate(input: SEOInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.request?.topic) errors.push('Topic required');
    if (!input.scriptPackage?.fullNarration) errors.push('Script required');
    return { valid: errors.length === 0, errors };
  }

  estimateCost(): { costUsd: number; breakdown: string[] } {
    return { costUsd: 0.02, breakdown: ['LLM SEO generation: $0.02'] };
  }

  async healthCheck(): Promise<{ healthy: boolean; details: string }> {
    const llm = await ProviderRegistry.getInstance().getPrimary<ILLMProvider>('llm');
    return { healthy: !!llm, details: llm ? 'Ready' : 'No LLM' };
  }

  async execute(input: SEOInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<SEOPackage> {
    const { request, scriptPackage } = input;
    const startTime = performance.now();

    log.info('SEO generation starting', { topic: request.topic, platform: request.platform });
    onProgress(15, 'Generating SEO-optimized metadata');

    const llm = await ProviderRegistry.getInstance().getPrimary<ILLMProvider>('llm');
    if (!llm) throw new Error('No LLM provider');
    if (cancellation.isCancelled) throw new Error('Cancelled');

    const response = await llm.complete({
      systemPrompt: 'You are a social media SEO expert. Generate metadata that maximizes discoverability and CTR. JSON only.',
      messages: [{ role: 'user', content: `Generate SEO package for ${request.platform.replace(/_/g, ' ')} video.

Topic: "${request.topic}"
Script hook: "${scriptPackage.hook.text}"
Full narration: "${scriptPackage.fullNarration.slice(0, 500)}"

JSON:
{"title":"max 60 chars, attention-grabbing","description":"max 2000 chars with keywords","keywords":["10-15 terms"],"tags":["10-15 tags"],"hashtags":["5-15 platform-appropriate"],"thumbnailText":"2-4 words for thumbnail overlay","pinnedComment":"engaging question or CTA","cta":"specific call to action","category":"most relevant category"}` }],
      temperature: 0.6,
      maxTokens: 1024,
      responseFormat: 'json',
    });

    CostTracker.getInstance().trackLLMUsage({
      userId: 'system', projectId: null, pipelineId: null,
      agentId: this.agentId, providerId: llm.id, model: response.model, tokens: response.usage,
    });

    onProgress(80, 'Parsing SEO package');

    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(response.content); } catch { throw new Error('SEO LLM returned invalid JSON'); }

    const pkg: SEOPackage = {
      id: generateId(ID_PREFIXES.step),
      contentIdeaId: scriptPackage.contentIdeaId,
      platform: request.platform as SocialPlatformId,
      title: (parsed.title as string) ?? request.topic,
      description: (parsed.description as string) ?? '',
      keywords: (parsed.keywords as string[]) ?? [],
      tags: (parsed.tags as string[]) ?? [],
      hashtags: (parsed.hashtags as string[]) ?? [],
      thumbnailText: (parsed.thumbnailText as string) ?? '',
      pinnedComment: (parsed.pinnedComment as string) ?? '',
      cta: (parsed.cta as string) ?? '',
      category: (parsed.category as string) ?? 'Education',
      language: request.language,
      metadata: { model: response.model, generatedAt: new Date(), processingTimeMs: Math.round(performance.now() - startTime) },
    };

    onProgress(100, 'SEO package generated');
    log.info('SEO generated', { title: pkg.title, tagCount: pkg.tags.length, hashtagCount: pkg.hashtags.length });
    return pkg;
  }
}
