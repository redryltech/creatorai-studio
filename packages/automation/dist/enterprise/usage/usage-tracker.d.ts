import type { UsageRecord, WorkspaceQuota, PlanTier } from '../types/enterprise.types';
export declare class UsageTracker {
    private static instance;
    private records;
    private constructor();
    static getInstance(): UsageTracker;
    static resetInstance(): void;
    private getKey;
    private getOrCreate;
    /** Record AI credit usage. */
    recordAiUsage(orgId: string, userId: string, provider: string, model: string, costUsd: number, units?: number): void;
    /** Record rendering time. */
    recordRenderingMinutes(orgId: string, userId: string, minutes: number): void;
    /** Record a publish event. */
    recordPublish(orgId: string, userId: string): void;
    /** Check if organization is within quota. */
    checkQuota(orgId: string, plan: PlanTier): WorkspaceQuota;
    /** Get current usage for org. */
    getUsage(orgId: string): UsageRecord | undefined;
}
//# sourceMappingURL=usage-tracker.d.ts.map