// ============================================================
// CreatorAI Studio — Script Writer Agent
// ============================================================
// Generates professional, platform-optimized scripts with
// scene-by-scene breakdown. This is the first agent in the
// main video creation pipeline.
//
// Input: topic, content type, platform, duration, style
// Output: Script with scenes, narration, visual descriptions
//
// Uses:
//   - PromptManager for template rendering
//   - ILLMProvider (via ProviderRegistry) for text generation
//   - CostTracker for usage tracking
//   - Logger for structured logging
// ============================================================
import { AgentId, ContentType, Platform, AgentError, estimateSpeakingDuration } from '@creatorai/shared';
import { BaseAgent } from '../core/base-agent';
import { PromptManager } from '../infrastructure/prompt/prompt-manager';
import { Logger } from '../infrastructure/logger';
import { ProviderRegistry } from '@creatorai/providers';
import { DEFAULT_PLATFORM_SETTINGS } from '@creatorai/shared';
const log = Logger.for('ScriptAgent');
// ---- Agent Implementation ----
export class ScriptAgent extends BaseAgent {
    id = AgentId.SCRIPT;
    name = 'Script Writer';
    version = '1.0.0';
    description = 'Generates professional video scripts with scene-by-scene breakdown';
    getMetadata() {
        return {
            id: this.id,
            name: this.name,
            version: this.version,
            description: this.description,
            inputSchema: {},
            outputSchema: {},
            dependencies: [AgentId.TREND],
            estimatedDuration: { min: 8, max: 30, average: 15 },
            supportedProviders: ['openai', 'anthropic'],
        };
    }
    async doValidate(input) {
        const errors = [];
        if (!input.topic || input.topic.trim().length < 3) {
            errors.push({ field: 'topic', message: 'Topic must be at least 3 characters', code: 'TOO_SHORT' });
        }
        if (input.topic && input.topic.length > 1000) {
            errors.push({ field: 'topic', message: 'Topic must be under 1000 characters', code: 'TOO_LONG' });
        }
        if (!Object.values(ContentType).includes(input.contentType)) {
            errors.push({ field: 'contentType', message: `Invalid content type: ${input.contentType}`, code: 'INVALID' });
        }
        if (!Object.values(Platform).includes(input.targetPlatform)) {
            errors.push({ field: 'targetPlatform', message: `Invalid platform: ${input.targetPlatform}`, code: 'INVALID' });
        }
        if (input.duration !== undefined && (input.duration < 5 || input.duration > 3600)) {
            errors.push({ field: 'duration', message: 'Duration must be between 5 and 3600 seconds', code: 'OUT_OF_RANGE' });
        }
        return { valid: errors.length === 0, errors };
    }
    async doExecute(input, context) {
        const agentLog = Logger.for(this.id, {
            pipelineId: context.pipelineId,
            userId: context.userId,
        });
        // 1. Resolve platform defaults
        const platformSettings = DEFAULT_PLATFORM_SETTINGS[input.targetPlatform];
        const duration = input.duration ?? platformSettings?.duration ?? 60;
        const isShortForm = duration <= 180;
        const sceneCount = this.calculateSceneCount(duration, isShortForm);
        agentLog.info('Generating script', {
            topic: input.topic,
            platform: input.targetPlatform,
            duration,
            sceneCount,
            style: input.style,
        });
        this.reportProgress(context, 10, 'Preparing prompt template');
        // 2. Render prompt
        const promptManager = PromptManager.getInstance();
        const templateId = isShortForm ? 'script.short_form' : 'script.long_form';
        if (!promptManager.has(templateId)) {
            throw new AgentError(this.id, `Prompt template "${templateId}" not registered. Run bootstrap first.`, false);
        }
        const rendered = promptManager.render(templateId, {
            topic: input.topic,
            platform: this.formatPlatformName(input.targetPlatform),
            duration: String(duration),
            style: input.style.replace(/_/g, ' '),
            tone: input.tone,
            language: input.language,
            sceneCount: String(sceneCount),
            keyPoints: input.keyPoints?.length
                ? `Key points to cover:\n${input.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`
                : '',
            brandVoice: input.brandVoice
                ? `Brand voice guidelines: ${input.brandVoice}`
                : '',
        });
        this.reportProgress(context, 20, 'Calling LLM provider');
        // 3. Get LLM provider
        const providerRegistry = ProviderRegistry.getInstance();
        const llmProvider = await providerRegistry.getPrimary('llm');
        if (!llmProvider) {
            throw new AgentError(this.id, 'No LLM provider available. Check API keys and provider health.', true);
        }
        // 4. Generate script via LLM
        const startTime = performance.now();
        const response = await llmProvider.complete({
            systemPrompt: rendered.systemPrompt,
            messages: [{ role: 'user', content: rendered.userPrompt }],
            model: rendered.model,
            temperature: rendered.temperature,
            maxTokens: rendered.maxTokens,
            responseFormat: rendered.responseFormat,
        });
        const llmDuration = Math.round(performance.now() - startTime);
        agentLog.info('LLM response received', {
            durationMs: llmDuration,
            tokens: response.usage.totalTokens,
            model: response.model,
        });
        this.reportProgress(context, 70, 'Parsing script');
        // 5. Parse the JSON response
        let script;
        try {
            const parsed = JSON.parse(response.content);
            script = this.normalizeScript(parsed, input, duration);
        }
        catch (parseError) {
            agentLog.error('Failed to parse LLM JSON response', {}, parseError);
            throw new AgentError(this.id, `Script generation returned invalid JSON. Model: ${response.model}. Finish reason: ${response.finishReason}`, true);
        }
        // 6. Quality checks
        this.reportProgress(context, 85, 'Running quality checks');
        this.validateScript(script, duration, sceneCount);
        // 7. Track cost
        this.costTracker.trackLLMUsage({
            userId: context.userId,
            projectId: context.projectId,
            pipelineId: context.pipelineId,
            agentId: this.id,
            providerId: llmProvider.id,
            model: response.model,
            tokens: response.usage,
        });
        // 8. Store in pipeline context for downstream agents
        context.setStoreValue('script.output', script);
        context.setStoreValue('script.scenes', script.scenes);
        context.setStoreValue('script.fullText', script.fullText);
        this.reportProgress(context, 100, 'Script generation complete');
        return {
            data: script,
            metrics: {
                tokensUsed: response.usage.totalTokens,
                costUsd: undefined, // CostTracker handles this
                provider: llmProvider.id,
            },
        };
    }
    async doRollback(_context) {
        // Script generation creates no external resources to clean up.
        // Output is purely data.
    }
    async doEstimateCost(input) {
        const duration = input.duration ?? 60;
        const isShortForm = duration <= 180;
        // Rough token estimate: short-form ~2500, long-form ~5000
        const estimatedTokens = isShortForm ? 2500 : 5000;
        return {
            provider: 'openai',
            model: 'gpt-4o',
            estimatedCostUsd: (estimatedTokens / 1000) * 0.01, // output pricing
            breakdown: [
                {
                    item: 'LLM completion (output tokens)',
                    quantity: estimatedTokens,
                    unitCostUsd: 0.01 / 1000,
                    totalCostUsd: (estimatedTokens / 1000) * 0.01,
                },
            ],
        };
    }
    async doHealthCheck() {
        const registry = ProviderRegistry.getInstance();
        const provider = await registry.getPrimary('llm');
        return {
            healthy: !!provider,
            provider: provider?.id ?? 'none',
            latencyMs: 0,
            details: { availableProvider: !!provider },
        };
    }
    // ---- Private Helpers ----
    calculateSceneCount(duration, isShortForm) {
        if (isShortForm) {
            // Short-form: ~5-8 seconds per scene
            return Math.max(3, Math.min(15, Math.round(duration / 7)));
        }
        // Long-form: ~15-25 seconds per scene
        return Math.max(5, Math.min(40, Math.round(duration / 20)));
    }
    formatPlatformName(platform) {
        const names = {
            youtube: 'YouTube',
            youtube_shorts: 'YouTube Shorts',
            instagram: 'Instagram',
            instagram_reels: 'Instagram Reels',
            tiktok: 'TikTok',
            facebook: 'Facebook',
            linkedin: 'LinkedIn',
            x: 'X (Twitter)',
            pinterest: 'Pinterest',
        };
        return names[platform] ?? platform;
    }
    /**
     * Normalize the raw LLM output into our Script type.
     * Handles common LLM quirks: wrong field names, missing fields, etc.
     */
    normalizeScript(raw, input, targetDuration) {
        const scenes = (raw.scenes ?? []).map((s, i) => ({
            id: s.id ?? `scene-${i + 1}`,
            order: s.order ?? i + 1,
            type: s.type ?? 'body',
            narration: s.narration ?? s.text ?? '',
            visualDescription: s.visualDescription ?? s.visual ?? s.visual_description ?? '',
            duration: s.duration ?? Math.round(targetDuration / (raw.scenes?.length ?? 5)),
            notes: s.notes ?? s.director_notes ?? '',
            transition: s.transition ?? 'crossfade',
        }));
        const fullText = raw.fullText ?? raw.full_text ?? scenes.map((s) => s.narration).join(' ');
        const metadata = raw.metadata ?? {};
        return {
            fullText,
            scenes,
            metadata: {
                wordCount: metadata.wordCount ?? metadata.word_count ?? fullText.split(/\s+/).length,
                estimatedDuration: metadata.estimatedDuration ?? metadata.estimated_duration ?? Math.round(estimateSpeakingDuration(fullText)),
                readabilityScore: metadata.readabilityScore ?? metadata.readability_score ?? 75,
                hookStrength: metadata.hookStrength ?? metadata.hook_strength ?? 80,
                ctaStrength: metadata.ctaStrength ?? metadata.cta_strength ?? 75,
                emotionalArc: metadata.emotionalArc ?? metadata.emotional_arc ?? [],
            },
        };
    }
    /**
     * Basic quality gate — catches obviously broken scripts.
     */
    validateScript(script, targetDuration, expectedScenes) {
        if (script.scenes.length === 0) {
            throw new AgentError(this.id, 'Script has no scenes', true);
        }
        if (script.fullText.length < 20) {
            throw new AgentError(this.id, 'Script text is too short', true);
        }
        // Warn but don't fail on scene count mismatch
        if (Math.abs(script.scenes.length - expectedScenes) > expectedScenes * 0.5) {
            log.warn('Scene count deviates significantly from target', {
                expected: expectedScenes,
                actual: script.scenes.length,
            });
        }
    }
}
//# sourceMappingURL=script.agent.js.map