// ============================================================
// CreatorAI Studio — Prompt Quality Scorer
// ============================================================
export class QualityScorer {
    /**
     * Score the quality of a compiled canonical prompt.
     */
    static score(prompt) {
        const blocks = prompt.blocks;
        const blockTypes = new Set(blocks.map((b) => b.type));
        const hasBlock = (type) => blockTypes.has(type);
        const blockContent = (type) => blocks.find((b) => b.type === type)?.content.length ?? 0;
        // Completeness: how many block types are present
        const requiredTypes = ['visual', 'camera', 'environment', 'lighting', 'composition'];
        const optionalTypes = ['character', 'vehicle', 'motion', 'effects', 'brand', 'continuity'];
        const reqPresent = requiredTypes.filter((t) => hasBlock(t)).length;
        const optPresent = optionalTypes.filter((t) => hasBlock(t)).length;
        const completeness = Math.min(100, (reqPresent / requiredTypes.length) * 70 + (optPresent / optionalTypes.length) * 30);
        // Character quality
        const characterQuality = hasBlock('character') ? Math.min(100, blockContent('character') * 2) : hasBlock('vehicle') ? 60 : 20;
        // Scene quality
        const sceneQuality = Math.min(100, (blockContent('visual') + blockContent('environment')) / 2);
        // Camera quality
        const cameraQuality = hasBlock('camera') ? Math.min(100, blockContent('camera') * 3) : 10;
        // Lighting quality
        const lightingQuality = hasBlock('lighting') ? Math.min(100, blockContent('lighting') * 3) : 10;
        // Motion quality
        const motionQuality = hasBlock('motion') ? Math.min(100, blockContent('motion') * 3) : 30;
        // Provider readiness: prompt length and completeness
        const providerReadiness = Math.min(100, (prompt.masterPrompt.length > 100 ? 40 : 20) +
            (prompt.negativePrompt.length > 30 ? 20 : 10) +
            (reqPresent >= 4 ? 30 : reqPresent * 7) +
            (prompt.tokenCount > 50 ? 10 : 5));
        const overallScore = Math.round(completeness * 0.25 + characterQuality * 0.1 + sceneQuality * 0.15 +
            cameraQuality * 0.15 + lightingQuality * 0.1 + motionQuality * 0.1 +
            providerReadiness * 0.15);
        return {
            completeness: Math.round(completeness),
            characterQuality: Math.round(characterQuality),
            sceneQuality: Math.round(sceneQuality),
            cameraQuality: Math.round(cameraQuality),
            lightingQuality: Math.round(lightingQuality),
            motionQuality: Math.round(motionQuality),
            providerReadiness: Math.round(providerReadiness),
            overallScore,
        };
    }
}
//# sourceMappingURL=quality-scorer.js.map