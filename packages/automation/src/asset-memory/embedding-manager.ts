import type { EmbeddingRecord } from './asset.types';

export class EmbeddingManager {
  private embeddings: Map<string, EmbeddingRecord> = new Map();

  save(emb: EmbeddingRecord): void { this.embeddings.set(emb.id, emb); }
  getByAsset(assetId: string): EmbeddingRecord[] { return [...this.embeddings.values()].filter(e => e.assetId === assetId); }
  getByType(type: EmbeddingRecord['type']): EmbeddingRecord[] { return [...this.embeddings.values()].filter(e => e.type === type); }
  resolve(placeholder: string): EmbeddingRecord | undefined { return [...this.embeddings.values()].find(e => e.placeholder === placeholder); }
  list(): EmbeddingRecord[] { return [...this.embeddings.values()]; }
  get size(): number { return this.embeddings.size; }
}
