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
import { generateId, ID_PREFIXES } from '@creatorai/shared';
/**
 * Create an AgentContext for a pipeline execution.
 *
 * @param config - Context configuration
 * @returns A fully initialized AgentContext
 */
export function createAgentContext(config) {
    const store = { ...(config.initialStore ?? {}) };
    const correlationId = generateId(ID_PREFIXES.pipeline);
    return {
        pipelineId: config.pipelineId,
        projectId: config.projectId,
        userId: config.userId,
        correlationId,
        store,
        reportProgress(progress, message) {
            config.onProgress?.({
                progress,
                message,
                timestamp: new Date(),
            });
        },
        log(level, message, data) {
            const entry = {
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
        isCancelled() {
            return config.cancelSignal?.cancelled ?? false;
        },
        getStoreValue(key) {
            return store[key];
        },
        setStoreValue(key, value) {
            store[key] = value;
        },
    };
}
/**
 * Create a minimal context for standalone agent execution (outside a pipeline).
 * Used when invoking agents directly via API endpoints.
 */
export function createStandaloneContext(userId, projectId) {
    return createAgentContext({
        pipelineId: generateId(ID_PREFIXES.pipeline),
        projectId: projectId ?? generateId(ID_PREFIXES.project),
        userId,
    });
}
//# sourceMappingURL=agent-context.js.map