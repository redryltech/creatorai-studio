import { UserPlan } from './enums';
/**
 * User usage tracking — enforces plan limits.
 */
export interface UserUsage {
    videosGenerated: number;
    imagesGenerated: number;
    voiceoversGenerated: number;
    storageUsedBytes: number;
    apiCallsThisMonth: number;
    lastResetAt: Date;
}
/**
 * User preferences — defaults for new projects.
 */
export interface UserPreferences {
    defaultPlatform: string;
    defaultLanguage: string;
    defaultVoice: string | null;
    defaultArtStyle: string | null;
    brandVoice: string | null;
    subtitlesEnabled: boolean;
}
/**
 * OAuth token pair for connected social media accounts.
 */
export interface OAuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    scope: string;
}
/**
 * Connected social media accounts.
 */
export interface ConnectedAccounts {
    youtube: (OAuthTokens & {
        channelId: string;
        channelName: string;
    }) | null;
    instagram: (OAuthTokens & {
        accountId: string;
        username: string;
    }) | null;
    tiktok: (OAuthTokens & {
        openId: string;
        username: string;
    }) | null;
    facebook: (OAuthTokens & {
        pageId: string;
        pageName: string;
    }) | null;
    linkedin: (OAuthTokens & {
        personId: string;
    }) | null;
    x: (OAuthTokens & {
        userId: string;
        username: string;
    }) | null;
}
/**
 * Core user document — stored in Firestore `users/{userId}`.
 */
export interface User {
    id: string;
    email: string;
    displayName: string;
    photoURL: string | null;
    plan: UserPlan;
    usage: UserUsage;
    preferences: UserPreferences;
    connectedAccounts: ConnectedAccounts;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Plan limits — what each subscription tier allows.
 */
export interface PlanLimits {
    maxVideosPerDay: number;
    maxImagesPerDay: number;
    maxVoiceoversPerDay: number;
    maxStorageBytes: number;
    maxApiCallsPerMonth: number;
    maxConcurrentPipelines: number;
    maxProjectCount: number;
    allowedProviders: string[];
    features: {
        trendResearch: boolean;
        scheduling: boolean;
        analytics: boolean;
        teamCollaboration: boolean;
        customBrandVoice: boolean;
        priorityProcessing: boolean;
    };
}
/**
 * Plan limits configuration.
 */
export declare const PLAN_LIMITS: Record<UserPlan, PlanLimits>;
//# sourceMappingURL=user.types.d.ts.map