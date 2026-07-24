// ============================================================
// CreatorAI Studio — Structured Logger
// ============================================================
// Replaces console.log everywhere. Every log entry is structured
// JSON with correlation IDs, agent IDs, and timing data.
//
// Why not winston/pino? We start with a thin wrapper so we can
// swap the transport (console → Datadog → GCP Logging) without
// changing any call sites. The interface is what matters.
// ============================================================
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 4] = "FATAL";
})(LogLevel || (LogLevel = {}));
class ConsoleTransport {
    write(entry) {
        const { level, message, timestamp, service, context, error } = entry;
        const contextStr = Object.keys(context).length > 0
            ? ` ${JSON.stringify(context)}`
            : '';
        const prefix = `[${timestamp}] [${level}] [${service}]`;
        switch (level) {
            case 'ERROR':
            case 'FATAL':
                console.error(`${prefix} ${message}${contextStr}`, error ?? '');
                break;
            case 'WARN':
                console.warn(`${prefix} ${message}${contextStr}`);
                break;
            case 'DEBUG':
                if (process.env.NODE_ENV === 'development') {
                    console.debug(`${prefix} ${message}${contextStr}`);
                }
                break;
            default:
                console.log(`${prefix} ${message}${contextStr}`);
        }
    }
}
/**
 * Structured logger with context propagation.
 *
 * Usage:
 *   const log = Logger.for('ScriptAgent', { pipelineId, userId });
 *   log.info('Generating script', { topic, style });
 *   log.error('Provider failed', { providerId }, error);
 */
export class Logger {
    static globalLevel = LogLevel.DEBUG;
    static transport = new ConsoleTransport();
    static serviceName = 'creatorai';
    source;
    baseContext;
    constructor(source, baseContext = {}) {
        this.source = source;
        this.baseContext = baseContext;
    }
    // ---- Static Configuration ----
    static configure(options) {
        if (options.level !== undefined)
            Logger.globalLevel = options.level;
        if (options.transport)
            Logger.transport = options.transport;
        if (options.serviceName)
            Logger.serviceName = options.serviceName;
    }
    /**
     * Create a logger for a specific source (agent, service, controller).
     * Base context is merged into every log entry from this logger.
     */
    static for(source, baseContext = {}) {
        return new Logger(source, baseContext);
    }
    // ---- Logging Methods ----
    debug(message, context = {}) {
        this.log(LogLevel.DEBUG, 'DEBUG', message, context);
    }
    info(message, context = {}) {
        this.log(LogLevel.INFO, 'INFO', message, context);
    }
    warn(message, context = {}) {
        this.log(LogLevel.WARN, 'WARN', message, context);
    }
    error(message, context = {}, error) {
        this.log(LogLevel.ERROR, 'ERROR', message, context, error);
    }
    fatal(message, context = {}, error) {
        this.log(LogLevel.FATAL, 'FATAL', message, context, error);
    }
    /**
     * Create a child logger with additional context.
     * Useful inside agent execution where you want to add step-level context.
     */
    child(additionalContext) {
        return new Logger(this.source, {
            ...this.baseContext,
            ...additionalContext,
        });
    }
    /**
     * Time an async operation and log its duration.
     */
    async time(label, fn, context = {}) {
        const start = performance.now();
        try {
            const result = await fn();
            const durationMs = Math.round(performance.now() - start);
            this.info(`${label} completed`, { ...context, durationMs });
            return result;
        }
        catch (error) {
            const durationMs = Math.round(performance.now() - start);
            this.error(`${label} failed`, { ...context, durationMs }, error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }
    // ---- Private ----
    log(level, levelStr, message, context, error) {
        if (level < Logger.globalLevel)
            return;
        const entry = {
            level: levelStr,
            message: `[${this.source}] ${message}`,
            timestamp: new Date().toISOString(),
            service: Logger.serviceName,
            context: { ...this.baseContext, ...context },
        };
        if (error) {
            entry.error = {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code,
            };
        }
        Logger.transport.write(entry);
    }
}
//# sourceMappingURL=logger.js.map