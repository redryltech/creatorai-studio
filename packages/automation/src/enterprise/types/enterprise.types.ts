// ============================================================
// CreatorAI Studio — Enterprise SaaS Domain Types
// ============================================================

import { z } from 'zod';

// ---- Subscription Plans ----

export type PlanTier = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';

export interface SubscriptionPlan {
  id: PlanTier;
  name: string;
  priceMonthlyUsd: number;
  priceYearlyUsd: number;
  limits: PlanLimits;
  features: string[];
}

export interface PlanLimits {
  storageGb: number;
  aiCreditsMonthly: number;
  renderingMinutesMonthly: number;
  publishingMonthly: number;
  teamMembers: number;
  concurrentWorkflows: number;
  brandProfiles: number;
  workspacesCount: number;
  apiRequestsDaily: number;
  videoQuality: '720p' | '1080p' | '4k';
}

export const PLAN_CATALOG: Record<PlanTier, SubscriptionPlan> = {
  free: { id: 'free', name: 'Free', priceMonthlyUsd: 0, priceYearlyUsd: 0, limits: { storageGb: 1, aiCreditsMonthly: 50, renderingMinutesMonthly: 10, publishingMonthly: 5, teamMembers: 1, concurrentWorkflows: 1, brandProfiles: 1, workspacesCount: 1, apiRequestsDaily: 100, videoQuality: '720p' }, features: ['Basic AI generation', '5 videos/month'] },
  starter: { id: 'starter', name: 'Starter', priceMonthlyUsd: 19, priceYearlyUsd: 190, limits: { storageGb: 10, aiCreditsMonthly: 200, renderingMinutesMonthly: 60, publishingMonthly: 30, teamMembers: 2, concurrentWorkflows: 2, brandProfiles: 3, workspacesCount: 2, apiRequestsDaily: 1000, videoQuality: '1080p' }, features: ['All Free features', '30 videos/month', 'Priority support'] },
  pro: { id: 'pro', name: 'Pro', priceMonthlyUsd: 49, priceYearlyUsd: 490, limits: { storageGb: 50, aiCreditsMonthly: 1000, renderingMinutesMonthly: 300, publishingMonthly: 200, teamMembers: 5, concurrentWorkflows: 5, brandProfiles: 10, workspacesCount: 5, apiRequestsDaily: 5000, videoQuality: '1080p' }, features: ['All Starter features', 'Voice cloning', 'AI Memory', 'Analytics'] },
  business: { id: 'business', name: 'Business', priceMonthlyUsd: 149, priceYearlyUsd: 1490, limits: { storageGb: 200, aiCreditsMonthly: 5000, renderingMinutesMonthly: 1000, publishingMonthly: 1000, teamMembers: 20, concurrentWorkflows: 10, brandProfiles: 50, workspacesCount: 20, apiRequestsDaily: 20000, videoQuality: '4k' }, features: ['All Pro features', 'Team collaboration', 'White label', 'API access'] },
  enterprise: { id: 'enterprise', name: 'Enterprise', priceMonthlyUsd: 499, priceYearlyUsd: 4990, limits: { storageGb: 1000, aiCreditsMonthly: -1, renderingMinutesMonthly: -1, publishingMonthly: -1, teamMembers: -1, concurrentWorkflows: 20, brandProfiles: -1, workspacesCount: -1, apiRequestsDaily: -1, videoQuality: '4k' }, features: ['Unlimited everything', 'SSO', 'SLA', 'Dedicated support', 'Custom models'] },
};

// ---- Subscription ----

export interface Subscription {
  id: string;
  userId: string;
  organizationId: string;
  plan: PlanTier;
  status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired';
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
}

// ---- Invoice ----

export interface Invoice {
  id: string;
  userId: string;
  organizationId: string;
  stripeInvoiceId: string | null;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  periodStart: Date;
  periodEnd: Date;
  lineItems: Array<{ description: string; amount: number; quantity: number }>;
  pdfUrl: string | null;
  paidAt: Date | null;
  createdAt: Date;
}

// ---- Usage ----

export interface UsageRecord {
  id: string;
  userId: string;
  organizationId: string;
  period: string; // YYYY-MM
  aiCreditsUsed: number;
  renderingMinutesUsed: number;
  publishingCount: number;
  storageUsedGb: number;
  costBreakdown: { provider: string; model: string; costUsd: number; units: number }[];
  totalCostUsd: number;
  updatedAt: Date;
}

export interface WorkspaceQuota {
  organizationId: string;
  plan: PlanTier;
  limits: PlanLimits;
  usage: UsageRecord;
  isOverLimit: boolean;
  overLimitFields: string[];
}

// ---- Organization ----

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  plan: PlanTier;
  subscriptionId: string | null;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Team ----

export type TeamRole = 'owner' | 'admin' | 'manager' | 'editor' | 'creator' | 'viewer';

export interface TeamMember {
  id: string;
  organizationId: string;
  userId: string;
  email: string;
  role: TeamRole;
  invitedBy: string;
  joinedAt: Date;
}

// ---- Notifications ----

export type NotificationChannel = 'in_app' | 'email' | 'slack' | 'discord' | 'webhook';
export type NotificationType = 'workflow_complete' | 'publish_success' | 'publish_failure' | 'quota_warning' | 'subscription_warning' | 'team_invite' | 'review_request' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  sentAt: Date;
}

// ---- API Keys ----

export interface ApiKey {
  id: string;
  userId: string;
  organizationId: string;
  name: string;
  keyPrefix: string; // First 8 chars (for display)
  keyHash: string;   // SHA-256 hash (for verification)
  permissions: string[];
  rateLimit: number; // requests per minute
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface WebhookConfig {
  id: string;
  userId: string;
  organizationId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastDeliveredAt: Date | null;
  failureCount: number;
  createdAt: Date;
}

// ---- Marketplace ----

export type MarketplaceCategory = 'prompt_template' | 'workflow_template' | 'brand_template' | 'automation_template';

export interface MarketplaceItem {
  id: string;
  authorId: string;
  authorName: string;
  category: MarketplaceCategory;
  title: string;
  description: string;
  price: number; // 0 = free
  currency: string;
  downloads: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  previewUrl: string | null;
  data: Record<string, unknown>;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Feature Flags ----

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  allowedPlans: PlanTier[];
  allowedOrganizations: string[];
  percentage: number; // 0-100 for gradual rollout
  createdAt: Date;
}

// ---- Audit ----

export interface AuditEvent {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress: string | null;
  timestamp: Date;
}

// ---- Admin ----

export interface PlatformStats {
  totalUsers: number;
  totalOrganizations: number;
  activeSubscriptions: Record<PlanTier, number>;
  totalRevenueMtd: number;
  totalVideosGenerated: number;
  totalPublished: number;
  aiProviderCosts: Record<string, number>;
  storageUsedGb: number;
  systemHealth: 'healthy' | 'degraded' | 'unhealthy';
}
