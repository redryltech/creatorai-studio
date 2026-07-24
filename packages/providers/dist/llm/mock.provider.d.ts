import type { ILLMProvider, LLMCompletionRequest, LLMCompletionResponse, LLMStreamChunk } from '../core/provider.interface';
export declare class MockLLMProvider implements ILLMProvider {
    readonly id = "mock_llm";
    readonly name = "Mock LLM (Dev Mode)";
    readonly version = "1.0.0";
    isAvailable(): Promise<boolean>;
    getRateLimitStatus(): Promise<{
        remaining: number;
        limit: number;
        resetsAt: null;
    }>;
    complete(req: LLMCompletionRequest): Promise<LLMCompletionResponse>;
    completeStream(req: LLMCompletionRequest): AsyncGenerator<LLMStreamChunk, void, unknown>;
    private generateMockJSON;
    private generateMockText;
}
//# sourceMappingURL=mock.provider.d.ts.map