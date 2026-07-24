import type { VersionEntry } from './asset.types';

export class VersionManager {
  private versions: Map<string, VersionEntry[]> = new Map();

  addVersion(assetId: string, version: string, changes: string, data: Record<string, unknown>): void {
    if (!this.versions.has(assetId)) this.versions.set(assetId, []);
    this.versions.get(assetId)!.push({ version, assetId, changes, data, createdAt: new Date().toISOString() });
  }

  getHistory(assetId: string): VersionEntry[] { return this.versions.get(assetId) ?? []; }
  getLatest(assetId: string): VersionEntry | undefined { const h = this.getHistory(assetId); return h[h.length - 1]; }
  rollback(assetId: string, version: string): VersionEntry | undefined { return this.getHistory(assetId).find(v => v.version === version); }

  diff(assetId: string, v1: string, v2: string): { added: string[]; removed: string[]; changed: string[] } {
    const h = this.getHistory(assetId);
    const e1 = h.find(v => v.version === v1);
    const e2 = h.find(v => v.version === v2);
    if (!e1 || !e2) return { added: [], removed: [], changed: [] };
    const k1 = new Set(Object.keys(e1.data));
    const k2 = new Set(Object.keys(e2.data));
    return {
      added: [...k2].filter(k => !k1.has(k)),
      removed: [...k1].filter(k => !k2.has(k)),
      changed: [...k1].filter(k => k2.has(k) && JSON.stringify(e1.data[k]) !== JSON.stringify(e2.data[k])),
    };
  }

  get totalVersions(): number { return [...this.versions.values()].reduce((s, v) => s + v.length, 0); }
}
