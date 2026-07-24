// ============================================================
// CreatorAI Studio — Music Provider Registry
// ============================================================

import { Logger } from '@creatorai/agents';
import type { IMusicProvider } from './music-provider.interface';

const log = Logger.for('MusicProviderRegistry');

export class MusicProviderRegistry {
  private static instance: MusicProviderRegistry | null = null;
  private providers: Map<string, IMusicProvider> = new Map();

  private constructor() {}

  static getInstance(): MusicProviderRegistry {
    if (!MusicProviderRegistry.instance) {
      MusicProviderRegistry.instance = new MusicProviderRegistry();
    }
    return MusicProviderRegistry.instance;
  }

  static resetInstance(): void { MusicProviderRegistry.instance = null; }

  register(provider: IMusicProvider): void {
    this.providers.set(provider.providerId, provider);
    log.info('Music provider registered', {
      id: provider.providerId, name: provider.providerName, priority: provider.priority,
    });
  }

  async getPrimary(): Promise<IMusicProvider | null> {
    const sorted = Array.from(this.providers.values()).sort((a, b) => a.priority - b.priority);
    for (const p of sorted) {
      try { if (await p.isAvailable()) return p; } catch { /* next */ }
    }
    return null;
  }

  get(id: string): IMusicProvider | undefined { return this.providers.get(id); }
  listIds(): string[] { return Array.from(this.providers.keys()); }
  get size(): number { return this.providers.size; }
}
