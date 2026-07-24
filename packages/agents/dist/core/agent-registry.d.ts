import type { IAgent, AgentMetadata } from './agent.interface';
/**
 * Singleton agent registry.
 * All agents register themselves here during application bootstrap.
 */
export declare class AgentRegistry {
    private static instance;
    private agents;
    private constructor();
    /**
     * Get the singleton instance.
     */
    static getInstance(): AgentRegistry;
    /**
     * Reset the registry (for testing).
     */
    static resetInstance(): void;
    /**
     * Register an agent in the registry.
     *
     * @param agent - Agent instance to register
     * @throws Error if an agent with the same ID is already registered
     */
    register(agent: IAgent & {
        getMetadata(): AgentMetadata;
    }): void;
    /**
     * Unregister an agent.
     */
    unregister(agentId: string): boolean;
    /**
     * Get an agent by ID.
     *
     * @param agentId - Agent identifier
     * @returns The agent instance, or undefined if not found
     */
    get<TInput = unknown, TOutput = unknown>(agentId: string): IAgent<TInput, TOutput> | undefined;
    /**
     * Get an agent by ID, throwing if not found.
     *
     * @param agentId - Agent identifier
     * @returns The agent instance
     * @throws Error if agent is not found or disabled
     */
    getOrThrow<TInput = unknown, TOutput = unknown>(agentId: string): IAgent<TInput, TOutput>;
    /**
     * Check if an agent is registered and enabled.
     */
    has(agentId: string): boolean;
    /**
     * Enable or disable an agent.
     */
    setEnabled(agentId: string, enabled: boolean): void;
    /**
     * List all registered agent IDs.
     */
    listIds(): string[];
    /**
     * List all registered agent metadata.
     */
    listMetadata(): AgentMetadata[];
    /**
     * Get the total number of registered agents.
     */
    get size(): number;
    /**
     * Run health checks on all registered agents.
     *
     * @returns Map of agentId → health check result
     */
    healthCheckAll(): Promise<Map<string, {
        healthy: boolean;
        latencyMs: number;
        details: Record<string, unknown>;
    }>>;
}
//# sourceMappingURL=agent-registry.d.ts.map