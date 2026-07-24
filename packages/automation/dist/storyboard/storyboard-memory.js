// ============================================================
// CreatorAI Studio — Storyboard Memory
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
export class StoryboardMemory {
    static instance = null;
    entries = [];
    constructor() { }
    static getInstance() {
        if (!StoryboardMemory.instance) {
            StoryboardMemory.instance = new StoryboardMemory();
        }
        return StoryboardMemory.instance;
    }
    static resetInstance() { StoryboardMemory.instance = null; }
    record(input) {
        this.entries.push({
            id: generateId(ID_PREFIXES.asset),
            title: input.title,
            storyboardId: input.storyboardId,
            frameCount: input.frameCount,
            category: input.category,
            style: input.style,
            qualityScore: 0,
            createdAt: new Date().toISOString(),
        });
        if (this.entries.length > 500)
            this.entries = this.entries.slice(-500);
    }
    updateQuality(storyboardId, score) {
        const entry = this.entries.find((e) => e.storyboardId === storyboardId);
        if (entry)
            entry.qualityScore = score;
    }
    getAll() { return [...this.entries]; }
    get size() { return this.entries.length; }
}
//# sourceMappingURL=storyboard-memory.js.map