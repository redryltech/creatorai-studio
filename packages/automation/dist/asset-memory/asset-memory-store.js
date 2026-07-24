import { generateId, ID_PREFIXES } from '@creatorai/shared';
export class AssetMemoryStore {
    static instance = null;
    entries = [];
    globalAssetLibrary = [];
    constructor() { }
    static getInstance() { if (!AssetMemoryStore.instance)
        AssetMemoryStore.instance = new AssetMemoryStore(); return AssetMemoryStore.instance; }
    static resetInstance() { AssetMemoryStore.instance = null; }
    record(input) {
        this.entries.push({ id: generateId(ID_PREFIXES.asset), ...input, createdAt: new Date().toISOString() });
        if (this.entries.length > 500)
            this.entries = this.entries.slice(-500);
    }
    addToGlobalLibrary(assets) {
        for (const asset of assets) {
            const existing = this.globalAssetLibrary.find(a => a.uuid === asset.uuid);
            if (!existing)
                this.globalAssetLibrary.push(asset);
            else {
                existing.usageCount++;
                existing.modifiedAt = new Date().toISOString();
            }
        }
    }
    searchGlobal(query) {
        const q = query.toLowerCase();
        return this.globalAssetLibrary.filter(a => a.name.toLowerCase().includes(q) || a.tags.some(t => t.includes(q)) || a.category.includes(q));
    }
    getAll() { return [...this.entries]; }
    getGlobalLibrary() { return [...this.globalAssetLibrary]; }
    get size() { return this.entries.length; }
}
//# sourceMappingURL=asset-memory-store.js.map