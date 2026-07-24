// ============================================================
// CreatorAI Studio — Scene Graph Memory
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import type { SceneGraphMemoryEntry } from './scene-graph.types';

export class SceneGraphMemory {
  private static instance: SceneGraphMemory | null = null;
  private entries: SceneGraphMemoryEntry[] = [];

  private constructor() {}
  static getInstance(): SceneGraphMemory {
    if (!SceneGraphMemory.instance) SceneGraphMemory.instance = new SceneGraphMemory();
    return SceneGraphMemory.instance;
  }
  static resetInstance(): void { SceneGraphMemory.instance = null; }

  record(input: { productionTitle: string; packageId: string; sceneCount: number; avgComplexity: number }): void {
    this.entries.push({
      id: generateId(ID_PREFIXES.asset),
      productionTitle: input.productionTitle,
      packageId: input.packageId,
      sceneCount: input.sceneCount,
      avgComplexity: input.avgComplexity,
      createdAt: new Date().toISOString(),
    });
    if (this.entries.length > 500) this.entries = this.entries.slice(-500);
  }

  getAll(): SceneGraphMemoryEntry[] { return [...this.entries]; }
  get size(): number { return this.entries.length; }
}
