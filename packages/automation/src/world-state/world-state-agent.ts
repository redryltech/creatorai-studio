// ============================================================
// CreatorAI Studio — World State Agent
// ============================================================
// Pipeline: SceneGraph → WorldStateAgent → PromptOptimizer
// ============================================================

import { Logger } from '@creatorai/agents';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { SceneGraphPackage } from '../scene-graph/scene-graph.types';
import type { CharacterDatabase } from '../character/character.types';
import type { DirectorPlan } from '../director/director.types';
import type { Storyboard } from '../storyboard/storyboard.types';
import type { WorldStatePackage } from './world-state.types';
import { WorldStatePlanner } from './world-state-planner';
import { WorldStateValidator } from './world-state-validator';
import { WorldStateMemory } from './world-state-memory';

const log = Logger.for('WorldStateAgent');

export interface WorldStateInput {
  request: Record<string, unknown>;
  sceneGraphPackage: SceneGraphPackage;
  characterDatabase: CharacterDatabase;
  storyboard: Storyboard;
  directorPlan?: DirectorPlan;
}

export class WorldStateAgent implements IAutomationAgent<WorldStateInput, WorldStatePackage> {
  readonly agentId = 'automation.world_state';
  readonly agentName = 'World State Engine';
  readonly stage = 'world_state' as AutomationStage;

  validate(input: WorldStateInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.sceneGraphPackage) errors.push('SceneGraphPackage required');
    if (!input.characterDatabase) errors.push('CharacterDatabase required');
    if (!input.storyboard) errors.push('Storyboard required');
    return { valid: errors.length === 0, errors };
  }

  estimateCost(): { costUsd: number; breakdown: string[] } {
    return { costUsd: 0, breakdown: ['World state is local computation — $0.00'] };
  }

  async healthCheck(): Promise<{ healthy: boolean; details: string }> {
    return { healthy: true, details: 'WorldStatePlanner is local — always available' };
  }

  async execute(
    input: WorldStateInput,
    onProgress: ProgressCallback,
    cancellation: CancellationToken,
  ): Promise<WorldStatePackage> {
    log.info('World state engine starting');
    onProgress(10, 'Building world snapshots');

    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(30, 'Computing state transitions');
    const pkg = WorldStatePlanner.plan(
      input.sceneGraphPackage, input.characterDatabase,
      input.storyboard, input.directorPlan,
    );

    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(60, 'Analyzing continuity');
    onProgress(80, 'Validating world state');
    const validation = WorldStateValidator.validate(pkg);

    onProgress(90, 'Recording in memory');
    WorldStateMemory.getInstance().record({
      productionTitle: input.storyboard.title,
      packageId: pkg.id,
      continuityScore: pkg.metrics.continuityScore,
      overallScore: pkg.metrics.overallProductionScore,
    });

    onProgress(100, `World state complete — continuity ${pkg.metrics.continuityScore}/100, overall ${pkg.metrics.overallProductionScore}/100`);

    log.info('World state complete', {
      id: pkg.id, snapshots: pkg.snapshots.length,
      issues: pkg.issues.length, continuity: pkg.metrics.continuityScore,
      overall: pkg.metrics.overallProductionScore, validation: validation.score,
    });

    return pkg;
  }
}
