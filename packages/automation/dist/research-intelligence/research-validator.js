// ============================================================
// CreatorAI Studio — Research Validator
// ============================================================
/**
 * Validates a ResearchPackage for completeness,
 * confidence, consistency, and quality.
 */
export class ResearchValidator {
    static validate(pkg) {
        const errors = [];
        const warnings = [];
        let score = 100;
        // Identity
        if (!pkg.id) {
            errors.push('No package ID');
            score -= 10;
        }
        if (!pkg.topic) {
            errors.push('No topic');
            score -= 20;
        }
        if (!pkg.category) {
            errors.push('No category');
            score -= 10;
        }
        // Keywords
        if (pkg.keywords.primary.length === 0) {
            errors.push('No primary keywords');
            score -= 15;
        }
        if (pkg.keywords.secondary.length === 0) {
            warnings.push('No secondary keywords');
            score -= 5;
        }
        if (pkg.keywords.longTail.length === 0) {
            warnings.push('No long-tail keywords');
            score -= 3;
        }
        if (pkg.keywords.overallSeoScore < 30) {
            warnings.push(`Low SEO score: ${pkg.keywords.overallSeoScore}`);
            score -= 5;
        }
        // Trends
        if (pkg.trends.signals.length === 0) {
            errors.push('No trend signals');
            score -= 10;
        }
        if (pkg.trends.overallTrendScore < 20) {
            warnings.push(`Low trend score: ${pkg.trends.overallTrendScore}`);
            score -= 3;
        }
        // Competitors
        if (pkg.competitors.competitors.length === 0) {
            warnings.push('No competitors analyzed');
            score -= 5;
        }
        // Audience
        if (!pkg.audience.primaryAudience) {
            errors.push('No audience analysis');
            score -= 10;
        }
        // Content gaps
        if (pkg.contentGaps.gaps.length === 0) {
            warnings.push('No content gaps found');
            score -= 3;
        }
        // Platforms
        if (pkg.recommendedPlatforms.length === 0) {
            errors.push('No recommended platforms');
            score -= 5;
        }
        // Confidence
        if (pkg.confidenceScore < 30) {
            warnings.push(`Low confidence: ${pkg.confidenceScore}`);
            score -= 5;
        }
        // Quality metrics
        if (pkg.qualityMetrics.overallQuality < 40) {
            warnings.push(`Low quality: ${pkg.qualityMetrics.overallQuality}`);
            score -= 5;
        }
        return { valid: errors.length === 0, score: Math.max(0, Math.min(100, score)), errors, warnings };
    }
}
//# sourceMappingURL=research-validator.js.map