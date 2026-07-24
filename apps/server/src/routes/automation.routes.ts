// ============================================================
// CreatorAI Studio — Automation API Routes
// ============================================================

import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { validate } from '../middleware/validator.middleware';
import {
  MasterAgent,
  AutomationRequestSchema,
  WorkflowManager,
  AutomationRegistry,
} from '@creatorai/automation';

const router = Router();

let masterAgent: MasterAgent | null = null;
function getMasterAgent(): MasterAgent {
  if (!masterAgent) masterAgent = new MasterAgent();
  return masterAgent;
}

/** POST /api/v1/automation/start — Start an automation workflow. */
router.post('/start', validate(AutomationRequestSchema), asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const request = req.body;

  const result = await getMasterAgent().executeAutomation(request, userId, `proj_${Date.now().toString(36)}`);

  res.status(201).json({
    success: true,
    data: result,
    meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() },
  });
}));

/** POST /api/v1/automation/:id/cancel — Cancel an automation. */
router.post('/:id/cancel', asyncHandler(async (req, res) => {
  const cancelled = getMasterAgent().cancelAutomation(req.params.id!);
  res.json({ success: true, data: { cancelled } });
}));

/** GET /api/v1/automation/workflows — List user's workflows. */
router.get('/workflows', asyncHandler(async (req, res) => {
  const workflows = WorkflowManager.getInstance().getByUser(req.userId!);
  res.json({
    success: true,
    data: workflows.map((w) => ({
      id: w.id, status: w.status, currentStage: w.currentStage,
      taskCount: w.tasks.length,
      completedTasks: w.tasks.filter((t) => t.status === 'completed').length,
      metrics: w.metrics,
      createdAt: w.createdAt, completedAt: w.completedAt,
    })),
  });
}));

/** GET /api/v1/automation/workflows/:id — Get workflow details. */
router.get('/workflows/:id', asyncHandler(async (req, res) => {
  const workflow = WorkflowManager.getInstance().get(req.params.id!);
  if (!workflow) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Workflow not found' } });
  }
  res.json({ success: true, data: workflow });
}));

/** GET /api/v1/automation/status — Automation engine status. */
router.get('/status', asyncHandler(async (_req, res) => {
  const registry = AutomationRegistry.getInstance();
  const wfManager = WorkflowManager.getInstance();
  const health = await registry.healthCheckAll();

  res.json({
    success: true,
    data: {
      agents: registry.listAgentIds().map((id) => ({
        id,
        healthy: health.get(id)?.healthy ?? false,
        details: health.get(id)?.details ?? 'unknown',
      })),
      researchProviders: registry.getResearchProviders().map((p) => ({
        id: p.providerId, name: p.providerName, category: p.category,
      })),
      workflows: wfManager.getSummary(),
      activeAutomations: getMasterAgent().activeCount,
    },
  });
}));

export { router as automationRoutes };
