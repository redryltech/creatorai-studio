// ============================================================
// CreatorAI Studio — Usage Tracker
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import { PLAN_CATALOG } from '../types/enterprise.types';
const log = Logger.for('UsageTracker');
export class UsageTracker {
    static instance = null;
    records = new Map(); // key: orgId-period
    constructor() { }
    static getInstance() { if (!UsageTracker.instance)
        UsageTracker.instance = new UsageTracker(); return UsageTracker.instance; }
    static resetInstance() { UsageTracker.instance = null; }
    getKey(orgId) {
        const now = new Date();
        return `${orgId}-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    getOrCreate(orgId, userId) {
        const key = this.getKey(orgId);
        let record = this.records.get(key);
        if (!record) {
            record = { id: generateId(ID_PREFIXES.step), userId, organizationId: orgId, period: key.split('-').slice(1).join('-'), aiCreditsUsed: 0, renderingMinutesUsed: 0, publishingCount: 0, storageUsedGb: 0, costBreakdown: [], totalCostUsd: 0, updatedAt: new Date() };
            this.records.set(key, record);
        }
        return record;
    }
    /** Record AI credit usage. */
    recordAiUsage(orgId, userId, provider, model, costUsd, units = 1) {
        const r = this.getOrCreate(orgId, userId);
        r.aiCreditsUsed += units;
        r.totalCostUsd += costUsd;
        r.costBreakdown.push({ provider, model, costUsd, units });
        r.updatedAt = new Date();
    }
    /** Record rendering time. */
    recordRenderingMinutes(orgId, userId, minutes) {
        const r = this.getOrCreate(orgId, userId);
        r.renderingMinutesUsed += minutes;
        r.updatedAt = new Date();
    }
    /** Record a publish event. */
    recordPublish(orgId, userId) {
        const r = this.getOrCreate(orgId, userId);
        r.publishingCount++;
        r.updatedAt = new Date();
    }
    /** Check if organization is within quota. */
    checkQuota(orgId, plan) {
        const limits = PLAN_CATALOG[plan]?.limits ?? PLAN_CATALOG.free.limits;
        const usage = this.records.get(this.getKey(orgId)) ?? { aiCreditsUsed: 0, renderingMinutesUsed: 0, publishingCount: 0, storageUsedGb: 0 };
        const overLimitFields = [];
        if (limits.aiCreditsMonthly > 0 && usage.aiCreditsUsed >= limits.aiCreditsMonthly)
            overLimitFields.push('aiCredits');
        if (limits.renderingMinutesMonthly > 0 && usage.renderingMinutesUsed >= limits.renderingMinutesMonthly)
            overLimitFields.push('renderingMinutes');
        if (limits.publishingMonthly > 0 && usage.publishingCount >= limits.publishingMonthly)
            overLimitFields.push('publishing');
        return { organizationId: orgId, plan, limits, usage, isOverLimit: overLimitFields.length > 0, overLimitFields };
    }
    /** Get current usage for org. */
    getUsage(orgId) {
        return this.records.get(this.getKey(orgId));
    }
}
//# sourceMappingURL=usage-tracker.js.map