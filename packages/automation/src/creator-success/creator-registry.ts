import { Logger } from '@creatorai/agents';
const log = Logger.for('CreatorRegistry');
export interface ICreatorStrategy { readonly strategyId: string; readonly strategyName: string; canHandle(platform: string): boolean; }
export class CreatorRegistry {
  private static instance: CreatorRegistry | null = null;
  private strategies: Map<string, ICreatorStrategy> = new Map();
  private constructor() {}
  static getInstance(): CreatorRegistry { if (!CreatorRegistry.instance) CreatorRegistry.instance = new CreatorRegistry(); return CreatorRegistry.instance; }
  static resetInstance(): void { CreatorRegistry.instance = null; }
  register(s: ICreatorStrategy): void { this.strategies.set(s.strategyId, s); log.info('Creator strategy registered', { id: s.strategyId }); }
  getStrategy(platform: string): ICreatorStrategy | null { for (const s of this.strategies.values()) if (s.canHandle(platform)) return s; return null; }
  get size(): number { return this.strategies.size; }
}
