// ============================================================
// CreatorAI Studio — Health Check Routes
// ============================================================

import { Router, type Request, type Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { AgentRegistry, CircuitBreakerRegistry, JobQueue } from '@creatorai/agents';

const router = Router();

/**
 * GET /api/v1/health
 * Basic liveness probe — returns 200 if server process is running.
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'creatorai-studio-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      memory: {
        heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
    },
  });
});

/**
 * GET /api/v1/health/ready
 * Readiness probe — verifies critical subsystems are operational.
 * Returns 503 if any critical dependency is down.
 */
router.get('/ready', asyncHandler(async (_req: Request, res: Response) => {
  const agentRegistry = AgentRegistry.getInstance();
  const circuitBreakerRegistry = CircuitBreakerRegistry.getInstance();
  const jobQueue = JobQueue.getInstance();

  const providerHealth = circuitBreakerRegistry.getAllHealthStates();
  const unhealthyProviders = providerHealth.filter((p) => p.status === 'unhealthy');

  const checks = {
    agents: {
      registered: agentRegistry.size,
      status: agentRegistry.size > 0 ? 'ok' : 'warn',
    },
    providers: {
      total: providerHealth.length,
      healthy: providerHealth.filter((p) => p.status === 'healthy').length,
      degraded: providerHealth.filter((p) => p.status === 'degraded').length,
      unhealthy: unhealthyProviders.length,
      status: unhealthyProviders.length === providerHealth.length ? 'error' : 'ok',
    },
    jobQueue: {
      pending: jobQueue.pendingCount,
      active: jobQueue.activeCount,
      status: 'ok',
    },
  };

  const isReady = checks.providers.status !== 'error';

  res.status(isReady ? 200 : 503).json({
    success: isReady,
    data: {
      status: isReady ? 'ready' : 'not_ready',
      checks,
      providerDetails: providerHealth.map((p) => ({
        id: p.providerId,
        status: p.status,
        errorRate: Math.round(p.errorRate * 100) + '%',
        avgLatencyMs: p.averageLatencyMs,
        circuitOpen: p.circuitOpen,
      })),
      timestamp: new Date().toISOString(),
    },
  });
}));

export { router as healthRoutes };
