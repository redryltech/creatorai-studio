// ============================================================
// CreatorAI Studio — AI Infrastructure Types
// ============================================================
// Types for the AI infrastructure layer that sits between
// agents and providers. Every AI call flows through this layer.
// ============================================================
/**
 * Job status for async AI operations.
 */
export var JobStatus;
(function (JobStatus) {
    JobStatus["PENDING"] = "pending";
    JobStatus["QUEUED"] = "queued";
    JobStatus["PROCESSING"] = "processing";
    JobStatus["COMPLETED"] = "completed";
    JobStatus["FAILED"] = "failed";
    JobStatus["CANCELLED"] = "cancelled";
    JobStatus["RETRYING"] = "retrying";
})(JobStatus || (JobStatus = {}));
/**
 * Job type identifier.
 */
export var JobType;
(function (JobType) {
    JobType["IMAGE_GENERATION"] = "image_generation";
    JobType["VIDEO_GENERATION"] = "video_generation";
    JobType["VOICE_SYNTHESIS"] = "voice_synthesis";
    JobType["VIDEO_COMPOSITION"] = "video_composition";
    JobType["TREND_RESEARCH"] = "trend_research";
    JobType["BULK_GENERATION"] = "bulk_generation";
})(JobType || (JobType = {}));
//# sourceMappingURL=ai.types.js.map