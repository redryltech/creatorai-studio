// ============================================================
// CreatorAI Studio — Scene Graph Registry
// ============================================================

import { Logger } from '@creatorai/agents';

const log = Logger.for('SceneGraphRegistry');

export interface ISceneGraphStrategy {
  readonly strategyId: string;
  readonly strategyName: string;
  canHandle(category: string): boolean;
}

export class SceneGraphRegistry {
  private static instance: SceneGraphRegistry | null = null;
  private strategies: Map<string, ISceneGraphStrategy> = new Map();

  private constructor() {}
  static getInstance(): SceneGraphRegistry {
    if (!SceneGraphRegistry.instance) SceneGraphRegistry.instance = new SceneGraphRegistry();
    return SceneGraphRegistry.instance;
  }
  static resetInstance(): void { SceneGraphRegistry.instance = null; }

  register(strategy: ISceneGraphStrategy): void {
    this.strategies.set(strategy.strategyId, strategy);
    log.info('Scene graph strategy registered', { id: strategy.strategyId });
  }

  get size(): number { return this.strategies.size; }
}
