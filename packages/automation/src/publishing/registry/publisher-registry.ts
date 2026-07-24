// ============================================================
// CreatorAI Studio — Publisher Registry
// ============================================================

import { Logger } from '@creatorai/agents';
import type { IPublisher, SocialPlatformId, PublisherHealth, SocialAccount } from '../types/publishing.types';

const log = Logger.for('PublisherRegistry');

export class PublisherRegistry {
  private static instance: PublisherRegistry | null = null;
  private publishers: Map<SocialPlatformId, IPublisher> = new Map();

  private constructor() {}

  static getInstance(): PublisherRegistry {
    if (!PublisherRegistry.instance) PublisherRegistry.instance = new PublisherRegistry();
    return PublisherRegistry.instance;
  }

  static resetInstance(): void { PublisherRegistry.instance = null; }

  register(publisher: IPublisher): void {
    this.publishers.set(publisher.platformId, publisher);
    log.info('Publisher registered', { platform: publisher.platformId, name: publisher.platformName });
  }

  get(platformId: SocialPlatformId): IPublisher | undefined {
    return this.publishers.get(platformId);
  }

  getOrThrow(platformId: SocialPlatformId): IPublisher {
    const p = this.get(platformId);
    if (!p) throw new Error(`Publisher not registered: ${platformId}. Available: ${this.listPlatforms().join(', ')}`);
    return p;
  }

  listPlatforms(): SocialPlatformId[] {
    return Array.from(this.publishers.keys());
  }

  async healthCheckAll(accounts: SocialAccount[]): Promise<Map<SocialPlatformId, PublisherHealth>> {
    const results = new Map<SocialPlatformId, PublisherHealth>();
    for (const [id, publisher] of this.publishers) {
      const account = accounts.find((a) => a.platform === id);
      if (account) {
        try { results.set(id, await publisher.healthCheck(account)); }
        catch { results.set(id, { platform: id, healthy: false, authenticated: false, rateLimitRemaining: null, latencyMs: -1, lastError: 'Health check failed', lastPublishAt: null }); }
      } else {
        results.set(id, { platform: id, healthy: false, authenticated: false, rateLimitRemaining: null, latencyMs: 0, lastError: 'No account connected', lastPublishAt: null });
      }
    }
    return results;
  }

  get size(): number { return this.publishers.size; }
}
