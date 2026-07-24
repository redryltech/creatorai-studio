import { generateId, ID_PREFIXES } from '@creatorai/shared';
import type { PromptCompilerMemoryEntry } from './prompt.types';

export class PromptMemory {
  private static instance: PromptMemory | null = null;
  private entries: PromptCompilerMemoryEntry[] = [];
  private constructor() {}
  static getInstance(): PromptMemory { if (!PromptMemory.instance) PromptMemory.instance = new PromptMemory(); return PromptMemory.instance; }
  static resetInstance(): void { PromptMemory.instance = null; }
  record(input: { productionTitle: string; packageId: string; avgScore: number; totalTokens: number }): void {
    this.entries.push({ id: generateId(ID_PREFIXES.asset), ...input, createdAt: new Date().toISOString() });
    if (this.entries.length > 500) this.entries = this.entries.slice(-500);
  }
  getAll(): PromptCompilerMemoryEntry[] { return [...this.entries]; }
  get size(): number { return this.entries.length; }
}
