export class PromptValidator {
    static validate(pkg) {
        const errors = [];
        const warnings = [];
        let score = 100;
        if (!pkg.id) {
            errors.push('No package ID');
            score -= 10;
        }
        if (pkg.canonicalPrompts.length === 0) {
            errors.push('No canonical prompts');
            score -= 50;
        }
        for (const cp of pkg.canonicalPrompts) {
            if (!cp.masterPrompt) {
                errors.push(`Scene ${cp.sceneOrder}: empty master prompt`);
                score -= 10;
            }
            if (cp.masterPrompt.length < 20) {
                warnings.push(`Scene ${cp.sceneOrder}: prompt too short`);
                score -= 5;
            }
            if (cp.blocks.length === 0) {
                errors.push(`Scene ${cp.sceneOrder}: no blocks`);
                score -= 10;
            }
            const types = new Set(cp.blocks.map(b => b.type));
            if (!types.has('visual')) {
                warnings.push(`Scene ${cp.sceneOrder}: no visual block`);
                score -= 5;
            }
            if (!types.has('camera')) {
                warnings.push(`Scene ${cp.sceneOrder}: no camera block`);
                score -= 3;
            }
            if (!types.has('lighting')) {
                warnings.push(`Scene ${cp.sceneOrder}: no lighting block`);
                score -= 3;
            }
            if (!types.has('environment')) {
                warnings.push(`Scene ${cp.sceneOrder}: no environment block`);
                score -= 3;
            }
        }
        if (pkg.qualityScores.length > 0) {
            const lowScores = pkg.qualityScores.filter(q => q.overallScore < 50);
            if (lowScores.length > 0) {
                warnings.push(`${lowScores.length} scenes have low quality scores`);
                score -= lowScores.length * 3;
            }
        }
        if (Object.keys(pkg.providerPrompts).length === 0) {
            errors.push('No provider prompts compiled');
            score -= 20;
        }
        return { valid: errors.length === 0, score: Math.max(0, Math.min(100, score)), errors, warnings };
    }
}
//# sourceMappingURL=prompt-validator.js.map