// ============================================================
// CreatorAI Studio — Publishing API Routes
// ============================================================

import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { validate } from '../middleware/validator.middleware';
import {
  PublishQueue, PublishHistory, ContentCalendarManager,
  PublisherRegistry, PublishRequestSchema,
} from '@creatorai/automation';
import { z } from 'zod';

const router = Router();

const scheduleSchema = z.object({
  ...PublishRequestSchema.shape,
  scheduledAt: z.string().datetime(),
  timezone: z.string().default('UTC'),
});

/** POST /api/v1/publish — Publish immediately. */
router.post('/', validate(PublishRequestSchema), asyncHandler(async (req, res) => {
  const job = PublishQueue.getInstance().enqueue(req.body, req.userId!, 'proj', 'wf');
  res.status(201).json({ success: true, data: job });
}));

/** POST /api/v1/publish/schedule — Schedule a publish. */
router.post('/schedule', validate(scheduleSchema), asyncHandler(async (req, res) => {
  const job = PublishQueue.getInstance().enqueue({ ...req.body, visibility: 'private' }, req.userId!, 'proj', 'wf');
  const schedule = ContentCalendarManager.getInstance().schedule({
    userId: req.userId!, projectId: 'proj', publishJobId: job.id,
    platform: req.body.platform, scheduledAt: new Date(req.body.scheduledAt),
    timezone: req.body.timezone, title: req.body.seo.title,
  });
  res.status(201).json({ success: true, data: { job, schedule } });
}));

/** GET /api/v1/publish/queue — Get publish queue. */
router.get('/queue', asyncHandler(async (req, res) => {
  const jobs = PublishQueue.getInstance().getUserJobs(req.userId!);
  res.json({ success: true, data: jobs });
}));

/** POST /api/v1/publish/queue/:id/cancel — Cancel queued job. */
router.post('/queue/:id/cancel', asyncHandler(async (req, res) => {
  const cancelled = PublishQueue.getInstance().cancelJob(req.params.id!);
  res.json({ success: true, data: { cancelled } });
}));

/** GET /api/v1/publish/history — Get publish history. */
router.get('/history', asyncHandler(async (req, res) => {
  const history = PublishHistory.getInstance().getByUser(req.userId!);
  res.json({ success: true, data: history });
}));

/** GET /api/v1/publish/calendar — Get content calendar. */
router.get('/calendar', asyncHandler(async (req, res) => {
  const from = req.query.from ? new Date(req.query.from as string) : new Date();
  const to = req.query.to ? new Date(req.query.to as string) : new Date(Date.now() + 30 * 86400000);
  const entries = ContentCalendarManager.getInstance().getCalendar(req.userId!, from, to);
  res.json({ success: true, data: entries });
}));

/** POST /api/v1/publish/calendar/:id/cancel — Cancel scheduled publish. */
router.post('/calendar/:id/cancel', asyncHandler(async (req, res) => {
  const cancelled = ContentCalendarManager.getInstance().cancel(req.params.id!);
  res.json({ success: true, data: { cancelled } });
}));

/** GET /api/v1/publish/platforms — List available publishers. */
router.get('/platforms', asyncHandler(async (_req, res) => {
  const platforms = PublisherRegistry.getInstance().listPlatforms();
  res.json({ success: true, data: platforms });
}));

/** GET /api/v1/publish/status — Publishing engine status. */
router.get('/status', asyncHandler(async (_req, res) => {
  const queue = PublishQueue.getInstance();
  const history = PublishHistory.getInstance();
  res.json({
    success: true,
    data: {
      queuePending: queue.pendingCount,
      queueActive: queue.activeCount,
      totalPublished: history.totalPublished,
      scheduledCount: ContentCalendarManager.getInstance().totalScheduled,
      platforms: PublisherRegistry.getInstance().listPlatforms(),
    },
  });
}));

export { router as publishRoutes };
