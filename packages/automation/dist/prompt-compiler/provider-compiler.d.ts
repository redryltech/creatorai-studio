import type { CanonicalPrompt, ProviderPrompt, NegativePromptSpec, PromptLength } from './prompt.types';
import type { DirectorScenePlan } from '../director/director.types';
interface ProviderDef {
    id: string;
    name: string;
    type: 'image' | 'video';
    maxTokens: number;
    supportsNegative: boolean;
    supportsSeed: boolean;
    supportsCamera: boolean;
    supportsDuration: boolean;
    promptPrefix: string;
    promptSuffix: string;
    supportLevel: 'full' | 'partial' | 'basic';
    costPerUnit: number;
}
export declare class ProviderCompiler {
    /**
     * Compile a canonical prompt for all providers.
     */
    static compileAll(canonical: CanonicalPrompt, negSpec: NegativePromptSpec, dirScene: DirectorScenePlan | undefined, seed: number, promptLength: PromptLength): ProviderPrompt[];
    /**
     * Compile for a single provider.
     */
    static compileForProvider(canonical: CanonicalPrompt, negSpec: NegativePromptSpec, dirScene: DirectorScenePlan | undefined, seed: number, provider: ProviderDef, promptLength: PromptLength): ProviderPrompt;
    /** Get all provider definitions. */
    static getProviders(): ProviderDef[];
    /** Get a specific provider definition. */
    static getProvider(id: string): ProviderDef | undefined;
}
export {};
//# sourceMappingURL=provider-compiler.d.ts.map