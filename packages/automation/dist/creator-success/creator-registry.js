import { Logger } from '@creatorai/agents';
const log = Logger.for('CreatorRegistry');
export class CreatorRegistry {
    static instance = null;
    strategies = new Map();
    constructor() { }
    static getInstance() { if (!CreatorRegistry.instance)
        CreatorRegistry.instance = new CreatorRegistry(); return CreatorRegistry.instance; }
    static resetInstance() { CreatorRegistry.instance = null; }
    register(s) { this.strategies.set(s.strategyId, s); log.info('Creator strategy registered', { id: s.strategyId }); }
    getStrategy(platform) { for (const s of this.strategies.values())
        if (s.canHandle(platform))
            return s; return null; }
    get size() { return this.strategies.size; }
}
//# sourceMappingURL=creator-registry.js.map