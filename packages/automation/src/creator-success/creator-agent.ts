import { Logger } from '@creatorai/agents';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { CreatorSuccessPackage } from './creator.types';
import { CreatorPlanner, type CreatorPlannerInput } from './creator-planner';
import { CreatorValidator } from './creator-validator';
import { CreatorMemory } from './creator-memory';

const log = Logger.for('CreatorSuccessAgent');

export interface CreatorSuccessInput {
  request: Record<string, unknown>;
  plannerInput: CreatorPlannerInput;
}

export class CreatorSuccessAgent implements IAutomationAgent<CreatorSuccessInput, CreatorSuccessPackage> {
  readonly agentId = 'automation.creator_success';
  readonly agentName = 'Creator Success Engine';
  readonly stage = 'creator_success' as AutomationStage;

  validate(input: CreatorSuccessInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.plannerInput?.topic) errors.push('Topic required');
    if (!input.plannerInput?.title) errors.push('Title required');
    return { valid: errors.length === 0, errors };
  }

  estimateCost() { return { costUsd: 0, breakdown: ['Creator success is local — $0.00'] }; }
  async healthCheck() { return { healthy: true, details: 'CreatorPlanner is local' }; }

  async execute(input: CreatorSuccessInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<CreatorSuccessPackage> {
    log.info('Creator success engine starting');
    onProgress(10, 'Analyzing SEO and title');
    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(25, 'Evaluating hook and retention');
    onProgress(40, 'Predicting engagement');
    onProgress(55, 'Generating hashtags and descriptions');
    onProgress(70, 'Checking policies');

    const pkg = CreatorPlanner.plan(input.plannerInput);

    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(85, 'Validating creator package');
    const validation = CreatorValidator.validate(pkg);
    if (!validation.valid) log.warn('Creator validation issues', { errors: validation.errors });

    onProgress(95, 'Recording in memory');
    CreatorMemory.getInstance().record({ productionTitle: pkg.productionTitle, packageId: pkg.id, creatorScore: pkg.creatorScore, seoScore: pkg.seo.seoScore, hookScore: pkg.hook.attentionScore });

    onProgress(100, `Creator score: ${pkg.creatorScore}/100, confidence: ${pkg.confidence}/100`);
    return pkg;
  }
}
