// ============================================================
// CreatorAI Studio — Provider Compiler
// ============================================================
// Compiles canonical prompts into provider-specific formats.
// Each provider has different prompt syntax, limits, and features.
// ============================================================
import { NegativePromptEngine } from './negative-prompt-engine';
import { TokenOptimizer } from './token-optimizer';
const PROVIDERS = [
    { id: 'veo', name: 'Google Veo', type: 'video', maxTokens: 2048, supportsNegative: true, supportsSeed: true, supportsCamera: true, supportsDuration: true, promptPrefix: '', promptSuffix: ', cinematic quality, professional', supportLevel: 'full', costPerUnit: 0.05 },
    { id: 'runway', name: 'Runway Gen-3', type: 'video', maxTokens: 1500, supportsNegative: true, supportsSeed: true, supportsCamera: true, supportsDuration: true, promptPrefix: '', promptSuffix: ', high quality video generation', supportLevel: 'full', costPerUnit: 0.05 },
    { id: 'kling', name: 'Kling', type: 'video', maxTokens: 2000, supportsNegative: true, supportsSeed: true, supportsCamera: true, supportsDuration: true, promptPrefix: '', promptSuffix: ', professional cinematography', supportLevel: 'full', costPerUnit: 0.04 },
    { id: 'luma', name: 'Luma Dream Machine', type: 'video', maxTokens: 1500, supportsNegative: false, supportsSeed: true, supportsCamera: false, supportsDuration: true, promptPrefix: '', promptSuffix: ', dream machine quality', supportLevel: 'partial', costPerUnit: 0.04 },
    { id: 'pika', name: 'Pika', type: 'video', maxTokens: 1000, supportsNegative: true, supportsSeed: true, supportsCamera: false, supportsDuration: true, promptPrefix: '', promptSuffix: ', high quality', supportLevel: 'partial', costPerUnit: 0.03 },
    { id: 'hunyuan', name: 'Hunyuan Video', type: 'video', maxTokens: 2000, supportsNegative: true, supportsSeed: true, supportsCamera: true, supportsDuration: true, promptPrefix: '', promptSuffix: ', high fidelity video', supportLevel: 'full', costPerUnit: 0.04 },
    { id: 'seedance', name: 'Seedance', type: 'video', maxTokens: 1500, supportsNegative: true, supportsSeed: true, supportsCamera: true, supportsDuration: true, promptPrefix: '', promptSuffix: ', smooth natural motion', supportLevel: 'full', costPerUnit: 0.04 },
    { id: 'flux', name: 'Flux', type: 'image', maxTokens: 1000, supportsNegative: false, supportsSeed: true, supportsCamera: false, supportsDuration: false, promptPrefix: '', promptSuffix: ', photorealistic, 8k', supportLevel: 'partial', costPerUnit: 0.003 },
    { id: 'imagen', name: 'Google Imagen', type: 'image', maxTokens: 1500, supportsNegative: true, supportsSeed: true, supportsCamera: false, supportsDuration: false, promptPrefix: '', promptSuffix: ', photographic quality', supportLevel: 'partial', costPerUnit: 0.01 },
    { id: 'openai', name: 'OpenAI DALL-E', type: 'image', maxTokens: 4000, supportsNegative: false, supportsSeed: false, supportsCamera: false, supportsDuration: false, promptPrefix: '', promptSuffix: '', supportLevel: 'basic', costPerUnit: 0.02 },
    { id: 'midjourney', name: 'Midjourney', type: 'image', maxTokens: 500, supportsNegative: true, supportsSeed: true, supportsCamera: false, supportsDuration: false, promptPrefix: '', promptSuffix: ' --ar 9:16 --v 6 --style raw', supportLevel: 'partial', costPerUnit: 0.01 },
    { id: 'dall_e', name: 'DALL-E 3', type: 'image', maxTokens: 4000, supportsNegative: false, supportsSeed: false, supportsCamera: false, supportsDuration: false, promptPrefix: '', promptSuffix: ', photographic quality', supportLevel: 'basic', costPerUnit: 0.04 },
];
export class ProviderCompiler {
    /**
     * Compile a canonical prompt for all providers.
     */
    static compileAll(canonical, negSpec, dirScene, seed, promptLength) {
        return PROVIDERS.map((provider) => ProviderCompiler.compileForProvider(canonical, negSpec, dirScene, seed, provider, promptLength));
    }
    /**
     * Compile for a single provider.
     */
    static compileForProvider(canonical, negSpec, dirScene, seed, provider, promptLength) {
        // Optimize master prompt for provider's token limit
        let prompt = TokenOptimizer.optimize(canonical.masterPrompt, provider.maxTokens, promptLength);
        // Add provider-specific suffix
        prompt += provider.promptSuffix;
        // Add provider-specific prefix
        if (provider.promptPrefix)
            prompt = provider.promptPrefix + prompt;
        // Camera metadata for providers that support it
        if (provider.supportsCamera && dirScene) {
            prompt += `, ${dirScene.cameraMovement.replace(/_/g, ' ')} camera movement`;
        }
        // Negative prompt
        const negative = provider.supportsNegative
            ? NegativePromptEngine.forProvider(negSpec, provider.id)
            : '';
        // Settings
        const settings = {
            duration: provider.supportsDuration ? (dirScene?.sceneDuration ?? 5) : 0,
            aspectRatio: '9:16',
            fps: provider.type === 'video' ? 24 : 0,
            resolution: '1080x1920',
            seed: provider.supportsSeed ? seed : 0,
            negativePrompt: negative,
            cameraMetadata: provider.supportsCamera && dirScene ? {
                style: dirScene.cameraStyle,
                movement: dirScene.cameraMovement,
                lens: dirScene.lens,
            } : {},
            styleMetadata: dirScene ? {
                colorGrading: dirScene.colorGrading,
                lighting: dirScene.lighting,
                mood: dirScene.sceneEmotion,
            } : {},
        };
        const tokenCount = Math.ceil(prompt.split(/\s+/).length * 1.3);
        return {
            providerId: provider.id,
            providerName: provider.name,
            prompt,
            negativePrompt: negative,
            settings,
            tokenCount,
            estimatedCost: provider.costPerUnit,
            supportLevel: provider.supportLevel,
        };
    }
    /** Get all provider definitions. */
    static getProviders() { return [...PROVIDERS]; }
    /** Get a specific provider definition. */
    static getProvider(id) { return PROVIDERS.find((p) => p.id === id); }
}
//# sourceMappingURL=provider-compiler.js.map