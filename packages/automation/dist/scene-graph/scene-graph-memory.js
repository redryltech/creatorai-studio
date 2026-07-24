// ============================================================
// CreatorAI Studio — Scene Graph Memory
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
export class SceneGraphMemory {
    static instance = null;
    entries = [];
    constructor() { }
    static getInstance() {
        if (!SceneGraphMemory.instance)
            SceneGraphMemory.instance = new SceneGraphMemory();
        return SceneGraphMemory.instance;
    }
    static resetInstance() { SceneGraphMemory.instance = null; }
    record(input) {
        this.entries.push({
            id: generateId(ID_PREFIXES.asset),
            productionTitle: input.productionTitle,
            packageId: input.packageId,
            sceneCount: input.sceneCount,
            avgComplexity: input.avgComplexity,
            createdAt: new Date().toISOString(),
        });
        if (this.entries.length > 500)
            this.entries = this.entries.slice(-500);
    }
    getAll() { return [...this.entries]; }
    get size() { return this.entries.length; }
}
//# sourceMappingURL=scene-graph-memory.js.map