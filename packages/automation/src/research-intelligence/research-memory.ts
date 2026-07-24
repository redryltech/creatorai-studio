// ============================================================
// CreatorAI Studio — Research Memory
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import type { ResearchMemoryEntry, ContentCategory } from './research.types';

/** Persistent memory store for research results. */
export class ResearchMemory {
  private static instance: ResearchMemory | null = null;
  private entries: ResearchMemoryEntry[] = [];

  private constructor() {}

  static getInstance(): ResearchMemory {
    if (!ResearchMemory.instance) ResearchMemory.instance = new ResearchMemory();
    return ResearchMemory.instance;
  }

  static resetInstance(): void { ResearchMemory.instance = null; }

  /** Record a research result for future reference. */
  record(input: { topic: string; category: ContentCategory; packageId: string; confidenceScore: number; qualityScore: number }): void {
    this.entries.push({ id: generateId(ID_PREFIXES.asset), ...input, createdAt: new Date().toISOString() });
    if (this.entries.length > 500) this.entries = this.entries.slice(-500);
  }

  /** Find past research for similar topics. */
  findSimilar(topic: string, limit = 5): ResearchMemoryEntry[] {
    const words = topic.toLowerCase().split(/\s+/);
    return this.entries
      .map((e) => ({ entry: e, score: words.filter((w) => e.topic.toLowerCase().includes(w)).length }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.entry);
  }

  getAll(): ResearchMemoryEntry[] { return [...this.entries]; }
  get size(): number { return this.entries.length; }
}
