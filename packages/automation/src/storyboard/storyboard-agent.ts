// ============================================================
// CreatorAI Studio — Storyboard Agent
// ============================================================
// IAutomationAgent that wraps StoryboardPlanner.
// Pipeline: Director → StoryboardAgent → PromptOptimizer
// ============================================================

import { Logger } from '@creatorai/agents';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { DirectorPlan } from '../director/director.types';
import type { Storyboard } from './storyboard.types';
import { StoryboardPlanner } from './storyboard-planner';
import { StoryboardValidator } from './storyboard-validator';
import { StoryboardMemory } from './storyboard-memory';

const log = Logger.for('StoryboardAgent');

export interface StoryboardInput {
  request: Record<string, unknown>;
  directorPlan: DirectorPlan;
}

export class StoryboardAgent implements IAutomationAgent<StoryboardInput, Storyboard> {
  readonly agentId = 'automation.storyboard';
  readonly agentName = 'Storyboard Engine';
  readonly stage = 'storyboarding' as AutomationStage;

  validate(input: StoryboardInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.directorPlan) errors.push('DirectorPlan is required');
    if (!input.directorPlan?.scenes?.length) errors.push('DirectorPlan must have scenes');
    return { valid: errors.length === 0, errors };
  }

  estimateCost(): { costUsd: number; breakdown: string[] } {
    return { costUsd: 0, breakdown: ['Storyboard planning is local — $0.00'] };
  }

  async healthCheck(): Promise<{ healthy: boolean; details: string }> {
    return { healthy: true, details: 'StoryboardPlanner is local — always available' };
  }

  async execute(
    input: StoryboardInput,
    onProgress: ProgressCallback,
    cancellation: CancellationToken,
  ): Promise<Storyboard> {
    const { directorPlan } = input;

    log.info('Storyboard generation starting', {
      planId: directorPlan.id,
      scenes: directorPlan.scenes.length,
    });

    onProgress(10, 'Analyzing director plan for storyboard generation');

    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(30, 'Building visual composition for each frame');
    const storyboard = StoryboardPlanner.plan(directorPlan);

    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(70, 'Generating optimized prompts for all providers');

    onProgress(85, 'Validating storyboard consistency');
    const validation = StoryboardValidator.validate(storyboard);

    if (!validation.valid) {
      log.warn('Storyboard validation warnings', { errors: validation.errors, warnings: validation.warnings });
    }

    onProgress(95, 'Recording storyboard in memory');
    StoryboardMemory.getInstance().record({
      title: directorPlan.title,
      storyboardId: storyboard.id,
      frameCount: storyboard.frames.length,
      category: directorPlan.globalStyle,
      style: storyboard.globalStyle.renderingStyle,
    });

    onProgress(100, 'Storyboard complete');

    log.info('Storyboard generated', {
      id: storyboard.id,
      frames: storyboard.frames.length,
      totalDuration: storyboard.metadata.totalDuration,
      validationScore: validation.score,
      processingTimeMs: storyboard.metadata.processingTimeMs,
    });

    return storyboard;
  }
}
