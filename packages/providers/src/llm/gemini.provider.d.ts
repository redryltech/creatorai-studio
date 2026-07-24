import { BaseProvider } from '../core/base-provider';
import type { ILLMProvider, LLMCompletionRequest, LLMCompletionResponse, LLMStreamChunk } from '../core/provider.interface';
export interface GeminiProviderConfig {
    apiKey: string;
    defaultModel?: string;
    timeoutMs?: number;
}
export declare class GeminiProvider extends BaseProvider implements ILLMProvider {
    readonly id = "gemini";
    readonly name = "Google Gemini (Free)";
    readonly version = "1.0.0";
    private readonly defaultModel;
    constructor(config: GeminiProviderConfig);
    protected getAuthHeaders(): Record<string, string>;
    complete(req: LLMCompletionRequest): Promise<LLMCompletionResponse>;
    completeStream(req: LLMCompletionRequest): AsyncGenerator<LLMStreamChunk, void, unknown>;
}
//# sourceMappingURL=gemini.provider.d.ts.map