export class EmbeddingManager {
    embeddings = new Map();
    save(emb) { this.embeddings.set(emb.id, emb); }
    getByAsset(assetId) { return [...this.embeddings.values()].filter(e => e.assetId === assetId); }
    getByType(type) { return [...this.embeddings.values()].filter(e => e.type === type); }
    resolve(placeholder) { return [...this.embeddings.values()].find(e => e.placeholder === placeholder); }
    list() { return [...this.embeddings.values()]; }
    get size() { return this.embeddings.size; }
}
//# sourceMappingURL=embedding-manager.js.map