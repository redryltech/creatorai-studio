export class ImageValidator {
    static validate(pkg) {
        const errors = [];
        const warnings = [];
        let score = 100;
        if (!pkg.id) {
            errors.push('No ID');
            score -= 10;
        }
        if (pkg.scenes.length === 0) {
            errors.push('No scenes');
            score -= 50;
        }
        for (const s of pkg.scenes) {
            if (!s.masterPrompt) {
                errors.push(`Scene ${s.sceneOrder}: no master prompt`);
                score -= 10;
            }
            if (s.masterPrompt.length < 50) {
                warnings.push(`Scene ${s.sceneOrder}: short prompt (${s.masterPrompt.length} chars)`);
                score -= 3;
            }
            if (!s.composition.foreground.element) {
                warnings.push(`Scene ${s.sceneOrder}: no foreground`);
                score -= 2;
            }
            if (!s.lighting.keyLight.type) {
                warnings.push(`Scene ${s.sceneOrder}: no key light`);
                score -= 2;
            }
            if (s.quality.overallScore < 40) {
                warnings.push(`Scene ${s.sceneOrder}: low quality score ${s.quality.overallScore}`);
                score -= 5;
            }
            if (Object.keys(s.providerHints).length < 3) {
                warnings.push(`Scene ${s.sceneOrder}: few provider hints`);
                score -= 2;
            }
        }
        return { valid: errors.length === 0, score: Math.max(0, Math.min(100, score)), errors, warnings };
    }
}
//# sourceMappingURL=image-validator.js.map