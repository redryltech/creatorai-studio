import { describe, it, expect, beforeEach } from 'vitest';
import { AgentRegistry } from '../core/agent-registry';
import type { IAgent, AgentMetadata, AgentStatus } from '../core/agent.interface';

// Minimal mock agent
function createMockAgent(id: string): IAgent & { getMetadata(): AgentMetadata } {
  return {
    id,
    name: `Mock ${id}`,
    version: '1.0.0',
    description: `Mock agent ${id}`,
    validate: async () => ({ valid: true, errors: [] }),
    execute: async () => ({ success: true, data: null, error: null, metrics: { durationMs: 0, tokensUsed: null, costUsd: null, provider: 'mock' } }),
    rollback: async () => {},
    getStatus: () => ({ isRunning: false, progress: 0, currentOperation: null, startedAt: null, lastError: null }),
    estimateCost: async () => ({ provider: 'mock', model: 'mock', estimatedCostUsd: 0, breakdown: [] }),
    healthCheck: async () => ({ healthy: true, provider: 'mock', latencyMs: 1, details: {} }),
    getMetadata: () => ({
      id, name: `Mock ${id}`, version: '1.0.0', description: '', inputSchema: {}, outputSchema: {},
      dependencies: [], estimatedDuration: { min: 1, max: 5, average: 3 }, supportedProviders: ['mock'],
    }),
  };
}

describe('AgentRegistry', () => {
  beforeEach(() => { AgentRegistry.resetInstance(); });

  it('registers and retrieves agents', () => {
    const registry = AgentRegistry.getInstance();
    const agent = createMockAgent('test');
    registry.register(agent);
    expect(registry.get('test')).toBe(agent);
  });

  it('throws on duplicate registration', () => {
    const registry = AgentRegistry.getInstance();
    registry.register(createMockAgent('dup'));
    expect(() => registry.register(createMockAgent('dup'))).toThrow(/already registered/);
  });

  it('returns undefined for unregistered agent', () => {
    const registry = AgentRegistry.getInstance();
    expect(registry.get('nonexistent')).toBeUndefined();
  });

  it('getOrThrow throws for missing agent', () => {
    const registry = AgentRegistry.getInstance();
    expect(() => registry.getOrThrow('missing')).toThrow(/not registered/);
  });

  it('lists all agent IDs', () => {
    const registry = AgentRegistry.getInstance();
    registry.register(createMockAgent('a'));
    registry.register(createMockAgent('b'));
    expect(registry.listIds()).toEqual(['a', 'b']);
  });

  it('disabling an agent makes it unavailable', () => {
    const registry = AgentRegistry.getInstance();
    registry.register(createMockAgent('x'));
    registry.setEnabled('x', false);
    expect(registry.get('x')).toBeUndefined();
    expect(registry.has('x')).toBe(false);
  });

  it('re-enabling an agent makes it available again', () => {
    const registry = AgentRegistry.getInstance();
    registry.register(createMockAgent('y'));
    registry.setEnabled('y', false);
    registry.setEnabled('y', true);
    expect(registry.has('y')).toBe(true);
  });

  it('unregister removes an agent', () => {
    const registry = AgentRegistry.getInstance();
    registry.register(createMockAgent('z'));
    expect(registry.unregister('z')).toBe(true);
    expect(registry.has('z')).toBe(false);
  });

  it('healthCheckAll runs checks on all agents', async () => {
    const registry = AgentRegistry.getInstance();
    registry.register(createMockAgent('h1'));
    registry.register(createMockAgent('h2'));
    const results = await registry.healthCheckAll();
    expect(results.size).toBe(2);
    expect(results.get('h1')?.healthy).toBe(true);
  });
});
