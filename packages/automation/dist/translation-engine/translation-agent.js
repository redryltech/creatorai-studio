import { Logger } from '@creatorai/agents';
import { TranslationPlanner } from './translation-planner';
import { TranslationMemory } from './translation-memory';
const log = Logger.for('TranslationAgent');
export class TranslationAgent {
    agentId = 'automation.translation';
    agentName = 'AI Translation Engine';
    stage = 'translation';
    validate(input) {
        const errors = [];
        if (!input.scenes?.length)
            errors.push('Scenes required');
        if (!input.targetLanguages?.length)
            errors.push('At least one target language required');
        return { valid: errors.length === 0, errors };
    }
    estimateCost() { return { costUsd: 0, breakdown: ['Translation uses Gemini (free)'] }; }
    async healthCheck() { return { healthy: true, details: 'Gemini-powered translation' }; }
    async execute(input, onProgress, cancellation) {
        log.info('Translation starting', { languages: input.targetLanguages.length });
        onProgress(10, `Translating to ${input.targetLanguages.length} languages`);
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
        const pkg = await TranslationPlanner.translate(input.scenes, input.title, input.targetLanguages, input.sourceLanguage ?? 'en');
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
        onProgress(90, 'Recording translations');
        TranslationMemory.getInstance().record({ productionTitle: input.title, packageId: pkg.id, languageCount: pkg.translations.length });
        onProgress(100, `Translated to ${pkg.translations.length} languages`);
        return pkg;
    }
}
//# sourceMappingURL=translation-agent.js.map