import type { IPublisher, SocialAccount, PublishRequest, PublishResult, PublisherHealth, SocialPlatformId } from '../types/publishing.types';
export interface InstagramPublisherConfig {
    appId: string;
    appSecret: string;
    graphVersion: string;
}
export declare class InstagramPublisher implements IPublisher {
    readonly platformId: SocialPlatformId;
    readonly platformName = "Instagram";
    private config;
    /** Set Meta App config. Called during bootstrap. */
    configure(config: InstagramPublisherConfig): void;
    private get graphUrl();
    authenticate(account: SocialAccount): Promise<boolean>;
    refreshAuth(account: SocialAccount): Promise<SocialAccount>;
    validate(request: PublishRequest): {
        valid: boolean;
        errors: string[];
    };
    upload(request: PublishRequest, account: SocialAccount, onProgress: (progress: number, message: string) => void): Promise<PublishResult>;
    schedule(request: PublishRequest, account: SocialAccount, scheduleAt: Date): Promise<PublishResult>;
    delete(platformPostId: string, account: SocialAccount): Promise<boolean>;
    update(platformPostId: string, updates: Partial<PublishRequest['seo']>, account: SocialAccount): Promise<boolean>;
    getStatus(platformPostId: string, account: SocialAccount): Promise<{
        status: string;
        url: string;
    }>;
    healthCheck(account: SocialAccount): Promise<PublisherHealth>;
    private buildCaption;
}
//# sourceMappingURL=instagram.publisher.d.ts.map