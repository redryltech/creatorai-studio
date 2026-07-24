import type { StyleGuide } from './asset.types';

export class StyleGuideManager {
  private guides: Map<string, StyleGuide> = new Map();

  save(guide: StyleGuide): void { this.guides.set(guide.id, guide); }
  get(id: string): StyleGuide | undefined { return this.guides.get(id); }
  list(): StyleGuide[] { return [...this.guides.values()]; }
  get size(): number { return this.guides.size; }
}
