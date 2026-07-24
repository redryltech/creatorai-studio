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
export var IntentAction;
(function (IntentAction) {
    IntentAction["CREATE_VIDEO"] = "create_video";
    IntentAction["CREATE_THUMBNAIL"] = "create_thumbnail";
    IntentAction["GENERATE_SCRIPT"] = "generate_script";
    IntentAction["GENERATE_VOICEOVER"] = "generate_voiceover";
    IntentAction["GENERATE_IMAGE"] = "generate_image";
    IntentAction["RESEARCH_TRENDS"] = "research_trends";
    IntentAction["GENERATE_IDEAS"] = "generate_ideas";
    IntentAction["GENERATE_SEO"] = "generate_seo";
    IntentAction["SCHEDULE_POST"] = "schedule_post";
    IntentAction["PUBLISH_NOW"] = "publish_now";
    IntentAction["EDIT_PROJECT"] = "edit_project";
    IntentAction["GET_ANALYTICS"] = "get_analytics";
    IntentAction["TRANSLATE"] = "translate";
    IntentAction["REWRITE"] = "rewrite";
    IntentAction["SUMMARIZE"] = "summarize";
    IntentAction["OPTIMIZE"] = "optimize";
    IntentAction["GENERAL_CHAT"] = "general_chat";
})(IntentAction || (IntentAction = {}));
/**
 * Default entity values when not specified by the user.
 */
export const DEFAULT_ENTITIES = {
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
//# sourceMappingURL=intent.types.js.map