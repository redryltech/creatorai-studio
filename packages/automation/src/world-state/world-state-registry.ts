// ============================================================
// CreatorAI Studio — World State Registry
// ============================================================

import { Logger } from '@creatorai/agents';

const log = Logger.for('WorldStateRegistry');

export interface IWorldStateStrategy {
  readonly strategyId: string;
  canHandle(category: string): boolean;
}

export class WorldStateRegistry {
  private static instance: WorldStateRegistry | null = null;
  private strategies: Map<string, IWorldStateStrategy> = new Map();

  private constructor() {}
  static getInstance(): WorldStateRegistry {
    if (!WorldStateRegistry.instance) WorldStateRegistry.instance = new WorldStateRegistry();
    return WorldStateRegistry.instance;
  }
  static resetInstance(): void { WorldStateRegistry.instance = null; }

  register(strategy: IWorldStateStrategy): void {
    this.strategies.set(strategy.strategyId, strategy);
    log.info('World state strategy registered', { id: strategy.strategyId });
  }

  get size(): number { return this.strategies.size; }
}
