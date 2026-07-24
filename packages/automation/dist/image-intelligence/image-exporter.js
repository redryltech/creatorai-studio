export class ImageExporter {
    static export(pkg) {
        return {
            fullJson: pkg,
            compactJson: pkg.scenes.map(s => ({ sceneId: s.sceneId, quality: s.quality.overallScore, confidence: s.confidence, promptLength: s.masterPrompt.length })),
            promptsOnly: pkg.scenes.map(s => ({ sceneId: s.sceneId, masterPrompt: s.masterPrompt, negativePrompt: s.negativePrompt, providerHints: s.providerHints })),
            debugPackage: { scenes: pkg.scenes.length, avgQuality: pkg.metadata.avgQuality, identityLocks: pkg.scenes.reduce((s, sc) => s + sc.identity.vehicleLock.length + sc.identity.characterLock.length, 0) },
        };
    }
}
//# sourceMappingURL=image-exporter.js.map