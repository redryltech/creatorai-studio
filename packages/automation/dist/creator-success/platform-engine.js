export class PlatformEngine {
    static optimize(topic, category) {
        const platforms = ['youtube', 'instagram', 'tiktok', 'facebook', 'linkedin', 'x'];
        return platforms.map(p => {
            const recs = [];
            let score = 60;
            if (p === 'youtube') {
                recs.push('Use #Shorts in title', 'Add end screen', 'Pin a comment with CTA');
                score = 85;
            }
            else if (p === 'instagram') {
                recs.push('Use 30 hashtags', 'Add to Reels', 'Use trending audio');
                score = 75;
            }
            else if (p === 'tiktok') {
                recs.push('Use trending sounds', 'Add #fyp #foryou', 'Duet/stitch strategy');
                score = 80;
            }
            else if (p === 'facebook') {
                recs.push('Share in relevant groups', 'Write engaging caption', 'Tag relevant pages');
                score = 55;
            }
            else if (p === 'linkedin') {
                recs.push('Write professional context', 'Use industry hashtags', 'Tag thought leaders');
                score = 45;
            }
            else {
                recs.push('Use concise copy', 'Add relevant hashtags', 'Thread for long content');
                score = 50;
            }
            const timings = { youtube: '7-9 PM IST', instagram: '11 AM-1 PM IST', tiktok: '7-9 PM IST', facebook: '1-3 PM IST', linkedin: '8-10 AM IST', x: '12-3 PM IST' };
            return { platform: p, optimizationScore: score, recommendations: recs, bestPostingTime: timings[p], hashtagStrategy: p === 'instagram' ? 'Mix popular + niche tags (30 max)' : p === 'tiktok' ? 'Use 3-5 trending tags' : 'Use 3-5 relevant tags', captionStrategy: p === 'youtube' ? 'Keyword-rich first 2 lines' : p === 'instagram' ? 'Hook + story + CTA' : 'Short, punchy, emoji' };
        });
    }
}
//# sourceMappingURL=platform-engine.js.map