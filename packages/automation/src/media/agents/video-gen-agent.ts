// ============================================================
// CreatorAI Studio — Video Generation Agent (Media Factory)
// ============================================================

import { generateId, ID_PREFIXES, chunk, sleep } from '@creatorai/shared';
import { Logger, CostTracker } from '@creatorai/agents';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { OptimizedPromptPackage, ImagePackage, VideoClipPackage } from '../types/media.types';
import { MediaProviderRegistry } from '../registry/media-provider-registry';
import { AutomationStage } from '../../types/automation.types';

const log = Logger.for('VideoGenAgent');

interface VideoGenInput {
  request: Record<string, unknown>;
  prompts: OptimizedPromptPackage;
  images: ImagePackage[];
  clipDuration?: number;
}

export class VideoGenerationAgent implements IAutomationAgent<VideoGenInput, VideoClipPackage[]> {
  readonly agentId = 'automation.video_gen';
  readonly agentName = 'Video Generator';
  readonly stage = AutomationStage.MEDIA;

  validate(input: VideoGenInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.prompts?.prompts?.length) errors.push('Prompts required');
    return { valid: errors.length === 0, errors };
  }

  estimateCost(input: VideoGenInput): { costUsd: number; breakdown: string[] } {
    const count = input.prompts?.prompts?.length ?? 0;
    const dur = input.clipDuration ?? 5;
    const cost = count * dur * 0.05;
    return { costUsd: cost, breakdown: [`${count} clips × ${dur}s × $0.05/s = $${cost.toFixed(2)}`] };
  }

  async healthCheck(): Promise<{ healthy: boolean; details: string }> {
    const provider = await MediaProviderRegistry.getInstance().getPrimary('video');
    return { healthy: !!provider, details: provider ? `Provider: ${provider.providerName}` : 'No video provider (expected — future integration)' };
  }

  async execute(
    input: VideoGenInput,
    onProgress: ProgressCallback,
    cancellation: CancellationToken,
  ): Promise<VideoClipPackage[]> {
    const { prompts, images, clipDuration = 5 } = input;
    const totalClips = prompts.prompts.length;

    log.info('Video generation starting', { clipCount: totalClips, clipDuration });
    onProgress(5, `Generating ${totalClips} video clips`);

    const registry = MediaProviderRegistry.getInstance();
    const provider = await registry.getPrimary('video');

    // If no video provider is registered, use image-to-video simulation
    // (Ken Burns effect applied during video composition phase)
    if (!provider) {
      log.info('No video provider — clips will use Ken Burns on images');
      onProgress(50, 'Using image-to-video (Ken Burns) — no video provider configured');

      const clips: VideoClipPackage[] = prompts.prompts.map((p, i) => {
        const matchedImage = images.find((img) => img.sceneId === p.sceneId);
        return {
          clipId: generateId(ID_PREFIXES.asset),
          sceneId: p.sceneId,
          videoUrl: matchedImage?.imageUrl ?? '',
          storagePath: '',
          duration: clipDuration,
          provider: 'ken_burns',
          model: 'image_pan_zoom',
          resolution: { width: matchedImage?.width ?? 1080, height: matchedImage?.height ?? 1920 },
          fps: 30,
          generationTimeMs: 0,
          costUsd: 0,
          metadata: { sourceImage: matchedImage?.imageUrl, method: 'ken_burns', videoPrompt: p.videoPrompt },
        };
      });

      onProgress(100, 'Video clips prepared (Ken Burns)');
      return clips;
    }

    // Real video generation via provider
    const clips: VideoClipPackage[] = [];
    let completed = 0;

    for (const prompt of prompts.prompts) {
      if (cancellation.isCancelled) break;

      try {
        const matchedImage = images.find((img) => img.sceneId === prompt.sceneId);
        const startTime = performance.now();

        const response = await provider.generate({
          prompt: prompt.videoPrompt || prompt.imagePrompt,
          imageUrl: matchedImage?.imageUrl,
          duration: clipDuration,
          aspectRatio: '9:16',
        });

        if (response.success && response.url) {
          CostTracker.getInstance().trackVideoGeneration({
            userId: 'system', projectId: null, pipelineId: null,
            agentId: this.agentId, providerId: provider.providerId,
            model: response.model, durationSeconds: clipDuration,
          });

          clips.push({
            clipId: generateId(ID_PREFIXES.asset),
            sceneId: prompt.sceneId,
            videoUrl: response.url,
            storagePath: '',
            duration: clipDuration,
            provider: provider.providerId,
            model: response.model,
            resolution: { width: 1080, height: 1920 },
            fps: 30,
            generationTimeMs: Math.round(performance.now() - startTime),
            costUsd: response.costUsd,
            metadata: response.metadata,
          });
        }
      } catch (err) {
        log.error('Video clip generation failed', { sceneId: prompt.sceneId }, err as Error);
      }

      completed++;
      onProgress(Math.round((completed / totalClips) * 100), `Generated ${clips.length}/${totalClips} clips`);
    }

    log.info('Video generation complete', { succeeded: clips.length, total: totalClips });
    return clips;
  }
}
