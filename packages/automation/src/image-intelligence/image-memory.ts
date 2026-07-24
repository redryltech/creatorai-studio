import { generateId, ID_PREFIXES } from '@creatorai/shared';
import type { ImageMemoryEntry } from './image.types';
export class ImageMemory {
  private static instance: ImageMemory | null = null;
  private entries: ImageMemoryEntry[] = [];
  private constructor() {}
  static getInstance(): ImageMemory { if (!ImageMemory.instance) ImageMemory.instance = new ImageMemory(); return ImageMemory.instance; }
  static resetInstance(): void { ImageMemory.instance = null; }
  record(input: { productionTitle: string; packageId: string; avgQuality: number; avgConfidence: number }): void {
    this.entries.push({ id: generateId(ID_PREFIXES.asset), ...input, createdAt: new Date().toISOString() });
    if (this.entries.length > 500) this.entries = this.entries.slice(-500);
  }
  getAll(): ImageMemoryEntry[] { return [...this.entries]; }
  get size(): number { return this.entries.length; }
}
