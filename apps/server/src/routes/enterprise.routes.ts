// ============================================================
// CreatorAI Studio — Enterprise SaaS API Routes
// ============================================================

import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { BillingService, UsageTracker, TeamService, NotificationService, ApiKeyService, MarketplaceService, FeatureFlagService, AdminService, PLAN_CATALOG } from '@creatorai/automation';

const router = Router();

// ---- Plans & Billing ----
router.get('/plans', asyncHandler(async (_req, res) => {
  res.json({ success: true, data: Object.values(PLAN_CATALOG) });
}));

router.post('/billing/subscribe', asyncHandler(async (req, res) => {
  const sub = await BillingService.getInstance().createSubscription({ userId: req.userId!, organizationId: req.body.organizationId, plan: req.body.plan, trial: req.body.trial });
  res.status(201).json({ success: true, data: sub });
}));

router.post('/billing/change-plan', asyncHandler(async (req, res) => {
  const sub = await BillingService.getInstance().changePlan(req.body.subscriptionId, req.body.plan);
  res.json({ success: true, data: sub });
}));

router.get('/billing/invoices', asyncHandler(async (req, res) => {
  const invoices = BillingService.getInstance().getInvoices(req.body.organizationId ?? '');
  res.json({ success: true, data: invoices });
}));

// ---- Usage ----
router.get('/usage', asyncHandler(async (req, res) => {
  const usage = UsageTracker.getInstance().getUsage(req.query.orgId as string ?? '');
  res.json({ success: true, data: usage });
}));

router.get('/usage/quota', asyncHandler(async (req, res) => {
  const quota = UsageTracker.getInstance().checkQuota(req.query.orgId as string ?? '', (req.query.plan as any) ?? 'free');
  res.json({ success: true, data: quota });
}));

// ---- Organizations & Teams ----
router.post('/organizations', asyncHandler(async (req, res) => {
  const org = TeamService.getInstance().createOrganization({ name: req.body.name, ownerId: req.userId! });
  res.status(201).json({ success: true, data: org });
}));

router.get('/organizations', asyncHandler(async (req, res) => {
  const orgs = TeamService.getInstance().getUserOrganizations(req.userId!);
  res.json({ success: true, data: orgs });
}));

router.get('/organizations/:id/members', asyncHandler(async (req, res) => {
  const members = TeamService.getInstance().getMembers(req.params.id!);
  res.json({ success: true, data: members });
}));

router.post('/organizations/:id/members', asyncHandler(async (req, res) => {
  const member = TeamService.getInstance().addMember(req.params.id!, req.body.userId, req.body.email, req.body.role, req.userId!);
  res.status(201).json({ success: true, data: member });
}));

router.delete('/organizations/:id/members/:memberId', asyncHandler(async (req, res) => {
  TeamService.getInstance().removeMember(req.params.id!, req.params.memberId!, req.userId!);
  res.json({ success: true, data: { removed: true } });
}));

router.get('/organizations/:id/audit', asyncHandler(async (req, res) => {
  const log = TeamService.getInstance().getAuditLog(req.params.id!);
  res.json({ success: true, data: log });
}));

// ---- Notifications ----
router.get('/notifications', asyncHandler(async (req, res) => {
  const notifications = NotificationService.getInstance().getAll(req.userId!);
  res.json({ success: true, data: notifications });
}));

router.get('/notifications/unread', asyncHandler(async (req, res) => {
  const unread = NotificationService.getInstance().getUnread(req.userId!);
  res.json({ success: true, data: unread });
}));

router.post('/notifications/:id/read', asyncHandler(async (req, res) => {
  NotificationService.getInstance().markRead(req.params.id!);
  res.json({ success: true, data: { read: true } });
}));

router.post('/notifications/read-all', asyncHandler(async (req, res) => {
  const count = NotificationService.getInstance().markAllRead(req.userId!);
  res.json({ success: true, data: { markedRead: count } });
}));

// ---- API Keys ----
router.post('/api-keys', asyncHandler(async (req, res) => {
  const result = ApiKeyService.getInstance().createKey({ userId: req.userId!, organizationId: req.body.organizationId, name: req.body.name });
  res.status(201).json({ success: true, data: { key: result.apiKey, rawKey: result.rawKey } });
}));

router.get('/api-keys', asyncHandler(async (req, res) => {
  const keys = ApiKeyService.getInstance().listKeys(req.query.orgId as string ?? '');
  res.json({ success: true, data: keys });
}));

router.delete('/api-keys/:id', asyncHandler(async (req, res) => {
  ApiKeyService.getInstance().revokeKey(req.params.id!);
  res.json({ success: true, data: { revoked: true } });
}));

// ---- Webhooks ----
router.post('/webhooks', asyncHandler(async (req, res) => {
  const webhook = ApiKeyService.getInstance().registerWebhook({ userId: req.userId!, organizationId: req.body.organizationId, url: req.body.url, events: req.body.events });
  res.status(201).json({ success: true, data: webhook });
}));

// ---- Marketplace ----
router.get('/marketplace', asyncHandler(async (req, res) => {
  const query = (req.query.q as string) ?? '';
  const category = req.query.category as string | undefined;
  const items = query ? MarketplaceService.getInstance().search(query, category as any) : MarketplaceService.getInstance().getFeatured();
  res.json({ success: true, data: items });
}));

router.post('/marketplace', asyncHandler(async (req, res) => {
  const item = MarketplaceService.getInstance().publish({ authorId: req.userId!, ...req.body });
  res.status(201).json({ success: true, data: item });
}));

// ---- Feature Flags ----
router.get('/features', asyncHandler(async (req, res) => {
  const flags = FeatureFlagService.getInstance().getAll();
  res.json({ success: true, data: flags });
}));

router.get('/features/check', asyncHandler(async (req, res) => {
  const enabled = FeatureFlagService.getInstance().isEnabled(req.query.feature as string, (req.query.plan as any) ?? 'free', req.query.orgId as string);
  res.json({ success: true, data: { feature: req.query.feature, enabled } });
}));

// ---- Admin ----
router.get('/admin/stats', asyncHandler(async (_req, res) => {
  const stats = AdminService.getInstance().getStats();
  res.json({ success: true, data: stats });
}));

export { router as enterpriseRoutes };
