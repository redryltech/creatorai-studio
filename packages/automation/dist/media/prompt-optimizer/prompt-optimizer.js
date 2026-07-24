// ============================================================
// CreatorAI Studio — Prompt Optimizer Agent
// ============================================================
// Transforms ScriptPackage scenes into optimized generation
// prompts for image, video, and voice providers.
// Ensures visual consistency across all scenes.
// ============================================================
import { Logger, CostTracker } from '@creatorai/agents';
import { ProviderRegistry } from '@creatorai/providers';
import { AutomationStage } from '../../types/automation.types';
const log = Logger.for('PromptOptimizer');
export class PromptOptimizerAgent {
    agentId = 'automation.prompt_optimizer';
    agentName = 'Prompt Optimizer';
    stage = AutomationStage.MEDIA;
    validate(input) {
        const errors = [];
        if (!input.scriptPackage?.scenes?.length)
            errors.push('ScriptPackage with scenes required');
        return { valid: errors.length === 0, errors };
    }
    estimateCost(input) {
        const scenes = input.scriptPackage?.scenes?.length ?? 0;
        return { costUsd: 0.02 + scenes * 0.002, breakdown: [`LLM prompt optimization: ${scenes} scenes`] };
    }
    async healthCheck() {
        const llm = await ProviderRegistry.getInstance().getPrimary('llm');
        return { healthy: !!llm, details: llm ? 'Ready' : 'No LLM provider' };
    }
    async execute(input, onProgress, cancellation) {
        const startTime = performance.now();
        const { scriptPackage, artStyle, aspectRatio } = input;
        log.info('Optimizing prompts', { sceneCount: scriptPackage.scenes.length, artStyle });
        onProgress(10, 'Analyzing scenes for visual consistency');
        const llm = await ProviderRegistry.getInstance().getPrimary('llm');
        if (!llm)
            throw new Error('No LLM provider available');
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
        onProgress(25, 'Generating optimized prompts for all scenes');
        const scenesText = scriptPackage.scenes.map((s) => `Scene ${s.order}: Narration="${s.narration}" Visual="${s.visualNotes}" Camera="${s.cameraAngle}" Movement="${s.cameraMovement}" Emotion="${s.emotion}"`).join('\n');
        const response = await llm.complete({
            systemPrompt: 'You are an expert AI prompt engineer for image and video generation. Create detailed, consistent prompts optimized for Flux/DALL-E/Runway. Respond ONLY with valid JSON.',
            messages: [{ role: 'user', content: `Optimize these scene descriptions into generation prompts.

Art style: ${artStyle ?? 'cinematic'}
Aspect ratio: ${aspectRatio ?? '9:16'}

Scenes:
${scenesText}

Respond with JSON:
{
  "prompts": [${scriptPackage.scenes.map((s) => `{"sceneId":"${s.id}","sceneOrder":${s.order},"imagePrompt":"detailed prompt","negativePrompt":"blurry, low quality, text, watermark","videoPrompt":"motion description","cameraAngle":"${s.cameraAngle}","cameraMovement":"${s.cameraMovement}","lighting":"description","mood":"${s.emotion}","colorPalette":["#hex"],"lens":"35mm|50mm|85mm|wide","composition":"rule of thirds|centered|dynamic","style":"${artStyle ?? 'cinematic'}"}`).join(',')}],
  "globalStyle": "consistent style description",
  "consistencyNotes": "how to maintain visual consistency"
}` }],
            temperature: 0.5,
            maxTokens: 4096,
            responseFormat: 'json',
        });
        CostTracker.getInstance().trackLLMUsage({
            userId: 'system', projectId: null, pipelineId: null,
            agentId: this.agentId, providerId: llm.id, model: response.model, tokens: response.usage,
        });
        onProgress(85, 'Parsing optimized prompts');
        let parsed;
        try {
            parsed = JSON.parse(response.content);
        }
        catch {
            throw new Error('Prompt optimizer returned invalid JSON');
        }
        const result = {
            prompts: (parsed.prompts ?? []).map((p, i) => ({
                sceneId: p.sceneId ?? scriptPackage.scenes[i]?.id ?? `scene-${i + 1}`,
                sceneOrder: p.sceneOrder ?? i + 1,
                imagePrompt: p.imagePrompt ?? '',
                negativePrompt: p.negativePrompt ?? 'blurry, low quality, deformed, text, watermark',
                videoPrompt: p.videoPrompt ?? '',
                cameraAngle: p.cameraAngle ?? 'medium shot',
                cameraMovement: p.cameraMovement ?? 'static',
                lighting: p.lighting ?? 'natural',
                mood: p.mood ?? 'neutral',
                colorPalette: p.colorPalette ?? [],
                lens: p.lens ?? '50mm',
                composition: p.composition ?? 'rule of thirds',
                style: p.style ?? artStyle ?? 'cinematic',
            })),
            globalStyle: parsed.globalStyle ?? artStyle ?? 'cinematic',
            consistencyNotes: parsed.consistencyNotes ?? '',
            metadata: {
                processingTimeMs: Math.round(performance.now() - startTime),
                model: response.model,
                generatedAt: new Date(),
            },
        };
        onProgress(100, 'Prompts optimized');
        log.info('Prompts optimized', { sceneCount: result.prompts.length, processingTimeMs: result.metadata.processingTimeMs });
        return result;
    }
}
//# sourceMappingURL=prompt-optimizer.js.map