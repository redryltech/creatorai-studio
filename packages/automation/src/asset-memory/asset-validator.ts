import type { AssetMemoryPackage } from './asset.types';

export interface AssetValidationResult { valid: boolean; score: number; errors: string[]; warnings: string[]; }

export class AssetValidator {
  static validate(pkg: AssetMemoryPackage): AssetValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    if (!pkg.id) { errors.push('No package ID'); score -= 10; }

    const seenIds = new Set<string>();
    const seenUuids = new Set<string>();
    for (const asset of pkg.assets) {
      if (seenIds.has(asset.assetId)) { errors.push(`Duplicate asset ID: ${asset.assetId}`); score -= 10; }
      seenIds.add(asset.assetId);
      if (seenUuids.has(asset.uuid)) { errors.push(`Duplicate UUID: ${asset.uuid}`); score -= 5; }
      seenUuids.add(asset.uuid);
      if (!asset.name) { warnings.push(`${asset.assetId}: no name`); score -= 2; }
      if (!asset.category) { errors.push(`${asset.assetId}: no category`); score -= 5; }
      if (asset.tags.length === 0) { warnings.push(`${asset.assetId}: no tags`); score -= 1; }
    }

    // Reference validation
    for (const ref of pkg.references) {
      if (!seenIds.has(ref.sourceAssetId)) { warnings.push(`Ref ${ref.id}: source ${ref.sourceAssetId} missing`); score -= 3; }
      if (!seenIds.has(ref.targetAssetId)) { warnings.push(`Ref ${ref.id}: target ${ref.targetAssetId} missing`); score -= 3; }
    }

    // Brand kit
    if (pkg.brandKit && pkg.brandKit.primaryColors.length === 0) { warnings.push('Brand kit: no primary colors'); score -= 2; }

    // Prompt templates
    if (pkg.promptTemplates.length === 0) { warnings.push('No prompt templates'); score -= 3; }

    // Orphan check
    const referencedIds = new Set([...pkg.references.map(r => r.sourceAssetId), ...pkg.references.map(r => r.targetAssetId)]);
    const orphans = pkg.assets.filter(a => a.category !== 'environment' && a.category !== 'prop' && !referencedIds.has(a.assetId));

    return { valid: errors.length === 0, score: Math.max(0, Math.min(100, score)), errors, warnings };
  }
}
