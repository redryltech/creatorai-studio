/**
 * AI Memory — stored in `aiMemory/{memoryId}`.
 * One per workspace + optionally one per project.
 */
export interface AIMemory {
    id: string;
    workspaceId: string;
    projectId: string | null;
    userId: string;
    /** Writing style preferences */
    writingStyle: WritingStyleMemory;
    /** Audience information */
    audience: AudienceMemory;
    /** Content strategy */
    contentStrategy: ContentStrategyMemory;
    /** Prompt presets — reusable prompt fragments */
    promptPresets: PromptPreset[];
    /** Global negative prompts (always appended to image generation) */
    globalNegativePrompts: string[];
    /** Custom instructions appended to every agent system prompt */
    customInstructions: string;
    /** Key facts the AI should remember */
    facts: string[];
    /** Things the AI should never say/do */
    restrictions: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface WritingStyleMemory {
    tone: string;
    vocabulary: 'simple' | 'moderate' | 'advanced';
    sentenceLength: 'short' | 'medium' | 'long';
    useEmojis: boolean;
    useHashtags: boolean;
    persona: string;
    samplePhrases: string[];
    avoidPhrases: string[];
}
export interface AudienceMemory {
    primaryAge: string;
    interests: string[];
    painPoints: string[];
    contentPreferences: string[];
    platforms: string[];
    languages: string[];
}
export interface ContentStrategyMemory {
    contentPillars: string[];
    postingFrequency: string;
    bestPerformingTopics: string[];
    contentGoals: string[];
    competitorChannels: string[];
    callToActions: string[];
}
export interface PromptPreset {
    id: string;
    name: string;
    category: 'system' | 'image' | 'video' | 'voice' | 'seo';
    prompt: string;
    isDefault: boolean;
}
/**
 * Brand Profile — stored in `brandProfiles/{profileId}`.
 * Reusable across projects within a workspace.
 */
export interface BrandProfile {
    id: string;
    workspaceId: string;
    userId: string;
    name: string;
    description: string;
    /** Brand identity */
    identity: BrandIdentity;
    /** Visual style */
    visualStyle: BrandVisualStyle;
    /** Voice & tone */
    voiceTone: BrandVoiceTone;
    /** Content rules */
    contentRules: BrandContentRules;
    /** Whether this is the default brand for the workspace */
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface BrandIdentity {
    brandName: string;
    tagline: string;
    mission: string;
    values: string[];
    industry: string;
    website: string | null;
    logoUrl: string | null;
}
export interface BrandVisualStyle {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string | null;
    artStyle: string | null;
    imageStyle: string;
    thumbnailStyle: string;
}
export interface BrandVoiceTone {
    tone: string;
    personality: string[];
    preferredVoiceId: string | null;
    languageStyle: string;
    sampleScript: string | null;
}
export interface BrandContentRules {
    mustInclude: string[];
    mustAvoid: string[];
    hashtagSets: Record<string, string[]>;
    ctaTemplates: string[];
    keywordDensity: string[];
    forbiddenWords: string[];
}
/**
 * Merged memory context — assembled by MemoryLoader and injected
 * into agent system prompts.
 */
export interface MergedMemoryContext {
    workspaceMemory: AIMemory | null;
    projectMemory: AIMemory | null;
    brandProfile: BrandProfile | null;
    /** Pre-rendered system prompt injection (the AI reads this) */
    systemPromptInjection: string;
    /** Pre-rendered negative prompt additions */
    negativePromptAdditions: string[];
    /** Pre-rendered CTA templates */
    ctaTemplates: string[];
}
//# sourceMappingURL=memory.types.d.ts.map