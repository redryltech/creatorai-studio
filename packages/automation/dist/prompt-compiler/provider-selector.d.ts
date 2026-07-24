import { type ProviderRoute } from './provider-router';
export declare class ProviderSelector {
    static selectBest(mediaType: 'image' | 'video' | 'voice' | 'music', budget: 'free' | 'budget' | 'standard' | 'premium', preferQuality?: boolean): ProviderRoute | null;
    static selectAll(budget: 'free' | 'budget' | 'standard' | 'premium'): Record<string, ProviderRoute | null>;
}
//# sourceMappingURL=provider-selector.d.ts.map