import type { PromptBlock, PromptConflict } from './prompt.types';
export declare class ConflictResolver {
    /**
     * Detect and auto-resolve conflicts between prompt blocks.
     */
    static resolve(blocks: PromptBlock[], masterPrompt: string): PromptConflict[];
}
//# sourceMappingURL=conflict-resolver.d.ts.map