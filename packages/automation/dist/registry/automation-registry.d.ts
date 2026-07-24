import type { IAutomationAgent, IResearchProvider } from '../interfaces/automation-agent.interface';
export declare class AutomationRegistry {
    private static instance;
    private agents;
    private researchProviders;
    private constructor();
    static getInstance(): AutomationRegistry;
    static resetInstance(): void;
    /**
     * Register an automation agent.
     */
    registerAgent<TIn, TOut>(agent: IAutomationAgent<TIn, TOut>): void;
    /**
     * Get an automation agent by ID.
     */
    getAgent<TIn, TOut>(agentId: string): IAutomationAgent<TIn, TOut> | undefined;
    /**
     * Get an agent or throw.
     */
    getAgentOrThrow<TIn, TOut>(agentId: string): IAutomationAgent<TIn, TOut>;
    /**
     * List all registered agent IDs.
     */
    listAgentIds(): string[];
    /**
     * Get agents by stage.
     */
    getAgentsByStage(stage: string): IAutomationAgent<unknown, unknown>[];
    /**
     * Register a research data source provider.
     */
    registerResearchProvider(provider: IResearchProvider): void;
    /**
     * Get all research providers, optionally filtered by category.
     */
    getResearchProviders(category?: string): IResearchProvider[];
    /**
     * Get a specific research provider.
     */
    getResearchProvider(providerId: string): IResearchProvider | undefined;
    /**
     * Run health checks on all registered agents.
     */
    healthCheckAll(): Promise<Map<string, {
        healthy: boolean;
        details: string;
    }>>;
    get agentCount(): number;
    get providerCount(): number;
}
//# sourceMappingURL=automation-registry.d.ts.map