import type { CompiledPromptPackage, PromptExportFormats } from './prompt.types';

export class PromptExporter {
  static export(pkg: CompiledPromptPackage): PromptExportFormats {
    return {
      canonicalJson: pkg.canonicalPrompts,
      providerPackage: pkg.providerPrompts,
      negativePackage: pkg.negativeSpecs,
      promptReport: { scenes: pkg.metadata.totalScenes, providers: pkg.metadata.totalProviders, avgScore: pkg.metadata.avgQualityScore, conflicts: pkg.metadata.totalConflicts },
      promptMetrics: { tokenCounts: pkg.canonicalPrompts.map(p => p.tokenCount), complexities: pkg.canonicalPrompts.map(p => p.estimatedComplexity), scores: pkg.qualityScores.map(q => q.overallScore) },
      debugPackage: { conflicts: pkg.conflicts, lowScoreScenes: pkg.qualityScores.filter(q => q.overallScore < 50).map((q, i) => `scene-${i + 1}`) },
    };
  }
}
