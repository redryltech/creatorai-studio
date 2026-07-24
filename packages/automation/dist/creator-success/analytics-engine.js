export class CreatorAnalyticsEngine {
    static calculate(seo, thumb, hook, retention, engagement, audienceMatch, publishReady) {
        const overall = Math.round(seo * 0.15 + thumb * 0.1 + hook * 0.2 + retention * 0.2 + engagement * 0.15 + audienceMatch * 0.1 + publishReady * 0.1);
        const scores = { seo, thumbnail: thumb, hook, retention, engagement, audienceMatch, publishingReadiness: publishReady };
        const priorities = Object.entries(scores).map(([area, score]) => ({ area, currentScore: score, targetScore: Math.min(100, score + 20), priority: (score < 40 ? 'critical' : score < 60 ? 'high' : score < 80 ? 'medium' : 'low') })).filter(p => p.priority !== 'low').sort((a, b) => { const ord = { critical: 0, high: 1, medium: 2, low: 3 }; return ord[a.priority] - ord[b.priority]; });
        return { seoScore: seo, thumbnailScore: thumb, hookScore: hook, retentionScore: retention, engagementScore: engagement, audienceMatch, publishingReadiness: publishReady, overallCreatorScore: overall, radarChart: scores, improvementPriorities: priorities };
    }
}
//# sourceMappingURL=analytics-engine.js.map