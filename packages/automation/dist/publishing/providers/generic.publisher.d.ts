import type { IPublisher, SocialAccount, PublishRequest, PublishResult, PublisherHealth, SocialPlatformId } from '../types/publishing.types';
export declare class GenericPublisher implements IPublisher {
    readonly platformId: SocialPlatformId;
    readonly platformName: string;
    private readonly maxTitle;
    private readonly maxDescription;
    private readonly maxHashtags;
    constructor(config: {
        platformId: SocialPlatformId;
        platformName: string;
        maxTitle: number;
        maxDescription: number;
        maxHashtags: number;
    });
    authenticate(account: SocialAccount): Promise<boolean>;
    refreshAuth(account: SocialAccount): Promise<SocialAccount>;
    validate(request: PublishRequest): {
        valid: boolean;
        errors: string[];
    };
    upload(request: PublishRequest, account: SocialAccount, onProgress: (p: number, m: string) => void): Promise<PublishResult>;
    schedule(request: PublishRequest, account: SocialAccount, scheduleAt: Date): Promise<PublishResult>;
    delete(platformPostId: string, _account: SocialAccount): Promise<boolean>;
    update(platformPostId: string, updates: Partial<PublishRequest['seo']>, _account: SocialAccount): Promise<boolean>;
    getStatus(platformPostId: string, _account: SocialAccount): Promise<{
        status: string;
        url: string;
    }>;
    healthCheck(account: SocialAccount): Promise<PublisherHealth>;
}
export declare const TikTokPublisher: GenericPublisher;
export declare const FacebookPublisher: GenericPublisher;
export declare const LinkedInPublisher: GenericPublisher;
export declare const XPublisher: GenericPublisher;
//# sourceMappingURL=generic.publisher.d.ts.map