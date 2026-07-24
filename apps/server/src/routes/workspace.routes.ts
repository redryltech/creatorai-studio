// ============================================================
// CreatorAI Studio — Workspace Routes
// ============================================================

import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validator.middleware';
import { getWorkspaceService, getMemoryService } from '../services';

const router = Router();

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'reviewer', 'viewer']),
});

/** POST /api/v1/workspaces — Create workspace. */
router.post('/', validate(createWorkspaceSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getWorkspaceService().createWorkspace({
      userId: req.userId!, userEmail: req.userEmail ?? '', name: req.body.name, description: req.body.description,
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) { next(error); }
});

/** GET /api/v1/workspaces — List user's workspaces. */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaces = await getWorkspaceService().getUserWorkspaces(req.userId!);
    res.json({ success: true, data: workspaces });
  } catch (error) { next(error); }
});

/** GET /api/v1/workspaces/:id — Get workspace details. */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspace = await getWorkspaceService().getWorkspace(req.params.id!, req.userId!);
    res.json({ success: true, data: workspace });
  } catch (error) { next(error); }
});

/** GET /api/v1/workspaces/:id/members — List members. */
router.get('/:id/members', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await getWorkspaceService().getMembers(req.params.id!, req.userId!);
    res.json({ success: true, data: members });
  } catch (error) { next(error); }
});

/** POST /api/v1/workspaces/:id/invite — Invite member. */
router.post('/:id/invite', validate(inviteMemberSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invitation = await getWorkspaceService().inviteMember(req.params.id!, req.userId!, req.userEmail ?? '', req.body);
    res.status(201).json({ success: true, data: invitation });
  } catch (error) { next(error); }
});

/** POST /api/v1/workspaces/invitations/:id/accept — Accept invitation. */
router.post('/invitations/:id/accept', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await getWorkspaceService().acceptInvitation(req.params.id!, req.userId!, req.userEmail ?? '');
    res.json({ success: true, data: member });
  } catch (error) { next(error); }
});

/** DELETE /api/v1/workspaces/:id/members/:memberId — Remove member. */
router.delete('/:id/members/:memberId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getWorkspaceService().removeMember(req.params.id!, req.params.memberId!, req.userId!, req.userEmail ?? '');
    res.json({ success: true, data: { removed: true } });
  } catch (error) { next(error); }
});

// ---- AI Memory ----

/** GET /api/v1/workspaces/:id/memory — Get workspace memory. */
router.get('/:id/memory', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const memory = await getMemoryService().getWorkspaceMemory(req.params.id!, req.userId!);
    res.json({ success: true, data: memory });
  } catch (error) { next(error); }
});

/** PUT /api/v1/workspaces/:id/memory — Update workspace memory. */
router.put('/:id/memory', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const memory = await getMemoryService().upsertWorkspaceMemory(req.params.id!, req.userId!, req.body);
    res.json({ success: true, data: memory });
  } catch (error) { next(error); }
});

// ---- Brand Profiles ----

/** GET /api/v1/workspaces/:id/brands — List brands. */
router.get('/:id/brands', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brands = await getMemoryService().listBrands(req.params.id!, req.userId!);
    res.json({ success: true, data: brands });
  } catch (error) { next(error); }
});

/** POST /api/v1/workspaces/:id/brands — Create brand. */
router.post('/:id/brands', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brand = await getMemoryService().createBrand(req.params.id!, req.userId!, req.body);
    res.status(201).json({ success: true, data: brand });
  } catch (error) { next(error); }
});

/** PATCH /api/v1/workspaces/:id/brands/:brandId — Update brand. */
router.patch('/:id/brands/:brandId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getMemoryService().updateBrand(req.params.brandId!, req.userId!, req.body);
    res.json({ success: true, data: { updated: true } });
  } catch (error) { next(error); }
});

/** DELETE /api/v1/workspaces/:id/brands/:brandId — Delete brand. */
router.delete('/:id/brands/:brandId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getMemoryService().deleteBrand(req.params.brandId!, req.userId!);
    res.json({ success: true, data: { deleted: true } });
  } catch (error) { next(error); }
});

export { router as workspaceRoutes };
