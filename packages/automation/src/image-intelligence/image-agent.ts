import { Logger } from '@creatorai/agents';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { Storyboard } from '../storyboard/storyboard.types';
import type { CharacterDatabase } from '../character/character.types';
import type { SceneGraphPackage } from '../scene-graph/scene-graph.types';
import type { WorldStatePackage } from '../world-state/world-state.types';
import type { AssetMemoryPackage } from '../asset-memory/asset.types';
import type { DirectorPlan } from '../director/director.types';
import type { ImagePlanningPackage } from './image.types';
import { ImagePlanner } from './image-planner';
import { ImageValidator } from './image-validator';
import { ImageMemory } from './image-memory';

const log = Logger.for('ImageIntelligenceAgent');

export interface ImageIntelligenceInput {
  request: Record<string, unknown>;
  storyboard: Storyboard;
  characterDatabase: CharacterDatabase;
  directorPlan?: DirectorPlan;
  sceneGraphPackage?: SceneGraphPackage;
  worldStatePackage?: WorldStatePackage;
  assetMemoryPackage?: AssetMemoryPackage;
}

export class ImageIntelligenceAgent implements IAutomationAgent<ImageIntelligenceInput, ImagePlanningPackage> {
  readonly agentId = 'automation.image_intelligence';
  readonly agentName = 'Image Intelligence Engine';
  readonly stage = 'image_planning' as AutomationStage;

  validate(input: ImageIntelligenceInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.storyboard) errors.push('Storyboard required');
    if (!input.characterDatabase) errors.push('CharacterDatabase required');
    return { valid: errors.length === 0, errors };
  }
  estimateCost() { return { costUsd: 0, breakdown: ['Image planning is local — $0.00'] }; }
  async healthCheck() { return { healthy: true, details: 'ImagePlanner is local' }; }

  async execute(input: ImageIntelligenceInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<ImagePlanningPackage> {
    log.info('Image intelligence starting');
    onProgress(10, 'Analyzing composition and camera for each frame');
    if (cancellation.isCancelled) throw new Error('Cancelled');
    onProgress(30, 'Computing lighting and color grading');
    onProgress(50, 'Locking character and vehicle identities');
    onProgress(70, 'Building master prompts with quality scoring');
    const pkg = ImagePlanner.plan(input.storyboard, input.characterDatabase, input.directorPlan, input.sceneGraphPackage, input.worldStatePackage, input.assetMemoryPackage);
    if (cancellation.isCancelled) throw new Error('Cancelled');
    onProgress(85, 'Validating image plans');
    const v = ImageValidator.validate(pkg);
    if (!v.valid) log.warn('Image validation issues', { errors: v.errors });
    onProgress(95, 'Recording in memory');
    ImageMemory.getInstance().record({ productionTitle: input.storyboard.title, packageId: pkg.id, avgQuality: pkg.metadata.avgQuality, avgConfidence: pkg.metadata.avgConfidence });
    onProgress(100, `Image intelligence complete — ${pkg.metadata.totalScenes} scenes, avg quality ${pkg.metadata.avgQuality}/100`);
    return pkg;
  }
}
