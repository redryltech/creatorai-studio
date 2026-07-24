// ============================================================
// CreatorAI Studio — Content Gap Analyzer
// ============================================================
import { Logger } from '@creatorai/agents';
const log = Logger.for('ContentGapAnalyzer');
const GAP_TEMPLATES = {
    automotive: [
        { gap: 'Most reviews lack real-world riding footage', opportunity: 'Create cinematic riding sequences', angle: 'Ride-first review format' },
        { gap: 'Few creators show long-term ownership experience', opportunity: '6-month/1-year update series', angle: 'Honest ownership diary' },
        { gap: 'Budget modification guides are rare', opportunity: 'Affordable upgrade tutorials', angle: 'Best mods under ₹5,000' },
        { gap: 'Night riding content is underserved', opportunity: 'Cinematic night ride series', angle: 'City night riding aesthetics' },
    ],
    technology: [
        { gap: 'Most tech reviews focus on specs, not real usage', opportunity: 'Daily life integration reviews', angle: 'A week with [product]' },
        { gap: 'Comparison videos lack visual side-by-side', opportunity: 'Split-screen comparison format', angle: 'Visual spec-by-spec comparison' },
        { gap: 'Few creators explain WHY a feature matters', opportunity: 'Feature impact analysis', angle: 'Why this feature changes everything' },
    ],
    motivational: [
        { gap: 'Most motivational content is generic quotes', opportunity: 'Story-driven motivation with real examples', angle: 'Real stories, not quotes' },
        { gap: 'Lack of actionable takeaways', opportunity: 'One tip per Short format', angle: 'Do THIS today to change your life' },
        { gap: 'Regional language motivational content is scarce', opportunity: 'Hindi/Telugu motivational Shorts', angle: 'Vernacular motivation' },
    ],
};
const DEFAULT_GAPS = [
    { gap: 'Most content lacks cinematic quality', opportunity: 'Premium production value', angle: 'Movie-quality Shorts' },
    { gap: 'Consistent posting schedules are rare', opportunity: 'Daily content with consistent brand', angle: 'Reliable daily value' },
    { gap: 'Few creators use AI-powered production', opportunity: 'AI-enhanced production pipeline', angle: 'Future of content creation' },
];
export class ContentGapAnalyzer {
    static analyze(topic, category) {
        const templates = GAP_TEMPLATES[category] ?? DEFAULT_GAPS;
        const gaps = templates.map((t, i) => ({
            gap: t.gap,
            opportunity: t.opportunity,
            competition: (i === 0 ? 'low' : i < 3 ? 'low' : 'medium'),
            estimatedDemand: Math.max(50, 90 - i * 10),
            suggestedAngle: t.angle,
            priority: (i === 0 ? 'critical' : i < 2 ? 'high' : 'medium'),
        }));
        const topOpportunity = gaps.length > 0 ? gaps[0] : null;
        const gapSummary = `Found ${gaps.length} content gaps for "${topic}". ` +
            `Top opportunity: "${topOpportunity?.opportunity ?? 'N/A'}" with ${topOpportunity?.competition ?? 'unknown'} competition. ` +
            `${gaps.filter((g) => g.priority === 'critical' || g.priority === 'high').length} high-priority gaps identified.`;
        log.info('Content gap analysis complete', { topic: topic.slice(0, 40), gaps: gaps.length });
        return { gaps, totalOpportunities: gaps.length, topOpportunity, gapSummary };
    }
}
//# sourceMappingURL=content-gap-analyzer.js.map