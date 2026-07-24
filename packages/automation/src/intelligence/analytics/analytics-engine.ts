// ============================================================
// CreatorAI Studio — Analytics Engine
// ============================================================
// Collects and stores performance analytics from all platforms.
// Provides historical data for the Learning Engine.
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../../interfaces/automation-agent.interface';
import type { AnalyticsSnapshot, AnalyticsHistory, AnalyticsPlatform, ContentScore } from '../types/intelligence.types';

const log = Logger.for('AnalyticsEngine');

interface AnalyticsInput {
  request: Record<string, unknown>;
  platformPostId: string;
  platform: AnalyticsPlatform;
  userId: string;
  projectId: string;
}

export class AnalyticsEngine implements IAutomationAgent<AnalyticsInput, AnalyticsSnapshot> {
  readonly agentId = 'intelligence.analytics';
  readonly agentName = 'Analytics Engine';
  readonly stage = 'analytics';

  private history: Map<string, AnalyticsHistory> = new Map();
  private scores: Map<string, ContentScore> = new Map();

  validate(input: AnalyticsInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.platformPostId) errors.push('Platform post ID required');
    if (!input.platform) errors.push('Platform required');
    return { valid: errors.length === 0, errors };
  }

  estimateCost(): { costUsd: number; breakdown: string[] } {
    return { costUsd: 0, breakdown: ['Analytics collection: API calls (free tier)'] };
  }

  async healthCheck(): Promise<{ healthy: boolean; details: string }> {
    return { healthy: true, details: 'Analytics engine ready' };
  }

  async execute(input: AnalyticsInput, onProgress: ProgressCallback, cancellation: CancellationToken): Promise<AnalyticsSnapshot> {
    log.info('Collecting analytics', { platform: input.platform, postId: input.platformPostId });
    onProgress(10, `Fetching ${input.platform} analytics`);

    if (cancellation.isCancelled) throw new Error('Cancelled');

    // In production: call platform-specific Analytics APIs
    // YouTube: YouTube Analytics API
    // Instagram: Instagram Graph API
    // TikTok: TikTok Analytics API
    onProgress(50, 'Processing metrics');

    const snapshot: AnalyticsSnapshot = {
      id: generateId(ID_PREFIXES.step),
      userId: input.userId,
      projectId: input.projectId,
      platformPostId: input.platformPostId,
      platform: input.platform,
      fetchedAt: new Date(),
      metrics: {
        views: 0, impressions: 0, ctr: 0,
        watchTimeSeconds: 0, averageViewDuration: 0, audienceRetention: 0,
        subscribers: 0, followers: 0,
        likes: 0, comments: 0, shares: 0, saves: 0,
        revenue: 0, rpm: 0, cpm: 0,
      },
      demographics: null,
      trafficSources: [],
    };

    // Store in history
    this.addToHistory(snapshot);

    onProgress(100, 'Analytics collected');
    log.info('Analytics collected', { platform: input.platform, views: snapshot.metrics.views });
    return snapshot;
  }

  /** Get analytics history for a post. */
  getHistory(platformPostId: string): AnalyticsHistory | undefined {
    return this.history.get(platformPostId);
  }

  /** Get all tracked posts for a user. */
  getUserPosts(userId: string): AnalyticsHistory[] {
    return Array.from(this.history.values()).filter((h) =>
      h.snapshots.some((s) => s.userId === userId)
    );
  }

  /** Score content performance relative to benchmarks. */
  scoreContent(platformPostId: string): ContentScore | undefined {
    return this.scores.get(platformPostId);
  }

  /** Get aggregate stats for a user across all platforms. */
  getAggregateStats(userId: string): { totalViews: number; totalEngagement: number; avgCtr: number; contentCount: number } {
    const posts = this.getUserPosts(userId);
    let totalViews = 0, totalEngagement = 0, totalCtr = 0;

    for (const post of posts) {
      const latest = post.snapshots[post.snapshots.length - 1];
      if (latest) {
        totalViews += latest.metrics.views;
        totalEngagement += latest.metrics.likes + latest.metrics.comments + latest.metrics.shares;
        totalCtr += latest.metrics.ctr;
      }
    }

    return {
      totalViews, totalEngagement,
      avgCtr: posts.length > 0 ? totalCtr / posts.length : 0,
      contentCount: posts.length,
    };
  }

  private addToHistory(snapshot: AnalyticsSnapshot): void {
    const key = snapshot.platformPostId;
    const existing = this.history.get(key);
    if (existing) {
      existing.snapshots.push(snapshot);
      const first = existing.snapshots[0];
      const last = existing.snapshots[existing.snapshots.length - 1];
      if (first && last) {
        existing.trend = {
          direction: last.metrics.views > first.metrics.views * 1.1 ? 'growing' : last.metrics.views < first.metrics.views * 0.9 ? 'declining' : 'stable',
          velocity: first.metrics.views > 0 ? (last.metrics.views - first.metrics.views) / first.metrics.views : 0,
        };
      }
    } else {
      this.history.set(key, { platformPostId: key, platform: snapshot.platform, snapshots: [snapshot], trend: { direction: 'stable', velocity: 0 } });
    }
  }
}
