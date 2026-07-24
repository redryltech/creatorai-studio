import type { IPublisher, SocialPlatformId, PublisherHealth, SocialAccount } from '../types/publishing.types';
export declare class PublisherRegistry {
    private static instance;
    private publishers;
    private constructor();
    static getInstance(): PublisherRegistry;
    static resetInstance(): void;
    register(publisher: IPublisher): void;
    get(platformId: SocialPlatformId): IPublisher | undefined;
    getOrThrow(platformId: SocialPlatformId): IPublisher;
    listPlatforms(): SocialPlatformId[];
    healthCheckAll(accounts: SocialAccount[]): Promise<Map<SocialPlatformId, PublisherHealth>>;
    get size(): number;
}
//# sourceMappingURL=publisher-registry.d.ts.map