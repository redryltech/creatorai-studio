import { ProviderCapabilityMap } from './provider-capability';
export class ProviderOptimizer {
    static optimize(prompt, providerId) {
        const cap = ProviderCapabilityMap.get(providerId);
        if (!cap)
            return { optimizedPrompt: prompt, tokenCount: prompt.split(/\s+/).length, truncated: false, safetyClean: true };
        const words = prompt.split(/\s+/);
        const maxWords = Math.floor(cap.maxTokens / 1.5);
        const truncated = words.length > maxWords;
        const optimized = truncated ? words.slice(0, maxWords).join(' ') : prompt;
        // Safety: remove potentially unsafe terms
        const unsafe = ['violence', 'blood', 'gore', 'nsfw', 'nude', 'naked'];
        let safePrompt = optimized;
        let safetyClean = true;
        for (const u of unsafe) {
            if (safePrompt.toLowerCase().includes(u)) {
                safePrompt = safePrompt.replace(new RegExp(u, 'gi'), '[removed]');
                safetyClean = false;
            }
        }
        return { optimizedPrompt: safePrompt, tokenCount: safePrompt.split(/\s+/).length, truncated, safetyClean };
    }
}
//# sourceMappingURL=provider-optimizer.js.map