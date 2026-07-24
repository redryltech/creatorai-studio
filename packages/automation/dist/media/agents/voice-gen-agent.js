// ============================================================
// CreatorAI Studio — Voice Generation Agent (Media Factory)
// ============================================================
import { chunk } from '@creatorai/shared';
import { Logger, CostTracker } from '@creatorai/agents';
import { MediaProviderRegistry } from '../registry/media-provider-registry';
import { AutomationStage } from '../../types/automation.types';
const log = Logger.for('VoiceGenAgent');
const BATCH_SIZE = 3;
export class VoiceGenerationAgent {
    agentId = 'automation.voice_gen';
    agentName = 'Voice Generator';
    stage = AutomationStage.MEDIA;
    validate(input) {
        const errors = [];
        if (!input.scriptPackage?.scenes?.length)
            errors.push('ScriptPackage with scenes required');
        for (const s of (input.scriptPackage?.scenes ?? [])) {
            if (!s.narration || s.narration.length < 2)
                errors.push(`Scene ${s.id} has no narration`);
        }
        return { valid: errors.length === 0, errors };
    }
    estimateCost(input) {
        const chars = input.scriptPackage?.scenes?.reduce((s, sc) => s + sc.narration.length, 0) ?? 0;
        const cost = chars * 0.00018;
        return { costUsd: cost, breakdown: [`${chars} characters × $0.00018/char = $${cost.toFixed(4)}`] };
    }
    async healthCheck() {
        const provider = await MediaProviderRegistry.getInstance().getPrimary('voice');
        return { healthy: !!provider, details: provider ? `Provider: ${provider.providerName}` : 'No voice provider' };
    }
    async execute(input, onProgress, cancellation) {
        const { scriptPackage, speaker = 'adam', language = 'en', speed = 1.0 } = input;
        const totalScenes = scriptPackage.scenes.length;
        log.info('Voice generation starting', { sceneCount: totalScenes, speaker, language });
        onProgress(5, `Generating ${totalScenes} voiceovers`);
        const registry = MediaProviderRegistry.getInstance();
        const voiceovers = [];
        const batches = chunk(scriptPackage.scenes, BATCH_SIZE);
        let completedCount = 0;
        for (const batch of batches) {
            if (cancellation.isCancelled)
                break;
            const results = await Promise.allSettled(batch.map(async (scene) => {
                const provider = await registry.getPrimary('voice');
                if (!provider)
                    throw new Error('No voice provider available');
                const startTime = performance.now();
                const response = await provider.generate({
                    text: scene.narration,
                    voiceId: speaker,
                    language,
                    speed,
                    outputFormat: 'mp3',
                });
                if (!response.success)
                    throw new Error(response.error ?? 'Voice generation failed');
                CostTracker.getInstance().trackVoiceSynthesis({
                    userId: 'system', projectId: null, pipelineId: null,
                    agentId: this.agentId, providerId: provider.providerId,
                    model: response.model, characterCount: scene.narration.length,
                });
                return {
                    sceneId: scene.id,
                    audioUrl: response.url ?? '',
                    storagePath: '',
                    speaker,
                    language,
                    speed,
                    duration: response.duration ?? scene.narration.length / 15,
                    provider: provider.providerId,
                    model: response.model,
                    characterCount: scene.narration.length,
                    costUsd: response.costUsd,
                    metadata: response.metadata,
                };
            }));
            for (const result of results) {
                if (result.status === 'fulfilled')
                    voiceovers.push(result.value);
                else
                    log.error('Voice generation failed', {}, new Error(result.reason?.message ?? ''));
                completedCount++;
            }
            onProgress(Math.round((completedCount / totalScenes) * 100), `Generated ${voiceovers.length}/${totalScenes} voiceovers`);
        }
        log.info('Voice generation complete', { succeeded: voiceovers.length, total: totalScenes });
        return voiceovers;
    }
}
//# sourceMappingURL=voice-gen-agent.js.map