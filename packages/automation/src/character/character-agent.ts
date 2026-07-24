// ============================================================
// CreatorAI Studio — Character Agent
// ============================================================
// Pipeline: Storyboard → CharacterAgent → PromptOptimizer
// ============================================================

import { Logger } from '@creatorai/agents';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { Storyboard } from '../storyboard/storyboard.types';
import type { DirectorPlan } from '../director/director.types';
import type { CharacterDatabase } from './character.types';
import { CharacterPlanner } from './character-planner';
import { CharacterValidator } from './character-validator';
import { CharacterMemory } from './character-memory';

const log = Logger.for('CharacterAgent');

export interface CharacterInput {
  request: Record<string, unknown>;
  storyboard: Storyboard;
  directorPlan?: DirectorPlan;
  baseSeed?: number;
}

export class CharacterAgent implements IAutomationAgent<CharacterInput, CharacterDatabase> {
  readonly agentId = 'automation.character';
  readonly agentName = 'Character Consistency Engine';
  readonly stage = 'character_planning' as AutomationStage;

  validate(input: CharacterInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.storyboard) errors.push('Storyboard is required');
    if (!input.storyboard?.frames?.length) errors.push('Storyboard must have frames');
    return { valid: errors.length === 0, errors };
  }

  estimateCost(): { costUsd: number; breakdown: string[] } {
    return { costUsd: 0, breakdown: ['Character planning is local — $0.00'] };
  }

  async healthCheck(): Promise<{ healthy: boolean; details: string }> {
    return { healthy: true, details: 'CharacterPlanner is local — always available' };
  }

  async execute(
    input: CharacterInput,
    onProgress: ProgressCallback,
    cancellation: CancellationToken,
  ): Promise<CharacterDatabase> {
    const { storyboard, directorPlan, baseSeed } = input;

    log.info('Character consistency engine starting', { frames: storyboard.frames.length });

    onProgress(10, 'Scanning storyboard for entities');

    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(30, 'Building entity profiles and identity blocks');
    const database = CharacterPlanner.plan(storyboard, directorPlan, baseSeed);

    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(60, 'Analyzing continuity across scenes');
    const continuity = CharacterPlanner.analyzeContinuity(storyboard, database, baseSeed);

    onProgress(80, 'Validating character database');
    const validation = CharacterValidator.validate(database);

    if (!validation.valid) {
      log.warn('Character validation issues', { errors: validation.errors });
    }

    onProgress(90, 'Recording in character memory');
    CharacterMemory.getInstance().record({
      productionTitle: storyboard.title,
      databaseId: database.id,
      entityCount: database.entities.length,
      continuityScore: continuity.overallScore,
    });

    onProgress(100, `Character engine complete — ${database.entities.length} entities, continuity ${continuity.overallScore}/100`);

    log.info('Character database complete', {
      id: database.id,
      entities: database.entities.length,
      continuityScore: continuity.overallScore,
      continuityIssues: continuity.issues.length,
      validationScore: validation.score,
    });

    return database;
  }
}
