// ============================================================
// CreatorAI Studio — Research Exporter
// ============================================================
/** Exports research packages in multiple formats. */
export class ResearchExporter {
    /** Export to all supported formats. */
    static export(pkg) {
        return {
            fullJson: pkg,
            compactJson: {
                topic: pkg.topic,
                category: pkg.category,
                keywordCount: pkg.keywords.primary.length + pkg.keywords.secondary.length + pkg.keywords.longTail.length + pkg.keywords.semantic.length,
                competitorCount: pkg.competitors.competitors.length,
                trendScore: pkg.trends.overallTrendScore,
                confidence: pkg.confidenceScore,
            },
            markdown: ResearchExporter.toMarkdown(pkg),
            debugPackage: {
                metrics: pkg.qualityMetrics,
                gapCount: pkg.contentGaps.gaps.length,
                ideaCount: pkg.contentIdeas.length,
            },
        };
    }
    /** Export research as a Markdown document. */
    static toMarkdown(pkg) {
        const lines = [
            `# Research: ${pkg.topic}`,
            `**Category:** ${pkg.category} | **Confidence:** ${pkg.confidenceScore}/100 | **Quality:** ${pkg.qualityMetrics.overallQuality}/100`,
            '',
            `## Summary`,
            pkg.researchSummary,
            '',
            `## Trends`,
            `- Overall Score: ${pkg.trends.overallTrendScore}/100`,
            `- Best Platform: ${pkg.trends.bestPlatform}`,
            `- Viral Potential: ${pkg.trends.viralPotential}/100`,
            '',
            `## Keywords (${pkg.keywords.primary.length + pkg.keywords.secondary.length + pkg.keywords.longTail.length})`,
            `- SEO Score: ${pkg.keywords.overallSeoScore}/100`,
            ...pkg.keywords.primary.map((k) => `- **${k.keyword}** (${k.type}, SEO: ${k.seoScore})`),
            '',
            `## Competitors (${pkg.competitors.competitors.length})`,
            `- Market: ${pkg.competitors.marketSaturation}`,
            ...pkg.competitors.competitors.map((c) => `- ${c.name}: ${c.strengths.join(', ')}`),
            '',
            `## Audience`,
            `- ${pkg.audience.primaryAudience.name} (${pkg.audience.primaryAudience.ageRange})`,
            `- Platforms: ${pkg.audience.primaryAudience.preferredPlatforms.join(', ')}`,
            '',
            `## Content Gaps (${pkg.contentGaps.gaps.length})`,
            ...pkg.contentGaps.gaps.map((g) => `- **${g.gap}** → ${g.opportunity} (${g.priority})`),
            '',
            `## Content Ideas (${pkg.contentIdeas.length})`,
            ...pkg.contentIdeas.map((i) => `- ${i.title} (${i.type}, interest: ${i.estimatedInterest}/100)`),
        ];
        return lines.join('\n');
    }
}
//# sourceMappingURL=research-exporter.js.map