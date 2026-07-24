import type { BrandKit } from './asset.types';

export class BrandKitManager {
  private kits: Map<string, BrandKit> = new Map();

  save(kit: BrandKit): void { this.kits.set(kit.id, kit); }
  get(id: string): BrandKit | undefined { return this.kits.get(id); }
  getByName(name: string): BrandKit | undefined { return [...this.kits.values()].find(k => k.brandName.toLowerCase().includes(name.toLowerCase())); }
  list(): BrandKit[] { return [...this.kits.values()]; }
  update(id: string, updates: Partial<BrandKit>): boolean { const k = this.kits.get(id); if (!k) return false; Object.assign(k, updates, { modifiedAt: new Date().toISOString() }); return true; }
  delete(id: string): boolean { return this.kits.delete(id); }
  get size(): number { return this.kits.size; }
}
