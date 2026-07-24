import type { IProvider } from './provider.interface';
export type ProviderCategory = 'llm' | 'image' | 'video' | 'voice' | 'search';
interface ProviderEntry {
    provider: IProvider;
    category: ProviderCategory;
    priority: number;
    registeredAt: Date;
    enabled: boolean;
}
/**
 * Singleton provider registry with fallback support.
 */
export declare class ProviderRegistry {
    private static instance;
    private providers;
    private constructor();
    static getInstance(): ProviderRegistry;
    static resetInstance(): void;
    /**
     * Register a provider.
     *
     * @param provider - Provider instance
     * @param category - Provider category (llm, image, video, voice, search)
     * @param priority - Priority within category (0 = highest)
     */
    register(provider: IProvider, category: ProviderCategory, priority?: number): void;
    /**
     * Get a specific provider by ID.
     */
    get<T extends IProvider>(providerId: string): T | undefined;
    /**
     * Get the primary (highest priority) provider for a category.
     * Returns the first available provider, falling back as needed.
     */
    getPrimary<T extends IProvider>(category: ProviderCategory): Promise<T | undefined>;
    /**
     * Get all providers for a category, sorted by priority.
     */
    getByCategory(category: ProviderCategory): ProviderEntry[];
    /**
     * List all registered provider IDs.
     */
    listIds(): string[];
    /**
     * List provider IDs by category.
     */
    listByCategory(category: ProviderCategory): string[];
    /**
     * Enable or disable a provider.
     */
    setEnabled(providerId: string, enabled: boolean): void;
    /**
     * Run availability checks on all providers.
     */
    checkAvailability(): Promise<Map<string, {
        available: boolean;
        category: ProviderCategory;
        priority: number;
    }>>;
}
export {};
//# sourceMappingURL=provider-registry.d.ts.map