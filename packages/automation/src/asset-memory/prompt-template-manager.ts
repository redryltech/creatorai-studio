import type { PromptTemplate, PromptTemplateCategory } from './asset.types';

export class PromptTemplateManager {
  private templates: Map<string, PromptTemplate> = new Map();

  save(tmpl: PromptTemplate): void { this.templates.set(tmpl.id, tmpl); }
  get(id: string): PromptTemplate | undefined { return this.templates.get(id); }
  getByCategory(cat: PromptTemplateCategory): PromptTemplate[] { return [...this.templates.values()].filter(t => t.category === cat); }
  list(): PromptTemplate[] { return [...this.templates.values()]; }

  /** Apply a template with variable substitution. */
  apply(id: string, vars: Record<string, string>): { image: string; video: string; negative: string } | null {
    const t = this.templates.get(id);
    if (!t) return null;
    const sub = (s: string) => { let r = s; for (const [k, v] of Object.entries(vars)) r = r.replace(new RegExp(k.replace(/[{}]/g, '\\$&'), 'g'), v); return r; };
    return { image: sub(t.imagePromptTemplate), video: sub(t.videoPromptTemplate), negative: sub(t.negativePromptTemplate) };
  }

  get size(): number { return this.templates.size; }
}
