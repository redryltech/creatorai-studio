import { Logger } from '@creatorai/agents';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { DirectorPlan } from '../director/director.types';
import type { Storyboard } from '../storyboard/storyboard.types';
import type { CharacterDatabase } from '../character/character.types';
import type { SceneGraphPackage } from '../scene-graph/scene-graph.types';
import type { WorldStatePackage } from '../world-state/world-state.types';
import type { AssetMemoryPackage } from '../asset-memory/asset.types';
import type { CompiledPromptPackage, PromptLength } from './prompt.types';
import { PromptCompilerCore } from './prompt-compiler';
import { PromptValidator } from './prompt-validator';
import { PromptMemory } from './prompt-memory';

const log = Logger.for('PromptCompilerAgent');

export interface PromptCompilerInput {
  request: Record<string, unknown>;
  directorPlan: DirectorPlan;
  storyboard: Storyboard;
  characterDatabase: CharacterDatabase;
  sceneGraphPackage: SceneGraphPackage;
  worldStatePackage: WorldStatePackage;
  assetMemoryPackage: AssetMemoryPackage;
  promptLength?: PromptLength;
}

export class PromptCompilerAgent implements IAutomationAgent<PromptCompilerInput, CompiledPromptPackage> {
  readonly agentId = 'automation.prompt_compiler';
  readonly agentName = 'AI Prompt Compiler';
  readonly stage = 'prompt_compilation' as AutomationStage;

  validate(input: PromptCompilerInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.directorPlan) errors.push('DirectorPlan required');
    if (!input.storyboard) errors.push('Storyboard required');
    if (!input.characterDatabase) errors.push('CharacterDatabase required');
    return { valid: errors.length === 0, errors };
  }

  estimateCost() { return { costUsd: 0, breakdown: ['Prompt compilation is local — $0.00'] }; }
  async healthCheck() { return { healthy: true, details: 'PromptCompiler is local' }; }

  async execute(input: PromptCompilerInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<CompiledPromptPackage> {
    log.info('Prompt compiler starting');
    onProgress(10, 'Assembling prompt blocks from all planning stages');
    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(30, 'Building canonical prompts');
    onProgress(50, 'Compiling for 12 AI providers');
    const pkg = PromptCompilerCore.compile(
      input.directorPlan, input.storyboard, input.characterDatabase,
      input.sceneGraphPackage, input.worldStatePackage, input.assetMemoryPackage,
      input.promptLength ?? 'detailed',
    );

    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(80, 'Validating prompt quality');
    const validation = PromptValidator.validate(pkg);
    if (!validation.valid) log.warn('Prompt validation issues', { errors: validation.errors });

    onProgress(95, 'Recording in memory');
    PromptMemory.getInstance().record({ productionTitle: input.storyboard.title, packageId: pkg.id, avgScore: pkg.metadata.avgQualityScore, totalTokens: pkg.metadata.avgTokenCount * pkg.metadata.totalScenes });

    onProgress(100, `Prompt compilation complete — ${pkg.metadata.totalScenes} scenes × ${pkg.metadata.totalProviders} providers, avg score ${pkg.metadata.avgQualityScore}/100`);
    log.info('Prompt compilation complete', { id: pkg.id, scenes: pkg.metadata.totalScenes, avgScore: pkg.metadata.avgQualityScore });
    return pkg;
  }
}
