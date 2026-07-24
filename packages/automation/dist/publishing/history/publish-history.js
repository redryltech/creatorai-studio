// ============================================================
// CreatorAI Studio — Publish History Manager
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
const log = Logger.for('PublishHistory');
export class PublishHistory {
    static instance = null;
    entries = [];
    constructor() { }
    static getInstance() { if (!PublishHistory.instance)
        PublishHistory.instance = new PublishHistory(); return PublishHistory.instance; }
    static resetInstance() { PublishHistory.instance = null; }
    record(entry) {
        const full = { id: generateId(ID_PREFIXES.step), ...entry };
        this.entries.push(full);
        log.info('Publish recorded', { platform: entry.platform, url: entry.platformUrl, status: entry.status });
        return full;
    }
    getByUser(userId, limit = 50) {
        return this.entries.filter((e) => e.userId === userId).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()).slice(0, limit);
    }
    getByProject(projectId) {
        return this.entries.filter((e) => e.projectId === projectId).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    }
    getByPlatform(userId, platform) {
        return this.entries.filter((e) => e.userId === userId && e.platform === platform);
    }
    get totalPublished() { return this.entries.filter((e) => e.status === 'published').length; }
}
//# sourceMappingURL=publish-history.js.map