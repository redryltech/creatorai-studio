// ============================================================
// CreatorAI Studio — Automation Agent Registry
// ============================================================
// Central registry for automation agents.
// The Master Agent discovers agents through this registry.
// Adding a new agent = registering it here. Nothing else changes.
// ============================================================

import type { IAutomationAgent, IResearchProvider } from '../interfaces/automation-agent.interface';
import { Logger } from '@creatorai/agents';

const log = Logger.for('AutomationRegistry');

export class AutomationRegistry {
  private static instance: AutomationRegistry | null = null;
  private agents: Map<string, IAutomationAgent<unknown, unknown>> = new Map();
  private researchProviders: Map<string, IResearchProvider> = new Map();

  private constructor() {}

  static getInstance(): AutomationRegistry {
    if (!AutomationRegistry.instance) {
      AutomationRegistry.instance = new AutomationRegistry();
    }
    return AutomationRegistry.instance;
  }

  static resetInstance(): void {
    AutomationRegistry.instance = null;
  }

  // ---- Agent Registration ----

  /**
   * Register an automation agent.
   */
  registerAgent<TIn, TOut>(agent: IAutomationAgent<TIn, TOut>): void {
    if (this.agents.has(agent.agentId)) {
      throw new Error(`Automation agent "${agent.agentId}" is already registered`);
    }
    this.agents.set(agent.agentId, agent as IAutomationAgent<unknown, unknown>);
    log.info('Automation agent registered', { agentId: agent.agentId, stage: agent.stage });
  }

  /**
   * Get an automation agent by ID.
   */
  getAgent<TIn, TOut>(agentId: string): IAutomationAgent<TIn, TOut> | undefined {
    return this.agents.get(agentId) as IAutomationAgent<TIn, TOut> | undefined;
  }

  /**
   * Get an agent or throw.
   */
  getAgentOrThrow<TIn, TOut>(agentId: string): IAutomationAgent<TIn, TOut> {
    const agent = this.getAgent<TIn, TOut>(agentId);
    if (!agent) {
      throw new Error(`Automation agent "${agentId}" not found. Registered: ${this.listAgentIds().join(', ')}`);
    }
    return agent;
  }

  /**
   * List all registered agent IDs.
   */
  listAgentIds(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Get agents by stage.
   */
  getAgentsByStage(stage: string): IAutomationAgent<unknown, unknown>[] {
    return Array.from(this.agents.values()).filter((a) => a.stage === stage);
  }

  // ---- Research Provider Registration ----

  /**
   * Register a research data source provider.
   */
  registerResearchProvider(provider: IResearchProvider): void {
    this.researchProviders.set(provider.providerId, provider);
    log.info('Research provider registered', { providerId: provider.providerId, category: provider.category });
  }

  /**
   * Get all research providers, optionally filtered by category.
   */
  getResearchProviders(category?: string): IResearchProvider[] {
    const all = Array.from(this.researchProviders.values());
    return category ? all.filter((p) => p.category === category) : all;
  }

  /**
   * Get a specific research provider.
   */
  getResearchProvider(providerId: string): IResearchProvider | undefined {
    return this.researchProviders.get(providerId);
  }

  // ---- Health ----

  /**
   * Run health checks on all registered agents.
   */
  async healthCheckAll(): Promise<Map<string, { healthy: boolean; details: string }>> {
    const results = new Map<string, { healthy: boolean; details: string }>();
    const checks = Array.from(this.agents.entries()).map(async ([id, agent]) => {
      try {
        const result = await agent.healthCheck();
        results.set(id, result);
      } catch (error) {
        results.set(id, { healthy: false, details: error instanceof Error ? error.message : String(error) });
      }
    });
    await Promise.allSettled(checks);
    return results;
  }

  get agentCount(): number { return this.agents.size; }
  get providerCount(): number { return this.researchProviders.size; }
}
