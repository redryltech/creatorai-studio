// ============================================================
// CreatorAI Studio — Agent Execution Context
// ============================================================
// The context is the shared communication channel between
// agents within a pipeline. It provides:
// - Shared key-value store for passing data between agents
// - Progress reporting
// - Logging
// - Cancellation checking
//
// The context is created by the pipeline runner and passed
// to each agent during execution.
// ============================================================

import type { AgentContext } from '@creatorai/shared';
import { generateId, ID_PREFIXES } from '@creatorai/shared';

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
export function createAgentContext(config: {
  pipelineId: string;
  projectId: string;
  userId: string;
  initialStore?: Record<string, unknown>;
  onProgress?: OnProgressCallback;
  onLog?: OnLogCallback;
  cancelSignal?: { cancelled: boolean };
}): AgentContext {
  const store: Record<string, unknown> = { ...(config.initialStore ?? {}) };
  const correlationId = generateId(ID_PREFIXES.pipeline);

  return {
    pipelineId: config.pipelineId,
    projectId: config.projectId,
    userId: config.userId,
    correlationId,
    store,

    reportProgress(progress: number, message?: string): void {
      config.onProgress?.({
        progress,
        message,
        timestamp: new Date(),
      });
    },

    log(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
      const entry: LogEntry = {
        level,
        message,
        data,
        timestamp: new Date(),
      };

      config.onLog?.(entry);

      // Also log to console in development
      if (process.env.NODE_ENV !== 'production') {
        const prefix = `[${level.toUpperCase()}] [${config.pipelineId}]`;
        switch (level) {
          case 'info':
            console.log(prefix, message, data ?? '');
            break;
          case 'warn':
            console.warn(prefix, message, data ?? '');
            break;
          case 'error':
            console.error(prefix, message, data ?? '');
            break;
        }
      }
    },

    isCancelled(): boolean {
      return config.cancelSignal?.cancelled ?? false;
    },

    getStoreValue<T>(key: string): T | undefined {
      return store[key] as T | undefined;
    },

    setStoreValue(key: string, value: unknown): void {
      store[key] = value;
    },
  };
}

/**
 * Create a minimal context for standalone agent execution (outside a pipeline).
 * Used when invoking agents directly via API endpoints.
 */
export function createStandaloneContext(
  userId: string,
  projectId?: string,
): AgentContext {
  return createAgentContext({
    pipelineId: generateId(ID_PREFIXES.pipeline),
    projectId: projectId ?? generateId(ID_PREFIXES.project),
    userId,
  });
}
