import { Logger } from '@creatorai/agents';
import { SfxPlanner } from './sfx-planner';
import { SfxMemory } from './sfx-memory';
const log = Logger.for('SfxAgent');
export class SfxAgent {
    agentId = 'automation.sound_effects';
    agentName = 'AI Sound Effects Engine';
    stage = 'sound_effects';
    validate(input) {
        const errors = [];
        if (!input.scenes?.length)
            errors.push('Scenes required');
        return { valid: errors.length === 0, errors };
    }
    estimateCost() { return { costUsd: 0, breakdown: ['SFX uses FFmpeg synthesis (free)'] }; }
    async healthCheck() { return { healthy: true, details: 'FFmpeg-powered SFX generation' }; }
    async execute(input, onProgress, cancellation) {
        log.info('SFX generation starting');
        onProgress(10, 'Analyzing scenes for sound effects');
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
        onProgress(40, 'Generating sound effects');
        const pkg = SfxPlanner.generate(input.scenes, input.outputDir);
        onProgress(90, 'Recording SFX');
        SfxMemory.getInstance().record({ productionTitle: '', packageId: pkg.id, effectCount: pkg.metadata.totalEffects });
        onProgress(100, `${pkg.metadata.totalEffects} sound effects generated`);
        return pkg;
    }
}
//# sourceMappingURL=sfx-agent.js.map