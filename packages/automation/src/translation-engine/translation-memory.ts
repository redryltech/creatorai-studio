import { generateId, ID_PREFIXES } from '@creatorai/shared';
import type { TranslationMemoryEntry } from './translation.types';
export class TranslationMemory {
  private static instance: TranslationMemory | null = null;
  private entries: TranslationMemoryEntry[] = [];
  private constructor() {}
  static getInstance(): TranslationMemory { if (!TranslationMemory.instance) TranslationMemory.instance = new TranslationMemory(); return TranslationMemory.instance; }
  static resetInstance(): void { TranslationMemory.instance = null; }
  record(input: { productionTitle: string; packageId: string; languageCount: number }): void {
    this.entries.push({ id: generateId(ID_PREFIXES.asset), ...input, createdAt: new Date().toISOString() });
    if (this.entries.length > 500) this.entries = this.entries.slice(-500);
  }
  getAll(): TranslationMemoryEntry[] { return [...this.entries]; }
  get size(): number { return this.entries.length; }
}
