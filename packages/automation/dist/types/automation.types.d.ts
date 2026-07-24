import { z } from 'zod';
export declare const AutomationRequestSchema: z.ZodObject<{
    topic: z.ZodString;
    platform: z.ZodEnum<["youtube", "youtube_shorts", "instagram", "instagram_reels", "tiktok", "facebook", "linkedin", "x", "pinterest"]>;
    language: z.ZodDefault<z.ZodString>;
    audience: z.ZodOptional<z.ZodString>;
    videoCount: z.ZodDefault<z.ZodNumber>;
    duration: z.ZodOptional<z.ZodNumber>;
    tone: z.ZodDefault<z.ZodEnum<["professional", "casual", "dramatic", "humorous", "inspirational", "informative", "educational", "storytelling"]>>;
    style: z.ZodOptional<z.ZodString>;
    brandProfileId: z.ZodOptional<z.ZodString>;
    additionalInstructions: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    topic: string;
    platform: "youtube" | "youtube_shorts" | "instagram" | "instagram_reels" | "tiktok" | "facebook" | "linkedin" | "x" | "pinterest";
    language: string;
    videoCount: number;
    tone: "professional" | "casual" | "dramatic" | "humorous" | "inspirational" | "informative" | "educational" | "storytelling";
    audience?: string | undefined;
    duration?: number | undefined;
    style?: string | undefined;
    brandProfileId?: string | undefined;
    additionalInstructions?: string | undefined;
}, {
    topic: string;
    platform: "youtube" | "youtube_shorts" | "instagram" | "instagram_reels" | "tiktok" | "facebook" | "linkedin" | "x" | "pinterest";
    language?: string | undefined;
    audience?: string | undefined;
    videoCount?: number | undefined;
    duration?: number | undefined;
    tone?: "professional" | "casual" | "dramatic" | "humorous" | "inspirational" | "informative" | "educational" | "storytelling" | undefined;
    style?: string | undefined;
    brandProfileId?: string | undefined;
    additionalInstructions?: string | undefined;
}>;
export type AutomationRequest = z.infer<typeof AutomationRequestSchema>;
export interface Trend {
    query: string;
    volume: number;
    growth: number;
    timeframe: string;
    platform: string;
    relatedQueries: string[];
}
export interface Keyword {
    term: string;
    searchVolume: number;
    competition: 'low' | 'medium' | 'high';
    relevanceScore: number;
    intent: 'informational' | 'navigational' | 'transactional' | 'commercial';
}
export interface Competitor {
    name: string;
    platform: string;
    subscriberCount: number | null;
    recentVideoCount: number;
    averageViews: number;
    topPerformingTopics: string[];
    contentGaps: string[];
    strengths: string[];
    weaknesses: string[];
}
export interface AudienceProfile {
    primaryAge: string;
    interests: string[];
    painPoints: string[];
    contentPreferences: string[];
    activePlatforms: string[];
    peakActivityHours: string[];
    languagePreferences: string[];
}
export interface ResearchReport {
    id: string;
    requestId: string;
    topic: string;
    platform: string;
    trends: Trend[];
    keywords: Keyword[];
    competitors: Competitor[];
    audience: AudienceProfile;
    topAngles: string[];
    contentGaps: string[];
    references: Array<{
        title: string;
        url: string;
        source: string;
        relevance: number;
    }>;
    scores: {
        trendScore: number;
        difficultyScore: number;
        opportunityScore: number;
        confidenceScore: number;
    };
    metadata: {
        sourcesQueried: number;
        processingTimeMs: number;
        generatedAt: Date;
    };
}
export interface ContentIdea {
    id: string;
    title: string;
    description: string;
    angle: string;
    targetKeywords: string[];
    estimatedViews: string;
    difficulty: 'easy' | 'medium' | 'hard';
    priority: number;
    hook: string;
    contentType: string;
}
export interface ContentPlan {
    id: string;
    requestId: string;
    researchReportId: string;
    ideas: ContentIdea[];
    publishingStrategy: {
        frequency: string;
        bestTimes: string[];
        platformNotes: string;
        sequencing: string;
    };
    estimates: {
        totalCostUsd: number;
        totalDurationMinutes: number;
        costPerVideo: number;
        timePerVideoMinutes: number;
    };
    dependencies: string[];
    metadata: {
        plannerModel: string;
        generatedAt: Date;
        processingTimeMs: number;
    };
}
export interface ScriptPackage {
    id: string;
    contentIdeaId: string;
    contentPlanId: string;
    hook: {
        text: string;
        type: 'question' | 'statistic' | 'story' | 'bold_claim' | 'controversy';
        estimatedAttentionGrab: number;
    };
    story: {
        text: string;
        structure: 'problem_solution' | 'journey' | 'listicle' | 'comparison' | 'revelation';
        keyPoints: string[];
    };
    cta: {
        text: string;
        type: 'subscribe' | 'comment' | 'share' | 'visit' | 'follow' | 'like';
        placement: 'end' | 'middle_and_end';
    };
    fullNarration: string;
    scenes: Array<{
        id: string;
        order: number;
        narration: string;
        visualNotes: string;
        cameraAngle: string;
        cameraMovement: string;
        emotion: string;
        duration: number;
        transition: string;
    }>;
    metadata: {
        wordCount: number;
        estimatedDuration: number;
        readabilityScore: number;
        emotionalArc: string[];
        hookStrength: number;
        ctaStrength: number;
        tone: string;
    };
}
export declare enum AutomationStage {
    RESEARCH = "research",
    PLANNING = "planning",
    SCRIPTING = "scripting",
    PROMPT_OPTIMIZATION = "prompt_optimization",
    IMAGE_GENERATION = "image_generation",
    VIDEO_GENERATION = "video_generation",
    VOICE_GENERATION = "voice_generation",
    MUSIC_GENERATION = "music_generation",
    MEDIA = "media",
    EDITING = "editing",
    SEO = "seo",
    REVIEW = "review",
    PUBLISHING = "publishing"
}
export declare enum TaskStatus {
    PENDING = "pending",
    QUEUED = "queued",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    PAUSED = "paused",
    RETRYING = "retrying"
}
export interface WorkflowTask {
    id: string;
    stage: AutomationStage;
    agentId: string;
    label: string;
    status: TaskStatus;
    progress: number;
    input: Record<string, unknown>;
    output: Record<string, unknown> | null;
    error: string | null;
    attempts: number;
    maxAttempts: number;
    startedAt: Date | null;
    completedAt: Date | null;
    durationMs: number | null;
    costUsd: number | null;
    dependsOn: string[];
}
export interface WorkflowMetrics {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    totalCostUsd: number;
    totalDurationMs: number;
    averageTaskDurationMs: number;
    retryCount: number;
}
export interface WorkflowExecution {
    id: string;
    requestId: string;
    userId: string;
    projectId: string;
    status: TaskStatus;
    currentStage: AutomationStage | null;
    tasks: WorkflowTask[];
    metrics: WorkflowMetrics;
    createdAt: Date;
    startedAt: Date | null;
    completedAt: Date | null;
    updatedAt: Date;
}
export interface AgentRuntimeStatus {
    agentId: string;
    agentName: string;
    isRunning: boolean;
    currentTask: string | null;
    progress: number;
    lastError: string | null;
    lastSuccessAt: Date | null;
    totalInvocations: number;
    successRate: number;
}
export interface AutomationPlan {
    id: string;
    request: AutomationRequest;
    stages: AutomationStage[];
    estimatedCostUsd: number;
    estimatedDurationMinutes: number;
    taskCount: number;
    workflow: WorkflowExecution;
    createdAt: Date;
}
export interface AutomationResponse {
    planId: string;
    workflowId: string;
    status: string;
    message: string;
    stages: AutomationStage[];
    estimatedCostUsd: number;
    estimatedDurationMinutes: number;
}
//# sourceMappingURL=automation.types.d.ts.map