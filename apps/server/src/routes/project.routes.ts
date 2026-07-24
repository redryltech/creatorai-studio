// ============================================================
// CreatorAI Studio — Project Routes (Production Implementation)
// ============================================================

import { Router, type Request, type Response, type NextFunction } from 'express';
import { validate } from '../middleware/validator.middleware';
import { createProjectSchema, updateProjectSchema, paginationSchema } from '@creatorai/shared';
import { getProjectService } from '../services';

const router = Router();

/** POST /api/v1/projects — Create a new project. */
router.post('/', validate(createProjectSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await getProjectService().createProject({
      userId: req.userId!,
      title: req.body.title,
      description: req.body.description,
      contentType: req.body.contentType,
      targetPlatforms: req.body.targetPlatforms,
      settings: req.body.settings,
    });
    res.status(201).json({ success: true, data: project, meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() } });
  } catch (error) { next(error); }
});

/** GET /api/v1/projects — List projects. */
router.get('/', validate(paginationSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getProjectService().listProjects(req.userId!, {
      page: (req.query as any).page ?? 1,
      limit: (req.query as any).limit ?? 20,
      orderBy: (req.query as any).sortBy,
      orderDirection: (req.query as any).sortOrder,
      status: (req.query as any).status,
      contentType: (req.query as any).contentType,
    });
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

/** GET /api/v1/projects/:id — Get project details. */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await getProjectService().getProject(req.params.id!, req.userId!);
    res.json({ success: true, data: project });
  } catch (error) { next(error); }
});

/** PATCH /api/v1/projects/:id — Update project. */
router.patch('/:id', validate(updateProjectSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getProjectService().updateProject(req.params.id!, req.userId!, req.body);
    res.json({ success: true, data: { updated: true } });
  } catch (error) { next(error); }
});

/** DELETE /api/v1/projects/:id — Soft delete project. */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getProjectService().deleteProject(req.params.id!, req.userId!);
    res.json({ success: true, data: { deleted: true } });
  } catch (error) { next(error); }
});

/** POST /api/v1/projects/:id/archive — Archive project. */
router.post('/:id/archive', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getProjectService().archiveProject(req.params.id!, req.userId!);
    res.json({ success: true, data: { archived: true } });
  } catch (error) { next(error); }
});

/** POST /api/v1/projects/:id/restore — Restore project. */
router.post('/:id/restore', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getProjectService().restoreProject(req.params.id!, req.userId!);
    res.json({ success: true, data: { restored: true } });
  } catch (error) { next(error); }
});

/** POST /api/v1/projects/:id/clone — Clone project. */
router.post('/:id/clone', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cloned = await getProjectService().cloneProject(req.params.id!, req.userId!);
    res.status(201).json({ success: true, data: cloned });
  } catch (error) { next(error); }
});

/** GET /api/v1/projects/:id/timeline — Get project timeline. */
router.get('/:id/timeline', validate(paginationSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getProjectService().getTimeline(req.params.id!, req.userId!, {
      page: (req.query as any).page ?? 1,
      limit: (req.query as any).limit ?? 50,
      category: (req.query as any).category,
    });
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

/** GET /api/v1/projects/:id/stats — Get project statistics. */
router.get('/:id/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getProjectService().getProjectStats(req.params.id!, req.userId!);
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
});

export { router as projectRoutes };
