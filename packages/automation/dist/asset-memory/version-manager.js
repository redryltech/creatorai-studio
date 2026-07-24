export class VersionManager {
    versions = new Map();
    addVersion(assetId, version, changes, data) {
        if (!this.versions.has(assetId))
            this.versions.set(assetId, []);
        this.versions.get(assetId).push({ version, assetId, changes, data, createdAt: new Date().toISOString() });
    }
    getHistory(assetId) { return this.versions.get(assetId) ?? []; }
    getLatest(assetId) { const h = this.getHistory(assetId); return h[h.length - 1]; }
    rollback(assetId, version) { return this.getHistory(assetId).find(v => v.version === version); }
    diff(assetId, v1, v2) {
        const h = this.getHistory(assetId);
        const e1 = h.find(v => v.version === v1);
        const e2 = h.find(v => v.version === v2);
        if (!e1 || !e2)
            return { added: [], removed: [], changed: [] };
        const k1 = new Set(Object.keys(e1.data));
        const k2 = new Set(Object.keys(e2.data));
        return {
            added: [...k2].filter(k => !k1.has(k)),
            removed: [...k1].filter(k => !k2.has(k)),
            changed: [...k1].filter(k => k2.has(k) && JSON.stringify(e1.data[k]) !== JSON.stringify(e2.data[k])),
        };
    }
    get totalVersions() { return [...this.versions.values()].reduce((s, v) => s + v.length, 0); }
}
//# sourceMappingURL=version-manager.js.map