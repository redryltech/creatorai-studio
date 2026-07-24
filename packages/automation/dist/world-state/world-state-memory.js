// ============================================================
// CreatorAI Studio — World State Memory
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
export class WorldStateMemory {
    static instance = null;
    entries = [];
    constructor() { }
    static getInstance() {
        if (!WorldStateMemory.instance)
            WorldStateMemory.instance = new WorldStateMemory();
        return WorldStateMemory.instance;
    }
    static resetInstance() { WorldStateMemory.instance = null; }
    record(input) {
        this.entries.push({
            id: generateId(ID_PREFIXES.asset), ...input, createdAt: new Date().toISOString(),
        });
        if (this.entries.length > 500)
            this.entries = this.entries.slice(-500);
    }
    getAll() { return [...this.entries]; }
    get size() { return this.entries.length; }
}
//# sourceMappingURL=world-state-memory.js.map