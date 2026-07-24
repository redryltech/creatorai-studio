import type { IVideoProvider, VideoProviderStatus, VideoProviderCapabilities } from './video-provider.interface';
export declare class VideoProviderRegistry {
    private static instance;
    private providers;
    private constructor();
    static getInstance(): VideoProviderRegistry;
    static resetInstance(): void;
    /** Register a video provider. */
    register(provider: IVideoProvider): void;
    /** Unregister a provider by ID. */
    unregister(providerId: string): boolean;
    /**
     * Get the best available video provider (by priority, with failover).
     * Returns null if no provider is available.
     */
    getPrimary(): Promise<IVideoProvider | null>;
    /**
     * Get a specific provider by ID.
     */
    get(providerId: string): IVideoProvider | undefined;
    /**
     * Get all registered providers, sorted by priority (lower = first).
     */
    getSorted(): IVideoProvider[];
    /**
     * List all registered provider IDs.
     */
    listIds(): string[];
    /**
     * List providers with their priorities and names.
     */
    listProviders(): Array<{
        id: string;
        name: string;
        priority: number;
    }>;
    /**
     * Run health checks on all registered providers.
     */
    healthCheckAll(): Promise<Map<string, VideoProviderStatus>>;
    /**
     * Get capabilities of all providers.
     */
    getCapabilitiesAll(): Map<string, VideoProviderCapabilities>;
    /**
     * Get total number of registered providers.
     */
    get size(): number;
}
//# sourceMappingURL=video-provider-registry.d.ts.map