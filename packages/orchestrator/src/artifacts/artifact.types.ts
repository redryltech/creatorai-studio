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

export enum ArtifactType {
  SCRIPT = 'script',
  SCENE_PROMPTS = 'scene_prompts',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  VOICEOVER = 'voiceover',
  THUMBNAIL = 'thumbnail',
  SEO_METADATA = 'seo_metadata',
  SUBTITLE = 'subtitle',
  COMPOSED_VIDEO = 'composed_video',
  TREND_RESEARCH = 'trend_research',
  GENERIC = 'generic',
}

export enum ArtifactStatus {
  PENDING = 'pending',
  READY = 'ready',
  FAILED = 'failed',
  DELETED = 'deleted',
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
