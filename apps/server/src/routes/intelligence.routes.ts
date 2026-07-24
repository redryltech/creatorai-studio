// ============================================================
// CreatorAI Studio — Intelligence API Routes
// ============================================================

import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { KnowledgeBase, InsightEngine, PromptEvolutionEngine } from '@creatorai/automation';

const router = Router();

/** GET /api/v1/intelligence/knowledge — Search knowledge base. */
router.get('/knowledge', asyncHandler(async (req, res) => {
  const query = (req.query.q as string) ?? '';
  const category = req.query.category as string | undefined;
  const results = KnowledgeBase.getInstance().search(req.userId!, query, category as any);
  res.json({ success: true, data: results });
}));

/** GET /api/v1/intelligence/knowledge/top — Top performing knowledge. */
router.get('/knowledge/top', asyncHandler(async (req, res) => {
  const category = (req.query.category as string) ?? 'prompt';
  const results = KnowledgeBase.getInstance().getTopPerforming(req.userId!, category as any);
  res.json({ success: true, data: results });
}));

/** GET /api/v1/intelligence/reports — Get insight reports. */
router.get('/reports', asyncHandler(async (req, res) => {
  const reports = InsightEngine.getInstance().getReports(req.userId!);
  res.json({ success: true, data: reports });
}));

/** GET /api/v1/intelligence/reports/latest — Get latest report. */
router.get('/reports/latest', asyncHandler(async (req, res) => {
  const report = InsightEngine.getInstance().getLatest(req.userId!);
  res.json({ success: true, data: report ?? null });
}));

/** GET /api/v1/intelligence/prompts — Get prompt version history. */
router.get('/prompts', asyncHandler(async (req, res) => {
  const type = (req.query.type as string) ?? 'script';
  const history = PromptEvolutionEngine.getInstance().getHistory(req.userId!, type as any);
  res.json({ success: true, data: history });
}));

/** GET /api/v1/intelligence/prompts/best — Get best performing prompt. */
router.get('/prompts/best', asyncHandler(async (req, res) => {
  const type = (req.query.type as string) ?? 'script';
  const best = PromptEvolutionEngine.getInstance().getBestVersion(req.userId!, type as any);
  res.json({ success: true, data: best ?? null });
}));

/** GET /api/v1/intelligence/status — Intelligence engine status. */
router.get('/status', asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: {
      knowledgeEntries: KnowledgeBase.getInstance().size,
      reportCount: InsightEngine.getInstance().getReports('').length,
      promptVersions: PromptEvolutionEngine.getInstance().getHistory('', 'script').length,
    },
  });
}));

export { router as intelligenceRoutes };
