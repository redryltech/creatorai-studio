// ============================================================
// CreatorAI Studio — Automation Agent Registry
// ============================================================
// Central registry for automation agents.
// The Master Agent discovers agents through this registry.
// Adding a new agent = registering it here. Nothing else changes.
// ============================================================
import { Logger } from '@creatorai/agents';
const log = Logger.for('AutomationRegistry');
export class AutomationRegistry {
    static instance = null;
    agents = new Map();
    researchProviders = new Map();
    constructor() { }
    static getInstance() {
        if (!AutomationRegistry.instance) {
            AutomationRegistry.instance = new AutomationRegistry();
        }
        return AutomationRegistry.instance;
    }
    static resetInstance() {
        AutomationRegistry.instance = null;
    }
    // ---- Agent Registration ----
    /**
     * Register an automation agent.
     */
    registerAgent(agent) {
        if (this.agents.has(agent.agentId)) {
            throw new Error(`Automation agent "${agent.agentId}" is already registered`);
        }
        this.agents.set(agent.agentId, agent);
        log.info('Automation agent registered', { agentId: agent.agentId, stage: agent.stage });
    }
    /**
     * Get an automation agent by ID.
     */
    getAgent(agentId) {
        return this.agents.get(agentId);
    }
    /**
     * Get an agent or throw.
     */
    getAgentOrThrow(agentId) {
        const agent = this.getAgent(agentId);
        if (!agent) {
            throw new Error(`Automation agent "${agentId}" not found. Registered: ${this.listAgentIds().join(', ')}`);
        }
        return agent;
    }
    /**
     * List all registered agent IDs.
     */
    listAgentIds() {
        return Array.from(this.agents.keys());
    }
    /**
     * Get agents by stage.
     */
    getAgentsByStage(stage) {
        return Array.from(this.agents.values()).filter((a) => a.stage === stage);
    }
    // ---- Research Provider Registration ----
    /**
     * Register a research data source provider.
     */
    registerResearchProvider(provider) {
        this.researchProviders.set(provider.providerId, provider);
        log.info('Research provider registered', { providerId: provider.providerId, category: provider.category });
    }
    /**
     * Get all research providers, optionally filtered by category.
     */
    getResearchProviders(category) {
        const all = Array.from(this.researchProviders.values());
        return category ? all.filter((p) => p.category === category) : all;
    }
    /**
     * Get a specific research provider.
     */
    getResearchProvider(providerId) {
        return this.researchProviders.get(providerId);
    }
    // ---- Health ----
    /**
     * Run health checks on all registered agents.
     */
    async healthCheckAll() {
        const results = new Map();
        const checks = Array.from(this.agents.entries()).map(async ([id, agent]) => {
            try {
                const result = await agent.healthCheck();
                results.set(id, result);
            }
            catch (error) {
                results.set(id, { healthy: false, details: error instanceof Error ? error.message : String(error) });
            }
        });
        await Promise.allSettled(checks);
        return results;
    }
    get agentCount() { return this.agents.size; }
    get providerCount() { return this.researchProviders.size; }
}
//# sourceMappingURL=automation-registry.js.map