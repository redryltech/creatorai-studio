// ============================================================
// CreatorAI Studio — Storyboard Registry
// ============================================================
import { Logger } from '@creatorai/agents';
const log = Logger.for('StoryboardRegistry');
export class StoryboardRegistry {
    static instance = null;
    strategies = new Map();
    constructor() { }
    static getInstance() {
        if (!StoryboardRegistry.instance)
            StoryboardRegistry.instance = new StoryboardRegistry();
        return StoryboardRegistry.instance;
    }
    static resetInstance() { StoryboardRegistry.instance = null; }
    register(strategy) {
        this.strategies.set(strategy.strategyId, strategy);
        log.info('Storyboard strategy registered', { id: strategy.strategyId });
    }
    getStrategy(style) {
        for (const s of this.strategies.values())
            if (s.canHandle(style))
                return s;
        return this.strategies.get('default') ?? null;
    }
    get size() { return this.strategies.size; }
}
//# sourceMappingURL=storyboard-registry.js.map