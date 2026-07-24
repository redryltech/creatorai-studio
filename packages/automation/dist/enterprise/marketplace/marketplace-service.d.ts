import type { MarketplaceItem, MarketplaceCategory } from '../types/enterprise.types';
export declare class MarketplaceService {
    private static instance;
    private items;
    private constructor();
    static getInstance(): MarketplaceService;
    static resetInstance(): void;
    /** Publish an item to the marketplace. */
    publish(params: {
        authorId: string;
        authorName: string;
        category: MarketplaceCategory;
        title: string;
        description: string;
        price: number;
        tags: string[];
        data: Record<string, unknown>;
    }): MarketplaceItem;
    /** Search marketplace. */
    search(query: string, category?: MarketplaceCategory, limit?: number): MarketplaceItem[];
    /** Get featured/popular items. */
    getFeatured(limit?: number): MarketplaceItem[];
    /** Record a download. */
    recordDownload(itemId: string): void;
    get totalItems(): number;
}
//# sourceMappingURL=marketplace-service.d.ts.map