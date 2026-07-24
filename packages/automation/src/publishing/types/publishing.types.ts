// ============================================================
// CreatorAI Studio — Publishing & Distribution Domain Types
// ============================================================

import { z } from 'zod';

// ---- Social Platform ----

export type SocialPlatformId = 'youtube' | 'instagram' | 'tiktok' | 'facebook' | 'linkedin' | 'x';

export interface SocialAccount {
  id: string;
  userId: string;
  platform: SocialPlatformId;
  accountName: string;
  accountId: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
  scopes: string[];
  isActive: boolean;
  connectedAt: Date;
}

export interface SocialPlatform {
  id: SocialPlatformId;
  name: string;
  maxVideoSizeMb: number;
  maxVideoDurationSec: number;
  supportedFormats: string[];
  requiresThumbnail: boolean;
  maxTitleLength: number;
  maxDescriptionLength: number;
  maxTags: number;
  maxHashtags: number;
}

// ---- SEO Package ----

export interface SEOPackage {
  id: string;
  contentIdeaId: string;
  platform: SocialPlatformId;
  title: string;
  description: string;
  keywords: string[];
  tags: string[];
  hashtags: string[];
  thumbnailText: string;
  pinnedComment: string;
  cta: string;
  category: string;
  language: string;
  metadata: { model: string; generatedAt: Date; processingTimeMs: number };
}

// ---- Publish Request ----

export const PublishRequestSchema = z.object({
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  platform: z.enum(['youtube', 'instagram', 'tiktok', 'facebook', 'linkedin', 'x']),
  accountId: z.string().min(1),
  seo: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(10000),
    tags: z.array(z.string()).max(50).default([]),
    hashtags: z.array(z.string()).max(30).default([]),
  }),
  visibility: z.enum(['public', 'unlisted', 'private', 'draft']).default('public'),
  scheduleAt: z.string().datetime().optional(),
  options: z.record(z.unknown()).optional(),
});

export type PublishRequest = z.infer<typeof PublishRequestSchema>;

// ---- Publish Job ----

export type PublishStatus = 'queued' | 'validating' | 'uploading' | 'processing' | 'published' | 'scheduled' | 'failed' | 'cancelled';

export interface PublishJob {
  id: string;
  request: PublishRequest;
  userId: string;
  projectId: string;
  workflowId: string;
  status: PublishStatus;
  progress: number;
  priority: number;
  attempts: number;
  maxAttempts: number;
  error: string | null;
  result: PublishResult | null;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface PublishResult {
  platformPostId: string;
  platformUrl: string;
  platform: SocialPlatformId;
  thumbnailUrl: string | null;
  publishedAt: Date;
  visibility: string;
  metadata: Record<string, unknown>;
}

// ---- Publish History ----

export interface PublishHistoryEntry {
  id: string;
  userId: string;
  projectId: string;
  workflowId: string;
  platform: SocialPlatformId;
  platformPostId: string;
  platformUrl: string;
  title: string;
  status: 'published' | 'scheduled' | 'failed' | 'deleted';
  videoUrl: string;
  thumbnailUrl: string | null;
  seoPackageId: string;
  publishedAt: Date;
  version: number;
  error: string | null;
}

// ---- Content Calendar ----

export interface PublishingSchedule {
  id: string;
  userId: string;
  projectId: string;
  publishJobId: string;
  platform: SocialPlatformId;
  scheduledAt: Date;
  timezone: string;
  status: 'pending' | 'published' | 'cancelled' | 'failed';
  title: string;
}

export interface PublishingWindow {
  dayOfWeek: number;
  startHour: number;
  endHour: number;
  timezone: string;
  platform: SocialPlatformId;
}

export interface ContentCalendar {
  userId: string;
  entries: PublishingSchedule[];
  windows: PublishingWindow[];
}

// ---- Publisher Health ----

export interface PublisherHealth {
  platform: SocialPlatformId;
  healthy: boolean;
  authenticated: boolean;
  rateLimitRemaining: number | null;
  latencyMs: number;
  lastError: string | null;
  lastPublishAt: Date | null;
}

// ---- Publisher Interface ----

export interface IPublisher {
  readonly platformId: SocialPlatformId;
  readonly platformName: string;

  authenticate(account: SocialAccount): Promise<boolean>;
  refreshAuth(account: SocialAccount): Promise<SocialAccount>;
  upload(request: PublishRequest, account: SocialAccount, onProgress: (progress: number, message: string) => void): Promise<PublishResult>;
  schedule(request: PublishRequest, account: SocialAccount, scheduleAt: Date): Promise<PublishResult>;
  delete(platformPostId: string, account: SocialAccount): Promise<boolean>;
  update(platformPostId: string, updates: Partial<PublishRequest['seo']>, account: SocialAccount): Promise<boolean>;
  getStatus(platformPostId: string, account: SocialAccount): Promise<{ status: string; url: string }>;
  validate(request: PublishRequest): { valid: boolean; errors: string[] };
  healthCheck(account: SocialAccount): Promise<PublisherHealth>;
}
