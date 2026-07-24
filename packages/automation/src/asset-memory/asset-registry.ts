import { Logger } from '@creatorai/agents';
const log = Logger.for('AssetRegistry');

export interface IAssetStrategy { readonly strategyId: string; canHandle(category: string): boolean; }

export class AssetRegistry {
  private static instance: AssetRegistry | null = null;
  private strategies: Map<string, IAssetStrategy> = new Map();
  private constructor() {}
  static getInstance(): AssetRegistry { if (!AssetRegistry.instance) AssetRegistry.instance = new AssetRegistry(); return AssetRegistry.instance; }
  static resetInstance(): void { AssetRegistry.instance = null; }
  register(s: IAssetStrategy): void { this.strategies.set(s.strategyId, s); log.info('Asset strategy registered', { id: s.strategyId }); }
  get size(): number { return this.strategies.size; }
}
