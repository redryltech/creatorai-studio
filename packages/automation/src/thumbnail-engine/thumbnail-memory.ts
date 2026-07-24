import { generateId, ID_PREFIXES } from '@creatorai/shared';
import type { ThumbnailMemoryEntry } from './thumbnail.types';
export class ThumbnailMemory {
  private static instance: ThumbnailMemory | null = null;
  private entries: ThumbnailMemoryEntry[] = [];
  private constructor() {}
  static getInstance(): ThumbnailMemory { if (!ThumbnailMemory.instance) ThumbnailMemory.instance = new ThumbnailMemory(); return ThumbnailMemory.instance; }
  static resetInstance(): void { ThumbnailMemory.instance = null; }
  record(input: { productionTitle: string; packageId: string; bestCtr: number }): void {
    this.entries.push({ id: generateId(ID_PREFIXES.asset), ...input, createdAt: new Date().toISOString() });
    if (this.entries.length > 500) this.entries = this.entries.slice(-500);
  }
  getAll(): ThumbnailMemoryEntry[] { return [...this.entries]; }
  get size(): number { return this.entries.length; }
}
