// ============================================================
// CreatorAI Studio — Agent Registry
// ============================================================
// Central registry for discovering and accessing agents.
//
// The Registry pattern decouples the pipeline engine from
// concrete agent implementations. The engine asks the registry
// for an agent by ID — it never imports agents directly.
//
// This enables:
// - Dynamic agent loading
// - Agent versioning (multiple versions of the same agent)
// - Feature flags (enable/disable agents per user plan)
// - Testing (register mock agents)
// ============================================================
/**
 * Singleton agent registry.
 * All agents register themselves here during application bootstrap.
 */
export class AgentRegistry {
    static instance = null;
    agents = new Map();
    constructor() { }
    /**
     * Get the singleton instance.
     */
    static getInstance() {
        if (!AgentRegistry.instance) {
            AgentRegistry.instance = new AgentRegistry();
        }
        return AgentRegistry.instance;
    }
    /**
     * Reset the registry (for testing).
     */
    static resetInstance() {
        AgentRegistry.instance = null;
    }
    /**
     * Register an agent in the registry.
     *
     * @param agent - Agent instance to register
     * @throws Error if an agent with the same ID is already registered
     */
    register(agent) {
        const metadata = agent.getMetadata();
        if (this.agents.has(agent.id)) {
            throw new Error(`Agent with ID "${agent.id}" is already registered. ` +
                `Use unregister() first or use a different ID.`);
        }
        this.agents.set(agent.id, {
            agent,
            metadata,
            registeredAt: new Date(),
            enabled: true,
        });
    }
    /**
     * Unregister an agent.
     */
    unregister(agentId) {
        return this.agents.delete(agentId);
    }
    /**
     * Get an agent by ID.
     *
     * @param agentId - Agent identifier
     * @returns The agent instance, or undefined if not found
     */
    get(agentId) {
        const entry = this.agents.get(agentId);
        if (!entry || !entry.enabled)
            return undefined;
        return entry.agent;
    }
    /**
     * Get an agent by ID, throwing if not found.
     *
     * @param agentId - Agent identifier
     * @returns The agent instance
     * @throws Error if agent is not found or disabled
     */
    getOrThrow(agentId) {
        const agent = this.get(agentId);
        if (!agent) {
            throw new Error(`Agent "${agentId}" is not registered or is disabled. ` +
                `Available agents: ${this.listIds().join(', ')}`);
        }
        return agent;
    }
    /**
     * Check if an agent is registered and enabled.
     */
    has(agentId) {
        const entry = this.agents.get(agentId);
        return !!entry && entry.enabled;
    }
    /**
     * Enable or disable an agent.
     */
    setEnabled(agentId, enabled) {
        const entry = this.agents.get(agentId);
        if (entry) {
            entry.enabled = enabled;
        }
    }
    /**
     * List all registered agent IDs.
     */
    listIds() {
        return Array.from(this.agents.keys());
    }
    /**
     * List all registered agent metadata.
     */
    listMetadata() {
        return Array.from(this.agents.values())
            .filter((entry) => entry.enabled)
            .map((entry) => entry.metadata);
    }
    /**
     * Get the total number of registered agents.
     */
    get size() {
        return this.agents.size;
    }
    /**
     * Run health checks on all registered agents.
     *
     * @returns Map of agentId → health check result
     */
    async healthCheckAll() {
        const results = new Map();
        const checks = Array.from(this.agents.entries())
            .filter(([, entry]) => entry.enabled)
            .map(async ([id, entry]) => {
            try {
                const result = await entry.agent.healthCheck();
                results.set(id, result);
            }
            catch (error) {
                results.set(id, {
                    healthy: false,
                    latencyMs: -1,
                    details: {
                        error: error instanceof Error ? error.message : String(error),
                    },
                });
            }
        });
        await Promise.allSettled(checks);
        return results;
    }
}
//# sourceMappingURL=agent-registry.js.map