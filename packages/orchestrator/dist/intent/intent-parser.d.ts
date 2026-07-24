import type { ParsedIntent } from './intent.types';
export declare class IntentParser {
    private readonly promptManager;
    private readonly costTracker;
    constructor();
    /**
     * Parse a user message into a structured intent.
     *
     * @param message — Raw user message
     * @param userId — For cost tracking
     * @returns Strongly typed ParsedIntent
     */
    parse(message: string, userId: string): Promise<ParsedIntent>;
    /**
     * Normalize and validate the raw LLM output into our ParsedIntent type.
     * Handles common LLM quirks: wrong field names, missing fields, invalid enums.
     */
    private normalize;
    private resolveAction;
    private resolvePriority;
    private clampInt;
    private isCreationAction;
    private generateClarificationQuestion;
    private createGeneralChatIntent;
}
//# sourceMappingURL=intent-parser.d.ts.map