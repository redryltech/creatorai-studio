// ============================================================
// CreatorAI Studio — Music Provider Registry
// ============================================================
import { Logger } from '@creatorai/agents';
const log = Logger.for('MusicProviderRegistry');
export class MusicProviderRegistry {
    static instance = null;
    providers = new Map();
    constructor() { }
    static getInstance() {
        if (!MusicProviderRegistry.instance) {
            MusicProviderRegistry.instance = new MusicProviderRegistry();
        }
        return MusicProviderRegistry.instance;
    }
    static resetInstance() { MusicProviderRegistry.instance = null; }
    register(provider) {
        this.providers.set(provider.providerId, provider);
        log.info('Music provider registered', {
            id: provider.providerId, name: provider.providerName, priority: provider.priority,
        });
    }
    async getPrimary() {
        const sorted = Array.from(this.providers.values()).sort((a, b) => a.priority - b.priority);
        for (const p of sorted) {
            try {
                if (await p.isAvailable())
                    return p;
            }
            catch { /* next */ }
        }
        return null;
    }
    get(id) { return this.providers.get(id); }
    listIds() { return Array.from(this.providers.keys()); }
    get size() { return this.providers.size; }
}
//# sourceMappingURL=music-provider-registry.js.map