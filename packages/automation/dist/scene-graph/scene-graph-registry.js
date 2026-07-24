// ============================================================
// CreatorAI Studio — Scene Graph Registry
// ============================================================
import { Logger } from '@creatorai/agents';
const log = Logger.for('SceneGraphRegistry');
export class SceneGraphRegistry {
    static instance = null;
    strategies = new Map();
    constructor() { }
    static getInstance() {
        if (!SceneGraphRegistry.instance)
            SceneGraphRegistry.instance = new SceneGraphRegistry();
        return SceneGraphRegistry.instance;
    }
    static resetInstance() { SceneGraphRegistry.instance = null; }
    register(strategy) {
        this.strategies.set(strategy.strategyId, strategy);
        log.info('Scene graph strategy registered', { id: strategy.strategyId });
    }
    get size() { return this.strategies.size; }
}
//# sourceMappingURL=scene-graph-registry.js.map