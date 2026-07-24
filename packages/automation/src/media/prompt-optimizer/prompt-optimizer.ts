// ============================================================
// CreatorAI Studio — Prompt Optimizer Agent
// ============================================================
// Transforms ScriptPackage scenes into optimized generation
// prompts for image, video, and voice providers.
// Ensures visual consistency across all scenes.
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger, CostTracker } from '@creatorai/agents';
import type { ILLMProvider } from '@creatorai/providers';
import { ProviderRegistry } from '@creatorai/providers';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { ScriptPackage } from '../../types/automation.types';
import type { OptimizedPromptPackage } from '../types/media.types';
import { AutomationStage } from '../../types/automation.types';

const log = Logger.for('PromptOptimizer');

interface PromptOptimizerInput {
  request: Record<string, unknown>;
  scriptPackage: ScriptPackage;
  artStyle?: string;
  aspectRatio?: string;
}

export class PromptOptimizerAgent implements IAutomationAgent<PromptOptimizerInput, OptimizedPromptPackage> {
  readonly agentId = 'automation.prompt_optimizer';
  readonly agentName = 'Prompt Optimizer';
  readonly stage = AutomationStage.MEDIA;

  validate(input: PromptOptimizerInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.scriptPackage?.scenes?.length) errors.push('ScriptPackage with scenes required');
    return { valid: errors.length === 0, errors };
  }

  estimateCost(input: PromptOptimizerInput): { costUsd: number; breakdown: string[] } {
    const scenes = input.scriptPackage?.scenes?.length ?? 0;
    return { costUsd: 0.02 + scenes * 0.002, breakdown: [`LLM prompt optimization: ${scenes} scenes`] };
  }

  async healthCheck(): Promise<{ healthy: boolean; details: string }> {
    const llm = await ProviderRegistry.getInstance().getPrimary<ILLMProvider>('llm');
    return { healthy: !!llm, details: llm ? 'Ready' : 'No LLM provider' };
  }

  async execute(
    input: PromptOptimizerInput,
    onProgress: ProgressCallback,
    cancellation: CancellationToken,
  ): Promise<OptimizedPromptPackage> {
    const startTime = performance.now();
    const { scriptPackage, artStyle, aspectRatio } = input;

    log.info('Optimizing prompts', { sceneCount: scriptPackage.scenes.length, artStyle });
    onProgress(10, 'Analyzing scenes for visual consistency');

    const llm = await ProviderRegistry.getInstance().getPrimary<ILLMProvider>('llm');
    if (!llm) throw new Error('No LLM provider available');
    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(25, 'Generating optimized prompts for all scenes');

    const scenesText = scriptPackage.scenes.map((s) =>
      `Scene ${s.order}: Narration="${s.narration}" Visual="${s.visualNotes}" Camera="${s.cameraAngle}" Movement="${s.cameraMovement}" Emotion="${s.emotion}"`
    ).join('\n');

    const response = await llm.complete({
      systemPrompt: 'You are an expert AI prompt engineer for image and video generation. Create detailed, consistent prompts optimized for Flux/DALL-E/Runway. Respond ONLY with valid JSON.',
      messages: [{ role: 'user', content: `Optimize these scene descriptions into generation prompts.

Art style: ${artStyle ?? 'cinematic'}
Aspect ratio: ${aspectRatio ?? '9:16'}

Scenes:
${scenesText}

Respond with JSON:
{
  "prompts": [${scriptPackage.scenes.map((s) => `{"sceneId":"${s.id}","sceneOrder":${s.order},"imagePrompt":"detailed prompt","negativePrompt":"blurry, low quality, text, watermark","videoPrompt":"motion description","cameraAngle":"${s.cameraAngle}","cameraMovement":"${s.cameraMovement}","lighting":"description","mood":"${s.emotion}","colorPalette":["#hex"],"lens":"35mm|50mm|85mm|wide","composition":"rule of thirds|centered|dynamic","style":"${artStyle ?? 'cinematic'}"}`).join(',')}],
  "globalStyle": "consistent style description",
  "consistencyNotes": "how to maintain visual consistency"
}` }],
      temperature: 0.5,
      maxTokens: 4096,
      responseFormat: 'json',
    });

    CostTracker.getInstance().trackLLMUsage({
      userId: 'system', projectId: null, pipelineId: null,
      agentId: this.agentId, providerId: llm.id, model: response.model, tokens: response.usage,
    });

    onProgress(85, 'Parsing optimized prompts');

    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(response.content); } catch { throw new Error('Prompt optimizer returned invalid JSON'); }

    const result: OptimizedPromptPackage = {
      prompts: ((parsed.prompts as OptimizedPromptPackage['prompts']) ?? []).map((p, i) => ({
        sceneId: p.sceneId ?? scriptPackage.scenes[i]?.id ?? `scene-${i + 1}`,
        sceneOrder: p.sceneOrder ?? i + 1,
        imagePrompt: p.imagePrompt ?? '',
        negativePrompt: p.negativePrompt ?? 'blurry, low quality, deformed, text, watermark',
        videoPrompt: p.videoPrompt ?? '',
        cameraAngle: p.cameraAngle ?? 'medium shot',
        cameraMovement: p.cameraMovement ?? 'static',
        lighting: p.lighting ?? 'natural',
        mood: p.mood ?? 'neutral',
        colorPalette: p.colorPalette ?? [],
        lens: p.lens ?? '50mm',
        composition: p.composition ?? 'rule of thirds',
        style: p.style ?? artStyle ?? 'cinematic',
      })),
      globalStyle: (parsed.globalStyle as string) ?? artStyle ?? 'cinematic',
      consistencyNotes: (parsed.consistencyNotes as string) ?? '',
      metadata: {
        processingTimeMs: Math.round(performance.now() - startTime),
        model: response.model,
        generatedAt: new Date(),
      },
    };

    onProgress(100, 'Prompts optimized');
    log.info('Prompts optimized', { sceneCount: result.prompts.length, processingTimeMs: result.metadata.processingTimeMs });
    return result;
  }
}
