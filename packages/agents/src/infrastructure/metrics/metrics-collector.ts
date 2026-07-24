// ============================================================
// CreatorAI Studio — Metrics Collector
// ============================================================
// Collects structured metrics from agents, providers, workflows,
// and the job queue. Aggregates into queryable summaries.
//
// Architecture:
// - Agents/providers call MetricsCollector.record() during execution
// - The collector stores raw data points in memory
// - periodically aggregates into MetricsSummary
// - Dashboard APIs query the collector for current data
//
// Future: flush to a time-series database (InfluxDB, Prometheus)
// ============================================================

import type { MetricPoint, MetricsSummary } from '@creatorai/shared';
import { Logger } from '../logger';

const log = Logger.for('MetricsCollector');

const MAX_POINTS = 50000;      // Memory cap
const CLEANUP_INTERVAL = 300000; // 5 min

export class MetricsCollector {
  private static instance: MetricsCollector | null = null;
  private points: MetricPoint[] = [];
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.cleanupTimer = setInterval(() => this.cleanup(), CLEANUP_INTERVAL);
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  static resetInstance(): void {
    if (MetricsCollector.instance?.cleanupTimer) {
      clearInterval(MetricsCollector.instance.cleanupTimer);
    }
    MetricsCollector.instance = null;
  }

  /** Record a single metric data point. */
  record(name: string, value: number, unit: MetricPoint['unit'], tags: Record<string, string> = {}): void {
    this.points.push({ name, value, unit, tags, timestamp: new Date() });
  }

  // ---- Convenience Methods ----

  recordAgentDuration(agentId: string, durationMs: number): void {
    this.record('agent.duration', durationMs, 'ms', { agentId });
  }

  recordAgentSuccess(agentId: string): void {
    this.record('agent.success', 1, 'count', { agentId });
  }

  recordAgentFailure(agentId: string): void {
    this.record('agent.failure', 1, 'count', { agentId });
  }

  recordProviderLatency(providerId: string, latencyMs: number): void {
    this.record('provider.latency', latencyMs, 'ms', { providerId });
  }

  recordProviderError(providerId: string): void {
    this.record('provider.error', 1, 'count', { providerId });
  }

  recordTokenUsage(agentId: string, providerId: string, model: string, tokens: number): void {
    this.record('tokens.used', tokens, 'tokens', { agentId, providerId, model });
  }

  recordCost(agentId: string, providerId: string, model: string, costUsd: number): void {
    this.record('cost.usd', costUsd, 'usd', { agentId, providerId, model });
  }

  recordWorkflowCompleted(durationMs: number, costUsd: number): void {
    this.record('workflow.completed', 1, 'count', {});
    this.record('workflow.duration', durationMs, 'ms', {});
    this.record('workflow.cost', costUsd, 'usd', {});
  }

  recordWorkflowFailed(): void {
    this.record('workflow.failed', 1, 'count', {});
  }

  // ---- Aggregation ----

  /** Generate a summary for a given time period. */
  getSummary(period: MetricsSummary['period'] = 'day'): MetricsSummary {
    const now = new Date();
    const windowMs = this.periodToMs(period);
    const startTime = new Date(now.getTime() - windowMs);
    const relevant = this.points.filter((p) => p.timestamp >= startTime);

    return {
      period,
      startTime,
      endTime: now,
      workflows: this.aggregateWorkflows(relevant),
      agents: this.aggregateAgents(relevant),
      providers: this.aggregateProviders(relevant),
      costs: this.aggregateCosts(relevant),
      usage: this.aggregateUsage(relevant),
    };
  }

  /** Get raw points for a specific metric (for charts). */
  getTimeSeries(name: string, periodHours: number = 24): MetricPoint[] {
    const cutoff = new Date(Date.now() - periodHours * 3600000);
    return this.points.filter((p) => p.name === name && p.timestamp >= cutoff);
  }

  get pointCount(): number { return this.points.length; }

  // ---- Private ----

  private aggregateWorkflows(points: MetricPoint[]): MetricsSummary['workflows'] {
    const completed = points.filter((p) => p.name === 'workflow.completed');
    const failed = points.filter((p) => p.name === 'workflow.failed');
    const durations = points.filter((p) => p.name === 'workflow.duration');
    const costs = points.filter((p) => p.name === 'workflow.cost');

    return {
      total: completed.length + failed.length,
      completed: completed.length,
      failed: failed.length,
      cancelled: 0,
      averageDurationMs: durations.length > 0 ? durations.reduce((s, p) => s + p.value, 0) / durations.length : 0,
      averageCostUsd: costs.length > 0 ? costs.reduce((s, p) => s + p.value, 0) / costs.length : 0,
    };
  }

  private aggregateAgents(points: MetricPoint[]): MetricsSummary['agents'] {
    const result: MetricsSummary['agents'] = {};
    const agentPoints = points.filter((p) => p.tags.agentId);

    const agentIds = new Set(agentPoints.map((p) => p.tags.agentId!));
    for (const agentId of agentIds) {
      const ap = agentPoints.filter((p) => p.tags.agentId === agentId);
      const successes = ap.filter((p) => p.name === 'agent.success');
      const failures = ap.filter((p) => p.name === 'agent.failure');
      const durations = ap.filter((p) => p.name === 'agent.duration');
      const tokens = ap.filter((p) => p.name === 'tokens.used');
      const costs = ap.filter((p) => p.name === 'cost.usd');

      result[agentId] = {
        invocations: successes.length + failures.length,
        successes: successes.length,
        failures: failures.length,
        averageDurationMs: durations.length > 0 ? Math.round(durations.reduce((s, p) => s + p.value, 0) / durations.length) : 0,
        totalTokens: tokens.reduce((s, p) => s + p.value, 0),
        totalCostUsd: costs.reduce((s, p) => s + p.value, 0),
      };
    }
    return result;
  }

  private aggregateProviders(points: MetricPoint[]): MetricsSummary['providers'] {
    const result: MetricsSummary['providers'] = {};
    const providerPoints = points.filter((p) => p.tags.providerId);

    const providerIds = new Set(providerPoints.map((p) => p.tags.providerId!));
    for (const providerId of providerIds) {
      const pp = providerPoints.filter((p) => p.tags.providerId === providerId);
      const latencies = pp.filter((p) => p.name === 'provider.latency');
      const errors = pp.filter((p) => p.name === 'provider.error');

      const sortedLatencies = latencies.map((p) => p.value).sort((a, b) => a - b);
      const p95Index = Math.floor(sortedLatencies.length * 0.95);

      result[providerId] = {
        requests: latencies.length + errors.length,
        successes: latencies.length,
        failures: errors.length,
        averageLatencyMs: latencies.length > 0 ? Math.round(latencies.reduce((s, p) => s + p.value, 0) / latencies.length) : 0,
        p95LatencyMs: sortedLatencies[p95Index] ?? 0,
        errorRate: (latencies.length + errors.length) > 0 ? errors.length / (latencies.length + errors.length) : 0,
        circuitBreakerTrips: 0,
      };
    }
    return result;
  }

  private aggregateCosts(points: MetricPoint[]): MetricsSummary['costs'] {
    const costPoints = points.filter((p) => p.name === 'cost.usd');
    const byProvider: Record<string, number> = {};
    const byAgent: Record<string, number> = {};
    const byModel: Record<string, number> = {};
    let total = 0;

    for (const p of costPoints) {
      total += p.value;
      if (p.tags.providerId) byProvider[p.tags.providerId] = (byProvider[p.tags.providerId] ?? 0) + p.value;
      if (p.tags.agentId) byAgent[p.tags.agentId] = (byAgent[p.tags.agentId] ?? 0) + p.value;
      if (p.tags.model) byModel[p.tags.model] = (byModel[p.tags.model] ?? 0) + p.value;
    }

    return { totalUsd: total, byProvider, byAgent, byModel };
  }

  private aggregateUsage(points: MetricPoint[]): MetricsSummary['usage'] {
    const tokens = points.filter((p) => p.name === 'tokens.used');
    return {
      totalTokensUsed: tokens.reduce((s, p) => s + p.value, 0),
      totalImagesGenerated: points.filter((p) => p.name === 'agent.success' && p.tags.agentId === 'image').length,
      totalVoiceoversGenerated: points.filter((p) => p.name === 'agent.success' && p.tags.agentId === 'voice').length,
      totalVideosGenerated: points.filter((p) => p.name === 'agent.success' && p.tags.agentId === 'video').length,
      storageUsedBytes: 0,
    };
  }

  private periodToMs(period: MetricsSummary['period']): number {
    switch (period) {
      case 'hour': return 3600000;
      case 'day': return 86400000;
      case 'week': return 604800000;
      case 'month': return 2592000000;
    }
  }

  private cleanup(): void {
    if (this.points.length > MAX_POINTS) {
      const cutoff = this.points.length - MAX_POINTS;
      this.points = this.points.slice(cutoff);
      log.debug('Metrics cleanup', { removed: cutoff, remaining: this.points.length });
    }
    // Also remove points older than 7 days
    const weekAgo = new Date(Date.now() - 604800000);
    const before = this.points.length;
    this.points = this.points.filter((p) => p.timestamp >= weekAgo);
    if (this.points.length < before) {
      log.debug('Expired metrics removed', { removed: before - this.points.length });
    }
  }
}
