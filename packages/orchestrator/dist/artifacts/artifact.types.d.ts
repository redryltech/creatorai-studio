export declare enum ArtifactType {
    SCRIPT = "script",
    SCENE_PROMPTS = "scene_prompts",
    IMAGE = "image",
    VIDEO = "video",
    AUDIO = "audio",
    VOICEOVER = "voiceover",
    THUMBNAIL = "thumbnail",
    SEO_METADATA = "seo_metadata",
    SUBTITLE = "subtitle",
    COMPOSED_VIDEO = "composed_video",
    TREND_RESEARCH = "trend_research",
    GENERIC = "generic"
}
export declare enum ArtifactStatus {
    PENDING = "pending",
    READY = "ready",
    FAILED = "failed",
    DELETED = "deleted"
}
/**
 * An artifact produced during workflow execution.
 */
export interface Artifact {
    /** Unique artifact ID */
    id: string;
    /** The workflow node that produced this artifact */
    nodeId: string;
    /** The workflow run this artifact belongs to */
    workflowRunId: string;
    /** The project this artifact belongs to */
    projectId: string;
    /** Owner user */
    userId: string;
    /** Artifact type — determines how to interpret `data` */
    type: ArtifactType;
    /** Current status */
    status: ArtifactStatus;
    /** The structured data payload (for JSON-serializable artifacts) */
    data: Record<string, unknown>;
    /** Firebase Storage reference (for binary artifacts: images, audio, video) */
    storageRef: string | null;
    /** Public URL (for binary artifacts) */
    url: string | null;
    /** Which agent produced this */
    sourceAgentId: string;
    /** Content hash for deduplication / integrity */
    checksum: string | null;
    /** Size in bytes (for binary artifacts) */
    sizeBytes: number | null;
    /** Version — incremented on re-generation */
    version: number;
    /** Metadata — flexible key-value for agent-specific info */
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=artifact.types.d.ts.map