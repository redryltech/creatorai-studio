// ============================================================
// CreatorAI Studio — Storyboard Memory
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import type { StoryboardMemoryEntry } from './storyboard.types';

export class StoryboardMemory {
  private static instance: StoryboardMemory | null = null;
  private entries: StoryboardMemoryEntry[] = [];

  private constructor() {}

  static getInstance(): StoryboardMemory {
    if (!StoryboardMemory.instance) {
      StoryboardMemory.instance = new StoryboardMemory();
    }
    return StoryboardMemory.instance;
  }

  static resetInstance(): void { StoryboardMemory.instance = null; }

  record(input: { title: string; storyboardId: string; frameCount: number; category: string; style: string }): void {
    this.entries.push({
      id: generateId(ID_PREFIXES.asset),
      title: input.title,
      storyboardId: input.storyboardId,
      frameCount: input.frameCount,
      category: input.category,
      style: input.style,
      qualityScore: 0,
      createdAt: new Date().toISOString(),
    });
    if (this.entries.length > 500) this.entries = this.entries.slice(-500);
  }

  updateQuality(storyboardId: string, score: number): void {
    const entry = this.entries.find((e) => e.storyboardId === storyboardId);
    if (entry) entry.qualityScore = score;
  }

  getAll(): StoryboardMemoryEntry[] { return [...this.entries]; }
  get size(): number { return this.entries.length; }
}
