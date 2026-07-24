// ============================================================
// CreatorAI Studio — Asset Service
// ============================================================
// Domain service for asset lifecycle: create, version, search,
// review, tag, favorite, and media library operations.
//
// This service integrates:
// - AssetRepository (Firestore persistence)
// - AssetVersionRepository (version history)
// - ReviewRepository (approval workflow)
// - TimelineRepository (audit events)
// - IStorageProvider (file storage)
// ============================================================

import type {
  PersistentAsset, AssetVersion, Review, TimelineEvent,
} from '@creatorai/shared';
import {
  PersistentAssetType, AssetStatus, TimelineEventType,
  generateId, ID_PREFIXES, NotFoundError, AuthorizationError,
} from '@creatorai/shared';
import type {
  AssetRepository, AssetVersionRepository, ReviewRepository,
  TimelineRepository, PaginatedResult, PaginationOptions,
} from '@creatorai/database';
import type { IStorageProvider } from '@creatorai/database';
import { Logger } from '@creatorai/agents';
import { createHash } from 'crypto';

const log = Logger.for('AssetService');

export class AssetService {
  constructor(
    private readonly assetRepo: AssetRepository,
    private readonly versionRepo: AssetVersionRepository,
    private readonly reviewRepo: ReviewRepository,
    private readonly timelineRepo: TimelineRepository,
    private readonly storage: IStorageProvider,
  ) {}

  // ================================================================
  // Asset CRUD
  // ================================================================

  /** Create a new asset from workflow output or manual upload. */
  async createAsset(params: {
    projectId: string;
    userId: string;
    name: string;
    type: PersistentAssetType;
    data?: Record<string, unknown>;
    buffer?: Buffer;
    mimeType?: string;
    workflowRunId?: string;
    workflowNodeId?: string;
    sourceAgentId?: string;
    tags?: string[];
  }): Promise<PersistentAsset> {
    const assetId = generateId(ID_PREFIXES.asset);
    let storagePath: string | null = null;
    let url: string | null = null;
    let sizeBytes: number | null = null;
    let checksum: string;

    // Binary upload
    if (params.buffer) {
      const ext = this.getExtension(params.mimeType ?? 'application/octet-stream');
      storagePath = `users/${params.userId}/projects/${params.projectId}/assets/${assetId}.${ext}`;

      const uploadResult = await this.storage.upload(storagePath, params.buffer, {
        contentType: params.mimeType,
        isPublic: true,
      });

      url = uploadResult.url;
      sizeBytes = uploadResult.sizeBytes;
      checksum = uploadResult.checksum;
    } else {
      checksum = params.data
        ? createHash('sha256').update(JSON.stringify(params.data)).digest('hex').slice(0, 16)
        : '';
    }

    const asset: PersistentAsset = {
      id: assetId,
      projectId: params.projectId,
      userId: params.userId,
      workflowRunId: params.workflowRunId ?? null,
      workflowNodeId: params.workflowNodeId ?? null,
      type: params.type,
      status: AssetStatus.READY,
      name: params.name,
      description: '',
      currentVersion: 1,
      mimeType: params.mimeType ?? 'application/json',
      sizeBytes,
      storagePath,
      url,
      data: params.data ?? null,
      checksum,
      sourceAgentId: params.sourceAgentId ?? null,
      tags: params.tags ?? [],
      collectionPath: null,
      isFavorite: false,
      usageCount: 0,
      relationships: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    await this.assetRepo.create(asset);

    // Create initial version
    await this.createVersion(asset, 'Initial creation', params.userId);

    // Timeline event
    await this.recordEvent(params.projectId, params.userId, TimelineEventType.ASSET_CREATED, 'asset', `Asset created: ${params.name}`, { assetId, type: params.type }, { assetId });

    log.info('Asset created', { assetId, projectId: params.projectId, type: params.type, name: params.name });
    return asset;
  }

  /** Get an asset with ownership check. */
  async getAsset(assetId: string, userId: string): Promise<PersistentAsset> {
    const asset = await this.assetRepo.findById(assetId);
    if (!asset) throw new NotFoundError('Asset', assetId);
    if (asset.userId !== userId) throw new AuthorizationError('You do not own this asset');
    return asset;
  }

  /** List assets for a project. */
  async listProjectAssets(
    projectId: string,
    userId: string,
    options: PaginationOptions & { type?: string; status?: string; tags?: string[]; isFavorite?: boolean },
  ): Promise<PaginatedResult<PersistentAsset>> {
    return this.assetRepo.findByProject(projectId, options);
  }

  /** Media library — list all user assets across projects. */
  async listMediaLibrary(
    userId: string,
    options: PaginationOptions & { type?: string; tags?: string[] },
  ): Promise<PaginatedResult<PersistentAsset>> {
    return this.assetRepo.findByUser(userId, options);
  }

  /** Soft delete an asset. */
  async deleteAsset(assetId: string, userId: string): Promise<void> {
    const asset = await this.getAsset(assetId, userId);
    await this.assetRepo.softDeleteAsset(assetId);
    await this.recordEvent(asset.projectId, userId, TimelineEventType.ASSET_DELETED, 'asset', `Asset deleted: ${asset.name}`, {}, { assetId });
  }

  /** Restore a deleted asset. */
  async restoreAsset(assetId: string, userId: string): Promise<void> {
    const asset = await this.getAsset(assetId, userId);
    await this.assetRepo.restoreAsset(assetId);
    await this.recordEvent(asset.projectId, userId, TimelineEventType.ASSET_RESTORED, 'asset', `Asset restored: ${asset.name}`, {}, { assetId });
  }

  // ================================================================
  // Version Control (Step 4)
  // ================================================================

  /** Create a new version of an asset. */
  async createNewVersion(params: {
    assetId: string;
    userId: string;
    changeDescription: string;
    data?: Record<string, unknown>;
    buffer?: Buffer;
    mimeType?: string;
    workflowRunId?: string;
    sourceAgentId?: string;
  }): Promise<AssetVersion> {
    const asset = await this.getAsset(params.assetId, params.userId);
    const newVersionNum = asset.currentVersion + 1;

    let storagePath: string | null = null;
    let url: string | null = null;
    let sizeBytes: number | null = null;
    let checksum: string;

    // If binary, copy old file to versioned path and upload new one
    if (params.buffer) {
      const ext = this.getExtension(params.mimeType ?? asset.mimeType);
      storagePath = `users/${params.userId}/projects/${asset.projectId}/assets/${params.assetId}/v${newVersionNum}.${ext}`;

      // Archive current version
      if (asset.storagePath) {
        const archivePath = `users/${params.userId}/projects/${asset.projectId}/assets/${params.assetId}/v${asset.currentVersion}.${ext}`;
        try { await this.storage.copy(asset.storagePath, archivePath); } catch { /* ignore if not exists */ }
      }

      const uploadResult = await this.storage.upload(storagePath, params.buffer, {
        contentType: params.mimeType,
        isPublic: true,
      });
      url = uploadResult.url;
      sizeBytes = uploadResult.sizeBytes;
      checksum = uploadResult.checksum;

      // Update main asset to point to new file
      await this.assetRepo.update(params.assetId, {
        storagePath,
        url,
        sizeBytes,
        checksum,
        currentVersion: newVersionNum,
        data: params.data ?? asset.data,
      } as Partial<PersistentAsset>);
    } else {
      checksum = params.data
        ? createHash('sha256').update(JSON.stringify(params.data)).digest('hex').slice(0, 16)
        : asset.checksum;

      await this.assetRepo.update(params.assetId, {
        data: params.data ?? asset.data,
        checksum,
        currentVersion: newVersionNum,
      } as Partial<PersistentAsset>);
    }

    const version: AssetVersion = {
      id: generateId(ID_PREFIXES.step),
      assetId: params.assetId,
      projectId: asset.projectId,
      userId: params.userId,
      version: newVersionNum,
      changeDescription: params.changeDescription,
      data: params.data ?? asset.data,
      storagePath,
      url,
      checksum,
      sizeBytes,
      mimeType: params.mimeType ?? asset.mimeType,
      workflowRunId: params.workflowRunId ?? null,
      sourceAgentId: params.sourceAgentId ?? null,
      createdAt: new Date(),
      createdBy: params.userId,
    };

    await this.versionRepo.create(version);

    await this.recordEvent(asset.projectId, params.userId, TimelineEventType.ASSET_VERSION_CREATED, 'asset', `Version ${newVersionNum} created: ${asset.name}`, { version: newVersionNum, changeDescription: params.changeDescription }, { assetId: params.assetId, versionId: version.id });

    log.info('Asset version created', { assetId: params.assetId, version: newVersionNum });
    return version;
  }

  /** Get version history for an asset. */
  async getVersionHistory(assetId: string, userId: string): Promise<AssetVersion[]> {
    await this.getAsset(assetId, userId);
    return this.versionRepo.getVersionHistory(assetId);
  }

  /** Restore a specific version (creates a new version from old data). */
  async restoreVersion(assetId: string, version: number, userId: string): Promise<AssetVersion> {
    const oldVersion = await this.versionRepo.getVersion(assetId, version);
    if (!oldVersion) throw new NotFoundError('AssetVersion', `${assetId}@v${version}`);

    return this.createNewVersion({
      assetId,
      userId,
      changeDescription: `Restored from version ${version}`,
      data: oldVersion.data ?? undefined,
    });
  }

  // ================================================================
  // Tags & Favorites (Step 5 — Media Library support)
  // ================================================================

  async toggleFavorite(assetId: string, userId: string): Promise<boolean> {
    await this.getAsset(assetId, userId);
    return this.assetRepo.toggleFavorite(assetId);
  }

  async addTags(assetId: string, userId: string, tags: string[]): Promise<void> {
    const asset = await this.getAsset(assetId, userId);
    await this.assetRepo.addTags(assetId, tags);
    await this.recordEvent(asset.projectId, userId, TimelineEventType.ASSET_TAGGED, 'asset', `Tags added to ${asset.name}`, { tags }, { assetId });
  }

  async removeTags(assetId: string, userId: string, tags: string[]): Promise<void> {
    await this.getAsset(assetId, userId);
    await this.assetRepo.removeTags(assetId, tags);
  }

  // ================================================================
  // Review & Approval (Step 6)
  // ================================================================

  /** Request a review for an asset. */
  async requestReview(assetId: string, userId: string): Promise<Review> {
    const asset = await this.getAsset(assetId, userId);

    const review: Review = {
      id: generateId(ID_PREFIXES.step),
      assetId,
      projectId: asset.projectId,
      assetVersion: asset.currentVersion,
      requestedBy: userId,
      reviewedBy: null,
      status: 'pending',
      comment: null,
      action: null,
      requestedAt: new Date(),
      reviewedAt: null,
    };

    await this.reviewRepo.create(review);

    await this.recordEvent(asset.projectId, userId, TimelineEventType.REVIEW_REQUESTED, 'review', `Review requested for ${asset.name}`, { version: asset.currentVersion }, { assetId, reviewId: review.id });

    return review;
  }

  /** Approve an asset. */
  async approveAsset(reviewId: string, userId: string, comment?: string): Promise<void> {
    const review = await this.reviewRepo.findByIdOrThrow(reviewId);

    await this.reviewRepo.update(reviewId, {
      status: 'approved',
      reviewedBy: userId,
      reviewedAt: new Date(),
      comment: comment ?? null,
      action: 'none',
    } as Partial<Review>);

    await this.assetRepo.update(review.assetId, { status: AssetStatus.APPROVED } as Partial<PersistentAsset>);

    await this.recordEvent(review.projectId, userId, TimelineEventType.REVIEW_APPROVED, 'review', 'Asset approved', { comment }, { assetId: review.assetId, reviewId });
  }

  /** Reject an asset. */
  async rejectAsset(reviewId: string, userId: string, comment: string, action?: 'regenerate' | 'edit'): Promise<void> {
    const review = await this.reviewRepo.findByIdOrThrow(reviewId);

    await this.reviewRepo.update(reviewId, {
      status: 'rejected',
      reviewedBy: userId,
      reviewedAt: new Date(),
      comment,
      action: action ?? 'none',
    } as Partial<Review>);

    await this.assetRepo.update(review.assetId, { status: AssetStatus.REJECTED } as Partial<PersistentAsset>);

    await this.recordEvent(review.projectId, userId, TimelineEventType.REVIEW_REJECTED, 'review', 'Asset rejected', { comment, action }, { assetId: review.assetId, reviewId });
  }

  /** Request changes on an asset. */
  async requestChanges(reviewId: string, userId: string, comment: string): Promise<void> {
    const review = await this.reviewRepo.findByIdOrThrow(reviewId);

    await this.reviewRepo.update(reviewId, {
      status: 'changes_requested',
      reviewedBy: userId,
      reviewedAt: new Date(),
      comment,
    } as Partial<Review>);

    await this.recordEvent(review.projectId, userId, TimelineEventType.REVIEW_CHANGES_REQUESTED, 'review', 'Changes requested', { comment }, { assetId: review.assetId, reviewId });
  }

  /** Get pending reviews for a user. */
  async getPendingReviews(userId: string): Promise<Review[]> {
    return this.reviewRepo.findPendingByUser(userId);
  }

  /** Get reviews for a project. */
  async getProjectReviews(projectId: string, status?: string): Promise<Review[]> {
    return this.reviewRepo.findByProject(projectId, status);
  }

  // ================================================================
  // Workflow → Asset Promotion
  // ================================================================

  /** Promote workflow artifacts to persistent assets (called by WorkflowExecutor). */
  async promoteWorkflowArtifacts(params: {
    projectId: string;
    userId: string;
    workflowRunId: string;
    artifacts: Array<{
      nodeId: string;
      agentId: string;
      type: PersistentAssetType;
      name: string;
      data: Record<string, unknown>;
      mimeType?: string;
    }>;
  }): Promise<PersistentAsset[]> {
    const assets: PersistentAsset[] = [];

    for (const artifact of params.artifacts) {
      const asset = await this.createAsset({
        projectId: params.projectId,
        userId: params.userId,
        name: artifact.name,
        type: artifact.type,
        data: artifact.data,
        mimeType: artifact.mimeType,
        workflowRunId: params.workflowRunId,
        workflowNodeId: artifact.nodeId,
        sourceAgentId: artifact.agentId,
      });
      assets.push(asset);
    }

    log.info('Workflow artifacts promoted to assets', {
      projectId: params.projectId,
      workflowRunId: params.workflowRunId,
      assetCount: assets.length,
    });

    return assets;
  }

  // ================================================================
  // Private
  // ================================================================

  private async createVersion(asset: PersistentAsset, changeDescription: string, userId: string): Promise<void> {
    const version: AssetVersion = {
      id: generateId(ID_PREFIXES.step),
      assetId: asset.id,
      projectId: asset.projectId,
      userId,
      version: 1,
      changeDescription,
      data: asset.data,
      storagePath: asset.storagePath,
      url: asset.url,
      checksum: asset.checksum,
      sizeBytes: asset.sizeBytes,
      mimeType: asset.mimeType,
      workflowRunId: asset.workflowRunId,
      sourceAgentId: asset.sourceAgentId,
      createdAt: new Date(),
      createdBy: userId,
    };
    await this.versionRepo.create(version);
  }

  private async recordEvent(
    projectId: string, userId: string, type: TimelineEventType,
    category: TimelineEvent['category'], description: string,
    data: Record<string, unknown>, refs?: TimelineEvent['refs'],
  ): Promise<void> {
    await this.timelineRepo.create({
      id: generateId(ID_PREFIXES.step),
      projectId, userId, type, category, description, data,
      refs: refs ?? {},
      timestamp: new Date(),
    });
  }

  private getExtension(mimeType: string): string {
    const map: Record<string, string> = {
      'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp',
      'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/ogg': 'ogg',
      'video/mp4': 'mp4', 'video/webm': 'webm',
      'application/json': 'json', 'text/plain': 'txt',
    };
    return map[mimeType] ?? 'bin';
  }
}
