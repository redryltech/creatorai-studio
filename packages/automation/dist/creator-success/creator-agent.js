import { Logger } from '@creatorai/agents';
import { CreatorPlanner } from './creator-planner';
import { CreatorValidator } from './creator-validator';
import { CreatorMemory } from './creator-memory';
const log = Logger.for('CreatorSuccessAgent');
export class CreatorSuccessAgent {
    agentId = 'automation.creator_success';
    agentName = 'Creator Success Engine';
    stage = 'creator_success';
    validate(input) {
        const errors = [];
        if (!input.plannerInput?.topic)
            errors.push('Topic required');
        if (!input.plannerInput?.title)
            errors.push('Title required');
        return { valid: errors.length === 0, errors };
    }
    estimateCost() { return { costUsd: 0, breakdown: ['Creator success is local — $0.00'] }; }
    async healthCheck() { return { healthy: true, details: 'CreatorPlanner is local' }; }
    async execute(input, onProgress, cancellation) {
        log.info('Creator success engine starting');
        onProgress(10, 'Analyzing SEO and title');
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
        onProgress(25, 'Evaluating hook and retention');
        onProgress(40, 'Predicting engagement');
        onProgress(55, 'Generating hashtags and descriptions');
        onProgress(70, 'Checking policies');
        const pkg = CreatorPlanner.plan(input.plannerInput);
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
        onProgress(85, 'Validating creator package');
        const validation = CreatorValidator.validate(pkg);
        if (!validation.valid)
            log.warn('Creator validation issues', { errors: validation.errors });
        onProgress(95, 'Recording in memory');
        CreatorMemory.getInstance().record({ productionTitle: pkg.productionTitle, packageId: pkg.id, creatorScore: pkg.creatorScore, seoScore: pkg.seo.seoScore, hookScore: pkg.hook.attentionScore });
        onProgress(100, `Creator score: ${pkg.creatorScore}/100, confidence: ${pkg.confidence}/100`);
        return pkg;
    }
}
//# sourceMappingURL=creator-agent.js.map