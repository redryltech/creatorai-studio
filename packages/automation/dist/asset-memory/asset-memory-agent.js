import { Logger } from '@creatorai/agents';
import { AssetMemoryPlanner } from './asset-memory-planner';
import { AssetValidator } from './asset-validator';
import { AssetMemoryStore } from './asset-memory-store';
const log = Logger.for('AssetMemoryAgent');
export class AssetMemoryAgent {
    agentId = 'automation.asset_memory';
    agentName = 'Asset Memory & Brand Kit Engine';
    stage = 'asset_memory';
    validate(input) {
        const errors = [];
        if (!input.directorPlan)
            errors.push('DirectorPlan required');
        if (!input.storyboard)
            errors.push('Storyboard required');
        if (!input.characterDatabase)
            errors.push('CharacterDatabase required');
        return { valid: errors.length === 0, errors };
    }
    estimateCost() { return { costUsd: 0, breakdown: ['Asset memory is local — $0.00'] }; }
    async healthCheck() { return { healthy: true, details: 'AssetMemoryPlanner is local' }; }
    async execute(input, onProgress, cancellation) {
        log.info('Asset memory engine starting');
        onProgress(10, 'Extracting reusable assets');
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
        onProgress(40, 'Building brand kit and style guide');
        const pkg = AssetMemoryPlanner.plan(input.directorPlan, input.storyboard, input.characterDatabase, input.sceneGraphPackage, input.worldStatePackage);
        onProgress(70, 'Generating prompt templates and recommendations');
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
        onProgress(85, 'Validating asset library');
        const validation = AssetValidator.validate(pkg);
        if (!validation.valid)
            log.warn('Asset validation issues', { errors: validation.errors });
        onProgress(95, 'Storing in memory');
        AssetMemoryStore.getInstance().record({ productionTitle: input.storyboard.title, packageId: pkg.id, assetCount: pkg.assets.length, hasBrandKit: !!pkg.brandKit });
        onProgress(100, `Asset memory complete — ${pkg.assets.length} assets, ${pkg.promptTemplates.length} templates`);
        log.info('Asset memory complete', { id: pkg.id, assets: pkg.assets.length, validation: validation.score });
        return pkg;
    }
}
//# sourceMappingURL=asset-memory-agent.js.map