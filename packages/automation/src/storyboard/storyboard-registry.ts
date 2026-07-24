// ============================================================
// CreatorAI Studio — Storyboard Registry
// ============================================================

import { Logger } from '@creatorai/agents';
import type { Storyboard } from './storyboard.types';
import type { DirectorPlan } from '../director/director.types';

const log = Logger.for('StoryboardRegistry');

export interface IStoryboardStrategy {
  readonly strategyId: string;
  readonly strategyName: string;
  plan(directorPlan: DirectorPlan): Storyboard;
  canHandle(style: string): boolean;
}

export class StoryboardRegistry {
  private static instance: StoryboardRegistry | null = null;
  private strategies: Map<string, IStoryboardStrategy> = new Map();

  private constructor() {}

  static getInstance(): StoryboardRegistry {
    if (!StoryboardRegistry.instance) StoryboardRegistry.instance = new StoryboardRegistry();
    return StoryboardRegistry.instance;
  }

  static resetInstance(): void { StoryboardRegistry.instance = null; }

  register(strategy: IStoryboardStrategy): void {
    this.strategies.set(strategy.strategyId, strategy);
    log.info('Storyboard strategy registered', { id: strategy.strategyId });
  }

  getStrategy(style: string): IStoryboardStrategy | null {
    for (const s of this.strategies.values()) if (s.canHandle(style)) return s;
    return this.strategies.get('default') ?? null;
  }

  get size(): number { return this.strategies.size; }
}
