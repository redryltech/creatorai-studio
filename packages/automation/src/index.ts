// ============================================================
// @creatorai/automation — AI Automation Engine
// ============================================================

// Sprint 1: Intelligence Layer
export * from './types/automation.types';
export type { IAutomationAgent, IResearchProvider, ProgressCallback, CancellationToken } from './interfaces/automation-agent.interface';
export { AutomationRegistry } from './registry/automation-registry';
export { MasterAgent } from './master/master-agent';
export { ResearchAgent } from './research/research-agent';
export { ContentPlannerAgent } from './planning/content-planner';
export { ScriptPlannerAgent } from './planning/script-planner';
export { WorkflowManager } from './workflow/workflow-manager';

// Sprint 2: Media Factory
export * from './media/types/media.types';
export { MediaProviderRegistry } from './media/registry/media-provider-registry';
export { PromptOptimizerAgent } from './media/prompt-optimizer/prompt-optimizer';
export { ImageGenerationAgent } from './media/agents/image-gen-agent';
export { VoiceGenerationAgent } from './media/agents/voice-gen-agent';
export { VideoGenerationAgent } from './media/agents/video-gen-agent';
export { MusicAgent } from './media/agents/music-agent';
export { ReplicateImageMediaProvider, type ReplicateImageConfig } from './media/providers/replicate-image.provider';
export { PollinationsImageProvider, type PollinationsImageConfig } from './media/providers/pollinations-image.provider';
export { GeminiImageProvider, type GeminiImageConfig } from './media/providers/gemini-image.provider';
export { ElevenLabsVoiceMediaProvider, type ElevenLabsVoiceConfig } from './media/providers/elevenlabs-voice.provider';
export { MockImageProvider } from './media/providers/mock-image.provider';
export { MockVoiceProvider } from './media/providers/mock-voice.provider';

// Sprint 3: Video Production
// Research Intelligence Engine
export * from './research-intelligence/index';

// AI Director Engine
export * from './director/index';

// Storyboard Engine
export * from './storyboard/index';

// Character Consistency Engine
export * from './character/index';

// Scene Graph Engine
export * from './scene-graph/index';

// World State Engine
export * from './world-state/index';

// Asset Memory & Brand Kit Engine
export * from './asset-memory/index';

// Image Intelligence Engine
export * from './image-intelligence/index';

// AI Prompt Compiler
export * from './prompt-compiler/index';

// Creator Success Engine
export * from './creator-success/index';

// AI Thumbnail Generator
export * from './thumbnail-engine/index';

// AI Video Upscaler
export * from './video-upscaler/index';

// AI Translation Engine
export * from './translation-engine/index';

// AI Sound Effects Engine
export * from './sound-effects/index';

// Video Providers
export * from './video/providers/index';

// Music Engine
export * from './music/index';

export * from './video/types/video-production.types';
export { TimelineBuilderAgent } from './video/timeline/timeline-builder';
export { CaptionGeneratorAgent } from './video/captions/caption-generator';
export { TransitionEngineAgent } from './video/transitions/transition-engine';
export { EffectEngineAgent } from './video/effects/effect-engine';
export { RenderEngineAgent } from './video/renderer/render-engine';
export { QualityCheckerAgent } from './video/quality/quality-checker';

// Sprint 4: Publishing
export * from './publishing/types/publishing.types';
export { PublisherRegistry } from './publishing/registry/publisher-registry';
export { YouTubePublisher } from './publishing/providers/youtube.publisher';
export { GenericPublisher, TikTokPublisher, FacebookPublisher, LinkedInPublisher, XPublisher } from './publishing/providers/generic.publisher';
export { InstagramPublisher, type InstagramPublisherConfig } from './publishing/providers/instagram.publisher';
export { SEOGeneratorAgent } from './publishing/seo/seo-agent';
export { PublishQueue } from './publishing/queue/publish-queue';
export { PublishHistory } from './publishing/history/publish-history';
export { ContentCalendarManager } from './publishing/calendar/content-calendar';

// Sprint 5: Intelligence & Learning
export * from './intelligence/types/intelligence.types';
export { AnalyticsEngine } from './intelligence/analytics/analytics-engine';
export { LearningEngine } from './intelligence/learning/learning-engine';
export { PromptEvolutionEngine } from './intelligence/prompts/prompt-evolution';
export { ContentStrategistAgent } from './intelligence/strategy/content-strategist';
export { PerformancePredictorAgent } from './intelligence/predictor/performance-predictor';
export { TrendMonitorAgent } from './intelligence/trends/trend-monitor';
export { KnowledgeBase } from './intelligence/knowledge/knowledge-base';
export { InsightEngine } from './intelligence/insights/insight-engine';

// Sprint 6: Enterprise SaaS
export * from './enterprise/types/enterprise.types';
export { BillingService } from './enterprise/billing/billing-service';
export { UsageTracker } from './enterprise/usage/usage-tracker';
export { TeamService } from './enterprise/teams/team-service';
export { NotificationService } from './enterprise/notifications/notification-service';
export { ApiKeyService } from './enterprise/api-keys/api-key-service';
export { MarketplaceService } from './enterprise/marketplace/marketplace-service';
export { FeatureFlagService } from './enterprise/config/feature-flags';
export { AdminService } from './enterprise/admin/admin-service';
