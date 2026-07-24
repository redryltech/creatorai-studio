// ============================================================
// CreatorAI Studio — World State Registry
// ============================================================
import { Logger } from '@creatorai/agents';
const log = Logger.for('WorldStateRegistry');
export class WorldStateRegistry {
    static instance = null;
    strategies = new Map();
    constructor() { }
    static getInstance() {
        if (!WorldStateRegistry.instance)
            WorldStateRegistry.instance = new WorldStateRegistry();
        return WorldStateRegistry.instance;
    }
    static resetInstance() { WorldStateRegistry.instance = null; }
    register(strategy) {
        this.strategies.set(strategy.strategyId, strategy);
        log.info('World state strategy registered', { id: strategy.strategyId });
    }
    get size() { return this.strategies.size; }
}
//# sourceMappingURL=world-state-registry.js.map