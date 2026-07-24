// ============================================================
// CreatorAI Studio — Intent Types
// ============================================================
// The Intent is the bridge between human language and machine
// execution. Every user message is reduced to a ParsedIntent
// before any planning or execution occurs.
//
// Design:
// - `action` determines WHAT to do (create, edit, research...)
// - `entities` determine the parameters (topic, count, platform...)
// - `confidence` tells the orchestrator whether to proceed or ask
//   for clarification
// - `missingRequired` tells the UI which fields to prompt for
// ============================================================

export enum IntentAction {
  CREATE_VIDEO = 'create_video',
  CREATE_THUMBNAIL = 'create_thumbnail',
  GENERATE_SCRIPT = 'generate_script',
  GENERATE_VOICEOVER = 'generate_voiceover',
  GENERATE_IMAGE = 'generate_image',
  RESEARCH_TRENDS = 'research_trends',
  GENERATE_IDEAS = 'generate_ideas',
  GENERATE_SEO = 'generate_seo',
  SCHEDULE_POST = 'schedule_post',
  PUBLISH_NOW = 'publish_now',
  EDIT_PROJECT = 'edit_project',
  GET_ANALYTICS = 'get_analytics',
  TRANSLATE = 'translate',
  REWRITE = 'rewrite',
  SUMMARIZE = 'summarize',
  OPTIMIZE = 'optimize',
  GENERAL_CHAT = 'general_chat',
}

export interface ParsedIntent {
  /** The primary action to execute */
  action: IntentAction;

  /** Confidence that we parsed the intent correctly (0.0 – 1.0) */
  confidence: number;

  /** Extracted entities from the user message */
  entities: IntentEntities;

  /** The original unmodified user message */
  rawMessage: string;

  /** Fields that were required but could not be extracted */
  missingRequired: string[];

  /** Whether the orchestrator should proceed or ask for clarification */
  requiresClarification: boolean;

  /** Suggested clarification question if confidence is low */
  clarificationQuestion: string | null;
}

export interface IntentEntities {
  topic: string | null;
  count: number;
  contentType: string | null;
  platform: string | null;
  format: string | null;      // short, long, reel, story, etc.
  style: string | null;        // educational, motivational, cinematic, etc.
  tone: string | null;         // professional, casual, dramatic, etc.
  duration: number | null;     // seconds
  language: string;
  voiceId: string | null;
  artStyle: string | null;
  scheduleDate: string | null; // ISO 8601
  projectId: string | null;    // Reference to existing project
  priority: 'low' | 'normal' | 'high';
  additionalInstructions: string | null;
}

/**
 * Default entity values when not specified by the user.
 */
export const DEFAULT_ENTITIES: IntentEntities = {
  topic: null,
  count: 1,
  contentType: null,
  platform: null,
  format: null,
  style: null,
  tone: 'professional',
  duration: null,
  language: 'en',
  voiceId: null,
  artStyle: null,
  scheduleDate: null,
  projectId: null,
  priority: 'normal',
  additionalInstructions: null,
};
