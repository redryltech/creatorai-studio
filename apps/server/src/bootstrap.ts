// ============================================================
// CreatorAI Studio — Application Bootstrap
// ============================================================
// Initializes ALL services in dependency order.
// This is the single place where everything gets wired together.
//
// Order:
// 1. Logger
// 2. Firebase
// 3. Circuit breakers
// 4. AI Providers (OpenAI, Replicate, ElevenLabs)
// 5. Prompt templates
// 6. Agents
// 7. Job queue
// 8. SSE + event bus wiring
// ============================================================

import { join } from 'path';
import { initializeFirebase } from './config/firebase';
import {
  // Infrastructure
  Logger,
  LogLevel,
  PromptManager,
  CostTracker,
  CircuitBreakerRegistry,
  SSEManager,
  JobQueue,
  // Agents
  AgentRegistry,
  ScriptAgent,
  PromptAgent,
  ImageAgent,
  VoiceAgent,
  EditorAgent,
  // Prompt templates
  SCRIPT_PROMPT_TEMPLATES,
  PROMPT_GENERATOR_TEMPLATES,
} from '@creatorai/agents';
import {
  ProviderRegistry,
  OpenAIProvider,
  GeminiProvider,
  MockLLMProvider,
  ReplicateImageProvider,
  ElevenLabsProvider,
} from '@creatorai/providers';
import {
  PipelineEventBus,
  WorkflowEventEmitter,
  INTENT_PARSER_TEMPLATE,
} from '@creatorai/orchestrator';
import {
  AutomationRegistry,
  // ResearchAgent — superseded by ResearchIntelligenceAgent
  ContentPlannerAgent,
  ScriptPlannerAgent,
  WorkflowManager,
  MediaProviderRegistry,
  ReplicateImageMediaProvider,
  PollinationsImageProvider,
  GeminiImageProvider,
  ElevenLabsVoiceMediaProvider,
  MockImageProvider,
  MockVoiceProvider,
  // Video providers
  VideoProviderRegistry,
  MockVideoProvider,
  // Research Intelligence + AI Director + Storyboard + Character + Scene Graph + World State + Asset Memory
  ResearchIntelligenceAgent,
  DirectorAgent,
  DirectorRegistry,
  StoryboardAgent,
  CharacterAgent,
  SceneGraphAgent,
  WorldStateAgent,
  AssetMemoryAgent,
  ImageIntelligenceAgent,
  PromptCompilerAgent,
  CreatorSuccessAgent,
  // Music engine
  MusicProviderRegistry,
  LocalMusicProvider,
  PromptOptimizerAgent,
  ImageGenerationAgent,
  VoiceGenerationAgent,
  VideoGenerationAgent,
  MusicAgent,
  // Sprint 3: Video Production
  TimelineBuilderAgent,
  CaptionGeneratorAgent,
  TransitionEngineAgent,
  EffectEngineAgent,
  RenderEngineAgent,
  QualityCheckerAgent,
  // Sprint 4: Publishing
  PublisherRegistry,
  YouTubePublisher,
  InstagramPublisher,
  TikTokPublisher, FacebookPublisher, LinkedInPublisher, XPublisher,
  SEOGeneratorAgent,
  PublishQueue,
  PublishHistory,
  ContentCalendarManager,
  // Sprint 5: Intelligence
  AnalyticsEngine,
  LearningEngine,
  ContentStrategistAgent,
  PerformancePredictorAgent,
  TrendMonitorAgent,
  PromptEvolutionEngine,
  KnowledgeBase,
  InsightEngine,
  // Sprint 6: Enterprise
  BillingService,
  UsageTracker,
  TeamService,
  NotificationService,
  ApiKeyService,
  MarketplaceService,
  FeatureFlagService,
  AdminService,
} from '@creatorai/automation';
import { env, isDevelopment } from './config/env';

const log = Logger.for('Bootstrap');

export async function bootstrap(): Promise<void> {
  const startTime = performance.now();

  console.log('');
  console.log('┌──────────────────────────────────────────────┐');
  console.log('│   🚀 CreatorAI Studio — Bootstrapping...     │');
  console.log('└──────────────────────────────────────────────┘');

  // ── 1. Logger ──────────────────────────────────────────
  Logger.configure({
    level: isDevelopment ? LogLevel.DEBUG : LogLevel.INFO,
    serviceName: 'creatorai-api',
  });
  log.info('Logger configured');

  // ── 2. Firebase ────────────────────────────────────────
  initializeFirebase();

  // ── 3. Circuit Breakers ────────────────────────────────
  const cbRegistry = CircuitBreakerRegistry.getInstance();
  const providerIds = ['openai', 'anthropic', 'replicate', 'elevenlabs', 'runway', 'openai_tts', 'openai_dalle'];
  for (const id of providerIds) {
    cbRegistry.getBreaker(id, {
      failureThreshold: 5,
      resetTimeoutMs: 60000,
      errorRateThreshold: 0.5,
    });
  }
  log.info('Circuit breakers initialized', { count: providerIds.length });

  // ── 4. AI Providers (with Development Mode fallbacks) ──
  const providerRegistry = ProviderRegistry.getInstance();
  const devMode = env.DEVELOPMENT_MODE && !env.OPENAI_API_KEY && !env.GEMINI_API_KEY;

  // LLM Provider: OpenAI (paid) → Gemini (free) → Mock (zero cost)
  if (env.OPENAI_API_KEY) {
    const openai = new OpenAIProvider({
      apiKey: env.OPENAI_API_KEY,
      defaultModel: env.OPENAI_MODEL,
      timeoutMs: env.OPENAI_TIMEOUT,
      maxRetries: 2,
    });
    openai.setCircuitBreaker(cbRegistry.getBreaker('openai'));
    providerRegistry.register(openai, 'llm', 0);
    log.info('✅ LLM: OpenAI (production)', { model: env.OPENAI_MODEL });
  } else if (env.GEMINI_API_KEY) {
    const gemini = new GeminiProvider({
      apiKey: env.GEMINI_API_KEY,
      defaultModel: 'gemini-3.1-flash-lite',
      timeoutMs: 120000,
    });
    providerRegistry.register(gemini, 'llm', 0);
    log.info('✅ LLM: Google Gemini (free tier — gemini-3.1-flash-lite with auto-fallback)');
  } else {
    providerRegistry.register(new MockLLMProvider(), 'llm', 99);
    log.info('⚡ LLM: Mock Provider (dev mode — zero cost, no API key needed)');
  }

  // Image Provider: Replicate (paid) → already handled in media registry below
  if (env.REPLICATE_API_TOKEN) {
    const replicate = new ReplicateImageProvider(env.REPLICATE_API_TOKEN);
    replicate.setCircuitBreaker(cbRegistry.getBreaker('replicate'));
    providerRegistry.register(replicate, 'image', 0);
    log.info('✅ Images: Replicate (production)');
  } else {
    log.info('⚡ Images: Mock Provider (dev mode — colored placeholders)');
  }

  // Voice Provider: ElevenLabs (paid) → already handled in media registry below
  if (env.ELEVENLABS_API_KEY) {
    const elevenlabs = new ElevenLabsProvider(env.ELEVENLABS_API_KEY);
    elevenlabs.setCircuitBreaker(cbRegistry.getBreaker('elevenlabs'));
    providerRegistry.register(elevenlabs, 'voice', 0);
    log.info('✅ Voice: ElevenLabs (production)');
  } else {
    log.info('⚡ Voice: Mock Provider (dev mode — sine tone audio)');
  }

  log.info('Provider registry populated', {
    llm: providerRegistry.listByCategory('llm'),
    image: providerRegistry.listByCategory('image'),
    voice: providerRegistry.listByCategory('voice'),
    developmentMode: devMode,
  });

  // ── 5. Prompt Templates ────────────────────────────────
  const promptManager = PromptManager.getInstance();
  promptManager.registerAll(SCRIPT_PROMPT_TEMPLATES);
  promptManager.registerAll(PROMPT_GENERATOR_TEMPLATES);
  promptManager.register(INTENT_PARSER_TEMPLATE);
  log.info('Prompt templates registered', { count: promptManager.size });

  // ── 6. Agents ──────────────────────────────────────────
  const agentRegistry = AgentRegistry.getInstance();
  agentRegistry.register(new ScriptAgent());
  agentRegistry.register(new PromptAgent());
  agentRegistry.register(new ImageAgent());
  agentRegistry.register(new VoiceAgent());
  agentRegistry.register(new EditorAgent());
  log.info('Agents registered', { agents: agentRegistry.listIds() });

  // ── 7. Cost Tracker ────────────────────────────────────
  CostTracker.getInstance();
  log.info('Cost tracker initialized');

  // ── 8. Job Queue ───────────────────────────────────────
  const jobQueue = JobQueue.getInstance({
    concurrency: isDevelopment ? 2 : 5,
    defaultMaxAttempts: 3,
    defaultExpiryMs: 30 * 60 * 1000,
    pollIntervalMs: 1000,
  });
  jobQueue.start();
  log.info('Job queue started');

  // ── 9. SSE + Event Bus Wiring ──────────────────────────
  const sseManager = SSEManager.getInstance();
  const eventBus = PipelineEventBus.getInstance();

  // Pipeline events → SSE
  eventBus.subscribeAll((event) => {
    sseManager.broadcast({
      event: event.type,
      data: {
        ...event.data,
        pipelineId: event.pipelineId,
        projectId: event.projectId,
        timestamp: event.timestamp.toISOString(),
      },
      userId: event.userId,
      pipelineId: event.pipelineId,
      projectId: event.projectId,
    });
  });

  // Job events → SSE
  jobQueue.on('job.started', (job) => {
    sseManager.sendToUser(job.userId, 'job.started', { jobId: job.id, type: job.type, agentId: job.agentId });
  });
  jobQueue.on('job.progress', (job) => {
    sseManager.sendToUser(job.userId, 'job.progress', { jobId: job.id, progress: job.progress });
  });
  jobQueue.on('job.completed', (job) => {
    sseManager.sendToUser(job.userId, 'job.completed', { jobId: job.id, type: job.type, output: job.output });
  });
  jobQueue.on('job.failed', (job) => {
    sseManager.sendToUser(job.userId, 'job.failed', { jobId: job.id, type: job.type, error: job.error });
  });

  log.info('Pipeline event bus → SSE bridge connected');

  // Workflow events → SSE (Phase 3 orchestration layer)
  const workflowEvents = WorkflowEventEmitter.getInstance();
  workflowEvents.onAll((event) => {
    sseManager.broadcast({
      event: event.type,
      data: {
        ...event.data,
        workflowRunId: event.workflowRunId,
        projectId: event.projectId,
        timestamp: event.timestamp.toISOString(),
      },
      userId: event.userId,
      projectId: event.projectId,
    });
  });
  log.info('Workflow event emitter → SSE bridge connected');

  // ── 10. Automation Engine ─────────────────────────────
  const automationRegistry = AutomationRegistry.getInstance();
  // Sprint 1: Intelligence agents
  // ResearchAgent (old, 190 LOC) superseded by ResearchIntelligenceAgent (1,309 LOC)
  automationRegistry.registerAgent(new ResearchIntelligenceAgent());
  automationRegistry.registerAgent(new ContentPlannerAgent());
  automationRegistry.registerAgent(new ScriptPlannerAgent());
  // AI Director (sits between Script → Storyboard → Prompt Optimizer)
  automationRegistry.registerAgent(new DirectorAgent());
  automationRegistry.registerAgent(new StoryboardAgent());
  automationRegistry.registerAgent(new CharacterAgent());
  automationRegistry.registerAgent(new SceneGraphAgent());
  automationRegistry.registerAgent(new WorldStateAgent());
  automationRegistry.registerAgent(new AssetMemoryAgent());
  automationRegistry.registerAgent(new ImageIntelligenceAgent());
  automationRegistry.registerAgent(new PromptCompilerAgent());
  // Sprint 2: Media Factory agents
  automationRegistry.registerAgent(new PromptOptimizerAgent());
  automationRegistry.registerAgent(new ImageGenerationAgent());
  automationRegistry.registerAgent(new VoiceGenerationAgent());
  automationRegistry.registerAgent(new VideoGenerationAgent());
  automationRegistry.registerAgent(new MusicAgent());
  // Sprint 3: Video production agents
  automationRegistry.registerAgent(new TimelineBuilderAgent());
  automationRegistry.registerAgent(new CaptionGeneratorAgent());
  automationRegistry.registerAgent(new TransitionEngineAgent());
  automationRegistry.registerAgent(new EffectEngineAgent());
  automationRegistry.registerAgent(new RenderEngineAgent());
  automationRegistry.registerAgent(new QualityCheckerAgent());
  // Creator Success Engine (post-render, pre-publish)
  automationRegistry.registerAgent(new CreatorSuccessAgent());
  // Sprint 4: Publishing agents
  automationRegistry.registerAgent(new SEOGeneratorAgent());

  // ── 11. Publisher Registry ────────────────────────────
  const publisherRegistry = PublisherRegistry.getInstance();
  const ytPublisher = new YouTubePublisher();
  if (env.YOUTUBE_CLIENT_ID && env.YOUTUBE_CLIENT_SECRET) {
    ytPublisher.configure({
      clientId: env.YOUTUBE_CLIENT_ID,
      clientSecret: env.YOUTUBE_CLIENT_SECRET,
      redirectUri: env.YOUTUBE_REDIRECT_URI,
    });
    log.info('YouTube publisher configured with OAuth');
  }
  publisherRegistry.register(ytPublisher);
  const igPublisher = new InstagramPublisher();
  if (env.INSTAGRAM_APP_ID && env.INSTAGRAM_APP_SECRET) {
    igPublisher.configure({
      appId: env.INSTAGRAM_APP_ID,
      appSecret: env.INSTAGRAM_APP_SECRET,
      graphVersion: env.INSTAGRAM_GRAPH_VERSION,
    });
    log.info('Instagram publisher configured with Graph API');
  }
  publisherRegistry.register(igPublisher);
  publisherRegistry.register(TikTokPublisher);
  publisherRegistry.register(FacebookPublisher);
  publisherRegistry.register(LinkedInPublisher);
  publisherRegistry.register(XPublisher);

  PublishQueue.getInstance();
  PublishHistory.getInstance();
  ContentCalendarManager.getInstance();

  log.info('Publishing engine initialized', { publishers: publisherRegistry.listPlatforms() });

  // ── 12. Intelligence Engine ───────────────────────────
  automationRegistry.registerAgent(new AnalyticsEngine());
  automationRegistry.registerAgent(new LearningEngine());
  automationRegistry.registerAgent(new ContentStrategistAgent());
  automationRegistry.registerAgent(new PerformancePredictorAgent());
  automationRegistry.registerAgent(new TrendMonitorAgent());
  PromptEvolutionEngine.getInstance();
  KnowledgeBase.getInstance();
  InsightEngine.getInstance();
  log.info('Intelligence engine initialized', { agents: automationRegistry.listAgentIds().filter((id) => id.startsWith('intelligence.')) });

  // ── 13. Enterprise SaaS ──────────────────────────────
  BillingService.getInstance();
  UsageTracker.getInstance();
  TeamService.getInstance();
  NotificationService.getInstance();
  ApiKeyService.getInstance();
  MarketplaceService.getInstance();
  FeatureFlagService.getInstance();
  AdminService.getInstance();
  log.info('Enterprise SaaS initialized', { featureFlags: FeatureFlagService.getInstance().getAll().length });

  WorkflowManager.getInstance();
  const mediaRegistry = MediaProviderRegistry.getInstance();

  // ── Register Image Providers (priority chain) ──
  // Priority: Replicate (0, paid) → Gemini Image (5, free/quota) → Pollinations (10, free) → Mock (99)
  // The MediaProviderRegistry.getPrimary() tries each by priority, skipping unavailable ones.

  const registeredImageProviders: string[] = [];

  // Priority 0: Replicate (paid, best quality)
  if (env.REPLICATE_API_TOKEN) {
    mediaRegistry.register(new ReplicateImageMediaProvider({
      apiToken: env.REPLICATE_API_TOKEN,
      defaultModel: env.REPLICATE_DEFAULT_MODEL,
      timeoutMs: env.REPLICATE_TIMEOUT,
    }));
    registeredImageProviders.push('Replicate (priority 0, paid)');
  }

  // Priority 5: Gemini Image (free, quota-limited)
  if (env.GEMINI_API_KEY) {
    mediaRegistry.register(new GeminiImageProvider({
      apiKey: env.GEMINI_API_KEY,
      targetWidth: 1080,
      targetHeight: 1920,
    }));
    registeredImageProviders.push('Gemini Image (priority 5, free/quota)');
  }

  // Priority 10: Pollinations.ai (free, always available, no API key)
  mediaRegistry.register(new PollinationsImageProvider({
    targetWidth: 1080,
    targetHeight: 1920,
    enhancePrompts: true,
    model: 'flux',
  }));
  registeredImageProviders.push('Pollinations/Flux (priority 10, free)');

  // Priority 99: Mock (fallback, no network needed)
  mediaRegistry.register(new MockImageProvider());
  registeredImageProviders.push('Mock (priority 99, fallback)');

  log.info('✅ Image providers registered', {
    count: registeredImageProviders.length,
    chain: registeredImageProviders.join(' → '),
  });

  // Register voice provider: ElevenLabs (production) or Mock (dev mode)
  if (env.ELEVENLABS_API_KEY) {
    mediaRegistry.register(new ElevenLabsVoiceMediaProvider({
      apiKey: env.ELEVENLABS_API_KEY,
      defaultVoiceId: env.ELEVENLABS_DEFAULT_VOICE,
      defaultModel: env.ELEVENLABS_MODEL,
      timeoutMs: env.ELEVENLABS_TIMEOUT,
    }));
    log.info('✅ Media voice: ElevenLabs', { model: env.ELEVENLABS_MODEL });
  } else {
    mediaRegistry.register(new MockVoiceProvider());
    log.info('⚡ Media voice: Mock (dev mode — sine tone MP3)');
  }

  // ── Register Video Providers (priority chain) ──
  // Priority: Google Veo (10) → Runway (15) → Kling (20) → Luma (25) → Pika (30) → Mock (99)
  // Only MockVideoProvider is active now. Future providers plug in via env vars.
  const videoRegistry = VideoProviderRegistry.getInstance();

  // Future: if (env.GOOGLE_VEO_API_KEY) videoRegistry.register(new GoogleVeoProvider(...))
  // Future: if (env.RUNWAY_API_KEY)      videoRegistry.register(new RunwayProvider(...))
  // Future: if (env.KLING_API_KEY)       videoRegistry.register(new KlingProvider(...))
  // Future: if (env.LUMA_API_KEY)        videoRegistry.register(new LumaProvider(...))
  // Future: if (env.PIKA_API_KEY)        videoRegistry.register(new PikaProvider(...))

  videoRegistry.register(new MockVideoProvider());
  log.info('✅ Video providers registered', {
    active: env.VIDEO_PROVIDER,
    chain: videoRegistry.listProviders().map((p) => `${p.name} (${p.priority})`).join(' → '),
    count: videoRegistry.size,
  });

  // ── Register Music Providers ──
  const musicRegistry = MusicProviderRegistry.getInstance();
  const musicDir = join(__dirname, '../../../assets/music');
  musicRegistry.register(new LocalMusicProvider({ musicDir }));
  // Future: if (env.SPOTIFY_API_KEY) musicRegistry.register(new SpotifyProvider(...))
  // Future: if (env.EPIDEMIC_API_KEY) musicRegistry.register(new EpidemicSoundProvider(...))
  log.info('✅ Music providers registered', { count: musicRegistry.size, ids: musicRegistry.listIds() });

  log.info('Automation engine initialized', {
    agents: automationRegistry.listAgentIds(),
    mediaProviders: MediaProviderRegistry.getInstance().listIds(),
    videoProviders: VideoProviderRegistry.getInstance().listIds(),
    researchProviders: automationRegistry.getResearchProviders().length,
  });

  // Periodic cleanup
  setInterval(() => jobQueue.cleanup(), 5 * 60 * 1000);

  const durationMs = Math.round(performance.now() - startTime);
  log.info(`Bootstrap completed in ${durationMs}ms`);

  console.log('');
  console.log('┌──────────────────────────────────────────────┐');
  console.log('│   ✅ All systems initialized                 │');
  console.log(`│   Agents:    ${agentRegistry.listIds().length} registered                   │`);
  console.log(`│   Providers: ${providerRegistry.listIds().length} registered                   │`);
  console.log(`│   Prompts:   ${promptManager.size} templates                    │`);
  console.log('└──────────────────────────────────────────────┘');
  console.log('');
}
