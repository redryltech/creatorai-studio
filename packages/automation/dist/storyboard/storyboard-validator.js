// ============================================================
// CreatorAI Studio — Storyboard Validator
// ============================================================
export class StoryboardValidator {
    static validate(storyboard) {
        const errors = [];
        const warnings = [];
        let score = 100;
        // ── Board-level ──
        if (!storyboard.id) {
            errors.push('No storyboard ID');
            score -= 10;
        }
        if (!storyboard.frames.length) {
            errors.push('No frames');
            score -= 50;
        }
        if (!storyboard.globalStyle.artStyle) {
            warnings.push('No global art style');
            score -= 3;
        }
        // ── Frame completeness ──
        const seenIds = new Set();
        let prevEnd = 0;
        for (const frame of storyboard.frames) {
            // Duplicate
            if (seenIds.has(frame.frameId)) {
                errors.push(`Duplicate frame: ${frame.frameId}`);
                score -= 10;
            }
            seenIds.add(frame.frameId);
            // Scene order sequential
            if (frame.sceneOrder < 1) {
                errors.push(`Frame ${frame.frameId}: invalid order ${frame.sceneOrder}`);
                score -= 5;
            }
            // Duration
            if (frame.expectedDuration <= 0) {
                errors.push(`Frame ${frame.frameId}: invalid duration`);
                score -= 5;
            }
            // Timing continuity
            if (Math.abs(frame.timing.startTimeSec - prevEnd) > 0.1 && frame.sceneOrder > 1) {
                warnings.push(`Frame ${frame.frameId}: timing gap (${prevEnd.toFixed(1)}s → ${frame.timing.startTimeSec.toFixed(1)}s)`);
                score -= 2;
            }
            prevEnd = frame.timing.endTimeSec;
            // Composition
            if (!frame.composition.mainSubject) {
                warnings.push(`Frame ${frame.frameId}: no main subject`);
                score -= 2;
            }
            if (!frame.composition.foreground) {
                warnings.push(`Frame ${frame.frameId}: no foreground`);
                score -= 1;
            }
            // Camera
            if (!frame.camera.lens) {
                errors.push(`Frame ${frame.frameId}: no lens`);
                score -= 5;
            }
            if (!frame.camera.position) {
                errors.push(`Frame ${frame.frameId}: no camera position`);
                score -= 5;
            }
            // Prompts
            if (!frame.prompts.imagePrompt) {
                errors.push(`Frame ${frame.frameId}: no image prompt`);
                score -= 10;
            }
            if (!frame.prompts.videoPrompt) {
                errors.push(`Frame ${frame.frameId}: no video prompt`);
                score -= 5;
            }
            if (!frame.prompts.negativePrompt) {
                warnings.push(`Frame ${frame.frameId}: no negative prompt`);
                score -= 2;
            }
            if (frame.prompts.imagePrompt.length < 30) {
                warnings.push(`Frame ${frame.frameId}: image prompt too short (${frame.prompts.imagePrompt.length} chars)`);
                score -= 3;
            }
            // Style
            if (!frame.style.mood) {
                warnings.push(`Frame ${frame.frameId}: no mood`);
                score -= 1;
            }
            if (frame.style.colorPalette.length === 0) {
                warnings.push(`Frame ${frame.frameId}: no color palette`);
                score -= 1;
            }
            // Continuity
            if (!frame.continuity.colorGrading) {
                warnings.push(`Frame ${frame.frameId}: no color grading continuity note`);
                score -= 1;
            }
            // Assets
            // (optional — no penalty for empty, but log it)
        }
        // ── Cross-frame checks ──
        // At least one thumbnail
        if (!storyboard.frames.some((f) => f.thumbnailCandidate)) {
            warnings.push('No thumbnail candidate frame');
            score -= 3;
        }
        // Total duration sanity
        const totalDur = storyboard.frames.reduce((s, f) => s + f.expectedDuration, 0);
        if (totalDur < 5) {
            errors.push(`Total duration too short: ${totalDur}s`);
            score -= 20;
        }
        if (totalDur > 300) {
            warnings.push(`Total duration very long: ${totalDur}s`);
            score -= 3;
        }
        // Provider hints coverage
        const firstFrame = storyboard.frames[0];
        if (firstFrame) {
            const hintCount = Object.keys(firstFrame.prompts.providerHints).length;
            if (hintCount < 3) {
                warnings.push(`Only ${hintCount} provider hints — add more for compatibility`);
                score -= 2;
            }
        }
        return {
            valid: errors.length === 0,
            score: Math.max(0, Math.min(100, score)),
            errors,
            warnings,
        };
    }
}
//# sourceMappingURL=storyboard-validator.js.map