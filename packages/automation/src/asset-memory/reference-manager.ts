import type { AssetReference } from './asset.types';

export class ReferenceManager {
  private refs: AssetReference[] = [];

  add(ref: AssetReference): void { this.refs.push(ref); }
  getBySource(assetId: string): AssetReference[] { return this.refs.filter(r => r.sourceAssetId === assetId); }
  getByTarget(assetId: string): AssetReference[] { return this.refs.filter(r => r.targetAssetId === assetId); }
  getChain(assetId: string, depth = 3): AssetReference[] {
    const result: AssetReference[] = [];
    const queue = [assetId];
    const visited = new Set<string>();
    for (let d = 0; d < depth && queue.length > 0; d++) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      const related = this.refs.filter(r => r.sourceAssetId === id || r.targetAssetId === id);
      result.push(...related);
      for (const r of related) {
        if (r.sourceAssetId !== id) queue.push(r.sourceAssetId);
        if (r.targetAssetId !== id) queue.push(r.targetAssetId);
      }
    }
    return result;
  }
  getAll(): AssetReference[] { return [...this.refs]; }
  get size(): number { return this.refs.length; }
}
