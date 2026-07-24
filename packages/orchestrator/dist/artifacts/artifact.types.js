// ============================================================
// CreatorAI Studio — Artifact Types
// ============================================================
// An Artifact is any piece of data produced by an agent during
// workflow execution. Artifacts are persisted, versioned, and
// addressable by ID.
//
// Why artifacts instead of in-memory data passing?
// 1. Persistence — if the server restarts mid-workflow, we resume
//    from persisted artifacts instead of re-running everything
// 2. Audit trail — every output is traceable to an agent + workflow
// 3. Reuse — a script artifact can be re-used to generate images
//    without re-running the script agent
// 4. Decoupling — agents never import each other's types; they
//    produce and consume artifacts through the ArtifactManager
// ============================================================
export var ArtifactType;
(function (ArtifactType) {
    ArtifactType["SCRIPT"] = "script";
    ArtifactType["SCENE_PROMPTS"] = "scene_prompts";
    ArtifactType["IMAGE"] = "image";
    ArtifactType["VIDEO"] = "video";
    ArtifactType["AUDIO"] = "audio";
    ArtifactType["VOICEOVER"] = "voiceover";
    ArtifactType["THUMBNAIL"] = "thumbnail";
    ArtifactType["SEO_METADATA"] = "seo_metadata";
    ArtifactType["SUBTITLE"] = "subtitle";
    ArtifactType["COMPOSED_VIDEO"] = "composed_video";
    ArtifactType["TREND_RESEARCH"] = "trend_research";
    ArtifactType["GENERIC"] = "generic";
})(ArtifactType || (ArtifactType = {}));
export var ArtifactStatus;
(function (ArtifactStatus) {
    ArtifactStatus["PENDING"] = "pending";
    ArtifactStatus["READY"] = "ready";
    ArtifactStatus["FAILED"] = "failed";
    ArtifactStatus["DELETED"] = "deleted";
})(ArtifactStatus || (ArtifactStatus = {}));
//# sourceMappingURL=artifact.types.js.map