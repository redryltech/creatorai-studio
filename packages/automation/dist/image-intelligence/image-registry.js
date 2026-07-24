import { Logger } from '@creatorai/agents';
const log = Logger.for('ImageRegistry');
export class ImageRegistry {
    static instance = null;
    strategies = new Map();
    constructor() { }
    static getInstance() { if (!ImageRegistry.instance)
        ImageRegistry.instance = new ImageRegistry(); return ImageRegistry.instance; }
    static resetInstance() { ImageRegistry.instance = null; }
    register(s) { this.strategies.set(s.strategyId, s); log.info('Image strategy registered', { id: s.strategyId }); }
    get size() { return this.strategies.size; }
}
//# sourceMappingURL=image-registry.js.map