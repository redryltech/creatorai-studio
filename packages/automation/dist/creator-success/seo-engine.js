export class SeoEngine {
    static analyze(topic, title, description, keywords) {
        const titleLower = title.toLowerCase();
        const topicLower = topic.toLowerCase();
        const topicWords = topicLower.split(/\s+/).filter(w => w.length > 3);
        const titleHasKeyword = topicWords.some(w => titleLower.includes(w));
        const descHasKeyword = topicWords.some(w => description.toLowerCase().includes(w));
        const primaryKeywords = topicWords.slice(0, 5);
        const secondaryKeywords = keywords.filter(k => !primaryKeywords.includes(k)).slice(0, 8);
        const titleOpt = (titleHasKeyword ? 40 : 10) + Math.min(30, title.length > 20 && title.length < 70 ? 30 : 15) + (title.match(/[!?🔥🚀💡]/) ? 15 : 0) + (titleLower.includes('best') || titleLower.includes('top') || titleLower.includes('how') ? 15 : 5);
        const descOpt = (descHasKeyword ? 40 : 10) + Math.min(30, description.length > 50 ? 30 : 15) + (description.includes('#') ? 15 : 5) + (description.toLowerCase().includes('subscribe') || description.toLowerCase().includes('follow') ? 15 : 5);
        const metaQuality = Math.min(100, (keywords.length > 5 ? 50 : keywords.length * 10) + (titleOpt > 60 ? 30 : 15) + (descOpt > 60 ? 20 : 10));
        const seoScore = Math.round((titleOpt * 0.3 + descOpt * 0.3 + metaQuality * 0.2 + (keywords.length > 3 ? 80 : 40) * 0.2));
        const searchVisibility = Math.min(100, seoScore + (secondaryKeywords.length * 3));
        const suggestions = [];
        if (!titleHasKeyword)
            suggestions.push('Add primary keyword to title');
        if (title.length > 70)
            suggestions.push('Shorten title to under 70 characters');
        if (title.length < 20)
            suggestions.push('Title too short — add more descriptive words');
        if (!descHasKeyword)
            suggestions.push('Include primary keyword in description');
        if (keywords.length < 5)
            suggestions.push('Add more keywords for better discoverability');
        if (!description.includes('#'))
            suggestions.push('Add hashtags to description');
        return { primaryKeywords, secondaryKeywords, seoScore: Math.min(100, seoScore), titleOptimization: Math.min(100, titleOpt), descriptionOptimization: Math.min(100, descOpt), metadataQuality: Math.min(100, metaQuality), searchVisibility: Math.min(100, searchVisibility), suggestions };
    }
}
//# sourceMappingURL=seo-engine.js.map