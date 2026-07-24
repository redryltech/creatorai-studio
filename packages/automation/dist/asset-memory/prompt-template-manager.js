export class PromptTemplateManager {
    templates = new Map();
    save(tmpl) { this.templates.set(tmpl.id, tmpl); }
    get(id) { return this.templates.get(id); }
    getByCategory(cat) { return [...this.templates.values()].filter(t => t.category === cat); }
    list() { return [...this.templates.values()]; }
    /** Apply a template with variable substitution. */
    apply(id, vars) {
        const t = this.templates.get(id);
        if (!t)
            return null;
        const sub = (s) => { let r = s; for (const [k, v] of Object.entries(vars))
            r = r.replace(new RegExp(k.replace(/[{}]/g, '\\$&'), 'g'), v); return r; };
        return { image: sub(t.imagePromptTemplate), video: sub(t.videoPromptTemplate), negative: sub(t.negativePromptTemplate) };
    }
    get size() { return this.templates.size; }
}
//# sourceMappingURL=prompt-template-manager.js.map