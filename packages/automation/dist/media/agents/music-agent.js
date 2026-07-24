// ============================================================
// CreatorAI Studio — Music Agent (Media Factory)
// ============================================================
// Selects or generates background music for the video.
// Uses MediaProviderRegistry for provider plugins.
// Falls back to LLM-recommended royalty-free music metadata.
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger, CostTracker } from '@creatorai/agents';
import { ProviderRegistry } from '@creatorai/providers';
import { MediaProviderRegistry } from '../registry/media-provider-registry';
import { AutomationStage } from '../../types/automation.types';
const log = Logger.for('MusicAgent');
export class MusicAgent {
    agentId = 'automation.music';
    agentName = 'Music Agent';
    stage = AutomationStage.MEDIA;
    validate(input) {
        const errors = [];
        if (!input.scriptPackage)
            errors.push('ScriptPackage required');
        if (input.totalDuration <= 0)
            errors.push('Total duration must be positive');
        return { valid: errors.length === 0, errors };
    }
    estimateCost(_input) {
        return { costUsd: 0.01, breakdown: ['LLM music recommendation: $0.01'] };
    }
    async healthCheck() {
        return { healthy: true, details: 'LLM-based music selection always available' };
    }
    async execute(input, onProgress, cancellation) {
        const { scriptPackage, totalDuration } = input;
        log.info('Music selection starting', { totalDuration, tone: scriptPackage.metadata.tone });
        onProgress(10, 'Analyzing video mood for music selection');
        // Check for dedicated music provider first
        const musicProvider = await MediaProviderRegistry.getInstance().getPrimary('music');
        if (musicProvider) {
            try {
                onProgress(50, 'Generating background music');
                const response = await musicProvider.generate({
                    mood: scriptPackage.metadata.tone,
                    duration: totalDuration,
                    genre: 'cinematic',
                    emotionalArc: scriptPackage.metadata.emotionalArc,
                });
                if (response.success && response.url) {
                    onProgress(100, 'Music generated');
                    return {
                        id: generateId(ID_PREFIXES.asset),
                        genre: 'cinematic',
                        mood: scriptPackage.metadata.tone,
                        tempo: 120,
                        duration: totalDuration,
                        provider: musicProvider.providerId,
                        audioUrl: response.url,
                        storagePath: '',
                        license: 'generated',
                        costUsd: response.costUsd,
                        metadata: response.metadata,
                    };
                }
            }
            catch (err) {
                log.warn('Music provider failed, falling back to LLM recommendation', {}, err);
            }
        }
        // Fallback: LLM recommends music parameters (actual file from royalty-free library)
        onProgress(40, 'Selecting music parameters via AI');
        const llm = await ProviderRegistry.getInstance().getPrimary('llm');
        if (!llm)
            throw new Error('No LLM provider');
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
        const response = await llm.complete({
            systemPrompt: 'You are a music director. Recommend background music parameters. JSON only.',
            messages: [{ role: 'user', content: `Recommend background music for a ${totalDuration}s ${scriptPackage.metadata.tone} video about "${scriptPackage.hook.text}". Emotional arc: ${scriptPackage.metadata.emotionalArc.join(' → ')}.

JSON: {"genre":"string","mood":"string","tempo":120,"style":"string","instruments":["string"],"energyLevel":"low|medium|high"}` }],
            temperature: 0.5,
            maxTokens: 256,
            responseFormat: 'json',
        });
        CostTracker.getInstance().trackLLMUsage({
            userId: 'system', projectId: null, pipelineId: null,
            agentId: this.agentId, providerId: llm.id, model: response.model, tokens: response.usage,
        });
        let parsed = {};
        try {
            parsed = JSON.parse(response.content);
        }
        catch { /* use defaults */ }
        onProgress(100, 'Music parameters selected');
        return {
            id: generateId(ID_PREFIXES.asset),
            genre: parsed.genre ?? 'cinematic',
            mood: parsed.mood ?? scriptPackage.metadata.tone,
            tempo: parsed.tempo ?? 120,
            duration: totalDuration,
            provider: 'llm_recommendation',
            audioUrl: '',
            storagePath: '',
            license: 'royalty_free',
            costUsd: 0.01,
            metadata: parsed,
        };
    }
}
//# sourceMappingURL=music-agent.js.map