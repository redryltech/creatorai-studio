// ============================================================
// CreatorAI Studio — Prompt Generator Agent
// ============================================================
// Transforms script scenes into optimized AI image/video
// generation prompts. Sits between ScriptAgent and ImageAgent
// in the pipeline.
//
// Input: Script scenes + art style + target model
// Output: Optimized prompts per scene (positive, negative, metadata)
//
// This agent ensures visual consistency across scenes by:
// 1. Establishing a character description palette upfront
// 2. Repeating key visual descriptors in every scene prompt
// 3. Using consistent lighting, color grading, and style terms
// ============================================================

import type { AgentContext, ValidationResult, CostEstimate, HealthCheckResult, ScriptScene, ScenePrompt } from '@creatorai/shared';
import { AgentId, ArtStyle, AspectRatio, AgentError } from '@creatorai/shared';
import { BaseAgent } from '../core/base-agent';
import type { AgentMetadata } from '../core/agent.interface';
import { PromptManager } from '../infrastructure/prompt/prompt-manager';
import { Logger } from '../infrastructure/logger';
import type { ILLMProvider } from '@creatorai/providers';
import { ProviderRegistry } from '@creatorai/providers';

// ---- Input / Output Types ----

export interface PromptAgentInput {
  scenes: ScriptScene[];
  artStyle: ArtStyle;
  aspectRatio: AspectRatio;
  targetModel: 'flux' | 'dalle3' | 'sdxl';
  characterConsistency: boolean;
  characterDescriptions?: Array<{
    name: string;
    description: string;
  }>;
}

export interface PromptAgentOutput {
  scenePrompts: ScenePrompt[];
}

// ---- Agent ----

export class PromptAgent extends BaseAgent<PromptAgentInput, PromptAgentOutput> {
  readonly id = AgentId.PROMPT;
  readonly name = 'Prompt Generator';
  readonly version = '1.0.0';
  readonly description = 'Generates optimized AI image/video prompts from script scenes';

  getMetadata(): AgentMetadata {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      description: this.description,
      inputSchema: {},
      outputSchema: {},
      dependencies: [AgentId.SCRIPT],
      estimatedDuration: { min: 5, max: 20, average: 10 },
      supportedProviders: ['openai', 'anthropic'],
    };
  }

  protected async doValidate(input: PromptAgentInput): Promise<ValidationResult> {
    const errors: ValidationResult['errors'] = [];

    if (!input.scenes || input.scenes.length === 0) {
      errors.push({ field: 'scenes', message: 'At least one scene is required', code: 'REQUIRED' });
    }
    if (input.scenes && input.scenes.length > 50) {
      errors.push({ field: 'scenes', message: 'Maximum 50 scenes per batch', code: 'TOO_MANY' });
    }
    if (!Object.values(ArtStyle).includes(input.artStyle)) {
      errors.push({ field: 'artStyle', message: `Invalid art style: ${input.artStyle}`, code: 'INVALID' });
    }

    return { valid: errors.length === 0, errors };
  }

  protected async doExecute(
    input: PromptAgentInput,
    context: AgentContext,
  ): Promise<{ data: PromptAgentOutput; metrics?: { tokensUsed?: number; costUsd?: number; provider?: string } }> {
    const agentLog = Logger.for(this.id, { pipelineId: context.pipelineId, userId: context.userId });

    agentLog.info('Generating image prompts', {
      sceneCount: input.scenes.length,
      artStyle: input.artStyle,
      targetModel: input.targetModel,
    });

    this.reportProgress(context, 10, 'Preparing prompt template');

    // 1. Resolve dimensions from aspect ratio
    const dimensions = this.getDimensions(input.aspectRatio);

    // 2. Format scenes for the template
    const scenesText = input.scenes.map((s) =>
      `Scene ${s.order} (${s.type}): Narration: "${s.narration}" | Visual: "${s.visualDescription}" | Duration: ${s.duration}s`
    ).join('\n\n');

    const charDescText = input.characterDescriptions?.length
      ? `Character descriptions for consistency:\n${input.characterDescriptions.map((c) => `- ${c.name}: ${c.description}`).join('\n')}`
      : 'No specific character descriptions. Infer appropriate characters from the script.';

    // 3. Render prompt
    const promptManager = PromptManager.getInstance();
    const rendered = promptManager.render('prompt.scene_to_image', {
      artStyle: this.formatArtStyle(input.artStyle),
      aspectRatio: input.aspectRatio,
      targetModel: input.targetModel,
      characterConsistency: input.characterConsistency ? 'Yes — maintain consistent character appearance across all scenes' : 'No — each scene can have different characters',
      characterDescriptions: charDescText,
      scenes: scenesText,
    });

    this.reportProgress(context, 25, 'Calling LLM provider');

    // 4. Call LLM
    const providerRegistry = ProviderRegistry.getInstance();
    const llmProvider = await providerRegistry.getPrimary<ILLMProvider>('llm');
    if (!llmProvider) {
      throw new AgentError(this.id, 'No LLM provider available', true);
    }

    const response = await llmProvider.complete({
      systemPrompt: rendered.systemPrompt,
      messages: [{ role: 'user', content: rendered.userPrompt }],
      model: rendered.model,
      temperature: rendered.temperature,
      maxTokens: rendered.maxTokens,
      responseFormat: rendered.responseFormat,
    });

    this.reportProgress(context, 70, 'Parsing prompts');

    // 5. Parse response
    let parsed: any;
    try {
      parsed = JSON.parse(response.content);
    } catch {
      throw new AgentError(this.id, 'LLM returned invalid JSON for image prompts', true);
    }

    // 6. Normalize and validate prompts
    const scenePrompts: ScenePrompt[] = (parsed.scenePrompts ?? parsed.scene_prompts ?? []).map((p: any, i: number) => ({
      sceneId: p.sceneId ?? p.scene_id ?? input.scenes[i]?.id ?? `scene-${i + 1}`,
      imagePrompt: {
        positive: p.imagePrompt?.positive ?? p.image_prompt?.positive ?? '',
        negative: p.imagePrompt?.negative ?? p.image_prompt?.negative ?? 'blurry, low quality, deformed, text, watermark',
        width: dimensions.width,
        height: dimensions.height,
        guidanceScale: p.imagePrompt?.guidanceScale ?? p.image_prompt?.guidance_scale ?? 7.5,
        seed: undefined,
      },
      metadata: {
        character: p.metadata?.character ?? '',
        environment: p.metadata?.environment ?? '',
        cameraAngle: p.metadata?.cameraAngle ?? p.metadata?.camera_angle ?? 'medium shot',
        lighting: p.metadata?.lighting ?? 'natural',
        mood: p.metadata?.mood ?? 'neutral',
        colorPalette: p.metadata?.colorPalette ?? p.metadata?.color_palette ?? [],
      },
    }));

    if (scenePrompts.length === 0) {
      throw new AgentError(this.id, 'No scene prompts were generated', true);
    }

    // 7. Append art style suffix to every prompt for consistency
    const styleBoost = this.getStyleSuffix(input.artStyle);
    for (const sp of scenePrompts) {
      if (styleBoost && !sp.imagePrompt.positive.includes(styleBoost)) {
        sp.imagePrompt.positive = `${sp.imagePrompt.positive}, ${styleBoost}`;
      }
    }

    // 8. Cost tracking
    this.costTracker.trackLLMUsage({
      userId: context.userId,
      projectId: context.projectId,
      pipelineId: context.pipelineId,
      agentId: this.id,
      providerId: llmProvider.id,
      model: response.model,
      tokens: response.usage,
    });

    // 9. Store in context for downstream agents
    context.setStoreValue('prompt.output', scenePrompts);

    agentLog.info('Prompt generation complete', {
      promptCount: scenePrompts.length,
      tokens: response.usage.totalTokens,
    });

    this.reportProgress(context, 100, 'Complete');

    return {
      data: { scenePrompts },
      metrics: {
        tokensUsed: response.usage.totalTokens,
        provider: llmProvider.id,
      },
    };
  }

  protected async doRollback(_context: AgentContext): Promise<void> {}

  protected async doEstimateCost(input: PromptAgentInput): Promise<CostEstimate> {
    const estimatedTokens = input.scenes.length * 400;
    return {
      provider: 'openai',
      model: 'gpt-4o',
      estimatedCostUsd: (estimatedTokens / 1000) * 0.01,
      breakdown: [{
        item: 'LLM completion for prompt engineering',
        quantity: estimatedTokens,
        unitCostUsd: 0.01 / 1000,
        totalCostUsd: (estimatedTokens / 1000) * 0.01,
      }],
    };
  }

  protected async doHealthCheck(): Promise<HealthCheckResult> {
    const registry = ProviderRegistry.getInstance();
    const provider = await registry.getPrimary<ILLMProvider>('llm');
    return {
      healthy: !!provider,
      provider: provider?.id ?? 'none',
      latencyMs: 0,
      details: {},
    };
  }

  // ---- Private ----

  private getDimensions(aspectRatio: AspectRatio): { width: number; height: number } {
    switch (aspectRatio) {
      case AspectRatio.LANDSCAPE: return { width: 1920, height: 1080 };
      case AspectRatio.PORTRAIT: return { width: 1080, height: 1920 };
      case AspectRatio.SQUARE: return { width: 1080, height: 1080 };
      default: return { width: 1080, height: 1920 };
    }
  }

  private formatArtStyle(style: ArtStyle): string {
    return style.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private getStyleSuffix(style: ArtStyle): string {
    const suffixes: Partial<Record<ArtStyle, string>> = {
      [ArtStyle.PHOTOREALISTIC]: 'photorealistic, ultra detailed, 8k, professional photography',
      [ArtStyle.CINEMATIC]: 'cinematic lighting, anamorphic lens, film grain, color graded, 35mm film',
      [ArtStyle.ANIME]: 'anime style, cel shaded, studio ghibli inspired, vibrant colors',
      [ArtStyle.CARTOON]: 'cartoon style, bold outlines, bright colors, playful',
      [ArtStyle.DIGITAL_ART]: 'digital art, concept art, artstation trending, detailed illustration',
      [ArtStyle.DARK_MOODY]: 'dark moody atmosphere, dramatic chiaroscuro lighting, desaturated',
      [ArtStyle.BRIGHT_VIBRANT]: 'vibrant colors, bright lighting, cheerful, saturated',
      [ArtStyle.THREE_D_RENDER]: '3D render, octane render, ray tracing, subsurface scattering',
      [ArtStyle.NEON]: 'neon glow, cyberpunk lighting, neon signs, dark background with neon accents',
    };
    return suffixes[style] ?? '';
  }
}
