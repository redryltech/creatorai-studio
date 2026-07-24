// ============================================================
// CreatorAI Studio — Seed Manager
// ============================================================
// Manages deterministic seeds for visual consistency.
// Each entity gets a global seed; scenes get variation seeds.
// Provider-specific seed mappings ensure compatibility.
// ============================================================

import { createHash } from 'crypto';

export class SeedManager {
  private globalBase: number;

  constructor(baseSeed?: number) {
    this.globalBase = baseSeed ?? SeedManager.generateBaseSeed();
  }

  /** Generate a deterministic seed from a string key. */
  seedFromKey(key: string): number {
    const hash = createHash('md5').update(key).digest();
    return Math.abs(hash.readInt32BE(0)) % 2147483647;
  }

  /** Global seed for an entity (consistent across all scenes). */
  entitySeed(entityId: string): number {
    return this.seedFromKey(`${this.globalBase}:entity:${entityId}`);
  }

  /** Scene-specific seed (adds variation while keeping entity identity). */
  sceneSeed(entityId: string, sceneId: string): number {
    return this.seedFromKey(`${this.globalBase}:entity:${entityId}:scene:${sceneId}`);
  }

  /** Variation seed (for slight differences — pose, angle, not identity). */
  variationSeed(entityId: string, variationIndex: number): number {
    return this.seedFromKey(`${this.globalBase}:entity:${entityId}:var:${variationIndex}`);
  }

  /** Map seeds for specific providers. */
  providerSeedMap(entityId: string): Record<string, number> {
    const base = this.entitySeed(entityId);
    return {
      flux: base,
      dall_e: base % 1000000000,
      midjourney: base % 999999999,
      runway: base,
      veo: base,
      kling: base,
      luma: base,
      pika: base,
      seedance: base,
      hunyuan: base,
      replicate: base,
      pollinations: base % 999999,
    };
  }

  /** Get the global base seed. */
  getBaseSeed(): number { return this.globalBase; }

  private static generateBaseSeed(): number {
    return Math.floor(Math.random() * 2147483647);
  }
}
