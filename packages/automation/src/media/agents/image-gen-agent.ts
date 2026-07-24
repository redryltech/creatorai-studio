// ============================================================
// CreatorAI Studio — Image Generation Agent (Media Factory)
// ============================================================
// Generates images for all scenes in parallel batches.
// Uses MediaProviderRegistry for provider selection + failover.
// ============================================================

import { generateId, ID_PREFIXES, chunk, sleep } from '@creatorai/shared';
import { Logger, CostTracker } from '@creatorai/agents';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { OptimizedPromptPackage, ImagePackage, IMediaProvider, ProviderResponse } from '../types/media.types';
import { MediaProviderRegistry } from '../registry/media-provider-registry';
import { AutomationStage } from '../../types/automation.types';

const log = Logger.for('ImageGenAgent');
const BATCH_SIZE = 3;
const MAX_RETRIES = 3;

interface ImageGenInput {
  request: Record<string, unknown>;
  prompts: OptimizedPromptPackage;
  width?: number;
  height?: number;
}

export class ImageGenerationAgent implements IAutomationAgent<ImageGenInput, ImagePackage[]> {
  readonly agentId = 'automation.image_gen';
  readonly agentName = 'Image Generator';
  readonly stage = AutomationStage.MEDIA;

  validate(input: ImageGenInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.prompts?.prompts?.length) errors.push('Optimized prompts required');
    return { valid: errors.length === 0, errors };
  }

  estimateCost(input: ImageGenInput): { costUsd: number; breakdown: string[] } {
    const count = input.prompts?.prompts?.length ?? 0;
    const costPerImage = 0.05;
    return { costUsd: count * costPerImage, breakdown: [`${count} images × $${costPerImage} = $${(count * costPerImage).toFixed(2)}`] };
  }

  async healthCheck(): Promise<{ healthy: boolean; details: string }> {
    const provider = await MediaProviderRegistry.getInstance().getPrimary('image');
    return { healthy: !!provider, details: provider ? `Provider: ${provider.providerName}` : 'No image provider' };
  }

  async execute(
    input: ImageGenInput,
    onProgress: ProgressCallback,
    cancellation: CancellationToken,
  ): Promise<ImagePackage[]> {
    const { prompts, width = 1080, height = 1920 } = input;
    const totalScenes = prompts.prompts.length;

    log.info('Image generation starting', { sceneCount: totalScenes, resolution: `${width}x${height}` });
    onProgress(5, `Generating ${totalScenes} images`);

    const registry = MediaProviderRegistry.getInstance();
    const images: ImagePackage[] = [];
    const batches = chunk(prompts.prompts, BATCH_SIZE);
    let completedCount = 0;

    for (const batch of batches) {
      if (cancellation.isCancelled) break;

      const results = await Promise.allSettled(
        batch.map(async (prompt) => {
          // Get provider with failover
          const providers = registry.getByType('image');
          let lastError: string = '';

          for (const provider of providers) {
            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
              try {
                if (cancellation.isCancelled) throw new Error('Cancelled');
                if (!(await provider.isAvailable())) continue;

                const startTime = performance.now();
                const response = await provider.generate({
                  prompt: prompt.imagePrompt,
                  negativePrompt: prompt.negativePrompt,
                  width,
                  height,
                  style: prompt.style,
                });

                if (!response.success || !response.url) {
                  lastError = response.error ?? 'No image returned';
                  if (attempt < MAX_RETRIES) { await sleep(2000 * attempt); continue; }
                  continue;
                }

                const genTime = Math.round(performance.now() - startTime);

                CostTracker.getInstance().trackImageGeneration({
                  userId: 'system', projectId: null, pipelineId: null,
                  agentId: this.agentId, providerId: provider.providerId,
                  model: response.model, imageCount: 1,
                });

                return {
                  sceneId: prompt.sceneId,
                  prompt: prompt.imagePrompt,
                  negativePrompt: prompt.negativePrompt,
                  provider: provider.providerId,
                  model: response.model,
                  imageUrl: response.url,
                  storagePath: '',
                  width,
                  height,
                  generationTimeMs: genTime,
                  costUsd: response.costUsd,
                  seed: null,
                  metadata: response.metadata,
                } satisfies ImagePackage;
              } catch (err) {
                lastError = (err as Error).message;
                if (attempt < MAX_RETRIES) await sleep(2000 * attempt);
              }
            }
          }
          throw new Error(`All providers failed for scene ${prompt.sceneId}: ${lastError}`);
        }),
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          images.push(result.value);
          completedCount++;
        } else {
          log.error('Image generation failed for scene', {}, new Error(result.reason?.message ?? String(result.reason)));
          completedCount++;
        }
      }

      const progress = Math.round((completedCount / totalScenes) * 100);
      onProgress(progress, `Generated ${images.length}/${totalScenes} images`);
    }

    log.info('Image generation complete', { succeeded: images.length, total: totalScenes });
    return images;
  }
}
