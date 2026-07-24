import type { EmbeddingRecord } from './asset.types';
export declare class EmbeddingManager {
    private embeddings;
    save(emb: EmbeddingRecord): void;
    getByAsset(assetId: string): EmbeddingRecord[];
    getByType(type: EmbeddingRecord['type']): EmbeddingRecord[];
    resolve(placeholder: string): EmbeddingRecord | undefined;
    list(): EmbeddingRecord[];
    get size(): number;
}
//# sourceMappingURL=embedding-manager.d.ts.map