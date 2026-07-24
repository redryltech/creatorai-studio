// ============================================================
// CreatorAI Studio — Image Generation Agent
// ============================================================
// Generates AI images for each scene using the prompts
// produced by the PromptAgent.
//
// This agent handles batch generation: given N scene prompts,
// it generates N images using the configured image provider.
//
// For large batches (>5 images), it uses the JobQueue
// to avoid blocking the API thread. For small batches,
// it runs inline.
//
// Input:  ScenePrompt[] (from PromptAgent)
// Output: ImageResult[] (URLs + metadata per scene)
// ============================================================

import type { AgentContext, ValidationResult, CostEstimate, HealthCheckResult, ScenePrompt, ImageResult } from '@creatorai/shared';
import { AgentId, AgentError, chunk } from '@creatorai/shared';
import { BaseAgent } from '../core/base-agent';
import type { AgentMetadata } from '../core/agent.interface';
import { Logger } from '../infrastructure/logger';
import type { IImageProvider } from '@creatorai/providers';
import { ProviderRegistry } from '@creatorai/providers';

// ---- Input / Output Types ----

export interface ImageAgentInput {
  scenePrompts: ScenePrompt[];
  provider?: string;       // Override provider selection
  model?: string;           // Override model selection
}

export interface ImageAgentOutput {
  images: ImageResult[];
  failedScenes: string[];   // Scene IDs that failed generation
}

// ---- Constants ----

const BATCH_SIZE = 3;       // Generate 3 images concurrently
const INLINE_THRESHOLD = 5; // Below this count, run inline

// ---- Agent ----

export class ImageAgent extends BaseAgent<ImageAgentInput, ImageAgentOutput> {
  readonly id = AgentId.IMAGE;
  readonly name = 'Image Generator';
  readonly version = '1.0.0';
  readonly description = 'Generates AI images for each video scene';

  getMetadata(): AgentMetadata {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      description: this.description,
      inputSchema: {},
      outputSchema: {},
      dependencies: [AgentId.PROMPT],
      estimatedDuration: { min: 10, max: 120, average: 45 },
      supportedProviders: ['replicate', 'openai_dalle'],
    };
  }

  protected async doValidate(input: ImageAgentInput): Promise<ValidationResult> {
    const errors: ValidationResult['errors'] = [];

    if (!input.scenePrompts || input.scenePrompts.length === 0) {
      errors.push({ field: 'scenePrompts', message: 'At least one scene prompt is required', code: 'REQUIRED' });
    }
    if (input.scenePrompts && input.scenePrompts.length > 50) {
      errors.push({ field: 'scenePrompts', message: 'Maximum 50 scene prompts per batch', code: 'TOO_MANY' });
    }

    // Validate each prompt has content
    for (const sp of (input.scenePrompts ?? [])) {
      if (!sp.imagePrompt.positive || sp.imagePrompt.positive.trim().length < 10) {
        errors.push({
          field: `scenePrompts.${sp.sceneId}.positive`,
          message: `Scene ${sp.sceneId} has an empty or too-short positive prompt`,
          code: 'TOO_SHORT',
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  protected async doExecute(
    input: ImageAgentInput,
    context: AgentContext,
  ): Promise<{ data: ImageAgentOutput; metrics?: { tokensUsed?: number; costUsd?: number; provider?: string } }> {
    const agentLog = Logger.for(this.id, { pipelineId: context.pipelineId, userId: context.userId });
    const totalScenes = input.scenePrompts.length;

    agentLog.info('Starting image generation', { sceneCount: totalScenes });

    // Get image provider
    const providerRegistry = ProviderRegistry.getInstance();
    let imageProvider: IImageProvider | undefined;

    if (input.provider) {
      imageProvider = providerRegistry.get<IImageProvider>(input.provider);
    }
    if (!imageProvider) {
      imageProvider = await providerRegistry.getPrimary<IImageProvider>('image');
    }
    if (!imageProvider) {
      throw new AgentError(this.id, 'No image provider available. Check API keys and provider health.', true);
    }

    const images: ImageResult[] = [];
    const failedScenes: string[] = [];

    // Process in batches for controlled concurrency
    const batches = chunk(input.scenePrompts, BATCH_SIZE);
    let completedCount = 0;

    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      const batch = batches[batchIdx]!;

      // Check cancellation between batches
      if (context.isCancelled()) {
        agentLog.warn('Image generation cancelled', { completed: completedCount, total: totalScenes });
        break;
      }

      const batchStart = performance.now();

      // Generate all images in this batch concurrently
      const results = await Promise.allSettled(
        batch.map(async (scenePrompt) => {
          const genStart = performance.now();

          const response = await imageProvider!.generate({
            prompt: scenePrompt.imagePrompt.positive,
            negativePrompt: scenePrompt.imagePrompt.negative,
            width: scenePrompt.imagePrompt.width,
            height: scenePrompt.imagePrompt.height,
            model: input.model,
            guidanceScale: scenePrompt.imagePrompt.guidanceScale,
            seed: scenePrompt.imagePrompt.seed,
            count: 1,
          });

          const genDuration = Math.round(performance.now() - genStart);
          const firstImage = response.images[0];

          if (!firstImage) {
            throw new Error('Provider returned no images');
          }

          const result: ImageResult = {
            url: firstImage.url,
            storageRef: '', // Set after upload to Firebase Storage
            width: firstImage.width,
            height: firstImage.height,
            format: 'png',
            sizeBytes: 0, // Determined after download
            provider: imageProvider!.id,
            model: response.model,
            prompt: scenePrompt.imagePrompt.positive,
            seed: firstImage.seed,
            generationTime: genDuration,
          };

          return { sceneId: scenePrompt.sceneId, result };
        }),
      );

      // Process batch results
      for (let i = 0; i < results.length; i++) {
        const scenePrompt = batch[i]!;
        const result = results[i]!;

        if (result.status === 'fulfilled') {
          images.push(result.value.result);
          completedCount++;

          // Track cost per image
          this.costTracker.trackImageGeneration({
            userId: context.userId,
            projectId: context.projectId,
            pipelineId: context.pipelineId,
            agentId: this.id,
            providerId: imageProvider.id,
            model: input.model ?? 'flux-pro-1.1',
            imageCount: 1,
          });
        } else {
          failedScenes.push(scenePrompt.sceneId);
          agentLog.error(
            `Image generation failed for scene ${scenePrompt.sceneId}`,
            { sceneId: scenePrompt.sceneId },
            result.reason instanceof Error ? result.reason : new Error(String(result.reason)),
          );
        }
      }

      // Report progress
      const progress = Math.round((completedCount / totalScenes) * 100);
      this.reportProgress(context, progress, `Generated ${completedCount}/${totalScenes} images`);

      const batchDuration = Math.round(performance.now() - batchStart);
      agentLog.info('Batch complete', {
        batch: batchIdx + 1,
        batchSize: batch.length,
        durationMs: batchDuration,
        completedTotal: completedCount,
      });
    }

    // Fail if too many scenes failed
    if (images.length === 0) {
      throw new AgentError(
        this.id,
        `All ${totalScenes} image generations failed. Check provider health.`,
        true,
      );
    }

    if (failedScenes.length > 0) {
      agentLog.warn('Some scenes failed image generation', {
        failed: failedScenes.length,
        succeeded: images.length,
        failedScenes,
      });
    }

    // Store in context for downstream agents
    context.setStoreValue('image.output', images);
    context.setStoreValue('image.failedScenes', failedScenes);

    this.reportProgress(context, 100, 'Image generation complete');

    return {
      data: { images, failedScenes },
      metrics: {
        provider: imageProvider.id,
      },
    };
  }

  protected async doRollback(context: AgentContext): Promise<void> {
    // In a full implementation, delete generated images from Firebase Storage
    const images = context.getStoreValue<ImageResult[]>('image.output');
    if (images && images.length > 0) {
      Logger.for(this.id).info('Rollback: would delete generated images', {
        count: images.length,
      });
      // TODO: Delete from Firebase Storage via StorageService
    }
  }

  protected async doEstimateCost(input: ImageAgentInput): Promise<CostEstimate> {
    const count = input.scenePrompts.length;
    const costPerImage = 0.05; // Flux Pro default
    return {
      provider: 'replicate',
      model: 'flux-pro-1.1',
      estimatedCostUsd: count * costPerImage,
      breakdown: [{
        item: 'Image generation (Flux Pro 1.1)',
        quantity: count,
        unitCostUsd: costPerImage,
        totalCostUsd: count * costPerImage,
      }],
    };
  }

  protected async doHealthCheck(): Promise<HealthCheckResult> {
    const registry = ProviderRegistry.getInstance();
    const provider = await registry.getPrimary<IImageProvider>('image');
    return {
      healthy: !!provider,
      provider: provider?.id ?? 'none',
      latencyMs: 0,
      details: {},
    };
  }
}
