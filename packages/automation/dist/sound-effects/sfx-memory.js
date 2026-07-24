import { generateId, ID_PREFIXES } from '@creatorai/shared';
export class SfxMemory {
    static instance = null;
    entries = [];
    constructor() { }
    static getInstance() { if (!SfxMemory.instance)
        SfxMemory.instance = new SfxMemory(); return SfxMemory.instance; }
    static resetInstance() { SfxMemory.instance = null; }
    record(input) {
        this.entries.push({ id: generateId(ID_PREFIXES.asset), ...input, createdAt: new Date().toISOString() });
    }
    getAll() { return [...this.entries]; }
    get size() { return this.entries.length; }
}
//# sourceMappingURL=sfx-memory.js.map