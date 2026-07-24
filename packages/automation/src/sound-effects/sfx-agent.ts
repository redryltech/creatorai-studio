import { Logger } from '@creatorai/agents';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { SfxPackage } from './sfx.types';
import { SfxPlanner } from './sfx-planner';
import { SfxMemory } from './sfx-memory';

const log = Logger.for('SfxAgent');

export interface SfxInput {
  request: Record<string, unknown>;
  scenes: Array<{ id: string; order: number; narration: string; visualNotes: string }>;
  outputDir: string;
}

export class SfxAgent implements IAutomationAgent<SfxInput, SfxPackage> {
  readonly agentId = 'automation.sound_effects';
  readonly agentName = 'AI Sound Effects Engine';
  readonly stage = 'sound_effects' as AutomationStage;

  validate(input: SfxInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.scenes?.length) errors.push('Scenes required');
    return { valid: errors.length === 0, errors };
  }
  estimateCost() { return { costUsd: 0, breakdown: ['SFX uses FFmpeg synthesis (free)'] }; }
  async healthCheck() { return { healthy: true, details: 'FFmpeg-powered SFX generation' }; }

  async execute(input: SfxInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<SfxPackage> {
    log.info('SFX generation starting');
    onProgress(10, 'Analyzing scenes for sound effects');
    if (cancellation.isCancelled) throw new Error('Cancelled');
    onProgress(40, 'Generating sound effects');
    const pkg = SfxPlanner.generate(input.scenes, input.outputDir);
    onProgress(90, 'Recording SFX');
    SfxMemory.getInstance().record({ productionTitle: '', packageId: pkg.id, effectCount: pkg.metadata.totalEffects });
    onProgress(100, `${pkg.metadata.totalEffects} sound effects generated`);
    return pkg;
  }
}
