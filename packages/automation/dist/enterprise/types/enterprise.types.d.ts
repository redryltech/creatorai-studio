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
export declare const PLAN_CATALOG: Record<PlanTier, SubscriptionPlan>;
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
    lineItems: Array<{
        description: string;
        amount: number;
        quantity: number;
    }>;
    pdfUrl: string | null;
    paidAt: Date | null;
    createdAt: Date;
}
export interface UsageRecord {
    id: string;
    userId: string;
    organizationId: string;
    period: string;
    aiCreditsUsed: number;
    renderingMinutesUsed: number;
    publishingCount: number;
    storageUsedGb: number;
    costBreakdown: {
        provider: string;
        model: string;
        costUsd: number;
        units: number;
    }[];
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
export interface ApiKey {
    id: string;
    userId: string;
    organizationId: string;
    name: string;
    keyPrefix: string;
    keyHash: string;
    permissions: string[];
    rateLimit: number;
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
export type MarketplaceCategory = 'prompt_template' | 'workflow_template' | 'brand_template' | 'automation_template';
export interface MarketplaceItem {
    id: string;
    authorId: string;
    authorName: string;
    category: MarketplaceCategory;
    title: string;
    description: string;
    price: number;
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
export interface FeatureFlag {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    allowedPlans: PlanTier[];
    allowedOrganizations: string[];
    percentage: number;
    createdAt: Date;
}
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
//# sourceMappingURL=enterprise.types.d.ts.map