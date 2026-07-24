import { generateId, ID_PREFIXES } from '@creatorai/shared';
import type { CreatorMemoryEntry } from './creator.types';
export class CreatorMemory {
  private static instance: CreatorMemory | null = null;
  private entries: CreatorMemoryEntry[] = [];
  private constructor() {}
  static getInstance(): CreatorMemory { if (!CreatorMemory.instance) CreatorMemory.instance = new CreatorMemory(); return CreatorMemory.instance; }
  static resetInstance(): void { CreatorMemory.instance = null; }
  record(input: { productionTitle: string; packageId: string; creatorScore: number; seoScore: number; hookScore: number }): void {
    this.entries.push({ id: generateId(ID_PREFIXES.asset), ...input, createdAt: new Date().toISOString() });
    if (this.entries.length > 500) this.entries = this.entries.slice(-500);
  }
  getAll(): CreatorMemoryEntry[] { return [...this.entries]; }
  getAverageScore(): number { return this.entries.length ? Math.round(this.entries.reduce((s, e) => s + e.creatorScore, 0) / this.entries.length) : 0; }
  get size(): number { return this.entries.length; }
}
