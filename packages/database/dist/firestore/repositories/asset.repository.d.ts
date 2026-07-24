import type { Firestore, DocumentSnapshot } from 'firebase-admin/firestore';
import type { PersistentAsset, AssetVersion, Review } from '@creatorai/shared';
import { BaseRepository, type PaginatedResult, type PaginationOptions } from './base.repository';
export declare class AssetRepository extends BaseRepository<PersistentAsset> {
    constructor(db: Firestore);
    protected fromFirestore(doc: DocumentSnapshot): PersistentAsset;
    protected toFirestore(entity: Partial<PersistentAsset>): Record<string, unknown>;
    /** Find assets by project with pagination, filtering, search. */
    findByProject(projectId: string, options: PaginationOptions & {
        type?: string;
        status?: string;
        tags?: string[];
        search?: string;
        isFavorite?: boolean;
    }): Promise<PaginatedResult<PersistentAsset>>;
    /** Find all assets for a user across projects (media library). */
    findByUser(userId: string, options: PaginationOptions & {
        type?: string;
        tags?: string[];
        search?: string;
    }): Promise<PaginatedResult<PersistentAsset>>;
    /** Find assets produced by a specific workflow run. */
    findByWorkflowRun(workflowRunId: string): Promise<PersistentAsset[]>;
    /** Toggle favorite. */
    toggleFavorite(assetId: string): Promise<boolean>;
    /** Add tags to an asset. */
    addTags(assetId: string, tags: string[]): Promise<void>;
    /** Remove tags from an asset. */
    removeTags(assetId: string, tags: string[]): Promise<void>;
    /** Increment usage count (when an asset is referenced elsewhere). */
    incrementUsage(assetId: string): Promise<void>;
    /** Soft delete. */
    softDeleteAsset(assetId: string): Promise<void>;
    /** Restore a soft-deleted asset. */
    restoreAsset(assetId: string): Promise<void>;
}
export declare class AssetVersionRepository extends BaseRepository<AssetVersion> {
    constructor(db: Firestore);
    protected fromFirestore(doc: DocumentSnapshot): AssetVersion;
    protected toFirestore(entity: Partial<AssetVersion>): Record<string, unknown>;
    /** Get all versions of an asset, ordered by version number. */
    getVersionHistory(assetId: string): Promise<AssetVersion[]>;
    /** Get a specific version. */
    getVersion(assetId: string, version: number): Promise<AssetVersion | null>;
}
export declare class ReviewRepository extends BaseRepository<Review> {
    constructor(db: Firestore);
    protected fromFirestore(doc: DocumentSnapshot): Review;
    protected toFirestore(entity: Partial<Review>): Record<string, unknown>;
    findByProject(projectId: string, status?: string): Promise<Review[]>;
    findPendingByUser(userId: string): Promise<Review[]>;
}
//# sourceMappingURL=asset.repository.d.ts.map