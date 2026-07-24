import type { AgentContext } from '@creatorai/shared';
/**
 * Log entry captured during agent execution.
 */
export interface LogEntry {
    level: 'info' | 'warn' | 'error';
    message: string;
    data?: unknown;
    timestamp: Date;
    agentId?: string;
}
/**
 * Progress update event.
 */
export interface ProgressUpdate {
    progress: number;
    message?: string;
    timestamp: Date;
}
/**
 * Callback type for progress updates.
 */
export type OnProgressCallback = (update: ProgressUpdate) => void;
/**
 * Callback type for log messages.
 */
export type OnLogCallback = (entry: LogEntry) => void;
/**
 * Create an AgentContext for a pipeline execution.
 *
 * @param config - Context configuration
 * @returns A fully initialized AgentContext
 */
export declare function createAgentContext(config: {
    pipelineId: string;
    projectId: string;
    userId: string;
    initialStore?: Record<string, unknown>;
    onProgress?: OnProgressCallback;
    onLog?: OnLogCallback;
    cancelSignal?: {
        cancelled: boolean;
    };
}): AgentContext;
/**
 * Create a minimal context for standalone agent execution (outside a pipeline).
 * Used when invoking agents directly via API endpoints.
 */
export declare function createStandaloneContext(userId: string, projectId?: string): AgentContext;
//# sourceMappingURL=agent-context.d.ts.map