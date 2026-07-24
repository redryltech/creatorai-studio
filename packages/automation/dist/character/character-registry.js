// ============================================================
// CreatorAI Studio — Character Registry
// ============================================================
import { Logger } from '@creatorai/agents';
const log = Logger.for('CharacterRegistry');
export class CharacterRegistry {
    static instance = null;
    strategies = new Map();
    constructor() { }
    static getInstance() {
        if (!CharacterRegistry.instance)
            CharacterRegistry.instance = new CharacterRegistry();
        return CharacterRegistry.instance;
    }
    static resetInstance() { CharacterRegistry.instance = null; }
    register(strategy) {
        this.strategies.set(strategy.strategyId, strategy);
        log.info('Character strategy registered', { id: strategy.strategyId });
    }
    getStrategy(category) {
        for (const s of this.strategies.values())
            if (s.canHandle(category))
                return s;
        return null;
    }
    get size() { return this.strategies.size; }
}
//# sourceMappingURL=character-registry.js.map