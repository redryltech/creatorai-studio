// ============================================================
// CreatorAI Studio — Asset Repository
// ============================================================
// Data access layer for persistent assets, versions, and reviews.
// ============================================================

import type { Firestore, DocumentSnapshot, Query } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import type { PersistentAsset, AssetVersion, Review } from '@creatorai/shared';
import { AssetStatus } from '@creatorai/shared';
import { BaseRepository, type PaginatedResult, type PaginationOptions } from './base.repository';

// ---- Asset Repository ----

export class AssetRepository extends BaseRepository<PersistentAsset> {
  constructor(db: Firestore) {
    super(db, 'assets');
  }

  protected fromFirestore(doc: DocumentSnapshot): PersistentAsset {
    const d = doc.data()!;
    return {
      id: doc.id,
      projectId: d.projectId,
      userId: d.userId,
      workflowRunId: d.workflowRunId ?? null,
      workflowNodeId: d.workflowNodeId ?? null,
      type: d.type,
      status: d.status,
      name: d.name,
      description: d.description ?? '',
      currentVersion: d.currentVersion ?? 1,
      mimeType: d.mimeType ?? 'application/json',
      sizeBytes: d.sizeBytes ?? null,
      storagePath: d.storagePath ?? null,
      url: d.url ?? null,
      data: d.data ?? null,
      checksum: d.checksum ?? '',
      sourceAgentId: d.sourceAgentId ?? null,
      tags: d.tags ?? [],
      collectionPath: d.collectionPath ?? null,
      isFavorite: d.isFavorite ?? false,
      usageCount: d.usageCount ?? 0,
      relationships: d.relationships ?? [],
      createdAt: d.createdAt?.toDate() ?? new Date(),
      updatedAt: d.updatedAt?.toDate() ?? new Date(),
      deletedAt: d.deletedAt?.toDate() ?? null,
    };
  }

  protected toFirestore(entity: Partial<PersistentAsset>): Record<string, unknown> {
    const data: Record<string, unknown> = { ...entity };
    delete data.id;
    return data;
  }

  /** Find assets by project with pagination, filtering, search. */
  async findByProject(
    projectId: string,
    options: PaginationOptions & {
      type?: string;
      status?: string;
      tags?: string[];
      search?: string;
      isFavorite?: boolean;
    },
  ): Promise<PaginatedResult<PersistentAsset>> {
    return this.findPaginated(
      (ref) => {
        let q: Query = ref
          .where('projectId', '==', projectId)
          .where('deletedAt', '==', null);

        if (options.type) q = q.where('type', '==', options.type);
        if (options.status) q = q.where('status', '==', options.status);
        if (options.isFavorite !== undefined) q = q.where('isFavorite', '==', options.isFavorite);
        if (options.tags && options.tags.length > 0) {
          q = q.where('tags', 'array-contains-any', options.tags.slice(0, 10));
        }
        return q;
      },
      options,
    );
  }

  /** Find all assets for a user across projects (media library). */
  async findByUser(
    userId: string,
    options: PaginationOptions & { type?: string; tags?: string[]; search?: string },
  ): Promise<PaginatedResult<PersistentAsset>> {
    return this.findPaginated(
      (ref) => {
        let q: Query = ref.where('userId', '==', userId).where('deletedAt', '==', null);
        if (options.type) q = q.where('type', '==', options.type);
        return q;
      },
      options,
    );
  }

  /** Find assets produced by a specific workflow run. */
  async findByWorkflowRun(workflowRunId: string): Promise<PersistentAsset[]> {
    return this.findByField('workflowRunId', workflowRunId);
  }

  /** Toggle favorite. */
  async toggleFavorite(assetId: string): Promise<boolean> {
    const asset = await this.findByIdOrThrow(assetId);
    const newValue = !asset.isFavorite;
    await this.update(assetId, { isFavorite: newValue } as Partial<PersistentAsset>);
    return newValue;
  }

  /** Add tags to an asset. */
  async addTags(assetId: string, tags: string[]): Promise<void> {
    await this.collection.doc(assetId).update({
      tags: FieldValue.arrayUnion(...tags),
      updatedAt: new Date(),
    });
  }

  /** Remove tags from an asset. */
  async removeTags(assetId: string, tags: string[]): Promise<void> {
    await this.collection.doc(assetId).update({
      tags: FieldValue.arrayRemove(...tags),
      updatedAt: new Date(),
    });
  }

  /** Increment usage count (when an asset is referenced elsewhere). */
  async incrementUsage(assetId: string): Promise<void> {
    await this.collection.doc(assetId).update({
      usageCount: FieldValue.increment(1),
    });
  }

  /** Soft delete. */
  async softDeleteAsset(assetId: string): Promise<void> {
    await this.update(assetId, {
      status: AssetStatus.DELETED,
      deletedAt: new Date(),
    } as Partial<PersistentAsset>);
  }

  /** Restore a soft-deleted asset. */
  async restoreAsset(assetId: string): Promise<void> {
    await this.collection.doc(assetId).update({
      status: AssetStatus.READY,
      deletedAt: null,
      updatedAt: new Date(),
    });
  }
}

// ---- Asset Version Repository ----

export class AssetVersionRepository extends BaseRepository<AssetVersion> {
  constructor(db: Firestore) {
    super(db, 'assetVersions');
  }

  protected fromFirestore(doc: DocumentSnapshot): AssetVersion {
    const d = doc.data()!;
    return {
      id: doc.id,
      assetId: d.assetId,
      projectId: d.projectId,
      userId: d.userId,
      version: d.version,
      changeDescription: d.changeDescription ?? '',
      data: d.data ?? null,
      storagePath: d.storagePath ?? null,
      url: d.url ?? null,
      checksum: d.checksum ?? '',
      sizeBytes: d.sizeBytes ?? null,
      mimeType: d.mimeType ?? 'application/json',
      workflowRunId: d.workflowRunId ?? null,
      sourceAgentId: d.sourceAgentId ?? null,
      createdAt: d.createdAt?.toDate() ?? new Date(),
      createdBy: d.createdBy,
    };
  }

  protected toFirestore(entity: Partial<AssetVersion>): Record<string, unknown> {
    const data: Record<string, unknown> = { ...entity };
    delete data.id;
    return data;
  }

  /** Get all versions of an asset, ordered by version number. */
  async getVersionHistory(assetId: string): Promise<AssetVersion[]> {
    const snapshot = await this.collection
      .where('assetId', '==', assetId)
      .orderBy('version', 'desc')
      .get();
    return snapshot.docs.map((doc) => this.fromFirestore(doc));
  }

  /** Get a specific version. */
  async getVersion(assetId: string, version: number): Promise<AssetVersion | null> {
    const snapshot = await this.collection
      .where('assetId', '==', assetId)
      .where('version', '==', version)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    return this.fromFirestore(snapshot.docs[0]!);
  }
}

// ---- Review Repository ----

export class ReviewRepository extends BaseRepository<Review> {
  constructor(db: Firestore) {
    super(db, 'reviews');
  }

  protected fromFirestore(doc: DocumentSnapshot): Review {
    const d = doc.data()!;
    return {
      id: doc.id,
      assetId: d.assetId,
      projectId: d.projectId,
      assetVersion: d.assetVersion,
      requestedBy: d.requestedBy,
      reviewedBy: d.reviewedBy ?? null,
      status: d.status,
      comment: d.comment ?? null,
      action: d.action ?? null,
      requestedAt: d.requestedAt?.toDate() ?? new Date(),
      reviewedAt: d.reviewedAt?.toDate() ?? null,
    };
  }

  protected toFirestore(entity: Partial<Review>): Record<string, unknown> {
    const data: Record<string, unknown> = { ...entity };
    delete data.id;
    return data;
  }

  async findByProject(projectId: string, status?: string): Promise<Review[]> {
    let q = this.collection.where('projectId', '==', projectId).orderBy('requestedAt', 'desc');
    if (status) q = q.where('status', '==', status) as typeof q;
    const snapshot = await q.get();
    return snapshot.docs.map((doc) => this.fromFirestore(doc));
  }

  async findPendingByUser(userId: string): Promise<Review[]> {
    const snapshot = await this.collection
      .where('requestedBy', '==', userId)
      .where('status', '==', 'pending')
      .orderBy('requestedAt', 'desc')
      .get();
    return snapshot.docs.map((doc) => this.fromFirestore(doc));
  }
}
