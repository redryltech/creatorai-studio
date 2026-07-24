// ============================================================
// CreatorAI Studio — Director Registry
// ============================================================
// Manages Director planning strategies. Currently only the
// default DirectorPlanner is registered, but the architecture
// supports future specialized directors (automotive, music video,
// documentary, etc.) without changing the pipeline.
// ============================================================

import { Logger } from '@creatorai/agents';
import type { DirectorPlan } from './director.types';
import type { ScriptPackage } from '../types/automation.types';

const log = Logger.for('DirectorRegistry');

export interface IDirectorStrategy {
  readonly strategyId: string;
  readonly strategyName: string;
  readonly supportedCategories: string[];

  plan(script: ScriptPackage, title?: string): DirectorPlan;
  canHandle(category: string): boolean;
}

export class DirectorRegistry {
  private static instance: DirectorRegistry | null = null;
  private strategies: Map<string, IDirectorStrategy> = new Map();

  private constructor() {}

  static getInstance(): DirectorRegistry {
    if (!DirectorRegistry.instance) {
      DirectorRegistry.instance = new DirectorRegistry();
    }
    return DirectorRegistry.instance;
  }

  static resetInstance(): void { DirectorRegistry.instance = null; }

  register(strategy: IDirectorStrategy): void {
    this.strategies.set(strategy.strategyId, strategy);
    log.info('Director strategy registered', {
      id: strategy.strategyId,
      name: strategy.strategyName,
      categories: strategy.supportedCategories,
    });
  }

  /**
   * Get the best strategy for a content category.
   */
  getStrategy(category: string): IDirectorStrategy | null {
    // Find a specialized strategy first
    for (const strategy of this.strategies.values()) {
      if (strategy.canHandle(category)) return strategy;
    }
    // Fallback to 'default' strategy
    return this.strategies.get('default') ?? null;
  }

  listStrategies(): Array<{ id: string; name: string; categories: string[] }> {
    return Array.from(this.strategies.values()).map((s) => ({
      id: s.strategyId,
      name: s.strategyName,
      categories: s.supportedCategories,
    }));
  }

  get size(): number { return this.strategies.size; }
}
