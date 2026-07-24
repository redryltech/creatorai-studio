import type { PromptTemplate, RenderedPrompt } from '@creatorai/shared';
/**
 * In-memory prompt template store.
 * In production, these would be loaded from Firestore or a config file
 * and hot-reloadable without server restart.
 */
export declare class PromptManager {
    private static instance;
    private templates;
    private constructor();
    static getInstance(): PromptManager;
    static resetInstance(): void;
    /**
     * Register a prompt template.
     */
    register(template: PromptTemplate): void;
    /**
     * Register multiple templates at once.
     */
    registerAll(templates: PromptTemplate[]): void;
    /**
     * Render a prompt template with the given variables.
     *
     * @param templateId - Template identifier
     * @param variables - Key-value map of template variables
     * @param overrides - Optional overrides for model, temperature, etc.
     * @returns Fully rendered prompt ready for LLM call
     * @throws Error if template not found or required variables missing
     */
    render(templateId: string, variables: Record<string, string>, overrides?: Partial<Pick<RenderedPrompt, 'model' | 'temperature' | 'maxTokens'>>): RenderedPrompt;
    /**
     * Get a template by ID (for inspection/editing).
     */
    get(templateId: string): PromptTemplate | undefined;
    /**
     * List all registered template IDs.
     */
    listIds(): string[];
    /**
     * List templates by category.
     */
    listByCategory(category: string): PromptTemplate[];
    /**
     * Check if a template exists.
     */
    has(templateId: string): boolean;
    /**
     * Get the count of registered templates.
     */
    get size(): number;
    private interpolate;
}
//# sourceMappingURL=prompt-manager.d.ts.map