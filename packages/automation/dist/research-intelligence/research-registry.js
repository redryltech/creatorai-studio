// ============================================================
// CreatorAI Studio — Research Registry
// ============================================================
import { Logger } from '@creatorai/agents';
const log = Logger.for('ResearchRegistry');
/**
 * Registry for research strategies.
 * Supports plugging in specialized analyzers for specific categories.
 */
export class ResearchRegistry {
    static instance = null;
    strategies = new Map();
    constructor() { }
    static getInstance() {
        if (!ResearchRegistry.instance)
            ResearchRegistry.instance = new ResearchRegistry();
        return ResearchRegistry.instance;
    }
    static resetInstance() { ResearchRegistry.instance = null; }
    register(strategy) {
        this.strategies.set(strategy.strategyId, strategy);
        log.info('Research strategy registered', { id: strategy.strategyId, name: strategy.strategyName });
    }
    getStrategy(category) {
        for (const s of this.strategies.values())
            if (s.canHandle(category))
                return s;
        return null;
    }
    listStrategies() {
        return [...this.strategies.values()].map((s) => ({ id: s.strategyId, name: s.strategyName }));
    }
    get size() { return this.strategies.size; }
}
//# sourceMappingURL=research-registry.js.map