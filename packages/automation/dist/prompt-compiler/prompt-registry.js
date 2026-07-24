import { Logger } from '@creatorai/agents';
const log = Logger.for('PromptRegistry');
export class PromptRegistry {
    static instance = null;
    strategies = new Map();
    constructor() { }
    static getInstance() { if (!PromptRegistry.instance)
        PromptRegistry.instance = new PromptRegistry(); return PromptRegistry.instance; }
    static resetInstance() { PromptRegistry.instance = null; }
    register(s) { this.strategies.set(s.strategyId, s); }
    get size() { return this.strategies.size; }
}
//# sourceMappingURL=prompt-registry.js.map