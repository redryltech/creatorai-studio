import { ProviderRouter } from './provider-router';
export class ProviderSelector {
    static selectBest(mediaType, budget, preferQuality = true) {
        const routes = ProviderRouter.route(mediaType, budget);
        if (routes.length === 0)
            return null;
        if (preferQuality)
            routes.sort((a, b) => b.quality - a.quality);
        return routes[0] ?? null;
    }
    static selectAll(budget) {
        return {
            image: ProviderSelector.selectBest('image', budget),
            video: ProviderSelector.selectBest('video', budget),
            voice: ProviderSelector.selectBest('voice', budget),
            music: ProviderSelector.selectBest('music', budget),
        };
    }
}
//# sourceMappingURL=provider-selector.js.map