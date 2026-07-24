// ============================================================
// CreatorAI Studio — Admin Dashboard Service
// ============================================================

import { Logger, MetricsCollector } from '@creatorai/agents';
import type { PlatformStats } from '../types/enterprise.types';
import { BillingService } from '../billing/billing-service';
import { TeamService } from '../teams/team-service';
import { MarketplaceService } from '../marketplace/marketplace-service';

const log = Logger.for('AdminService');

export class AdminService {
  private static instance: AdminService | null = null;

  private constructor() {}
  static getInstance(): AdminService { if (!AdminService.instance) AdminService.instance = new AdminService(); return AdminService.instance; }
  static resetInstance(): void { AdminService.instance = null; }

  /** Get platform-wide statistics. */
  getStats(): PlatformStats {
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
