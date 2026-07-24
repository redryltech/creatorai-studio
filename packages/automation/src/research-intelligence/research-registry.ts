// ============================================================
// CreatorAI Studio — Research Registry
// ============================================================

import { Logger } from '@creatorai/agents';

const log = Logger.for('ResearchRegistry');

/** Strategy interface for pluggable research analyzers. */
export interface IResearchStrategy {
  readonly strategyId: string;
  readonly strategyName: string;
  canHandle(category: string): boolean;
}

/**
 * Registry for research strategies.
 * Supports plugging in specialized analyzers for specific categories.
 */
export class ResearchRegistry {
  private static instance: ResearchRegistry | null = null;
  private strategies: Map<string, IResearchStrategy> = new Map();

  private constructor() {}
  static getInstance(): ResearchRegistry {
    if (!ResearchRegistry.instance) ResearchRegistry.instance = new ResearchRegistry();
    return ResearchRegistry.instance;
  }
  static resetInstance(): void { ResearchRegistry.instance = null; }

  register(strategy: IResearchStrategy): void {
    this.strategies.set(strategy.strategyId, strategy);
    log.info('Research strategy registered', { id: strategy.strategyId, name: strategy.strategyName });
  }

  getStrategy(category: string): IResearchStrategy | null {
    for (const s of this.strategies.values()) if (s.canHandle(category)) return s;
    return null;
  }

  listStrategies(): Array<{ id: string; name: string }> {
    return [...this.strategies.values()].map((s) => ({ id: s.strategyId, name: s.strategyName }));
  }

  get size(): number { return this.strategies.size; }
}
