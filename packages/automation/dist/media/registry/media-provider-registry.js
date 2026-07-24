// ============================================================
// CreatorAI Studio — Media Provider Registry
// ============================================================
// Manages media generation providers (image, video, voice, music).
// Supports priority ranking, automatic failover, and health checks.
//
// Adding a new provider = register it here. Nothing else changes.
// ============================================================
import { Logger } from '@creatorai/agents';
const log = Logger.for('MediaProviderRegistry');
export class MediaProviderRegistry {
    static instance = null;
    providers = new Map();
    constructor() { }
    static getInstance() {
        if (!MediaProviderRegistry.instance) {
            MediaProviderRegistry.instance = new MediaProviderRegistry();
        }
        return MediaProviderRegistry.instance;
    }
    static resetInstance() { MediaProviderRegistry.instance = null; }
    /** Register a media provider. */
    register(provider) {
        this.providers.set(provider.providerId, provider);
        log.info('Media provider registered', {
            id: provider.providerId,
            name: provider.providerName,
            type: provider.mediaType,
            priority: provider.priority,
        });
    }
    /** Get the best available provider for a media type (by priority, with failover). */
    async getPrimary(mediaType) {
        const candidates = this.getByType(mediaType);
        for (const provider of candidates) {
            try {
                if (await provider.isAvailable())
                    return provider;
            }
            catch {
                log.warn('Provider availability check failed', { id: provider.providerId });
            }
        }
        return null;
    }
    /** Get all providers for a media type, sorted by priority (lower = higher priority). */
    getByType(mediaType) {
        return Array.from(this.providers.values())
            .filter((p) => p.mediaType === mediaType)
            .sort((a, b) => a.priority - b.priority);
    }
    /** Get a specific provider by ID. */
    get(providerId) {
        return this.providers.get(providerId);
    }
    /** List all registered provider IDs. */
    listIds() { return Array.from(this.providers.keys()); }
    /** Run health checks on all providers. */
    async healthCheckAll() {
        const results = new Map();
        const checks = Array.from(this.providers.entries()).map(async ([id, provider]) => {
            try {
                const { healthy, latencyMs } = await provider.healthCheck();
                results.set(id, { healthy, latencyMs, type: provider.mediaType });
            }
            catch {
                results.set(id, { healthy: false, latencyMs: -1, type: provider.mediaType });
            }
        });
        await Promise.allSettled(checks);
        return results;
    }
    get size() { return this.providers.size; }
}
//# sourceMappingURL=media-provider-registry.js.map