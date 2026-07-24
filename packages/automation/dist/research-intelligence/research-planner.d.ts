import type { ResearchPackage, ContentCategory } from './research.types';
export declare class ResearchPlanner {
    /**
     * Run complete research for a topic.
     * @param topic — The user's content idea
     * @returns ResearchPackage with all analysis results
     */
    static research(topic: string): ResearchPackage;
    /** Classify the content category from topic text. */
    static classifyCategory(topic: string): ContentCategory;
    /** Compute research quality metrics. */
    private static computeQualityMetrics;
}
//# sourceMappingURL=research-planner.d.ts.map