import type { KeywordPackage, ContentCategory } from './research.types';
export declare class KeywordEngine {
    /**
     * Generate a complete keyword package for a topic.
     * @param topic — The content topic
     * @param category — Content category
     * @returns KeywordPackage with primary, secondary, long-tail, and semantic keywords
     */
    static generate(topic: string, category: ContentCategory): KeywordPackage;
}
//# sourceMappingURL=keyword-engine.d.ts.map