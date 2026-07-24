// ============================================================
// CreatorAI Studio — World State Memory
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import type { WorldStateMemoryEntry } from './world-state.types';

export class WorldStateMemory {
  private static instance: WorldStateMemory | null = null;
  private entries: WorldStateMemoryEntry[] = [];

  private constructor() {}
  static getInstance(): WorldStateMemory {
    if (!WorldStateMemory.instance) WorldStateMemory.instance = new WorldStateMemory();
    return WorldStateMemory.instance;
  }
  static resetInstance(): void { WorldStateMemory.instance = null; }

  record(input: { productionTitle: string; packageId: string; continuityScore: number; overallScore: number }): void {
    this.entries.push({
      id: generateId(ID_PREFIXES.asset), ...input, createdAt: new Date().toISOString(),
    });
    if (this.entries.length > 500) this.entries = this.entries.slice(-500);
  }

  getAll(): WorldStateMemoryEntry[] { return [...this.entries]; }
  get size(): number { return this.entries.length; }
}
