import { generateId, ID_PREFIXES } from '@creatorai/shared';
import type { AssetMemoryEntry, AssetRecord } from './asset.types';

export class AssetMemoryStore {
  private static instance: AssetMemoryStore | null = null;
  private entries: AssetMemoryEntry[] = [];
  private globalAssetLibrary: AssetRecord[] = [];

  private constructor() {}
  static getInstance(): AssetMemoryStore { if (!AssetMemoryStore.instance) AssetMemoryStore.instance = new AssetMemoryStore(); return AssetMemoryStore.instance; }
  static resetInstance(): void { AssetMemoryStore.instance = null; }

  record(input: { productionTitle: string; packageId: string; assetCount: number; hasBrandKit: boolean }): void {
    this.entries.push({ id: generateId(ID_PREFIXES.asset), ...input, createdAt: new Date().toISOString() });
    if (this.entries.length > 500) this.entries = this.entries.slice(-500);
  }

  addToGlobalLibrary(assets: AssetRecord[]): void {
    for (const asset of assets) {
      const existing = this.globalAssetLibrary.find(a => a.uuid === asset.uuid);
      if (!existing) this.globalAssetLibrary.push(asset);
      else { existing.usageCount++; existing.modifiedAt = new Date().toISOString(); }
    }
  }

  searchGlobal(query: string): AssetRecord[] {
    const q = query.toLowerCase();
    return this.globalAssetLibrary.filter(a => a.name.toLowerCase().includes(q) || a.tags.some(t => t.includes(q)) || a.category.includes(q));
  }

  getAll(): AssetMemoryEntry[] { return [...this.entries]; }
  getGlobalLibrary(): AssetRecord[] { return [...this.globalAssetLibrary]; }
  get size(): number { return this.entries.length; }
}
