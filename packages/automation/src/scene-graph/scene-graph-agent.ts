// ============================================================
// CreatorAI Studio — Scene Graph Agent
// ============================================================
// Pipeline: Character → SceneGraphAgent → PromptOptimizer
// ============================================================

import { Logger } from '@creatorai/agents';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { Storyboard } from '../storyboard/storyboard.types';
import type { CharacterDatabase } from '../character/character.types';
import type { DirectorPlan } from '../director/director.types';
import type { SceneGraphPackage } from './scene-graph.types';
import { SceneGraphPlanner } from './scene-graph-planner';
import { SceneGraphValidator } from './scene-graph-validator';
import { SceneGraphMemory } from './scene-graph-memory';

const log = Logger.for('SceneGraphAgent');

export interface SceneGraphInput {
  request: Record<string, unknown>;
  storyboard: Storyboard;
  characterDatabase: CharacterDatabase;
  directorPlan?: DirectorPlan;
}

export class SceneGraphAgent implements IAutomationAgent<SceneGraphInput, SceneGraphPackage> {
  readonly agentId = 'automation.scene_graph';
  readonly agentName = 'Scene Graph Engine';
  readonly stage = 'scene_graph' as AutomationStage;

  validate(input: SceneGraphInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.storyboard) errors.push('Storyboard required');
    if (!input.characterDatabase) errors.push('CharacterDatabase required');
    if (!input.storyboard?.frames?.length) errors.push('Storyboard must have frames');
    return { valid: errors.length === 0, errors };
  }

  estimateCost(): { costUsd: number; breakdown: string[] } {
    return { costUsd: 0, breakdown: ['Scene graph is local computation — $0.00'] };
  }

  async healthCheck(): Promise<{ healthy: boolean; details: string }> {
    return { healthy: true, details: 'SceneGraphPlanner is local — always available' };
  }

  async execute(
    input: SceneGraphInput,
    onProgress: ProgressCallback,
    cancellation: CancellationToken,
  ): Promise<SceneGraphPackage> {
    const { storyboard, characterDatabase, directorPlan } = input;

    log.info('Scene graph building', { frames: storyboard.frames.length, entities: characterDatabase.entities.length });
    onProgress(10, 'Building scene graphs from storyboard');

    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(40, 'Constructing 3D node hierarchies and relationships');
    const pkg = SceneGraphPlanner.plan(storyboard, characterDatabase, directorPlan);

    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(75, 'Validating scene graph integrity');
    const validation = SceneGraphValidator.validate(pkg);

    if (!validation.valid) {
      log.warn('Scene graph validation issues', { errors: validation.errors });
    }

    onProgress(90, 'Recording in memory');
    SceneGraphMemory.getInstance().record({
      productionTitle: storyboard.title,
      packageId: pkg.id,
      sceneCount: pkg.scenes.length,
      avgComplexity: pkg.metadata.avgComplexity,
    });

    onProgress(100, `Scene graph complete — ${pkg.metadata.totalNodes} nodes, ${pkg.metadata.totalRelationships} relationships`);

    log.info('Scene graph package complete', {
      id: pkg.id, scenes: pkg.scenes.length,
      totalNodes: pkg.metadata.totalNodes, totalRelationships: pkg.metadata.totalRelationships,
      avgComplexity: pkg.metadata.avgComplexity, validationScore: validation.score,
    });

    return pkg;
  }
}
