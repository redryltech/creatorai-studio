export class ReferenceManager {
    refs = [];
    add(ref) { this.refs.push(ref); }
    getBySource(assetId) { return this.refs.filter(r => r.sourceAssetId === assetId); }
    getByTarget(assetId) { return this.refs.filter(r => r.targetAssetId === assetId); }
    getChain(assetId, depth = 3) {
        const result = [];
        const queue = [assetId];
        const visited = new Set();
        for (let d = 0; d < depth && queue.length > 0; d++) {
            const id = queue.shift();
            if (visited.has(id))
                continue;
            visited.add(id);
            const related = this.refs.filter(r => r.sourceAssetId === id || r.targetAssetId === id);
            result.push(...related);
            for (const r of related) {
                if (r.sourceAssetId !== id)
                    queue.push(r.sourceAssetId);
                if (r.targetAssetId !== id)
                    queue.push(r.targetAssetId);
            }
        }
        return result;
    }
    getAll() { return [...this.refs]; }
    get size() { return this.refs.length; }
}
//# sourceMappingURL=reference-manager.js.map