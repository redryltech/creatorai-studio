import { generateId, ID_PREFIXES } from '@creatorai/shared';
import type { SfxMemoryEntry } from './sfx.types';
export class SfxMemory {
  private static instance: SfxMemory | null = null;
  private entries: SfxMemoryEntry[] = [];
  private constructor() {}
  static getInstance(): SfxMemory { if (!SfxMemory.instance) SfxMemory.instance = new SfxMemory(); return SfxMemory.instance; }
  static resetInstance(): void { SfxMemory.instance = null; }
  record(input: { productionTitle: string; packageId: string; effectCount: number }): void {
    this.entries.push({ id: generateId(ID_PREFIXES.asset), ...input, createdAt: new Date().toISOString() });
  }
  getAll(): SfxMemoryEntry[] { return [...this.entries]; }
  get size(): number { return this.entries.length; }
}
