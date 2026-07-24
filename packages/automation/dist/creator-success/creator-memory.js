import { generateId, ID_PREFIXES } from '@creatorai/shared';
export class CreatorMemory {
    static instance = null;
    entries = [];
    constructor() { }
    static getInstance() { if (!CreatorMemory.instance)
        CreatorMemory.instance = new CreatorMemory(); return CreatorMemory.instance; }
    static resetInstance() { CreatorMemory.instance = null; }
    record(input) {
        this.entries.push({ id: generateId(ID_PREFIXES.asset), ...input, createdAt: new Date().toISOString() });
        if (this.entries.length > 500)
            this.entries = this.entries.slice(-500);
    }
    getAll() { return [...this.entries]; }
    getAverageScore() { return this.entries.length ? Math.round(this.entries.reduce((s, e) => s + e.creatorScore, 0) / this.entries.length) : 0; }
    get size() { return this.entries.length; }
}
//# sourceMappingURL=creator-memory.js.map