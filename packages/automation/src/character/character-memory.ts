// ============================================================
// CreatorAI Studio — Character Memory
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import type { CharacterMemoryEntry } from './character.types';

export class CharacterMemory {
  private static instance: CharacterMemory | null = null;
  private entries: CharacterMemoryEntry[] = [];

  private constructor() {}
  static getInstance(): CharacterMemory {
    if (!CharacterMemory.instance) CharacterMemory.instance = new CharacterMemory();
    return CharacterMemory.instance;
  }
  static resetInstance(): void { CharacterMemory.instance = null; }

  record(input: { productionTitle: string; databaseId: string; entityCount: number; continuityScore: number }): void {
    this.entries.push({
      id: generateId(ID_PREFIXES.asset),
      productionTitle: input.productionTitle,
      databaseId: input.databaseId,
      entityCount: input.entityCount,
      continuityScore: input.continuityScore,
      createdAt: new Date().toISOString(),
    });
    if (this.entries.length > 500) this.entries = this.entries.slice(-500);
  }

  getAll(): CharacterMemoryEntry[] { return [...this.entries]; }
  get size(): number { return this.entries.length; }
}
