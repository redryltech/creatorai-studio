import type { PromptLength } from './prompt.types';
export declare class TokenOptimizer {
    /**
     * Optimize prompt text to fit within a token limit while
     * preserving the most important information.
     */
    static optimize(prompt: string, maxTokens: number, length: PromptLength): string;
    /** Estimate token count for a prompt string. */
    static estimateTokens(text: string): number;
    /** Estimate cost for a provider. */
    static estimateCost(tokenCount: number, costPerUnit: number): number;
}
//# sourceMappingURL=token-optimizer.d.ts.map