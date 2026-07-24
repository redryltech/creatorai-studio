export interface ProviderRoute {
    providerId: string;
    priority: number;
    cost: number;
    quality: number;
    speed: number;
    available: boolean;
}
export declare class ProviderRouter {
    static route(mediaType: 'image' | 'video' | 'voice' | 'music', budget: 'free' | 'budget' | 'standard' | 'premium'): ProviderRoute[];
}
//# sourceMappingURL=provider-router.d.ts.map