// ============================================================
// CreatorAI Studio — Route Registry
// ============================================================

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { agentRateLimiter } from '../middleware/rateLimiter.middleware';
import { healthRoutes } from './health.routes';
import { chatRoutes } from './chat.routes';
import { projectRoutes } from './project.routes';
import { assetRoutes } from './asset.routes';
import { eventsRoutes } from './events.routes';
import { agentRoutes } from './agent.routes';
import { workspaceRoutes } from './workspace.routes';
import { dashboardRoutes } from './dashboard.routes';
import { automationRoutes } from './automation.routes';
import { publishRoutes } from './publish.routes';
import { intelligenceRoutes } from './intelligence.routes';
import { enterpriseRoutes } from './enterprise.routes';
import { musicRoutes } from './music.routes';

const router = Router();

// ---- Public Routes ----
router.use('/health', healthRoutes);

// ---- Authenticated Routes ----
router.use('/chat', authMiddleware, chatRoutes);
router.use('/projects', authMiddleware, projectRoutes);
router.use('/assets', authMiddleware, assetRoutes);
router.use('/workspaces', authMiddleware, workspaceRoutes);
router.use('/dashboard', authMiddleware, dashboardRoutes);
router.use('/automation', authMiddleware, agentRateLimiter, automationRoutes);
router.use('/publish', authMiddleware, publishRoutes);
router.use('/intelligence', authMiddleware, intelligenceRoutes);
router.use('/enterprise', authMiddleware, enterpriseRoutes);
router.use('/events', authMiddleware, eventsRoutes);
router.use('/agents', authMiddleware, agentRateLimiter, agentRoutes);
router.use('/music', musicRoutes);

export { router as apiRoutes };
