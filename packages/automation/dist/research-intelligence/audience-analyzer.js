// ============================================================
// CreatorAI Studio — Audience Analyzer
// ============================================================
// Determines target audience segments, demographics,
// watch behavior, and platform preferences.
// ============================================================
import { Logger } from '@creatorai/agents';
const log = Logger.for('AudienceAnalyzer');
/** Category → primary audience profile. */
const AUDIENCE_PROFILES = {
    automotive: { name: 'Motorcycle/Car Enthusiasts', age: '18-35', gender: 'male', interests: ['motorcycles', 'cars', 'speed', 'engineering', 'road trips'], behavior: 'Watches reviews before purchase, subscribes to multiple auto channels', platforms: ['youtube_shorts', 'youtube', 'instagram_reels'], hours: '7-10 PM IST', prefs: ['Reviews', 'Comparisons', 'Riding footage', 'Specs breakdown'], size: 'large' },
    technology: { name: 'Tech Enthusiasts', age: '16-40', gender: 'all', interests: ['gadgets', 'AI', 'software', 'startups', 'coding'], behavior: 'Researches before buying, watches tutorials and reviews', platforms: ['youtube', 'youtube_shorts', 'linkedin'], hours: '6-9 PM IST', prefs: ['Tutorials', 'Reviews', 'Comparisons', 'News'], size: 'massive' },
    motivational: { name: 'Self-Improvement Seekers', age: '18-35', gender: 'all', interests: ['success', 'productivity', 'mindset', 'business', 'fitness'], behavior: 'Watches daily, saves quotes, shares with friends', platforms: ['youtube_shorts', 'instagram_reels', 'tiktok'], hours: '6-8 AM and 9-11 PM IST', prefs: ['Short motivational clips', 'Success stories', 'Daily quotes', 'Habit tips'], size: 'massive' },
    sports: { name: 'Sports Fans', age: '15-45', gender: 'male', interests: ['cricket', 'football', 'fitness', 'athletes', 'highlights'], behavior: 'Watches highlights, follows athletes, engages in debates', platforms: ['youtube_shorts', 'tiktok', 'instagram_reels'], hours: '7-11 PM IST', prefs: ['Highlights', 'Analysis', 'Athlete profiles', 'Training tips'], size: 'massive' },
    luxury: { name: 'Aspirational Consumers', age: '22-45', gender: 'all', interests: ['luxury brands', 'fashion', 'cars', 'watches', 'lifestyle'], behavior: 'Browses aspirational content, saves for later', platforms: ['instagram_reels', 'youtube_shorts', 'youtube'], hours: '8-11 PM IST', prefs: ['Product showcases', 'Lifestyle content', 'Unboxing', 'Brand stories'], size: 'medium' },
    travel: { name: 'Travel Enthusiasts', age: '20-40', gender: 'all', interests: ['destinations', 'adventure', 'culture', 'photography', 'food'], behavior: 'Plans trips using content, saves destination videos', platforms: ['instagram_reels', 'youtube_shorts', 'tiktok'], hours: '7-10 PM IST', prefs: ['Destination guides', 'Budget tips', 'Hidden gems', 'Vlogs'], size: 'large' },
    food: { name: 'Foodies', age: '18-45', gender: 'all', interests: ['cooking', 'restaurants', 'recipes', 'street food', 'baking'], behavior: 'Watches while eating, tries recipes, shares food content', platforms: ['tiktok', 'instagram_reels', 'youtube_shorts'], hours: '12-2 PM and 7-9 PM IST', prefs: ['Quick recipes', 'Restaurant reviews', 'Street food tours', 'Food hacks'], size: 'massive' },
    education: { name: 'Students & Learners', age: '14-30', gender: 'all', interests: ['learning', 'exams', 'skills', 'career', 'science'], behavior: 'Watches tutorials, takes notes, re-watches', platforms: ['youtube', 'youtube_shorts'], hours: '4-8 PM IST', prefs: ['Tutorials', 'Explained videos', 'Quick tips', 'Study hacks'], size: 'massive' },
    finance: { name: 'Financial Learners', age: '20-40', gender: 'male', interests: ['investing', 'stocks', 'crypto', 'savings', 'tax'], behavior: 'Researches before investing, follows market news', platforms: ['youtube', 'youtube_shorts', 'linkedin'], hours: '7-9 AM and 8-10 PM IST', prefs: ['Market analysis', 'Investment tips', 'Money saving', 'Tax planning'], size: 'large' },
};
const DEFAULT_PROFILE = { name: 'General Audience', age: '18-35', gender: 'all', interests: ['entertainment', 'learning'], behavior: 'Casual viewer', platforms: ['youtube_shorts', 'instagram_reels'], hours: '7-10 PM IST', prefs: ['Short engaging content'], size: 'large' };
export class AudienceAnalyzer {
    /**
     * Analyze the target audience for a topic.
     */
    static analyze(topic, category) {
        const profile = AUDIENCE_PROFILES[category] ?? DEFAULT_PROFILE;
        const primaryAudience = {
            name: profile.name,
            ageRange: profile.age,
            gender: profile.gender,
            interests: profile.interests,
            watchBehavior: profile.behavior,
            preferredPlatforms: profile.platforms,
            peakActiveHours: profile.hours,
            contentPreferences: profile.prefs,
            size: profile.size,
        };
        // Secondary audiences (adjacent interest groups)
        const secondaryAudiences = [
            {
                name: 'Casual Browsers',
                ageRange: '16-50',
                gender: 'all',
                interests: ['trending content', 'entertainment'],
                watchBehavior: 'Scrolls feed, watches if hooked in 2 seconds',
                preferredPlatforms: ['youtube_shorts', 'tiktok', 'instagram_reels'],
                peakActiveHours: '9 PM-12 AM IST',
                contentPreferences: ['Viral content', 'Satisfying visuals', 'Surprising facts'],
                size: 'massive',
            },
        ];
        // Engagement and retention predictions
        const isNiche = profile.size === 'niche' || profile.size === 'medium';
        const engagementPrediction = isNiche ? 75 : profile.size === 'massive' ? 55 : 65;
        const retentionPrediction = isNiche ? 70 : profile.size === 'massive' ? 45 : 55;
        const audienceSummary = `Primary audience: ${primaryAudience.name} (${primaryAudience.ageRange}, ${primaryAudience.gender}). ` +
            `Best platforms: ${primaryAudience.preferredPlatforms.map((p) => p.replace(/_/g, ' ')).join(', ')}. ` +
            `Peak hours: ${primaryAudience.peakActiveHours}. ` +
            `Audience size: ${primaryAudience.size}. ` +
            `Expected engagement: ${engagementPrediction}/100.`;
        log.info('Audience analysis complete', { topic: topic.slice(0, 40), audience: primaryAudience.name, engagement: engagementPrediction });
        return {
            primaryAudience,
            secondaryAudiences,
            totalAddressableMarket: profile.size === 'massive' ? '10M+ potential viewers' : profile.size === 'large' ? '1-10M potential viewers' : profile.size === 'medium' ? '100K-1M potential viewers' : '10K-100K potential viewers',
            engagementPrediction,
            retentionPrediction,
            audienceSummary,
        };
    }
}
//# sourceMappingURL=audience-analyzer.js.map