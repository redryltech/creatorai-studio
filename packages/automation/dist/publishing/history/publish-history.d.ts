import type { PublishHistoryEntry, SocialPlatformId } from '../types/publishing.types';
export declare class PublishHistory {
    private static instance;
    private entries;
    private constructor();
    static getInstance(): PublishHistory;
    static resetInstance(): void;
    record(entry: Omit<PublishHistoryEntry, 'id'>): PublishHistoryEntry;
    getByUser(userId: string, limit?: number): PublishHistoryEntry[];
    getByProject(projectId: string): PublishHistoryEntry[];
    getByPlatform(userId: string, platform: SocialPlatformId): PublishHistoryEntry[];
    get totalPublished(): number;
}
//# sourceMappingURL=publish-history.d.ts.map