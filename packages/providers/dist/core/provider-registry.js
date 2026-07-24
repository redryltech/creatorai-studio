// ============================================================
// CreatorAI Studio — Provider Registry
// ============================================================
// Central registry for AI providers. Each provider type
// (LLM, image, video, voice, search) can have multiple
// implementations with automatic fallback.
//
// Example:
//   LLM: OpenAI (primary) → Anthropic (fallback)
//   Image: Replicate/Flux (primary) → DALL-E 3 (fallback)
//   Voice: ElevenLabs (primary) → OpenAI TTS (fallback)
// ============================================================
/**
 * Singleton provider registry with fallback support.
 */
export class ProviderRegistry {
    static instance = null;
    providers = new Map();
    constructor() { }
    static getInstance() {
        if (!ProviderRegistry.instance) {
            ProviderRegistry.instance = new ProviderRegistry();
        }
        return ProviderRegistry.instance;
    }
    static resetInstance() {
        ProviderRegistry.instance = null;
    }
    /**
     * Register a provider.
     *
     * @param provider - Provider instance
     * @param category - Provider category (llm, image, video, voice, search)
     * @param priority - Priority within category (0 = highest)
     */
    register(provider, category, priority = 0) {
        this.providers.set(provider.id, {
            provider,
            category,
            priority,
            registeredAt: new Date(),
            enabled: true,
        });
    }
    /**
     * Get a specific provider by ID.
     */
    get(providerId) {
        const entry = this.providers.get(providerId);
        if (!entry || !entry.enabled)
            return undefined;
        return entry.provider;
    }
    /**
     * Get the primary (highest priority) provider for a category.
     * Returns the first available provider, falling back as needed.
     */
    async getPrimary(category) {
        const entries = this.getByCategory(category);
        for (const entry of entries) {
            try {
                const isAvailable = await entry.provider.isAvailable();
                if (isAvailable) {
                    return entry.provider;
                }
            }
            catch {
                // Provider not available, try next
                continue;
            }
        }
        return undefined;
    }
    /**
     * Get all providers for a category, sorted by priority.
     */
    getByCategory(category) {
        return Array.from(this.providers.values())
            .filter((entry) => entry.category === category && entry.enabled)
            .sort((a, b) => a.priority - b.priority);
    }
    /**
     * List all registered provider IDs.
     */
    listIds() {
        return Array.from(this.providers.keys());
    }
    /**
     * List provider IDs by category.
     */
    listByCategory(category) {
        return this.getByCategory(category).map((entry) => entry.provider.id);
    }
    /**
     * Enable or disable a provider.
     */
    setEnabled(providerId, enabled) {
        const entry = this.providers.get(providerId);
        if (entry) {
            entry.enabled = enabled;
        }
    }
    /**
     * Run availability checks on all providers.
     */
    async checkAvailability() {
        const results = new Map();
        const checks = Array.from(this.providers.entries()).map(async ([id, entry]) => {
            try {
                const available = await entry.provider.isAvailable();
                results.set(id, {
                    available,
                    category: entry.category,
                    priority: entry.priority,
                });
            }
            catch {
                results.set(id, {
                    available: false,
                    category: entry.category,
                    priority: entry.priority,
                });
            }
        });
        await Promise.allSettled(checks);
        return results;
    }
}
//# sourceMappingURL=provider-registry.js.map