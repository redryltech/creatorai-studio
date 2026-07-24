// ============================================================
// CreatorAI Studio — Chat Routes (Orchestrator-Backed)
// ============================================================
// The chat route is now the thin HTTP layer over the
// ConversationOrchestrator. It does NOT call agents directly.
//
// Flow:
//   POST /chat/message
//     → ConversationOrchestrator.processMessage()
//       → IntentParser → Planner → WorkflowExecutor (async)
//     → Return intent + plan + workflowRunId immediately
//     → Client subscribes to SSE for progress updates
// ============================================================

import { Router, type Request, type Response, type NextFunction } from 'express';
import { validate } from '../middleware/validator.middleware';
import { chatMessageSchema, paginationSchema } from '@creatorai/shared';
import { ConversationOrchestrator } from '@creatorai/orchestrator';

const router = Router();

// Singleton orchestrator — initialized once, serves all requests
let orchestrator: ConversationOrchestrator | null = null;

function getOrchestrator(): ConversationOrchestrator {
  if (!orchestrator) {
    orchestrator = new ConversationOrchestrator();
  }
  return orchestrator;
}

/**
 * POST /api/v1/chat/message
 * Process a user message through the full orchestration pipeline.
 */
router.post(
  '/message',
  validate(chatMessageSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { message, conversationId, projectId } = req.body;

      const result = await getOrchestrator().processMessage({
        userId,
        conversationId: conversationId ?? null,
        message,
        projectId,
      });

      res.json({
        success: true,
        data: {
          conversationId: result.conversationId,
          response: {
            id: `msg_${Date.now().toString(36)}`,
            role: 'assistant',
            content: result.assistantMessage,
            metadata: {
              intent: result.intent
                ? {
                    action: result.intent.action,
                    confidence: result.intent.confidence,
                    entities: result.intent.entities,
                  }
                : null,
              workflowRunId: result.workflowRunId,
              workflowPlan: result.workflowPlan
                ? {
                    id: result.workflowPlan.id,
                    name: result.workflowPlan.name,
                    nodeCount: result.workflowPlan.nodes.length,
                    estimatedCostUsd: result.workflowPlan.estimatedTotalCostUsd,
                    estimatedDurationSec: result.workflowPlan.estimatedTotalDurationSec,
                  }
                : null,
              requiresClarification: result.requiresClarification,
              clarificationQuestion: result.clarificationQuestion,
            },
          },
        },
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/v1/chat/workflow/:runId/cancel
 * Cancel an active workflow.
 */
router.post('/workflow/:runId/cancel', (req: Request, res: Response) => {
  const { runId } = req.params;
  const cancelled = getOrchestrator().cancelWorkflow(runId!);

  res.json({
    success: true,
    data: { cancelled, runId },
  });
});

/**
 * POST /api/v1/chat/workflow/:runId/pause
 * Pause an active workflow.
 */
router.post('/workflow/:runId/pause', (req: Request, res: Response) => {
  const { runId } = req.params;
  const paused = getOrchestrator().pauseWorkflow(runId!);

  res.json({
    success: true,
    data: { paused, runId },
  });
});

/**
 * POST /api/v1/chat/workflow/:runId/resume
 * Resume a paused workflow.
 */
router.post('/workflow/:runId/resume', (req: Request, res: Response) => {
  const { runId } = req.params;
  const resumed = getOrchestrator().resumeWorkflow(runId!);

  res.json({
    success: true,
    data: { resumed, runId },
  });
});

/**
 * GET /api/v1/chat/conversations
 * List conversations (placeholder — will be backed by Firestore).
 */
router.get('/conversations', validate(paginationSchema, 'query'), (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } },
  });
});

export { router as chatRoutes };
