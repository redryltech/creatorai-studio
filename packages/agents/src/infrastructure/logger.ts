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

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
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

class ConsoleTransport implements LogTransport {
  write(entry: LogEntry): void {
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
  private static globalLevel: LogLevel = LogLevel.DEBUG;
  private static transport: LogTransport = new ConsoleTransport();
  private static serviceName: string = 'creatorai';

  private readonly source: string;
  private readonly baseContext: LogContext;

  private constructor(source: string, baseContext: LogContext = {}) {
    this.source = source;
    this.baseContext = baseContext;
  }

  // ---- Static Configuration ----

  static configure(options: {
    level?: LogLevel;
    transport?: LogTransport;
    serviceName?: string;
  }): void {
    if (options.level !== undefined) Logger.globalLevel = options.level;
    if (options.transport) Logger.transport = options.transport;
    if (options.serviceName) Logger.serviceName = options.serviceName;
  }

  /**
   * Create a logger for a specific source (agent, service, controller).
   * Base context is merged into every log entry from this logger.
   */
  static for(source: string, baseContext: LogContext = {}): Logger {
    return new Logger(source, baseContext);
  }

  // ---- Logging Methods ----

  debug(message: string, context: LogContext = {}): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, context);
  }

  info(message: string, context: LogContext = {}): void {
    this.log(LogLevel.INFO, 'INFO', message, context);
  }

  warn(message: string, context: LogContext = {}): void {
    this.log(LogLevel.WARN, 'WARN', message, context);
  }

  error(message: string, context: LogContext = {}, error?: Error): void {
    this.log(LogLevel.ERROR, 'ERROR', message, context, error);
  }

  fatal(message: string, context: LogContext = {}, error?: Error): void {
    this.log(LogLevel.FATAL, 'FATAL', message, context, error);
  }

  /**
   * Create a child logger with additional context.
   * Useful inside agent execution where you want to add step-level context.
   */
  child(additionalContext: LogContext): Logger {
    return new Logger(this.source, {
      ...this.baseContext,
      ...additionalContext,
    });
  }

  /**
   * Time an async operation and log its duration.
   */
  async time<T>(
    label: string,
    fn: () => Promise<T>,
    context: LogContext = {},
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const durationMs = Math.round(performance.now() - start);
      this.info(`${label} completed`, { ...context, durationMs });
      return result;
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);
      this.error(
        `${label} failed`,
        { ...context, durationMs },
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  }

  // ---- Private ----

  private log(
    level: LogLevel,
    levelStr: string,
    message: string,
    context: LogContext,
    error?: Error,
  ): void {
    if (level < Logger.globalLevel) return;

    const entry: LogEntry = {
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
        code: (error as any).code,
      };
    }

    Logger.transport.write(entry);
  }
}
