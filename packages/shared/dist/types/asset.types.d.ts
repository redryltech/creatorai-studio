export declare enum PersistentAssetType {
    SCRIPT = "script",
    SCENE_BREAKDOWN = "scene_breakdown",
    IMAGE_PROMPT = "image_prompt",
    VIDEO_PROMPT = "video_prompt",
    IMAGE = "image",
    VIDEO = "video",
    AUDIO = "audio",
    VOICEOVER = "voiceover",
    MUSIC = "music",
    THUMBNAIL = "thumbnail",
    SUBTITLE = "subtitle",
    SEO_METADATA = "seo_metadata",
    COMPOSED_VIDEO = "composed_video",
    DOCUMENT = "document",
    ANALYTICS_SNAPSHOT = "analytics_snapshot"
}
export declare enum AssetStatus {
    DRAFT = "draft",
    PROCESSING = "processing",
    READY = "ready",
    APPROVED = "approved",
    REJECTED = "rejected",
    ARCHIVED = "archived",
    DELETED = "deleted"
}
/**
 * Persistent asset — stored in Firestore `assets/{assetId}`.
 */
export interface PersistentAsset {
    id: string;
    projectId: string;
    userId: string;
    /** Which workflow run produced this asset (null for uploads) */
    workflowRunId: string | null;
    /** Which workflow node produced this asset */
    workflowNodeId: string | null;
    type: PersistentAssetType;
    status: AssetStatus;
    /** Human-readable name */
    name: string;
    /** Optional description */
    description: string;
    /** Current version number */
    currentVersion: number;
    /** MIME type (e.g., "image/png", "audio/mp3", "application/json") */
    mimeType: string;
    /** File size in bytes (null for JSON-only assets) */
    sizeBytes: number | null;
    /** Firebase Storage path (null for JSON-only assets) */
    storagePath: string | null;
    /** Public download URL */
    url: string | null;
    /** Structured data payload (for scripts, prompts, SEO metadata) */
    data: Record<string, unknown> | null;
    /** Content hash for deduplication and integrity */
    checksum: string;
    /** Which agent produced this */
    sourceAgentId: string | null;
    /** User-defined tags for search and organization */
    tags: string[];
    /** Collection / folder path */
    collectionPath: string | null;
    /** Favorite flag */
    isFavorite: boolean;
    /** Usage count — how many times referenced in other assets/projects */
    usageCount: number;
    /** Relationships to other assets */
    relationships: AssetRelationship[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
export interface AssetRelationship {
    type: 'derived_from' | 'used_in' | 'variant_of' | 'paired_with';
    targetAssetId: string;
}
/**
 * Asset version — stored in `assetVersions/{versionId}`.
 * Every modification creates a new version.
 */
export interface AssetVersion {
    id: string;
    assetId: string;
    projectId: string;
    userId: string;
    version: number;
    /** What changed in this version */
    changeDescription: string;
    /** Structured data snapshot (for JSON assets) */
    data: Record<string, unknown> | null;
    /** Storage path for this version's binary file */
    storagePath: string | null;
    url: string | null;
    checksum: string;
    sizeBytes: number | null;
    mimeType: string;
    /** Which workflow/agent produced this version */
    workflowRunId: string | null;
    sourceAgentId: string | null;
    createdAt: Date;
    createdBy: string;
}
/**
 * Review record — stored in `reviews/{reviewId}`.
 */
export interface Review {
    id: string;
    assetId: string;
    projectId: string;
    assetVersion: number;
    /** Who requested the review */
    requestedBy: string;
    /** Who performed the review */
    reviewedBy: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
    /** Reviewer's comment */
    comment: string | null;
    /** Action taken after review */
    action: 'none' | 'regenerate' | 'edit' | 'publish' | null;
    requestedAt: Date;
    reviewedAt: Date | null;
}
/**
 * Timeline event — stored in `timelineEvents/{eventId}`.
 * Immutable audit log of everything that happens in a project.
 */
export interface TimelineEvent {
    id: string;
    projectId: string;
    userId: string;
    type: TimelineEventType;
    category: 'project' | 'workflow' | 'asset' | 'review' | 'publish' | 'system';
    /** Human-readable description */
    description: string;
    /** Structured event data */
    data: Record<string, unknown>;
    /** Related entity IDs for linking */
    refs: {
        assetId?: string;
        workflowRunId?: string;
        reviewId?: string;
        versionId?: string;
    };
    timestamp: Date;
}
export declare enum TimelineEventType {
    PROJECT_CREATED = "project.created",
    PROJECT_UPDATED = "project.updated",
    PROJECT_ARCHIVED = "project.archived",
    PROJECT_RESTORED = "project.restored",
    PROJECT_CLONED = "project.cloned",
    WORKFLOW_STARTED = "workflow.started",
    WORKFLOW_COMPLETED = "workflow.completed",
    WORKFLOW_FAILED = "workflow.failed",
    WORKFLOW_CANCELLED = "workflow.cancelled",
    WORKFLOW_PAUSED = "workflow.paused",
    WORKFLOW_RESUMED = "workflow.resumed",
    ASSET_CREATED = "asset.created",
    ASSET_UPDATED = "asset.updated",
    ASSET_VERSION_CREATED = "asset.version_created",
    ASSET_DELETED = "asset.deleted",
    ASSET_RESTORED = "asset.restored",
    ASSET_FAVORITED = "asset.favorited",
    ASSET_TAGGED = "asset.tagged",
    ASSET_UPLOADED = "asset.uploaded",
    REVIEW_REQUESTED = "review.requested",
    REVIEW_APPROVED = "review.approved",
    REVIEW_REJECTED = "review.rejected",
    REVIEW_CHANGES_REQUESTED = "review.changes_requested",
    PUBLISH_SCHEDULED = "publish.scheduled",
    PUBLISH_COMPLETED = "publish.completed",
    PUBLISH_FAILED = "publish.failed"
}
//# sourceMappingURL=asset.types.d.ts.map