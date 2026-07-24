export class StyleGuideManager {
    guides = new Map();
    save(guide) { this.guides.set(guide.id, guide); }
    get(id) { return this.guides.get(id); }
    list() { return [...this.guides.values()]; }
    get size() { return this.guides.size; }
}
//# sourceMappingURL=style-guide-manager.js.map