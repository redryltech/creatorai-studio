// ============================================================
// CreatorAI Studio — Asset & Version Domain Types
// ============================================================
// An Asset is any persistent output produced by an AI agent
// or uploaded by a user. Assets are versioned, tagged,
// searchable, and form the core of the media library.
//
// Relationship to Artifacts (Phase 3):
// - An Artifact is a transient in-memory object during workflow execution
// - An Asset is the persisted, versioned, permanent record
// - The WorkflowExecutor promotes Artifacts → Assets after completion
// ============================================================
export var PersistentAssetType;
(function (PersistentAssetType) {
    PersistentAssetType["SCRIPT"] = "script";
    PersistentAssetType["SCENE_BREAKDOWN"] = "scene_breakdown";
    PersistentAssetType["IMAGE_PROMPT"] = "image_prompt";
    PersistentAssetType["VIDEO_PROMPT"] = "video_prompt";
    PersistentAssetType["IMAGE"] = "image";
    PersistentAssetType["VIDEO"] = "video";
    PersistentAssetType["AUDIO"] = "audio";
    PersistentAssetType["VOICEOVER"] = "voiceover";
    PersistentAssetType["MUSIC"] = "music";
    PersistentAssetType["THUMBNAIL"] = "thumbnail";
    PersistentAssetType["SUBTITLE"] = "subtitle";
    PersistentAssetType["SEO_METADATA"] = "seo_metadata";
    PersistentAssetType["COMPOSED_VIDEO"] = "composed_video";
    PersistentAssetType["DOCUMENT"] = "document";
    PersistentAssetType["ANALYTICS_SNAPSHOT"] = "analytics_snapshot";
})(PersistentAssetType || (PersistentAssetType = {}));
export var AssetStatus;
(function (AssetStatus) {
    AssetStatus["DRAFT"] = "draft";
    AssetStatus["PROCESSING"] = "processing";
    AssetStatus["READY"] = "ready";
    AssetStatus["APPROVED"] = "approved";
    AssetStatus["REJECTED"] = "rejected";
    AssetStatus["ARCHIVED"] = "archived";
    AssetStatus["DELETED"] = "deleted";
})(AssetStatus || (AssetStatus = {}));
export var TimelineEventType;
(function (TimelineEventType) {
    // Project
    TimelineEventType["PROJECT_CREATED"] = "project.created";
    TimelineEventType["PROJECT_UPDATED"] = "project.updated";
    TimelineEventType["PROJECT_ARCHIVED"] = "project.archived";
    TimelineEventType["PROJECT_RESTORED"] = "project.restored";
    TimelineEventType["PROJECT_CLONED"] = "project.cloned";
    // Workflow
    TimelineEventType["WORKFLOW_STARTED"] = "workflow.started";
    TimelineEventType["WORKFLOW_COMPLETED"] = "workflow.completed";
    TimelineEventType["WORKFLOW_FAILED"] = "workflow.failed";
    TimelineEventType["WORKFLOW_CANCELLED"] = "workflow.cancelled";
    TimelineEventType["WORKFLOW_PAUSED"] = "workflow.paused";
    TimelineEventType["WORKFLOW_RESUMED"] = "workflow.resumed";
    // Asset
    TimelineEventType["ASSET_CREATED"] = "asset.created";
    TimelineEventType["ASSET_UPDATED"] = "asset.updated";
    TimelineEventType["ASSET_VERSION_CREATED"] = "asset.version_created";
    TimelineEventType["ASSET_DELETED"] = "asset.deleted";
    TimelineEventType["ASSET_RESTORED"] = "asset.restored";
    TimelineEventType["ASSET_FAVORITED"] = "asset.favorited";
    TimelineEventType["ASSET_TAGGED"] = "asset.tagged";
    TimelineEventType["ASSET_UPLOADED"] = "asset.uploaded";
    // Review
    TimelineEventType["REVIEW_REQUESTED"] = "review.requested";
    TimelineEventType["REVIEW_APPROVED"] = "review.approved";
    TimelineEventType["REVIEW_REJECTED"] = "review.rejected";
    TimelineEventType["REVIEW_CHANGES_REQUESTED"] = "review.changes_requested";
    // Publish
    TimelineEventType["PUBLISH_SCHEDULED"] = "publish.scheduled";
    TimelineEventType["PUBLISH_COMPLETED"] = "publish.completed";
    TimelineEventType["PUBLISH_FAILED"] = "publish.failed";
})(TimelineEventType || (TimelineEventType = {}));
//# sourceMappingURL=asset.types.js.map