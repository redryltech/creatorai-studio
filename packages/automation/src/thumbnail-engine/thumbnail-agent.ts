import { Logger } from '@creatorai/agents';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { ThumbnailPackage } from './thumbnail.types';
import { ThumbnailPlanner } from './thumbnail-planner';
import { ThumbnailMemory } from './thumbnail-memory';

const log = Logger.for('ThumbnailAgent');

export interface ThumbnailInput {
  request: Record<string, unknown>;
  topic: string;
  videoPath: string | null;
  bestFrameTimeSec: number;
  colorPalette: string[];
  category: string;
  outputDir?: string;
}

export class ThumbnailAgent implements IAutomationAgent<ThumbnailInput, ThumbnailPackage> {
  readonly agentId = 'automation.thumbnail';
  readonly agentName = 'AI Thumbnail Generator';
  readonly stage = 'thumbnail' as AutomationStage;

  validate(input: ThumbnailInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.topic) errors.push('Topic required');
    return { valid: errors.length === 0, errors };
  }
  estimateCost() { return { costUsd: 0, breakdown: ['Thumbnail uses Pollinations (free) + FFmpeg (free)'] }; }
  async healthCheck() { return { healthy: true, details: 'ThumbnailPlanner uses free providers' }; }

  async execute(input: ThumbnailInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<ThumbnailPackage> {
    log.info('Thumbnail generation starting', { topic: input.topic.slice(0, 40) });
    onProgress(10, 'Analyzing video for best frame');
    if (cancellation.isCancelled) throw new Error('Cancelled');
    onProgress(30, 'Generating AI thumbnail images');
    onProgress(60, 'Adding text overlays');
    const pkg = await ThumbnailPlanner.plan(input.topic, input.videoPath, input.bestFrameTimeSec, input.colorPalette, input.category, input.outputDir);
    if (cancellation.isCancelled) throw new Error('Cancelled');
    onProgress(90, 'Scoring thumbnails for CTR');
    ThumbnailMemory.getInstance().record({ productionTitle: input.topic, packageId: pkg.id, bestCtr: pkg.metadata.bestCtrPrediction });
    onProgress(100, `${pkg.thumbnails.length} thumbnails generated, best CTR: ${pkg.metadata.bestCtrPrediction}/100`);
    return pkg;
  }
}
