// ============================================================
// CreatorAI Studio — Voice Generation Agent
// ============================================================
// Generates AI voiceover narration for each scene.
// Runs in parallel with ImageAgent in the pipeline DAG
// (both depend on ScriptAgent but not on each other).
//
// Input:  Script scenes (narration text per scene) + voice settings
// Output: VoiceResult[] (audio URLs + duration per scene)
// ============================================================
import { AgentId, AgentError, chunk } from '@creatorai/shared';
import { BaseAgent } from '../core/base-agent';
import { Logger } from '../infrastructure/logger';
import { ProviderRegistry } from '@creatorai/providers';
// ---- Constants ----
const BATCH_SIZE = 3;
const DEFAULT_VOICE = 'adam';
const DEFAULT_LANGUAGE = 'en';
// ---- Agent ----
export class VoiceAgent extends BaseAgent {
    id = AgentId.VOICE;
    name = 'Voice Generator';
    version = '1.0.0';
    description = 'Generates AI voiceover narration for video scenes';
    getMetadata() {
        return {
            id: this.id,
            name: this.name,
            version: this.version,
            description: this.description,
            inputSchema: {},
            outputSchema: {},
            dependencies: [AgentId.SCRIPT],
            estimatedDuration: { min: 10, max: 60, average: 25 },
            supportedProviders: ['elevenlabs', 'openai_tts'],
        };
    }
    async doValidate(input) {
        const errors = [];
        if (!input.scenes || input.scenes.length === 0) {
            errors.push({ field: 'scenes', message: 'At least one scene is required', code: 'REQUIRED' });
        }
        for (const scene of (input.scenes ?? [])) {
            if (!scene.narration || scene.narration.trim().length < 2) {
                errors.push({
                    field: `scenes.${scene.id}.narration`,
                    message: `Scene ${scene.id} has no narration text`,
                    code: 'REQUIRED',
                });
            }
        }
        if (input.speed !== undefined && (input.speed < 0.5 || input.speed > 2.0)) {
            errors.push({ field: 'speed', message: 'Speed must be between 0.5 and 2.0', code: 'OUT_OF_RANGE' });
        }
        return { valid: errors.length === 0, errors };
    }
    async doExecute(input, context) {
        const agentLog = Logger.for(this.id, { pipelineId: context.pipelineId, userId: context.userId });
        const totalScenes = input.scenes.length;
        agentLog.info('Starting voiceover generation', {
            sceneCount: totalScenes,
            voiceId: input.voiceId ?? DEFAULT_VOICE,
            language: input.language ?? DEFAULT_LANGUAGE,
        });
        // Get voice provider
        const providerRegistry = ProviderRegistry.getInstance();
        let voiceProvider;
        if (input.provider) {
            voiceProvider = providerRegistry.get(input.provider);
        }
        if (!voiceProvider) {
            voiceProvider = await providerRegistry.getPrimary('voice');
        }
        if (!voiceProvider) {
            throw new AgentError(this.id, 'No voice provider available. Check API keys.', true);
        }
        const voiceovers = [];
        const failedScenes = [];
        let totalDuration = 0;
        let totalCharacters = 0;
        let completedCount = 0;
        // Process scenes in batches
        const batches = chunk(input.scenes, BATCH_SIZE);
        for (const batch of batches) {
            if (context.isCancelled()) {
                agentLog.warn('Voice generation cancelled', { completed: completedCount, total: totalScenes });
                break;
            }
            const results = await Promise.allSettled(batch.map(async (scene) => {
                const response = await voiceProvider.synthesize({
                    text: scene.narration,
                    voiceId: input.voiceId ?? DEFAULT_VOICE,
                    language: input.language ?? DEFAULT_LANGUAGE,
                    speed: input.speed,
                    outputFormat: 'mp3',
                });
                return {
                    sceneId: scene.id,
                    result: response,
                };
            }));
            for (let i = 0; i < results.length; i++) {
                const scene = batch[i];
                const result = results[i];
                if (result.status === 'fulfilled') {
                    const { result: response } = result.value;
                    voiceovers.push({
                        sceneId: scene.id,
                        url: response.audioUrl,
                        storageRef: '', // Set after upload to Firebase Storage
                        duration: response.duration,
                        format: response.format,
                        sizeBytes: response.sizeBytes,
                        provider: voiceProvider.id,
                        voiceId: input.voiceId ?? DEFAULT_VOICE,
                        language: input.language ?? DEFAULT_LANGUAGE,
                        characterCount: response.characterCount,
                    });
                    totalDuration += response.duration;
                    totalCharacters += response.characterCount;
                    completedCount++;
                    // Track cost
                    this.costTracker.trackVoiceSynthesis({
                        userId: context.userId,
                        projectId: context.projectId,
                        pipelineId: context.pipelineId,
                        agentId: this.id,
                        providerId: voiceProvider.id,
                        model: 'eleven_multilingual_v2',
                        characterCount: response.characterCount,
                    });
                }
                else {
                    failedScenes.push(scene.id);
                    agentLog.error(`Voice generation failed for scene ${scene.id}`, { sceneId: scene.id }, result.reason instanceof Error ? result.reason : new Error(String(result.reason)));
                }
            }
            const progress = Math.round((completedCount / totalScenes) * 100);
            this.reportProgress(context, progress, `Generated ${completedCount}/${totalScenes} voiceovers`);
        }
        if (voiceovers.length === 0) {
            throw new AgentError(this.id, `All ${totalScenes} voice generations failed`, true);
        }
        // Store in context
        context.setStoreValue('voice.output', voiceovers);
        context.setStoreValue('voice.totalDuration', totalDuration);
        agentLog.info('Voice generation complete', {
            succeeded: voiceovers.length,
            failed: failedScenes.length,
            totalDuration: Math.round(totalDuration),
            totalCharacters,
        });
        this.reportProgress(context, 100, 'Voiceover generation complete');
        return {
            data: { voiceovers, totalDuration, failedScenes },
            metrics: { provider: voiceProvider.id },
        };
    }
    async doRollback(context) {
        const voiceovers = context.getStoreValue('voice.output');
        if (voiceovers && voiceovers.length > 0) {
            Logger.for(this.id).info('Rollback: would delete generated voiceovers', { count: voiceovers.length });
        }
    }
    async doEstimateCost(input) {
        const totalChars = input.scenes.reduce((sum, s) => sum + (s.narration?.length ?? 0), 0);
        const costPerChar = 0.00018;
        return {
            provider: 'elevenlabs',
            model: 'eleven_multilingual_v2',
            estimatedCostUsd: totalChars * costPerChar,
            breakdown: [{
                    item: 'Voice synthesis (ElevenLabs)',
                    quantity: totalChars,
                    unitCostUsd: costPerChar,
                    totalCostUsd: totalChars * costPerChar,
                }],
        };
    }
    async doHealthCheck() {
        const registry = ProviderRegistry.getInstance();
        const provider = await registry.getPrimary('voice');
        return {
            healthy: !!provider,
            provider: provider?.id ?? 'none',
            latencyMs: 0,
            details: {},
        };
    }
}
//# sourceMappingURL=voice.agent.js.map