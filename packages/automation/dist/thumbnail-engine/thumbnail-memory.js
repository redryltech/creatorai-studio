import { generateId, ID_PREFIXES } from '@creatorai/shared';
export class ThumbnailMemory {
    static instance = null;
    entries = [];
    constructor() { }
    static getInstance() { if (!ThumbnailMemory.instance)
        ThumbnailMemory.instance = new ThumbnailMemory(); return ThumbnailMemory.instance; }
    static resetInstance() { ThumbnailMemory.instance = null; }
    record(input) {
        this.entries.push({ id: generateId(ID_PREFIXES.asset), ...input, createdAt: new Date().toISOString() });
        if (this.entries.length > 500)
            this.entries = this.entries.slice(-500);
    }
    getAll() { return [...this.entries]; }
    get size() { return this.entries.length; }
}
//# sourceMappingURL=thumbnail-memory.js.map