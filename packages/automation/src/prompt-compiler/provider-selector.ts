import { ProviderRouter, type ProviderRoute } from './provider-router';

export class ProviderSelector {
  static selectBest(mediaType: 'image' | 'video' | 'voice' | 'music', budget: 'free' | 'budget' | 'standard' | 'premium', preferQuality: boolean = true): ProviderRoute | null {
    const routes = ProviderRouter.route(mediaType, budget);
    if (routes.length === 0) return null;
    if (preferQuality) routes.sort((a, b) => b.quality - a.quality);
    return routes[0] ?? null;
  }

  static selectAll(budget: 'free' | 'budget' | 'standard' | 'premium'): Record<string, ProviderRoute | null> {
    return {
      image: ProviderSelector.selectBest('image', budget),
      video: ProviderSelector.selectBest('video', budget),
      voice: ProviderSelector.selectBest('voice', budget),
      music: ProviderSelector.selectBest('music', budget),
    };
  }
}
