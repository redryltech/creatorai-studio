// ============================================================
// CreatorAI Studio — Research Memory
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
/** Persistent memory store for research results. */
export class ResearchMemory {
    static instance = null;
    entries = [];
    constructor() { }
    static getInstance() {
        if (!ResearchMemory.instance)
            ResearchMemory.instance = new ResearchMemory();
        return ResearchMemory.instance;
    }
    static resetInstance() { ResearchMemory.instance = null; }
    /** Record a research result for future reference. */
    record(input) {
        this.entries.push({ id: generateId(ID_PREFIXES.asset), ...input, createdAt: new Date().toISOString() });
        if (this.entries.length > 500)
            this.entries = this.entries.slice(-500);
    }
    /** Find past research for similar topics. */
    findSimilar(topic, limit = 5) {
        const words = topic.toLowerCase().split(/\s+/);
        return this.entries
            .map((e) => ({ entry: e, score: words.filter((w) => e.topic.toLowerCase().includes(w)).length }))
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map((item) => item.entry);
    }
    getAll() { return [...this.entries]; }
    get size() { return this.entries.length; }
}
//# sourceMappingURL=research-memory.js.map