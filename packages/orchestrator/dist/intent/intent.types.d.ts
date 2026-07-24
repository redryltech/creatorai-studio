export declare enum IntentAction {
    CREATE_VIDEO = "create_video",
    CREATE_THUMBNAIL = "create_thumbnail",
    GENERATE_SCRIPT = "generate_script",
    GENERATE_VOICEOVER = "generate_voiceover",
    GENERATE_IMAGE = "generate_image",
    RESEARCH_TRENDS = "research_trends",
    GENERATE_IDEAS = "generate_ideas",
    GENERATE_SEO = "generate_seo",
    SCHEDULE_POST = "schedule_post",
    PUBLISH_NOW = "publish_now",
    EDIT_PROJECT = "edit_project",
    GET_ANALYTICS = "get_analytics",
    TRANSLATE = "translate",
    REWRITE = "rewrite",
    SUMMARIZE = "summarize",
    OPTIMIZE = "optimize",
    GENERAL_CHAT = "general_chat"
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
    format: string | null;
    style: string | null;
    tone: string | null;
    duration: number | null;
    language: string;
    voiceId: string | null;
    artStyle: string | null;
    scheduleDate: string | null;
    projectId: string | null;
    priority: 'low' | 'normal' | 'high';
    additionalInstructions: string | null;
}
/**
 * Default entity values when not specified by the user.
 */
export declare const DEFAULT_ENTITIES: IntentEntities;
//# sourceMappingURL=intent.types.d.ts.map