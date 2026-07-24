// ============================================================
// CreatorAI Studio — Insight Engine
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { InsightReport, ReportPeriod, AnalyticsSnapshot, StrategyRecommendation, AnalyticsPlatform } from '../types/intelligence.types';

const log = Logger.for('InsightEngine');

export class InsightEngine {
  private static instance: InsightEngine | null = null;
  private reports: InsightReport[] = [];

  private constructor() {}
  static getInstance(): InsightEngine { if (!InsightEngine.instance) InsightEngine.instance = new InsightEngine(); return InsightEngine.instance; }
  static resetInstance(): void { InsightEngine.instance = null; }

  generateReport(params: { userId: string; period: ReportPeriod; analytics: AnalyticsSnapshot[]; recommendations: StrategyRecommendation[] }): InsightReport {
    const { userId, period, analytics, recommendations } = params;
    const now = new Date();
    const periodMs = period === 'daily' ? 86400000 : period === 'weekly' ? 604800000 : 2592000000;
    const startDate = new Date(now.getTime() - periodMs);

    const periodAnalytics = analytics.filter((a) => a.fetchedAt >= startDate);
    const totalViews = periodAnalytics.reduce((s, a) => s + a.metrics.views, 0);
    const totalEngagement = periodAnalytics.reduce((s, a) => s + a.metrics.likes + a.metrics.comments + a.metrics.shares, 0);

    const platformBreakdown: Record<string, { views: number; engagement: number; growth: number }> = {};
    for (const a of periodAnalytics) {
      const p = platformBreakdown[a.platform] ?? { views: 0, engagement: 0, growth: 0 };
      p.views += a.metrics.views;
      p.engagement += a.metrics.likes + a.metrics.comments;
      platformBreakdown[a.platform] = p;
    }

    const report: InsightReport = {
      id: generateId(ID_PREFIXES.step), userId, period, startDate, endDate: now,
      summary: { totalViews, totalEngagement, totalRevenue: periodAnalytics.reduce((s, a) => s + a.metrics.revenue, 0), subscriberChange: periodAnalytics.reduce((s, a) => s + a.metrics.subscribers, 0), contentPublished: periodAnalytics.length, bestPerformingContent: '', worstPerformingContent: '', growthTrend: totalViews > 0 ? 'steady' : 'slowing' },
      platformBreakdown: platformBreakdown as Record<AnalyticsPlatform, { views: number; engagement: number; growth: number }>,
      topContent: periodAnalytics.sort((a, b) => b.metrics.views - a.metrics.views).slice(0, 5).map((a) => ({ id: a.platformPostId, title: '', views: a.metrics.views, engagement: a.metrics.likes + a.metrics.comments, score: a.metrics.views + a.metrics.likes * 5 })),
      recommendations, channelHealthScore: Math.min(100, Math.round(totalViews / Math.max(periodAnalytics.length, 1) / 100)), generatedAt: now,
    };

    this.reports.push(report);
    log.info('Insight report generated', { period, contentCount: periodAnalytics.length, totalViews });
    return report;
  }

  getReports(userId: string): InsightReport[] {
    return this.reports.filter((r) => r.userId === userId).sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }

  getLatest(userId: string): InsightReport | undefined {
    return this.getReports(userId)[0];
  }
}
