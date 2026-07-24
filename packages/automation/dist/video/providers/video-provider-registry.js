// ============================================================
// CreatorAI Studio — Video Provider Registry
// ============================================================
// Manages video generation providers with priority-based
// selection and automatic failover.
//
// Priority chain (lower = tried first):
//   Google Veo (10) → Runway (15) → Kling (20) →
//   Luma (25) → Pika (30) → Mock (99)
//
// Usage:
//   VideoProviderRegistry.getInstance().register(provider)
//   const best = await registry.getPrimary()
//
// Adding a new provider = register it here. Nothing else changes.
// ============================================================
import { Logger } from '@creatorai/agents';
const log = Logger.for('VideoProviderRegistry');
export class VideoProviderRegistry {
    static instance = null;
    providers = new Map();
    constructor() { }
    static getInstance() {
        if (!VideoProviderRegistry.instance) {
            VideoProviderRegistry.instance = new VideoProviderRegistry();
        }
        return VideoProviderRegistry.instance;
    }
    static resetInstance() {
        VideoProviderRegistry.instance = null;
    }
    // ── Registration ────────────────────────────────────────
    /** Register a video provider. */
    register(provider) {
        this.providers.set(provider.providerId, provider);
        log.info('Video provider registered', {
            id: provider.providerId,
            name: provider.providerName,
            priority: provider.priority,
        });
    }
    /** Unregister a provider by ID. */
    unregister(providerId) {
        const removed = this.providers.delete(providerId);
        if (removed) {
            log.info('Video provider unregistered', { id: providerId });
        }
        return removed;
    }
    // ── Selection ───────────────────────────────────────────
    /**
     * Get the best available video provider (by priority, with failover).
     * Returns null if no provider is available.
     */
    async getPrimary() {
        const sorted = this.getSorted();
        for (const provider of sorted) {
            try {
                if (await provider.isAvailable()) {
                    return provider;
                }
                log.debug('Video provider unavailable, trying next', {
                    id: provider.providerId,
                });
            }
            catch (err) {
                log.warn('Video provider availability check failed', {
                    id: provider.providerId,
                    error: err.message,
                });
            }
        }
        return null;
    }
    /**
     * Get a specific provider by ID.
     */
    get(providerId) {
        return this.providers.get(providerId);
    }
    /**
     * Get all registered providers, sorted by priority (lower = first).
     */
    getSorted() {
        return Array.from(this.providers.values()).sort((a, b) => a.priority - b.priority);
    }
    /**
     * List all registered provider IDs.
     */
    listIds() {
        return Array.from(this.providers.keys());
    }
    /**
     * List providers with their priorities and names.
     */
    listProviders() {
        return this.getSorted().map((p) => ({
            id: p.providerId,
            name: p.providerName,
            priority: p.priority,
        }));
    }
    // ── Diagnostics ─────────────────────────────────────────
    /**
     * Run health checks on all registered providers.
     */
    async healthCheckAll() {
        const results = new Map();
        const checks = Array.from(this.providers.entries()).map(async ([id, provider]) => {
            try {
                const status = await provider.getStatus();
                results.set(id, status);
            }
            catch {
                results.set(id, {
                    providerId: id,
                    healthy: false,
                    latencyMs: -1,
                    authenticated: false,
                    rateLimitRemaining: null,
                    message: 'Health check threw an exception',
                });
            }
        });
        await Promise.allSettled(checks);
        return results;
    }
    /**
     * Get capabilities of all providers.
     */
    getCapabilitiesAll() {
        const caps = new Map();
        for (const [id, provider] of this.providers) {
            caps.set(id, provider.getCapabilities());
        }
        return caps;
    }
    /**
     * Get total number of registered providers.
     */
    get size() {
        return this.providers.size;
    }
}
//# sourceMappingURL=video-provider-registry.js.map