// ============================================================
// CreatorAI Studio — Automation Engine Domain Types
// ============================================================
// These types model the Automation Brain's domain.
// Every object is serializable, strongly typed, and Zod-validated.
//
// Domain model:
//   AutomationRequest → MasterAgent → AutomationPlan
//     → ResearchAgent → ResearchReport
//       → ContentPlanner → ContentPlan
//         → ScriptPlanner → ScriptPackage[]
//           → (future: ImageAgent, VoiceAgent, EditorAgent, PublishAgent)
// ============================================================
import { z } from 'zod';
// ============================================================
// Automation Request — what the user asks for
// ============================================================
export const AutomationRequestSchema = z.object({
    topic: z.string().min(2).max(500),
    platform: z.enum([
        'youtube', 'youtube_shorts', 'instagram', 'instagram_reels',
        'tiktok', 'facebook', 'linkedin', 'x', 'pinterest',
    ]),
    language: z.string().min(2).max(10).default('en'),
    audience: z.string().max(500).optional(),
    videoCount: z.number().int().min(1).max(100).default(1),
    duration: z.number().int().min(5).max(3600).optional(),
    tone: z.enum([
        'professional', 'casual', 'dramatic', 'humorous',
        'inspirational', 'informative', 'educational', 'storytelling',
    ]).default('professional'),
    style: z.string().max(200).optional(),
    brandProfileId: z.string().optional(),
    additionalInstructions: z.string().max(2000).optional(),
});
// ============================================================
// Workflow Execution — state tracking
// ============================================================
export var AutomationStage;
(function (AutomationStage) {
    AutomationStage["RESEARCH"] = "research";
    AutomationStage["PLANNING"] = "planning";
    AutomationStage["SCRIPTING"] = "scripting";
    AutomationStage["PROMPT_OPTIMIZATION"] = "prompt_optimization";
    AutomationStage["IMAGE_GENERATION"] = "image_generation";
    AutomationStage["VIDEO_GENERATION"] = "video_generation";
    AutomationStage["VOICE_GENERATION"] = "voice_generation";
    AutomationStage["MUSIC_GENERATION"] = "music_generation";
    AutomationStage["MEDIA"] = "media";
    AutomationStage["EDITING"] = "editing";
    AutomationStage["SEO"] = "seo";
    AutomationStage["REVIEW"] = "review";
    AutomationStage["PUBLISHING"] = "publishing";
})(AutomationStage || (AutomationStage = {}));
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["QUEUED"] = "queued";
    TaskStatus["RUNNING"] = "running";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["FAILED"] = "failed";
    TaskStatus["CANCELLED"] = "cancelled";
    TaskStatus["PAUSED"] = "paused";
    TaskStatus["RETRYING"] = "retrying";
})(TaskStatus || (TaskStatus = {}));
//# sourceMappingURL=automation.types.js.map