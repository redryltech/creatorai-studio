export class BrandKitManager {
    kits = new Map();
    save(kit) { this.kits.set(kit.id, kit); }
    get(id) { return this.kits.get(id); }
    getByName(name) { return [...this.kits.values()].find(k => k.brandName.toLowerCase().includes(name.toLowerCase())); }
    list() { return [...this.kits.values()]; }
    update(id, updates) { const k = this.kits.get(id); if (!k)
        return false; Object.assign(k, updates, { modifiedAt: new Date().toISOString() }); return true; }
    delete(id) { return this.kits.delete(id); }
    get size() { return this.kits.size; }
}
//# sourceMappingURL=brand-kit-manager.js.map