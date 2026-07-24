// ============================================================
// CreatorAI Studio — Asset & Media Library Routes
// ============================================================

import { Router, type Request, type Response, type NextFunction } from 'express';
import { validate } from '../middleware/validator.middleware';
import { paginationSchema } from '@creatorai/shared';
import { z } from 'zod';
import { getAssetService } from '../services';

const router = Router();

// ---- Validation Schemas ----

const createAssetSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1).max(200),
  type: z.string().min(1),
  data: z.record(z.unknown()).optional(),
  mimeType: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const createVersionSchema = z.object({
  changeDescription: z.string().min(1).max(500),
  data: z.record(z.unknown()).optional(),
});

const reviewActionSchema = z.object({
  comment: z.string().max(2000).optional(),
  action: z.enum(['regenerate', 'edit']).optional(),
});

const tagsSchema = z.object({
  tags: z.array(z.string().min(1).max(50)).min(1).max(20),
});

// ---- Asset CRUD ----

/** POST /api/v1/assets — Create asset. */
router.post('/', validate(createAssetSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const asset = await getAssetService().createAsset({
      ...req.body,
      userId: req.userId!,
    });
    res.status(201).json({ success: true, data: asset });
  } catch (error) { next(error); }
});

/** GET /api/v1/assets/:id — Get asset. */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const asset = await getAssetService().getAsset(req.params.id!, req.userId!);
    res.json({ success: true, data: asset });
  } catch (error) { next(error); }
});

/** DELETE /api/v1/assets/:id — Delete asset. */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAssetService().deleteAsset(req.params.id!, req.userId!);
    res.json({ success: true, data: { deleted: true } });
  } catch (error) { next(error); }
});

/** POST /api/v1/assets/:id/restore — Restore deleted asset. */
router.post('/:id/restore', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAssetService().restoreAsset(req.params.id!, req.userId!);
    res.json({ success: true, data: { restored: true } });
  } catch (error) { next(error); }
});

// ---- Version Control ----

/** POST /api/v1/assets/:id/versions — Create new version. */
router.post('/:id/versions', validate(createVersionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const version = await getAssetService().createNewVersion({
      assetId: req.params.id!,
      userId: req.userId!,
      changeDescription: req.body.changeDescription,
      data: req.body.data,
    });
    res.status(201).json({ success: true, data: version });
  } catch (error) { next(error); }
});

/** GET /api/v1/assets/:id/versions — Get version history. */
router.get('/:id/versions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const versions = await getAssetService().getVersionHistory(req.params.id!, req.userId!);
    res.json({ success: true, data: versions });
  } catch (error) { next(error); }
});

/** POST /api/v1/assets/:id/versions/:version/restore — Restore version. */
router.post('/:id/versions/:version/restore', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const version = await getAssetService().restoreVersion(
      req.params.id!, parseInt(req.params.version!, 10), req.userId!,
    );
    res.json({ success: true, data: version });
  } catch (error) { next(error); }
});

// ---- Tags & Favorites ----

/** POST /api/v1/assets/:id/favorite — Toggle favorite. */
router.post('/:id/favorite', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isFavorite = await getAssetService().toggleFavorite(req.params.id!, req.userId!);
    res.json({ success: true, data: { isFavorite } });
  } catch (error) { next(error); }
});

/** POST /api/v1/assets/:id/tags — Add tags. */
router.post('/:id/tags', validate(tagsSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAssetService().addTags(req.params.id!, req.userId!, req.body.tags);
    res.json({ success: true, data: { added: true } });
  } catch (error) { next(error); }
});

/** DELETE /api/v1/assets/:id/tags — Remove tags. */
router.delete('/:id/tags', validate(tagsSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAssetService().removeTags(req.params.id!, req.userId!, req.body.tags);
    res.json({ success: true, data: { removed: true } });
  } catch (error) { next(error); }
});

// ---- Reviews ----

/** POST /api/v1/assets/:id/review — Request review. */
router.post('/:id/review', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await getAssetService().requestReview(req.params.id!, req.userId!);
    res.status(201).json({ success: true, data: review });
  } catch (error) { next(error); }
});

/** POST /api/v1/reviews/:id/approve — Approve. */
router.post('/reviews/:id/approve', validate(reviewActionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAssetService().approveAsset(req.params.id!, req.userId!, req.body.comment);
    res.json({ success: true, data: { approved: true } });
  } catch (error) { next(error); }
});

/** POST /api/v1/reviews/:id/reject — Reject. */
router.post('/reviews/:id/reject', validate(reviewActionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAssetService().rejectAsset(req.params.id!, req.userId!, req.body.comment ?? '', req.body.action);
    res.json({ success: true, data: { rejected: true } });
  } catch (error) { next(error); }
});

/** POST /api/v1/reviews/:id/changes — Request changes. */
router.post('/reviews/:id/changes', validate(reviewActionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAssetService().requestChanges(req.params.id!, req.userId!, req.body.comment ?? '');
    res.json({ success: true, data: { changesRequested: true } });
  } catch (error) { next(error); }
});

/** GET /api/v1/reviews/pending — Get user's pending reviews. */
router.get('/reviews/pending', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await getAssetService().getPendingReviews(req.userId!);
    res.json({ success: true, data: reviews });
  } catch (error) { next(error); }
});

// ---- Media Library ----

/** GET /api/v1/assets/library — Media library (all user assets). */
router.get('/library', validate(paginationSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAssetService().listMediaLibrary(req.userId!, {
      page: (req.query as any).page ?? 1,
      limit: (req.query as any).limit ?? 40,
      type: (req.query as any).type,
      tags: (req.query as any).tags?.split(','),
    });
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

export { router as assetRoutes };
