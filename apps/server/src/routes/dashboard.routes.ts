// ============================================================
// CreatorAI Studio — Dashboard & Monitoring Routes
// ============================================================

import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import {
  AgentRegistry, CircuitBreakerRegistry, MetricsCollector,
  JobQueue, SSEManager,
} from '@creatorai/agents';

const router = Router();

/** GET /api/v1/dashboard/metrics */
router.get('/metrics', asyncHandler(async (req, res) => {
  const period = (req.query.period as string) ?? 'day';
  const valid = ['hour', 'day', 'week', 'month'];
  const summary = MetricsCollector.getInstance().getSummary(valid.includes(period) ? (period as any) : 'day');
  res.json({ success: true, data: summary });
}));

/** GET /api/v1/dashboard/health */
router.get('/health', asyncHandler(async (_req, res) => {
  const agentRegistry = AgentRegistry.getInstance();
  const cbRegistry = CircuitBreakerRegistry.getInstance();
  const jobQueue = JobQueue.getInstance();
  const sseManager = SSEManager.getInstance();
  const providerHealth = cbRegistry.getAllHealthStates();
  const agentHealth = await agentRegistry.healthCheckAll();

  const unhealthyProviders = providerHealth.filter((p) => p.status === 'unhealthy').length;

  res.json({
    success: true,
    data: {
      status: unhealthyProviders === providerHealth.length ? 'unhealthy' : unhealthyProviders > 0 ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      memory: { heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1048576), rssMB: Math.round(process.memoryUsage().rss / 1048576) },
      services: { jobQueue: { pending: jobQueue.pendingCount, active: jobQueue.activeCount }, sse: { connectedClients: sseManager.clientCount }, metrics: { dataPoints: MetricsCollector.getInstance().pointCount } },
      providers: providerHealth.map((p) => ({ id: p.providerId, status: p.status, latencyMs: p.averageLatencyMs, errorRate: Math.round(p.errorRate * 100) + '%', circuitOpen: p.circuitOpen, consecutiveFailures: p.consecutiveFailures })),
      agents: agentRegistry.listMetadata().map((m) => ({ id: m.id, name: m.name, version: m.version, healthy: agentHealth.get(m.id)?.healthy ?? false })),
    },
  });
}));

/** GET /api/v1/dashboard/costs */
router.get('/costs', asyncHandler(async (req, res) => {
  const period = (req.query.period as string) ?? 'day';
  const summary = MetricsCollector.getInstance().getSummary(period as any);
  res.json({ success: true, data: { period, total: summary.costs.totalUsd, byProvider: summary.costs.byProvider, byAgent: summary.costs.byAgent, byModel: summary.costs.byModel } });
}));

/** GET /api/v1/dashboard/providers */
router.get('/providers', asyncHandler(async (_req, res) => {
  const summary = MetricsCollector.getInstance().getSummary('day');
  const healthStates = CircuitBreakerRegistry.getInstance().getAllHealthStates();
  const providers = Object.entries(summary.providers).map(([id, m]) => {
    const h = healthStates.find((s) => s.providerId === id);
    return { id, ...m, circuitOpen: h?.circuitOpen ?? false, consecutiveFailures: h?.consecutiveFailures ?? 0 };
  });
  res.json({ success: true, data: providers });
}));

/** GET /api/v1/dashboard/usage */
router.get('/usage', asyncHandler(async (_req, res) => {
  const summary = MetricsCollector.getInstance().getSummary('month');
  res.json({ success: true, data: summary.usage });
}));

export { router as dashboardRoutes };
