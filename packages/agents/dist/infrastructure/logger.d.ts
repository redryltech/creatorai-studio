export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4
}
export interface LogContext {
    correlationId?: string;
    userId?: string;
    projectId?: string;
    pipelineId?: string;
    agentId?: string;
    providerId?: string;
    requestId?: string;
    durationMs?: number;
    [key: string]: unknown;
}
interface LogEntry {
    level: string;
    message: string;
    timestamp: string;
    service: string;
    context: LogContext;
    error?: {
        name: string;
        message: string;
        stack?: string;
        code?: string;
    };
}
/**
 * Transport interface — where logs go.
 * Default: console. In production: external service.
 */
export interface LogTransport {
    write(entry: LogEntry): void;
}
/**
 * Structured logger with context propagation.
 *
 * Usage:
 *   const log = Logger.for('ScriptAgent', { pipelineId, userId });
 *   log.info('Generating script', { topic, style });
 *   log.error('Provider failed', { providerId }, error);
 */
export declare class Logger {
    private static globalLevel;
    private static transport;
    private static serviceName;
    private readonly source;
    private readonly baseContext;
    private constructor();
    static configure(options: {
        level?: LogLevel;
        transport?: LogTransport;
        serviceName?: string;
    }): void;
    /**
     * Create a logger for a specific source (agent, service, controller).
     * Base context is merged into every log entry from this logger.
     */
    static for(source: string, baseContext?: LogContext): Logger;
    debug(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, context?: LogContext, error?: Error): void;
    fatal(message: string, context?: LogContext, error?: Error): void;
    /**
     * Create a child logger with additional context.
     * Useful inside agent execution where you want to add step-level context.
     */
    child(additionalContext: LogContext): Logger;
    /**
     * Time an async operation and log its duration.
     */
    time<T>(label: string, fn: () => Promise<T>, context?: LogContext): Promise<T>;
    private log;
}
export {};
//# sourceMappingURL=logger.d.ts.map