// ============================================================
// CreatorAI Studio — Agent Direct Invocation Routes
// ============================================================
// These endpoints let the frontend call agents directly
// (outside a pipeline). Used for one-off operations like
// "generate a script" or "create a thumbnail."
//
// In pipeline mode, agents are invoked by the PipelineRunner.
// These routes exist for flexibility and testing.
// ============================================================

import { Router, type Request, type Response, type NextFunction } from 'express';
import { validate } from '../middleware/validator.middleware';
import { asyncHandler } from '../middleware/async-handler';
import {
  scriptGenerateSchema,
  imageGenerateSchema,
  voiceGenerateSchema,
} from '@creatorai/shared';
import {
  AgentRegistry,
  createStandaloneContext,
  type ScriptAgentInput,
  type PromptAgentInput,
  type ImageAgentInput,
  type VoiceAgentInput,
} from '@creatorai/agents';
import { ContentType, Platform, ScriptStyle, ArtStyle, AspectRatio, AgentId } from '@creatorai/shared';

const router = Router();

/**
 * POST /api/v1/agents/script/generate
 * Generate a video script.
 */
router.post(
  '/script/generate',
  validate(scriptGenerateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const body = req.body;

      const agent = AgentRegistry.getInstance().getOrThrow(AgentId.SCRIPT);
      const context = createStandaloneContext(userId);

      const input: ScriptAgentInput = {
        topic: body.topic,
        contentType: body.contentType as ContentType,
        targetPlatform: body.targetPlatform as Platform,
        duration: body.duration,
        style: (body.style as ScriptStyle) ?? ScriptStyle.HOOK_STORY_CTA,
        tone: body.tone ?? 'professional',
        language: body.language ?? 'en',
        keyPoints: body.keyPoints,
        brandVoice: body.brandVoice,
      };

      const result = await agent.execute(input, context);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: {
            code: result.error?.code ?? 'AGENT_ERROR',
            message: result.error?.message ?? 'Script generation failed',
          },
          meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() },
        });
      }

      res.json({
        success: true,
        data: result.data,
        meta: {
          requestId: req.headers['x-request-id'],
          timestamp: new Date().toISOString(),
          metrics: result.metrics,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/v1/agents/image/generate
 * Generate an image from a prompt.
 */
router.post(
  '/image/generate',
  validate(imageGenerateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const body = req.body;

      const agent = AgentRegistry.getInstance().getOrThrow(AgentId.IMAGE);
      const context = createStandaloneContext(userId);

      const input: ImageAgentInput = {
        scenePrompts: [{
          sceneId: 'standalone',
          imagePrompt: {
            positive: body.prompt,
            negative: body.negativePrompt ?? 'blurry, low quality, deformed, text, watermark',
            width: body.width ?? 1024,
            height: body.height ?? 1024,
            guidanceScale: 7.5,
          },
          metadata: {
            character: '',
            environment: '',
            cameraAngle: 'medium shot',
            lighting: 'natural',
            mood: 'neutral',
            colorPalette: [],
          },
        }],
        provider: body.provider,
        model: body.model,
      };

      const result = await agent.execute(input, context);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: { code: result.error?.code ?? 'AGENT_ERROR', message: result.error?.message ?? 'Image generation failed' },
          meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() },
        });
      }

      res.json({
        success: true,
        data: result.data,
        meta: {
          requestId: req.headers['x-request-id'],
          timestamp: new Date().toISOString(),
          metrics: result.metrics,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/v1/agents/voice/generate
 * Generate a voiceover.
 */
router.post(
  '/voice/generate',
  validate(voiceGenerateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const body = req.body;

      const agent = AgentRegistry.getInstance().getOrThrow(AgentId.VOICE);
      const context = createStandaloneContext(userId);

      const input: VoiceAgentInput = {
        scenes: [{
          id: 'standalone',
          order: 1,
          type: 'body',
          narration: body.text,
          visualDescription: '',
          duration: 0,
          notes: '',
          transition: 'cut',
        }],
        voiceId: body.voiceId,
        language: body.language,
        speed: body.speed,
        provider: body.provider,
      };

      const result = await agent.execute(input, context);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: { code: result.error?.code ?? 'AGENT_ERROR', message: result.error?.message ?? 'Voice generation failed' },
          meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() },
        });
      }

      res.json({
        success: true,
        data: result.data,
        meta: {
          requestId: req.headers['x-request-id'],
          timestamp: new Date().toISOString(),
          metrics: result.metrics,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/v1/agents/status
 * Get status and health of all registered agents.
 */
router.get('/status', asyncHandler(async (_req: Request, res: Response) => {
  const registry = AgentRegistry.getInstance();
  const agents = registry.listMetadata();

  const healthChecks = await registry.healthCheckAll();

  const status = agents.map((meta) => {
    const health = healthChecks.get(meta.id);
    return {
      id: meta.id,
      name: meta.name,
      version: meta.version,
      healthy: health?.healthy ?? false,
      provider: health?.details ? (health.details as any).availableProvider ?? null : null,
      latencyMs: health?.latencyMs ?? -1,
    };
  });

  res.json({
    success: true,
    data: {
      totalAgents: agents.length,
      agents: status,
    },
  });
}));

export { router as agentRoutes };
