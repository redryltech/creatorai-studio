import { generateId, ID_PREFIXES } from '@creatorai/shared';
export class TranslationMemory {
    static instance = null;
    entries = [];
    constructor() { }
    static getInstance() { if (!TranslationMemory.instance)
        TranslationMemory.instance = new TranslationMemory(); return TranslationMemory.instance; }
    static resetInstance() { TranslationMemory.instance = null; }
    record(input) {
        this.entries.push({ id: generateId(ID_PREFIXES.asset), ...input, createdAt: new Date().toISOString() });
        if (this.entries.length > 500)
            this.entries = this.entries.slice(-500);
    }
    getAll() { return [...this.entries]; }
    get size() { return this.entries.length; }
}
//# sourceMappingURL=translation-memory.js.map