import type { KnowledgeEntry } from '../types/intelligence.types';
export declare class KnowledgeBase {
    private static instance;
    private entries;
    private constructor();
    static getInstance(): KnowledgeBase;
    static resetInstance(): void;
    add(params: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): KnowledgeEntry;
    search(userId: string, query: string, category?: KnowledgeEntry['category']): KnowledgeEntry[];
    getTopPerforming(userId: string, category: KnowledgeEntry['category'], limit?: number): KnowledgeEntry[];
    getByUser(userId: string): KnowledgeEntry[];
    incrementUsage(entryId: string): void;
    get size(): number;
}
//# sourceMappingURL=knowledge-base.d.ts.map