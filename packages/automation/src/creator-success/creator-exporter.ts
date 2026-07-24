import type { CreatorSuccessPackage, CreatorExportFormats } from './creator.types';
export class CreatorExporter {
  static export(pkg: CreatorSuccessPackage): CreatorExportFormats {
    return {
      fullJson: pkg,
      compactJson: { creatorScore: pkg.creatorScore, seoScore: pkg.seo.seoScore, hookScore: pkg.hook.attentionScore, retentionScore: pkg.retention.estimatedRetention, bestTitle: pkg.title.bestTitle, confidence: pkg.confidence },
      markdown: [
        `# Creator Success Report: ${pkg.productionTitle}`,
        `**Score:** ${pkg.creatorScore}/100 | **Confidence:** ${pkg.confidence}/100`,
        `\n## Scores`, ...Object.entries(pkg.analytics.radarChart).map(([k, v]) => `- ${k}: ${v}/100`),
        `\n## Best Title\n${pkg.title.bestTitle}`,
        `\n## Hook Analysis\n- Attention: ${pkg.hook.attentionScore}/100\n${pkg.hook.improvements.map(i => `- ${i}`).join('\n')}`,
        `\n## Improvements\n${pkg.improvementSuggestions.map(s => `- ${s}`).join('\n')}`,
        `\n## Policy Warnings (${pkg.policyWarnings.length})\n${pkg.policyWarnings.map(w => `- [${w.severity}] ${w.description}`).join('\n') || 'None'}`,
      ].join('\n'),
      debugReport: { scores: pkg.analytics.radarChart, warnings: pkg.policyWarnings.length, suggestions: pkg.improvementSuggestions.length },
      analyticsReport: pkg.analytics,
    };
  }
}
