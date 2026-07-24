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

import type { IAgent, AgentMetadata } from './agent.interface';

/**
 * Registry entry — wraps an agent with metadata and state.
 */
interface RegistryEntry {
  agent: IAgent;
  metadata: AgentMetadata;
  registeredAt: Date;
  enabled: boolean;
}

/**
 * Singleton agent registry.
 * All agents register themselves here during application bootstrap.
 */
export class AgentRegistry {
  private static instance: AgentRegistry | null = null;
  private agents: Map<string, RegistryEntry> = new Map();

  private constructor() {}

  /**
   * Get the singleton instance.
   */
  static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  /**
   * Reset the registry (for testing).
   */
  static resetInstance(): void {
    AgentRegistry.instance = null;
  }

  /**
   * Register an agent in the registry.
   *
   * @param agent - Agent instance to register
   * @throws Error if an agent with the same ID is already registered
   */
  register(agent: IAgent & { getMetadata(): AgentMetadata }): void {
    const metadata = agent.getMetadata();

    if (this.agents.has(agent.id)) {
      throw new Error(
        `Agent with ID "${agent.id}" is already registered. ` +
          `Use unregister() first or use a different ID.`,
      );
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
  unregister(agentId: string): boolean {
    return this.agents.delete(agentId);
  }

  /**
   * Get an agent by ID.
   *
   * @param agentId - Agent identifier
   * @returns The agent instance, or undefined if not found
   */
  get<TInput = unknown, TOutput = unknown>(
    agentId: string,
  ): IAgent<TInput, TOutput> | undefined {
    const entry = this.agents.get(agentId);
    if (!entry || !entry.enabled) return undefined;
    return entry.agent as IAgent<TInput, TOutput>;
  }

  /**
   * Get an agent by ID, throwing if not found.
   *
   * @param agentId - Agent identifier
   * @returns The agent instance
   * @throws Error if agent is not found or disabled
   */
  getOrThrow<TInput = unknown, TOutput = unknown>(
    agentId: string,
  ): IAgent<TInput, TOutput> {
    const agent = this.get<TInput, TOutput>(agentId);
    if (!agent) {
      throw new Error(
        `Agent "${agentId}" is not registered or is disabled. ` +
          `Available agents: ${this.listIds().join(', ')}`,
      );
    }
    return agent;
  }

  /**
   * Check if an agent is registered and enabled.
   */
  has(agentId: string): boolean {
    const entry = this.agents.get(agentId);
    return !!entry && entry.enabled;
  }

  /**
   * Enable or disable an agent.
   */
  setEnabled(agentId: string, enabled: boolean): void {
    const entry = this.agents.get(agentId);
    if (entry) {
      entry.enabled = enabled;
    }
  }

  /**
   * List all registered agent IDs.
   */
  listIds(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * List all registered agent metadata.
   */
  listMetadata(): AgentMetadata[] {
    return Array.from(this.agents.values())
      .filter((entry) => entry.enabled)
      .map((entry) => entry.metadata);
  }

  /**
   * Get the total number of registered agents.
   */
  get size(): number {
    return this.agents.size;
  }

  /**
   * Run health checks on all registered agents.
   *
   * @returns Map of agentId → health check result
   */
  async healthCheckAll(): Promise<
    Map<string, { healthy: boolean; latencyMs: number; details: Record<string, unknown> }>
  > {
    const results = new Map<
      string,
      { healthy: boolean; latencyMs: number; details: Record<string, unknown> }
    >();

    const checks = Array.from(this.agents.entries())
      .filter(([, entry]) => entry.enabled)
      .map(async ([id, entry]) => {
        try {
          const result = await entry.agent.healthCheck();
          results.set(id, result);
        } catch (error) {
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
