import { generateId, ID_PREFIXES } from '@creatorai/shared';
export class PromptMemory {
    static instance = null;
    entries = [];
    constructor() { }
    static getInstance() { if (!PromptMemory.instance)
        PromptMemory.instance = new PromptMemory(); return PromptMemory.instance; }
    static resetInstance() { PromptMemory.instance = null; }
    record(input) {
        this.entries.push({ id: generateId(ID_PREFIXES.asset), ...input, createdAt: new Date().toISOString() });
        if (this.entries.length > 500)
            this.entries = this.entries.slice(-500);
    }
    getAll() { return [...this.entries]; }
    get size() { return this.entries.length; }
}
//# sourceMappingURL=prompt-memory.js.map