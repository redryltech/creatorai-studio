// ============================================================
// CreatorAI Studio — Provider Registry
// ============================================================
// Central registry for AI providers. Each provider type
// (LLM, image, video, voice, search) can have multiple
// implementations with automatic fallback.
//
// Example:
//   LLM: OpenAI (primary) → Anthropic (fallback)
//   Image: Replicate/Flux (primary) → DALL-E 3 (fallback)
//   Voice: ElevenLabs (primary) → OpenAI TTS (fallback)
// ============================================================

import type { IProvider } from './provider.interface';

export type ProviderCategory = 'llm' | 'image' | 'video' | 'voice' | 'search';

interface ProviderEntry {
  provider: IProvider;
  category: ProviderCategory;
  priority: number; // Lower = higher priority (0 = primary)
  registeredAt: Date;
  enabled: boolean;
}

/**
 * Singleton provider registry with fallback support.
 */
export class ProviderRegistry {
  private static instance: ProviderRegistry | null = null;
  private providers: Map<string, ProviderEntry> = new Map();

  private constructor() {}

  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  static resetInstance(): void {
    ProviderRegistry.instance = null;
  }

  /**
   * Register a provider.
   *
   * @param provider - Provider instance
   * @param category - Provider category (llm, image, video, voice, search)
   * @param priority - Priority within category (0 = highest)
   */
  register(provider: IProvider, category: ProviderCategory, priority: number = 0): void {
    this.providers.set(provider.id, {
      provider,
      category,
      priority,
      registeredAt: new Date(),
      enabled: true,
    });
  }

  /**
   * Get a specific provider by ID.
   */
  get<T extends IProvider>(providerId: string): T | undefined {
    const entry = this.providers.get(providerId);
    if (!entry || !entry.enabled) return undefined;
    return entry.provider as T;
  }

  /**
   * Get the primary (highest priority) provider for a category.
   * Returns the first available provider, falling back as needed.
   */
  async getPrimary<T extends IProvider>(category: ProviderCategory): Promise<T | undefined> {
    const entries = this.getByCategory(category);

    for (const entry of entries) {
      try {
        const isAvailable = await entry.provider.isAvailable();
        if (isAvailable) {
          return entry.provider as T;
        }
      } catch {
        // Provider not available, try next
        continue;
      }
    }

    return undefined;
  }

  /**
   * Get all providers for a category, sorted by priority.
   */
  getByCategory(category: ProviderCategory): ProviderEntry[] {
    return Array.from(this.providers.values())
      .filter((entry) => entry.category === category && entry.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * List all registered provider IDs.
   */
  listIds(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * List provider IDs by category.
   */
  listByCategory(category: ProviderCategory): string[] {
    return this.getByCategory(category).map((entry) => entry.provider.id);
  }

  /**
   * Enable or disable a provider.
   */
  setEnabled(providerId: string, enabled: boolean): void {
    const entry = this.providers.get(providerId);
    if (entry) {
      entry.enabled = enabled;
    }
  }

  /**
   * Run availability checks on all providers.
   */
  async checkAvailability(): Promise<
    Map<string, { available: boolean; category: ProviderCategory; priority: number }>
  > {
    const results = new Map<
      string,
      { available: boolean; category: ProviderCategory; priority: number }
    >();

    const checks = Array.from(this.providers.entries()).map(async ([id, entry]) => {
      try {
        const available = await entry.provider.isAvailable();
        results.set(id, {
          available,
          category: entry.category,
          priority: entry.priority,
        });
      } catch {
        results.set(id, {
          available: false,
          category: entry.category,
          priority: entry.priority,
        });
      }
    });

    await Promise.allSettled(checks);
    return results;
  }
}
