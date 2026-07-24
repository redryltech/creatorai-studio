import type { TrendAnalysis, ContentCategory } from './research.types';
export declare class TrendAnalyzer {
    /**
     * Analyze trends for a topic within a category.
     * @param topic — The content topic
     * @param category — Detected content category
     * @returns TrendAnalysis with signals, scores, and recommendations
     */
    static analyze(topic: string, category: ContentCategory): TrendAnalysis;
    /** Platform-specific peak posting times (IST-oriented for Indian creators). */
    private static getPeakTiming;
}
//# sourceMappingURL=trend-analyzer.d.ts.map