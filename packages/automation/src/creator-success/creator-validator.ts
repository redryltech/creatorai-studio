import type { CreatorSuccessPackage } from './creator.types';
export interface CreatorValidationResult { valid: boolean; score: number; errors: string[]; warnings: string[]; }
export class CreatorValidator {
  static validate(pkg: CreatorSuccessPackage): CreatorValidationResult {
    const errors: string[] = []; const warnings: string[] = []; let score = 100;
    if (!pkg.id) { errors.push('No ID'); score -= 10; }
    if (pkg.seo.seoScore < 30) { warnings.push(`Low SEO: ${pkg.seo.seoScore}`); score -= 5; }
    if (pkg.hook.attentionScore < 30) { warnings.push(`Weak hook: ${pkg.hook.attentionScore}`); score -= 5; }
    if (pkg.retention.estimatedRetention < 30) { warnings.push(`Low retention: ${pkg.retention.estimatedRetention}`); score -= 5; }
    if (pkg.title.variations.length === 0) { errors.push('No title variations'); score -= 10; }
    if (pkg.hashtags.totalCount === 0) { warnings.push('No hashtags'); score -= 3; }
    if (pkg.publishing.readinessScore < 40) { warnings.push(`Low publishing readiness: ${pkg.publishing.readinessScore}`); score -= 5; }
    if (pkg.policyWarnings.some(w => w.severity === 'critical')) { errors.push('Critical policy warning'); score -= 15; }
    if (pkg.platformRecommendations.length === 0) { errors.push('No platform recommendations'); score -= 5; }
    return { valid: errors.length === 0, score: Math.max(0, Math.min(100, score)), errors, warnings };
  }
}
