// ============================================================
// CreatorAI Studio — Character Registry
// ============================================================

import { Logger } from '@creatorai/agents';

const log = Logger.for('CharacterRegistry');

export interface ICharacterStrategy {
  readonly strategyId: string;
  readonly strategyName: string;
  canHandle(category: string): boolean;
}

export class CharacterRegistry {
  private static instance: CharacterRegistry | null = null;
  private strategies: Map<string, ICharacterStrategy> = new Map();

  private constructor() {}
  static getInstance(): CharacterRegistry {
    if (!CharacterRegistry.instance) CharacterRegistry.instance = new CharacterRegistry();
    return CharacterRegistry.instance;
  }
  static resetInstance(): void { CharacterRegistry.instance = null; }

  register(strategy: ICharacterStrategy): void {
    this.strategies.set(strategy.strategyId, strategy);
    log.info('Character strategy registered', { id: strategy.strategyId });
  }

  getStrategy(category: string): ICharacterStrategy | null {
    for (const s of this.strategies.values()) if (s.canHandle(category)) return s;
    return null;
  }

  get size(): number { return this.strategies.size; }
}
