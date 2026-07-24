import type { PromptVersion, LearningMemory } from '../types/intelligence.types';
export declare class PromptEvolutionEngine {
    private static instance;
    private versions;
    private constructor();
    static getInstance(): PromptEvolutionEngine;
    static resetInstance(): void;
    /** Record a prompt version with its performance. */
    recordVersion(params: {
        userId: string;
        promptType: PromptVersion['promptType'];
        prompt: string;
        performanceScore?: number;
    }): PromptVersion;
    /** Evolve a prompt using learning patterns. */
    evolvePrompt(userId: string, promptType: PromptVersion['promptType'], currentPrompt: string, learnings: LearningMemory[]): Promise<PromptVersion>;
    /** Get the best-performing version of a prompt type. */
    getBestVersion(userId: string, promptType: PromptVersion['promptType']): PromptVersion | undefined;
    /** Get version history. */
    getHistory(userId: string, promptType: PromptVersion['promptType']): PromptVersion[];
    /** Update performance score after analytics come in. */
    updatePerformance(versionId: string, score: number): void;
}
//# sourceMappingURL=prompt-evolution.d.ts.map