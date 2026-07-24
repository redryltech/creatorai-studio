import { Logger } from '@creatorai/agents';
const log = Logger.for('AssetRegistry');
export class AssetRegistry {
    static instance = null;
    strategies = new Map();
    constructor() { }
    static getInstance() { if (!AssetRegistry.instance)
        AssetRegistry.instance = new AssetRegistry(); return AssetRegistry.instance; }
    static resetInstance() { AssetRegistry.instance = null; }
    register(s) { this.strategies.set(s.strategyId, s); log.info('Asset strategy registered', { id: s.strategyId }); }
    get size() { return this.strategies.size; }
}
//# sourceMappingURL=asset-registry.js.map