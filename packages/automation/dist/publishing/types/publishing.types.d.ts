import { z } from 'zod';
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
    metadata: {
        model: string;
        generatedAt: Date;
        processingTimeMs: number;
    };
}
export declare const PublishRequestSchema: z.ZodObject<{
    videoUrl: z.ZodString;
    thumbnailUrl: z.ZodOptional<z.ZodString>;
    platform: z.ZodEnum<["youtube", "instagram", "tiktok", "facebook", "linkedin", "x"]>;
    accountId: z.ZodString;
    seo: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        hashtags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        description: string;
        hashtags: string[];
        tags: string[];
    }, {
        title: string;
        description: string;
        hashtags?: string[] | undefined;
        tags?: string[] | undefined;
    }>;
    visibility: z.ZodDefault<z.ZodEnum<["public", "unlisted", "private", "draft"]>>;
    scheduleAt: z.ZodOptional<z.ZodString>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    platform: "youtube" | "instagram" | "tiktok" | "facebook" | "linkedin" | "x";
    seo: {
        title: string;
        description: string;
        hashtags: string[];
        tags: string[];
    };
    videoUrl: string;
    accountId: string;
    visibility: "public" | "unlisted" | "private" | "draft";
    options?: Record<string, unknown> | undefined;
    thumbnailUrl?: string | undefined;
    scheduleAt?: string | undefined;
}, {
    platform: "youtube" | "instagram" | "tiktok" | "facebook" | "linkedin" | "x";
    seo: {
        title: string;
        description: string;
        hashtags?: string[] | undefined;
        tags?: string[] | undefined;
    };
    videoUrl: string;
    accountId: string;
    options?: Record<string, unknown> | undefined;
    thumbnailUrl?: string | undefined;
    visibility?: "public" | "unlisted" | "private" | "draft" | undefined;
    scheduleAt?: string | undefined;
}>;
export type PublishRequest = z.infer<typeof PublishRequestSchema>;
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
export interface PublisherHealth {
    platform: SocialPlatformId;
    healthy: boolean;
    authenticated: boolean;
    rateLimitRemaining: number | null;
    latencyMs: number;
    lastError: string | null;
    lastPublishAt: Date | null;
}
export interface IPublisher {
    readonly platformId: SocialPlatformId;
    readonly platformName: string;
    authenticate(account: SocialAccount): Promise<boolean>;
    refreshAuth(account: SocialAccount): Promise<SocialAccount>;
    upload(request: PublishRequest, account: SocialAccount, onProgress: (progress: number, message: string) => void): Promise<PublishResult>;
    schedule(request: PublishRequest, account: SocialAccount, scheduleAt: Date): Promise<PublishResult>;
    delete(platformPostId: string, account: SocialAccount): Promise<boolean>;
    update(platformPostId: string, updates: Partial<PublishRequest['seo']>, account: SocialAccount): Promise<boolean>;
    getStatus(platformPostId: string, account: SocialAccount): Promise<{
        status: string;
        url: string;
    }>;
    validate(request: PublishRequest): {
        valid: boolean;
        errors: string[];
    };
    healthCheck(account: SocialAccount): Promise<PublisherHealth>;
}
//# sourceMappingURL=publishing.types.d.ts.map