// ============================================================
// CreatorAI Studio — SSE Events Routes
// ============================================================
// Server-Sent Events endpoint for real-time updates.
//
// Clients connect to:
//   GET /api/v1/events/stream
//   GET /api/v1/events/stream?pipelineId=pipe_xxx
//
// Events are scoped to the authenticated user.
// ============================================================

import { Router, type Request, type Response } from 'express';
import { SSEManager } from '@creatorai/agents';
import { generateId, ID_PREFIXES } from '@creatorai/shared';

const router = Router();

/**
 * GET /api/v1/events/stream
 * SSE connection for real-time updates.
 *
 * Query params:
 *   pipelineId - (optional) Only receive events for this pipeline
 *   projectId  - (optional) Only receive events for this project
 */
router.get('/stream', (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required for SSE' },
    });
    return;
  }

  const clientId = generateId(ID_PREFIXES.step);
  const pipelineId = req.query.pipelineId as string | undefined;
  const projectId = req.query.projectId as string | undefined;

  const sseManager = SSEManager.getInstance();
  sseManager.addClient(clientId, userId, res, {
    pipelineId,
    projectId,
  });

  // Express won't end the response — SSE keeps the connection open.
  // The SSEManager handles cleanup when the client disconnects.
});

/**
 * GET /api/v1/events/status
 * Check SSE service status (useful for debugging).
 */
router.get('/status', (req: Request, res: Response) => {
  const sseManager = SSEManager.getInstance();
  const userId = req.userId;

  res.json({
    success: true,
    data: {
      totalClients: sseManager.clientCount,
      userClients: userId ? sseManager.getUserClientCount(userId) : 0,
    },
  });
});

export { router as eventsRoutes };
