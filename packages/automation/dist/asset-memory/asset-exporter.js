export class AssetExporter {
    static export(pkg) {
        const referencedIds = new Set([...pkg.references.map(r => r.sourceAssetId), ...pkg.references.map(r => r.targetAssetId)]);
        const orphans = pkg.assets.filter(a => !referencedIds.has(a.assetId) && a.category !== 'prompt_template').map(a => a.assetId);
        return {
            assetLibraryJson: pkg.assets,
            brandKitJson: pkg.brandKit,
            styleGuideJson: pkg.styleGuide,
            promptTemplatePackage: pkg.promptTemplates,
            referencePackage: pkg.references,
            debugPackage: { totalAssets: pkg.assets.length, categories: pkg.metadata.categories, orphans },
        };
    }
}
//# sourceMappingURL=asset-exporter.js.map