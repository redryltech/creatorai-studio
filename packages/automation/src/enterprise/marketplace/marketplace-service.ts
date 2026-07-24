// ============================================================
// CreatorAI Studio — Marketplace Service
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { MarketplaceItem, MarketplaceCategory } from '../types/enterprise.types';

const log = Logger.for('Marketplace');

export class MarketplaceService {
  private static instance: MarketplaceService | null = null;
  private items: MarketplaceItem[] = [];

  private constructor() {}
  static getInstance(): MarketplaceService { if (!MarketplaceService.instance) MarketplaceService.instance = new MarketplaceService(); return MarketplaceService.instance; }
  static resetInstance(): void { MarketplaceService.instance = null; }

  /** Publish an item to the marketplace. */
  publish(params: { authorId: string; authorName: string; category: MarketplaceCategory; title: string; description: string; price: number; tags: string[]; data: Record<string, unknown> }): MarketplaceItem {
    const item: MarketplaceItem = {
      id: generateId(ID_PREFIXES.step), ...params,
      currency: 'usd', downloads: 0, rating: 0, reviewCount: 0,
      previewUrl: null, isPublished: true,
      createdAt: new Date(), updatedAt: new Date(),
    };
    this.items.push(item);
    log.info('Marketplace item published', { itemId: item.id, title: item.title, category: item.category });
    return item;
  }

  /** Search marketplace. */
  search(query: string, category?: MarketplaceCategory, limit: number = 20): MarketplaceItem[] {
    const q = query.toLowerCase();
    return this.items.filter((i) => i.isPublished && (!category || i.category === category) && (i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.tags.some((t) => t.toLowerCase().includes(q))))
      .sort((a, b) => b.downloads - a.downloads).slice(0, limit);
  }

  /** Get featured/popular items. */
  getFeatured(limit: number = 10): MarketplaceItem[] {
    return this.items.filter((i) => i.isPublished).sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount).slice(0, limit);
  }

  /** Record a download. */
  recordDownload(itemId: string): void {
    const item = this.items.find((i) => i.id === itemId);
    if (item) item.downloads++;
  }

  get totalItems(): number { return this.items.filter((i) => i.isPublished).length; }
}
