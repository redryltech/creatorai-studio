// ============================================================
// CreatorAI Studio — Admin Dashboard Service
// ============================================================
import { Logger, MetricsCollector } from '@creatorai/agents';
import { BillingService } from '../billing/billing-service';
const log = Logger.for('AdminService');
export class AdminService {
    static instance = null;
    constructor() { }
    static getInstance() { if (!AdminService.instance)
        AdminService.instance = new AdminService(); return AdminService.instance; }
    static resetInstance() { AdminService.instance = null; }
    /** Get platform-wide statistics. */
    getStats() {
        const metrics = MetricsCollector.getInstance().getSummary('month');
        return {
            totalUsers: 0, // In production: query user collection
            totalOrganizations: 0, // In production: query org collection
            activeSubscriptions: { free: 0, starter: 0, pro: 0, business: 0, enterprise: 0 },
            totalRevenueMtd: BillingService.getInstance().getMRR(),
            totalVideosGenerated: metrics.usage.totalImagesGenerated,
            totalPublished: 0,
            aiProviderCosts: metrics.costs.byProvider,
            storageUsedGb: 0,
            systemHealth: 'healthy',
        };
    }
}
//# sourceMappingURL=admin-service.js.map