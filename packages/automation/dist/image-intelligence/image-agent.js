import { Logger } from '@creatorai/agents';
import { ImagePlanner } from './image-planner';
import { ImageValidator } from './image-validator';
import { ImageMemory } from './image-memory';
const log = Logger.for('ImageIntelligenceAgent');
export class ImageIntelligenceAgent {
    agentId = 'automation.image_intelligence';
    agentName = 'Image Intelligence Engine';
    stage = 'image_planning';
    validate(input) {
        const errors = [];
        if (!input.storyboard)
            errors.push('Storyboard required');
        if (!input.characterDatabase)
            errors.push('CharacterDatabase required');
        return { valid: errors.length === 0, errors };
    }
    estimateCost() { return { costUsd: 0, breakdown: ['Image planning is local — $0.00'] }; }
    async healthCheck() { return { healthy: true, details: 'ImagePlanner is local' }; }
    async execute(input, onProgress, cancellation) {
        log.info('Image intelligence starting');
        onProgress(10, 'Analyzing composition and camera for each frame');
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
        onProgress(30, 'Computing lighting and color grading');
        onProgress(50, 'Locking character and vehicle identities');
        onProgress(70, 'Building master prompts with quality scoring');
        const pkg = ImagePlanner.plan(input.storyboard, input.characterDatabase, input.directorPlan, input.sceneGraphPackage, input.worldStatePackage, input.assetMemoryPackage);
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
        onProgress(85, 'Validating image plans');
        const v = ImageValidator.validate(pkg);
        if (!v.valid)
            log.warn('Image validation issues', { errors: v.errors });
        onProgress(95, 'Recording in memory');
        ImageMemory.getInstance().record({ productionTitle: input.storyboard.title, packageId: pkg.id, avgQuality: pkg.metadata.avgQuality, avgConfidence: pkg.metadata.avgConfidence });
        onProgress(100, `Image intelligence complete — ${pkg.metadata.totalScenes} scenes, avg quality ${pkg.metadata.avgQuality}/100`);
        return pkg;
    }
}
//# sourceMappingURL=image-agent.js.map