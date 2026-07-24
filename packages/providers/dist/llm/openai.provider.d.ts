import { BaseProvider } from '../core/base-provider';
import type { ILLMProvider, LLMCompletionRequest, LLMCompletionResponse, LLMStreamChunk } from '../core/provider.interface';
export interface OpenAIProviderConfig {
    apiKey: string;
    defaultModel?: string;
    timeoutMs?: number;
    maxRetries?: number;
    baseUrl?: string;
}
export declare class OpenAIProvider extends BaseProvider implements ILLMProvider {
    readonly id = "openai";
    readonly name = "OpenAI";
    readonly version = "2.0.0";
    private readonly defaultModel;
    constructor(config: OpenAIProviderConfig | string);
    /**
     * Generate a complete text response (non-streaming).
     * Used for script generation, prompt optimization, SEO,
     * research synthesis, content planning — any task that
     * needs the full output before proceeding.
     */
    complete(req: LLMCompletionRequest): Promise<LLMCompletionResponse>;
    /**
     * Stream a text response token by token.
     * Used for the AI chat interface.
     */
    completeStream(req: LLMCompletionRequest): AsyncGenerator<LLMStreamChunk, void, unknown>;
    /**
     * Get the default model this provider is configured with.
     */
    getDefaultModel(): string;
    private mapFinishReason;
}
//# sourceMappingURL=openai.provider.d.ts.map