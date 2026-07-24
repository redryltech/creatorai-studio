// ============================================================
// CreatorAI Studio — Knowledge Base
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { KnowledgeEntry } from '../types/intelligence.types';

const log = Logger.for('KnowledgeBase');

export class KnowledgeBase {
  private static instance: KnowledgeBase | null = null;
  private entries: KnowledgeEntry[] = [];

  private constructor() {}
  static getInstance(): KnowledgeBase { if (!KnowledgeBase.instance) KnowledgeBase.instance = new KnowledgeBase(); return KnowledgeBase.instance; }
  static resetInstance(): void { KnowledgeBase.instance = null; }

  add(params: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): KnowledgeEntry {
    const entry: KnowledgeEntry = { id: generateId(ID_PREFIXES.step), ...params, usageCount: 0, createdAt: new Date(), updatedAt: new Date() };
    this.entries.push(entry);
    log.info('Knowledge added', { category: entry.category, title: entry.title });
    return entry;
  }

  search(userId: string, query: string, category?: KnowledgeEntry['category']): KnowledgeEntry[] {
    const q = query.toLowerCase();
    return this.entries.filter((e) => e.userId === userId && (!category || e.category === category) && (e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q) || e.tags.some((t) => t.toLowerCase().includes(q))))
      .sort((a, b) => b.performanceScore - a.performanceScore);
  }

  getTopPerforming(userId: string, category: KnowledgeEntry['category'], limit: number = 10): KnowledgeEntry[] {
    return this.entries.filter((e) => e.userId === userId && e.category === category).sort((a, b) => b.performanceScore - a.performanceScore).slice(0, limit);
  }

  getByUser(userId: string): KnowledgeEntry[] {
    return this.entries.filter((e) => e.userId === userId).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  incrementUsage(entryId: string): void {
    const entry = this.entries.find((e) => e.id === entryId);
    if (entry) { entry.usageCount++; entry.updatedAt = new Date(); }
  }

  get size(): number { return this.entries.length; }
}
