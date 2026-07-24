// ============================================================
// CreatorAI Studio — Research Intelligence Agent
// ============================================================
// IAutomationAgent implementation. Sits at the very start of
// the pipeline: User Idea → ResearchAgent → ContentPlanner.
// ============================================================

import { Logger } from '@creatorai/agents';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationStage } from '../types/automation.types';
import type { ResearchPackage } from './research.types';
import { ResearchPlanner } from './research-planner';
import { ResearchValidator } from './research-validator';
import { ResearchMemory } from './research-memory';

const log = Logger.for('ResearchIntelligenceAgent');

/** Input for the research agent. */
export interface ResearchIntelligenceInput {
  request: Record<string, unknown>;
  topic: string;
}

/**
 * Research Intelligence Agent.
 * Performs comprehensive market research, trend analysis,
 * keyword engineering, competitor mapping, audience profiling,
 * topic discovery, and content gap analysis.
 *
 * @implements IAutomationAgent<ResearchIntelligenceInput, ResearchPackage>
 */
export class ResearchIntelligenceAgent implements IAutomationAgent<ResearchIntelligenceInput, ResearchPackage> {
  readonly agentId = 'automation.research_intelligence';
  readonly agentName = 'Research Intelligence Engine';
  readonly stage = 'research' as AutomationStage;

  validate(input: ResearchIntelligenceInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.topic || input.topic.trim().length < 3) errors.push('Topic is required (min 3 characters)');
    return { valid: errors.length === 0, errors };
  }

  estimateCost(): { costUsd: number; breakdown: string[] } {
    return { costUsd: 0, breakdown: ['Research intelligence is local computation — $0.00'] };
  }

  async healthCheck(): Promise<{ healthy: boolean; details: string }> {
    return { healthy: true, details: 'ResearchPlanner is local — always available' };
  }

  async execute(
    input: ResearchIntelligenceInput,
    onProgress: ProgressCallback,
    cancellation: CancellationToken,
  ): Promise<ResearchPackage> {
    const { topic } = input;

    log.info('Research intelligence starting', { topic: topic.slice(0, 60) });
    onProgress(5, 'Classifying content category');

    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(15, 'Analyzing trends across platforms');
    onProgress(30, 'Generating keyword strategy');
    onProgress(45, 'Analyzing competitors');
    onProgress(60, 'Profiling target audience');

    const pkg = ResearchPlanner.research(topic);

    if (cancellation.isCancelled) throw new Error('Cancelled');

    onProgress(75, 'Discovering related topics');
    onProgress(85, 'Identifying content gaps');

    onProgress(90, 'Validating research quality');
    const validation = ResearchValidator.validate(pkg);
    if (!validation.valid) {
      log.warn('Research validation warnings', { errors: validation.errors, score: validation.score });
    }

    onProgress(95, 'Recording in research memory');
    ResearchMemory.getInstance().record({
      topic: pkg.topic,
      category: pkg.category,
      packageId: pkg.id,
      confidenceScore: pkg.confidenceScore,
      qualityScore: pkg.qualityMetrics.overallQuality,
    });

    onProgress(100, `Research complete — ${pkg.category}, confidence ${pkg.confidenceScore}/100, quality ${pkg.qualityMetrics.overallQuality}/100`);

    log.info('Research intelligence complete', {
      id: pkg.id,
      topic: topic.slice(0, 40),
      category: pkg.category,
      keywords: pkg.keywords.primary.length + pkg.keywords.secondary.length,
      competitors: pkg.competitors.competitors.length,
      trendScore: pkg.trends.overallTrendScore,
      confidence: pkg.confidenceScore,
      quality: pkg.qualityMetrics.overallQuality,
    });

    return pkg;
  }
}
