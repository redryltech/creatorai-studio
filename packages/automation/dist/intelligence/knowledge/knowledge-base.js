// ============================================================
// CreatorAI Studio — Knowledge Base
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
const log = Logger.for('KnowledgeBase');
export class KnowledgeBase {
    static instance = null;
    entries = [];
    constructor() { }
    static getInstance() { if (!KnowledgeBase.instance)
        KnowledgeBase.instance = new KnowledgeBase(); return KnowledgeBase.instance; }
    static resetInstance() { KnowledgeBase.instance = null; }
    add(params) {
        const entry = { id: generateId(ID_PREFIXES.step), ...params, usageCount: 0, createdAt: new Date(), updatedAt: new Date() };
        this.entries.push(entry);
        log.info('Knowledge added', { category: entry.category, title: entry.title });
        return entry;
    }
    search(userId, query, category) {
        const q = query.toLowerCase();
        return this.entries.filter((e) => e.userId === userId && (!category || e.category === category) && (e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q) || e.tags.some((t) => t.toLowerCase().includes(q))))
            .sort((a, b) => b.performanceScore - a.performanceScore);
    }
    getTopPerforming(userId, category, limit = 10) {
        return this.entries.filter((e) => e.userId === userId && e.category === category).sort((a, b) => b.performanceScore - a.performanceScore).slice(0, limit);
    }
    getByUser(userId) {
        return this.entries.filter((e) => e.userId === userId).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }
    incrementUsage(entryId) {
        const entry = this.entries.find((e) => e.id === entryId);
        if (entry) {
            entry.usageCount++;
            entry.updatedAt = new Date();
        }
    }
    get size() { return this.entries.length; }
}
//# sourceMappingURL=knowledge-base.js.map