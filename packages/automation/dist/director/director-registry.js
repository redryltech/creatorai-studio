// ============================================================
// CreatorAI Studio — Director Registry
// ============================================================
// Manages Director planning strategies. Currently only the
// default DirectorPlanner is registered, but the architecture
// supports future specialized directors (automotive, music video,
// documentary, etc.) without changing the pipeline.
// ============================================================
import { Logger } from '@creatorai/agents';
const log = Logger.for('DirectorRegistry');
export class DirectorRegistry {
    static instance = null;
    strategies = new Map();
    constructor() { }
    static getInstance() {
        if (!DirectorRegistry.instance) {
            DirectorRegistry.instance = new DirectorRegistry();
        }
        return DirectorRegistry.instance;
    }
    static resetInstance() { DirectorRegistry.instance = null; }
    register(strategy) {
        this.strategies.set(strategy.strategyId, strategy);
        log.info('Director strategy registered', {
            id: strategy.strategyId,
            name: strategy.strategyName,
            categories: strategy.supportedCategories,
        });
    }
    /**
     * Get the best strategy for a content category.
     */
    getStrategy(category) {
        // Find a specialized strategy first
        for (const strategy of this.strategies.values()) {
            if (strategy.canHandle(category))
                return strategy;
        }
        // Fallback to 'default' strategy
        return this.strategies.get('default') ?? null;
    }
    listStrategies() {
        return Array.from(this.strategies.values()).map((s) => ({
            id: s.strategyId,
            name: s.strategyName,
            categories: s.supportedCategories,
        }));
    }
    get size() { return this.strategies.size; }
}
//# sourceMappingURL=director-registry.js.map