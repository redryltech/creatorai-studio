import type { IMediaProvider } from '../types/media.types';
export declare class MediaProviderRegistry {
    private static instance;
    private providers;
    private constructor();
    static getInstance(): MediaProviderRegistry;
    static resetInstance(): void;
    /** Register a media provider. */
    register(provider: IMediaProvider): void;
    /** Get the best available provider for a media type (by priority, with failover). */
    getPrimary(mediaType: 'image' | 'video' | 'voice' | 'music'): Promise<IMediaProvider | null>;
    /** Get all providers for a media type, sorted by priority (lower = higher priority). */
    getByType(mediaType: 'image' | 'video' | 'voice' | 'music'): IMediaProvider[];
    /** Get a specific provider by ID. */
    get(providerId: string): IMediaProvider | undefined;
    /** List all registered provider IDs. */
    listIds(): string[];
    /** Run health checks on all providers. */
    healthCheckAll(): Promise<Map<string, {
        healthy: boolean;
        latencyMs: number;
        type: string;
    }>>;
    get size(): number;
}
//# sourceMappingURL=media-provider-registry.d.ts.map