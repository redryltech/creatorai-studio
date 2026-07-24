import { Logger } from '@creatorai/agents';
import { PromptCompilerCore } from './prompt-compiler';
import { PromptValidator } from './prompt-validator';
import { PromptMemory } from './prompt-memory';
const log = Logger.for('PromptCompilerAgent');
export class PromptCompilerAgent {
    agentId = 'automation.prompt_compiler';
    agentName = 'AI Prompt Compiler';
    stage = 'prompt_compilation';
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
    estimateCost() { return { costUsd: 0, breakdown: ['Prompt compilation is local — $0.00'] }; }
    async healthCheck() { return { healthy: true, details: 'PromptCompiler is local' }; }
    async execute(input, onProgress, cancellation) {
        log.info('Prompt compiler starting');
        onProgress(10, 'Assembling prompt blocks from all planning stages');
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
        onProgress(30, 'Building canonical prompts');
        onProgress(50, 'Compiling for 12 AI providers');
        const pkg = PromptCompilerCore.compile(input.directorPlan, input.storyboard, input.characterDatabase, input.sceneGraphPackage, input.worldStatePackage, input.assetMemoryPackage, input.promptLength ?? 'detailed');
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
        onProgress(80, 'Validating prompt quality');
        const validation = PromptValidator.validate(pkg);
        if (!validation.valid)
            log.warn('Prompt validation issues', { errors: validation.errors });
        onProgress(95, 'Recording in memory');
        PromptMemory.getInstance().record({ productionTitle: input.storyboard.title, packageId: pkg.id, avgScore: pkg.metadata.avgQualityScore, totalTokens: pkg.metadata.avgTokenCount * pkg.metadata.totalScenes });
        onProgress(100, `Prompt compilation complete — ${pkg.metadata.totalScenes} scenes × ${pkg.metadata.totalProviders} providers, avg score ${pkg.metadata.avgQualityScore}/100`);
        log.info('Prompt compilation complete', { id: pkg.id, scenes: pkg.metadata.totalScenes, avgScore: pkg.metadata.avgQualityScore });
        return pkg;
    }
}
//# sourceMappingURL=prompt-compiler-agent.js.map