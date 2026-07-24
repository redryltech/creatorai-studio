import type { AIMemory, BrandProfile, MergedMemoryContext } from '@creatorai/shared';
/**
 * Function signatures for loading memory from repositories.
 * We use function types instead of importing repositories directly
 * to keep the agents package decoupled from the database package.
 */
export interface MemoryDataSource {
    getWorkspaceMemory(workspaceId: string): Promise<AIMemory | null>;
    getProjectMemory(workspaceId: string, projectId: string): Promise<AIMemory | null>;
    getDefaultBrand(workspaceId: string): Promise<BrandProfile | null>;
    getBrandById(brandId: string): Promise<BrandProfile | null>;
}
export declare class MemoryLoader {
    private static dataSource;
    /**
     * Set the data source (called during bootstrap).
     * This injects the repository layer without the agents package
     * depending on the database package directly.
     */
    static setDataSource(ds: MemoryDataSource): void;
    /**
     * Load and merge memory context for an agent execution.
     *
     * @param workspaceId — The workspace owning the project
     * @param projectId — Optional project for project-level overrides
     * @param brandProfileId — Optional specific brand profile
     */
    static load(workspaceId: string, projectId?: string | null, brandProfileId?: string | null): Promise<MergedMemoryContext>;
    /**
     * Build the system prompt injection text from memory layers.
     * This is appended to every agent's system prompt.
     */
    private static buildSystemPromptInjection;
    private static emptyContext;
}
//# sourceMappingURL=memory-loader.d.ts.map