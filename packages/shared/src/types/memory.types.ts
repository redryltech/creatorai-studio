// ============================================================
// CreatorAI Studio — AI Memory & Brand Intelligence Types
// ============================================================
// AI Memory is persistent knowledge that agents load before
// every execution. It ensures the AI produces content that
// matches the user's brand, audience, and style consistently.
//
// Memory hierarchy:
//   Workspace Memory (applies to all projects)
//     └── Brand Profile (applies to projects using that brand)
//       └── Project Memory (project-specific overrides)
//
// When an agent executes, the MemoryLoader merges all layers
// into a single context object injected into the system prompt.
// ============================================================

/**
 * AI Memory — stored in `aiMemory/{memoryId}`.
 * One per workspace + optionally one per project.
 */
export interface AIMemory {
  id: string;
  workspaceId: string;
  projectId: string | null;         // null = workspace-level memory
  userId: string;                    // Who last updated

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
  tone: string;                      // e.g., "professional but approachable"
  vocabulary: 'simple' | 'moderate' | 'advanced';
  sentenceLength: 'short' | 'medium' | 'long';
  useEmojis: boolean;
  useHashtags: boolean;
  persona: string;                   // e.g., "You are a tech industry insider"
  samplePhrases: string[];           // Example phrases that match the brand voice
  avoidPhrases: string[];            // Phrases to never use
}

export interface AudienceMemory {
  primaryAge: string;                // e.g., "18-35"
  interests: string[];               // e.g., ["technology", "startups", "AI"]
  painPoints: string[];              // e.g., ["information overload", "time management"]
  contentPreferences: string[];      // e.g., ["short-form", "data-driven", "storytelling"]
  platforms: string[];               // e.g., ["youtube_shorts", "tiktok", "linkedin"]
  languages: string[];               // e.g., ["en", "es"]
}

export interface ContentStrategyMemory {
  contentPillars: string[];          // e.g., ["AI tutorials", "industry news", "behind the scenes"]
  postingFrequency: string;          // e.g., "3 times per week"
  bestPerformingTopics: string[];
  contentGoals: string[];            // e.g., ["grow subscribers", "drive website traffic"]
  competitorChannels: string[];
  callToActions: string[];           // Preferred CTAs
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
  primaryColor: string;              // hex
  secondaryColor: string;           // hex
  accentColor: string;              // hex
  fontFamily: string | null;
  artStyle: string | null;           // Maps to ArtStyle enum
  imageStyle: string;                // e.g., "clean, modern, minimalist"
  thumbnailStyle: string;            // e.g., "bold text, face close-up, high contrast"
}

export interface BrandVoiceTone {
  tone: string;                      // e.g., "authoritative yet friendly"
  personality: string[];             // e.g., ["expert", "approachable", "innovative"]
  preferredVoiceId: string | null;   // ElevenLabs voice
  languageStyle: string;             // e.g., "conversational, data-backed"
  sampleScript: string | null;       // Reference script that captures the brand voice
}

export interface BrandContentRules {
  mustInclude: string[];             // e.g., ["CTA to subscribe", "brand mention in first 3 seconds"]
  mustAvoid: string[];               // e.g., ["competitor names", "political opinions"]
  hashtagSets: Record<string, string[]>; // platform → hashtags
  ctaTemplates: string[];            // e.g., ["Like and subscribe for more {topic} content!"]
  keywordDensity: string[];          // SEO keywords to prioritize
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
