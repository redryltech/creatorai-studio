// ============================================================
// CreatorAI Studio — Director Agent
// ============================================================
// IAutomationAgent implementation that wraps DirectorPlanner.
// Sits in the pipeline between ScriptPlanner and PromptOptimizer.
//
// Pipeline: Script → DirectorAgent → PromptOptimizer → ImageGen
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { ScriptPackage, AutomationStage } from '../types/automation.types';
import type { DirectorPlan } from './director.types';
import { DirectorPlanner } from './director-planner';
import { DirectorValidator } from './director-validator';
import { DirectorMemoryStore } from './director-memory';

const log = Logger.for('DirectorAgent');

export interface DirectorInput {
  request: Record<string, unknown>;
  scriptPackage: ScriptPackage;
  title?: string;
  overrides?: Partial<{
    colorGrading: string;
    pacing: string;
    category: string;
  }>;
}

export class DirectorAgent implements IAutomationAgent<DirectorInput, DirectorPlan> {
  readonly agentId = 'automation.director';
  readonly agentName = 'AI Director';
  readonly stage = 'directing' as AutomationStage;

  validate(input: DirectorInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.scriptPackage) errors.push('ScriptPackage is required');
    if (!input.scriptPackage?.scenes?.length) errors.push('Script must have at least one scene');
    return { valid: errors.length === 0, errors };
  }

  estimateCost(_input: DirectorInput): { costUsd: number; breakdown: string[] } {
    return { costUsd: 0, breakdown: ['Director planning is local computation — $0.00'] };
  }

  async healthCheck(): Promise<{ healthy: boolean; details: string }> {
    return { healthy: true, details: 'DirectorPlanner is local — always available' };
  }

  async execute(
    input: DirectorInput,
    onProgress: ProgressCallback,
    cancellation: CancellationToken,
  ): Promise<DirectorPlan> {
    const { scriptPackage, title } = input;

    log.info('Director planning starting', {
      scenes: scriptPackage.scenes.length,
      title: title?.slice(0, 60),
    });

    onProgress(5, 'Analyzing script for cinematic planning');

    if (cancellation.isCancelled) throw new Error('Cancelled');

    // ── Step 1: Generate the plan ──
    onProgress(20, 'Detecting content category and global style');
    const plan = DirectorPlanner.plan(scriptPackage, title);

    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(60, 'Planning camera, lighting, and effects for each scene');

    // ── Step 2: Validate the plan ──
    onProgress(80, 'Validating cinematic plan');
    const validation = DirectorValidator.validate(plan);

    if (!validation.valid) {
      log.warn('Director plan has validation warnings', { errors: validation.errors });
    }

    // ── Step 3: Store in memory for future learning ──
    onProgress(90, 'Recording director decisions');
    DirectorMemoryStore.getInstance().record({
      topic: title ?? scriptPackage.hook.text,
      planId: plan.id,
      decisions: {
        preset: plan.globalStyle,
        colorGrading: plan.globalColorGrading,
        pacing: plan.globalPacing,
        cameraStyles: plan.scenes.map((s) => s.cameraStyle),
        lighting: plan.scenes.map((s) => s.lighting),
      },
    });

    onProgress(100, 'Director plan complete');

    log.info('Director plan generated', {
      id: plan.id,
      category: DirectorPlanner.detectCategory(title ?? '', scriptPackage),
      scenes: plan.scenes.length,
      totalDuration: plan.metadata.totalDuration,
      thumbnailScene: plan.metadata.thumbnailSceneIndex + 1,
      processingTimeMs: plan.metadata.processingTimeMs,
    });

    return plan;
  }
}
