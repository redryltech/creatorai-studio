// ============================================================
// CreatorAI Studio — Keyword Engine
// ============================================================
// Generates primary, secondary, long-tail, and semantic
// keywords with SEO scoring. Provider-independent.
// ============================================================
import { Logger } from '@creatorai/agents';
const log = Logger.for('KeywordEngine');
/** Category → seed keyword clusters. */
const CATEGORY_SEEDS = {
    automotive: ['car', 'bike', 'motorcycle', 'engine', 'speed', 'horsepower', 'ride', 'review', 'performance', 'exhaust', 'fuel efficiency', 'top speed', 'specifications', 'price', 'mileage'],
    technology: ['ai', 'tech', 'software', 'gadget', 'innovation', 'digital', 'app', 'device', 'review', 'comparison', 'features', 'update', 'release', 'tutorial'],
    motivational: ['motivation', 'success', 'mindset', 'discipline', 'goals', 'inspiration', 'growth', 'habits', 'productivity', 'self improvement', 'hustle', 'winner'],
    sports: ['sports', 'fitness', 'workout', 'athlete', 'training', 'game', 'match', 'score', 'highlights', 'technique', 'strength'],
    luxury: ['luxury', 'premium', 'brand', 'fashion', 'lifestyle', 'design', 'elegant', 'exclusive', 'collection', 'limited edition'],
    travel: ['travel', 'destination', 'explore', 'adventure', 'tourism', 'places', 'trip', 'vlog', 'budget', 'itinerary', 'hidden gems'],
    food: ['recipe', 'cooking', 'food', 'restaurant', 'review', 'cuisine', 'kitchen', 'homemade', 'easy recipe', 'street food'],
    education: ['learn', 'tutorial', 'course', 'study', 'explained', 'tips', 'guide', 'how to', 'beginners', 'advanced'],
    finance: ['money', 'invest', 'stock', 'savings', 'budget', 'income', 'wealth', 'financial', 'trading', 'crypto', 'passive income'],
    health: ['health', 'wellness', 'fitness', 'diet', 'nutrition', 'exercise', 'mental health', 'yoga', 'meditation', 'weight loss'],
    gaming: ['game', 'gaming', 'gameplay', 'review', 'walkthrough', 'tips', 'strategy', 'esports', 'stream', 'new release'],
};
export class KeywordEngine {
    /**
     * Generate a complete keyword package for a topic.
     * @param topic — The content topic
     * @param category — Content category
     * @returns KeywordPackage with primary, secondary, long-tail, and semantic keywords
     */
    static generate(topic, category) {
        const topicWords = topic.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
        const seeds = CATEGORY_SEEDS[category] ?? CATEGORY_SEEDS.education ?? [];
        // ── Primary keywords (direct topic terms) ──
        const primary = topicWords
            .filter((w) => w.length > 3)
            .slice(0, 5)
            .map((w) => ({
            keyword: w,
            type: 'primary',
            searchVolume: seeds.includes(w) ? 'high' : 'medium',
            competition: 'medium',
            seoScore: Math.min(95, 60 + (seeds.includes(w) ? 20 : 0) + w.length * 2),
            relevance: 0.95,
        }));
        // Add the full topic as a primary keyword
        primary.unshift({
            keyword: topic.toLowerCase(),
            type: 'primary',
            searchVolume: 'medium',
            competition: 'medium',
            seoScore: 85,
            relevance: 1.0,
        });
        // ── Secondary keywords (category-related) ──
        const secondary = seeds
            .filter((s) => !topicWords.includes(s))
            .slice(0, 8)
            .map((s, i) => ({
            keyword: s,
            type: 'secondary',
            searchVolume: i < 3 ? 'high' : 'medium',
            competition: i < 3 ? 'high' : 'medium',
            seoScore: Math.max(40, 75 - i * 5),
            relevance: Math.max(0.3, 0.8 - i * 0.06),
        }));
        // ── Long-tail keywords (topic + modifier combinations) ──
        const modifiers = ['best', 'top', 'review', 'vs', 'how to', 'guide', 'tips', 'price', 'features', 'specifications', 'in 2024', 'comparison', 'worth it'];
        const longTail = modifiers.slice(0, 8).map((mod, i) => {
            const kw = `${topic.toLowerCase()} ${mod}`;
            return {
                keyword: kw,
                type: 'long_tail',
                searchVolume: i < 3 ? 'medium' : 'low',
                competition: 'low',
                seoScore: Math.max(50, 80 - i * 4),
                relevance: Math.max(0.5, 0.9 - i * 0.05),
            };
        });
        // ── Semantic keywords (related meaning) ──
        const semanticPool = [...seeds.slice(0, 5), ...topicWords.slice(0, 3)];
        const semantic = semanticPool
            .filter((s, i, arr) => arr.indexOf(s) === i)
            .slice(0, 6)
            .map((s, i) => ({
            keyword: `${s} ${category}`,
            type: 'semantic',
            searchVolume: 'low',
            competition: 'low',
            seoScore: Math.max(40, 65 - i * 5),
            relevance: Math.max(0.4, 0.7 - i * 0.05),
        }));
        // ── Title suggestions ──
        const titleSuggestions = [
            `${topic} — Everything You Need to Know`,
            `Why ${topic} Is Taking Over in 2024`,
            `${topic}: The Complete Guide`,
            `${topic} vs The Competition — Honest Review`,
            `5 Things Nobody Tells You About ${topic}`,
        ];
        // ── Hashtag suggestions ──
        const hashtagSuggestions = [
            `#${topic.replace(/\s+/g, '')}`,
            ...seeds.slice(0, 5).map((s) => `#${s.replace(/\s+/g, '')}`),
            '#Shorts', '#Viral',
        ];
        // ── Overall SEO score ──
        const allKeywords = [...primary, ...secondary, ...longTail, ...semantic];
        const overallSeoScore = Math.round(allKeywords.reduce((s, k) => s + k.seoScore, 0) / Math.max(allKeywords.length, 1));
        log.info('Keywords generated', { topic: topic.slice(0, 40), primary: primary.length, secondary: secondary.length, longTail: longTail.length, semantic: semantic.length, seoScore: overallSeoScore });
        return { primary, secondary, longTail, semantic, overallSeoScore, titleSuggestions, hashtagSuggestions };
    }
}
//# sourceMappingURL=keyword-engine.js.map