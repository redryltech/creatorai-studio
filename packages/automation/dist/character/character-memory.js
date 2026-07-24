// ============================================================
// CreatorAI Studio — Character Memory
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
export class CharacterMemory {
    static instance = null;
    entries = [];
    constructor() { }
    static getInstance() {
        if (!CharacterMemory.instance)
            CharacterMemory.instance = new CharacterMemory();
        return CharacterMemory.instance;
    }
    static resetInstance() { CharacterMemory.instance = null; }
    record(input) {
        this.entries.push({
            id: generateId(ID_PREFIXES.asset),
            productionTitle: input.productionTitle,
            databaseId: input.databaseId,
            entityCount: input.entityCount,
            continuityScore: input.continuityScore,
            createdAt: new Date().toISOString(),
        });
        if (this.entries.length > 500)
            this.entries = this.entries.slice(-500);
    }
    getAll() { return [...this.entries]; }
    get size() { return this.entries.length; }
}
//# sourceMappingURL=character-memory.js.map