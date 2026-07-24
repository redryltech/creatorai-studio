// ============================================================
// CreatorAI Studio — Publisher Registry
// ============================================================
import { Logger } from '@creatorai/agents';
const log = Logger.for('PublisherRegistry');
export class PublisherRegistry {
    static instance = null;
    publishers = new Map();
    constructor() { }
    static getInstance() {
        if (!PublisherRegistry.instance)
            PublisherRegistry.instance = new PublisherRegistry();
        return PublisherRegistry.instance;
    }
    static resetInstance() { PublisherRegistry.instance = null; }
    register(publisher) {
        this.publishers.set(publisher.platformId, publisher);
        log.info('Publisher registered', { platform: publisher.platformId, name: publisher.platformName });
    }
    get(platformId) {
        return this.publishers.get(platformId);
    }
    getOrThrow(platformId) {
        const p = this.get(platformId);
        if (!p)
            throw new Error(`Publisher not registered: ${platformId}. Available: ${this.listPlatforms().join(', ')}`);
        return p;
    }
    listPlatforms() {
        return Array.from(this.publishers.keys());
    }
    async healthCheckAll(accounts) {
        const results = new Map();
        for (const [id, publisher] of this.publishers) {
            const account = accounts.find((a) => a.platform === id);
            if (account) {
                try {
                    results.set(id, await publisher.healthCheck(account));
                }
                catch {
                    results.set(id, { platform: id, healthy: false, authenticated: false, rateLimitRemaining: null, latencyMs: -1, lastError: 'Health check failed', lastPublishAt: null });
                }
            }
            else {
                results.set(id, { platform: id, healthy: false, authenticated: false, rateLimitRemaining: null, latencyMs: 0, lastError: 'No account connected', lastPublishAt: null });
            }
        }
        return results;
    }
    get size() { return this.publishers.size; }
}
//# sourceMappingURL=publisher-registry.js.map