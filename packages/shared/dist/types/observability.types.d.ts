/**
 * Metric data point — collected by the MetricsCollector.
 */
export interface MetricPoint {
    name: string;
    value: number;
    unit: 'count' | 'ms' | 'bytes' | 'usd' | 'tokens' | 'percent';
    tags: Record<string, string>;
    timestamp: Date;
}
/**
 * Aggregated metrics over a time window.
 */
export interface MetricsSummary {
    period: 'hour' | 'day' | 'week' | 'month';
    startTime: Date;
    endTime: Date;
    workflows: {
        total: number;
        completed: number;
        failed: number;
        cancelled: number;
        averageDurationMs: number;
        averageCostUsd: number;
    };
    agents: Record<string, {
        invocations: number;
        successes: number;
        failures: number;
        averageDurationMs: number;
        totalTokens: number;
        totalCostUsd: number;
    }>;
    providers: Record<string, {
        requests: number;
        successes: number;
        failures: number;
        averageLatencyMs: number;
        p95LatencyMs: number;
        errorRate: number;
        circuitBreakerTrips: number;
    }>;
    costs: {
        totalUsd: number;
        byProvider: Record<string, number>;
        byAgent: Record<string, number>;
        byModel: Record<string, number>;
    };
    usage: {
        totalTokensUsed: number;
        totalImagesGenerated: number;
        totalVoiceoversGenerated: number;
        totalVideosGenerated: number;
        storageUsedBytes: number;
    };
}
/**
 * Health check result for the platform health dashboard.
 */
export interface PlatformHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: Date;
    uptime: number;
    services: {
        api: ServiceHealth;
        database: ServiceHealth;
        storage: ServiceHealth;
        jobQueue: ServiceHealth;
        sseConnections: number;
    };
    providers: Array<{
        id: string;
        name: string;
        status: 'healthy' | 'degraded' | 'unhealthy';
        latencyMs: number;
        errorRate: number;
        circuitOpen: boolean;
    }>;
    agents: Array<{
        id: string;
        name: string;
        registered: boolean;
        healthy: boolean;
    }>;
}
export interface ServiceHealth {
    status: 'up' | 'degraded' | 'down';
    latencyMs: number | null;
    details: Record<string, unknown>;
}
/**
 * Audit log entry — immutable record of every significant action.
 */
export interface AuditLogEntry {
    id: string;
    workspaceId: string;
    userId: string;
    userEmail: string;
    action: string;
    category: 'auth' | 'project' | 'asset' | 'workflow' | 'workspace' | 'memory' | 'brand' | 'publish' | 'settings' | 'system';
    /** What was acted upon */
    resource: {
        type: string;
        id: string;
        name: string | null;
    };
    /** What changed (for updates) */
    changes: Record<string, {
        before: unknown;
        after: unknown;
    }> | null;
    /** Request metadata */
    context: {
        ipAddress: string | null;
        userAgent: string | null;
        requestId: string | null;
    };
    timestamp: Date;
}
//# sourceMappingURL=observability.types.d.ts.map