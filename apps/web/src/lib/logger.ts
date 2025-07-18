import { NextRequest } from 'next/server';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

export interface LogContext {
  userId?: string;
  requestId?: string;
  sessionId?: string;
  apiRoute?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  ip?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private static instance: Logger;
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logBuffer: LogEntry[] = [];
  private bufferSize = 100;
  private flushInterval = 5000; // 5 seconds

  private constructor() {
    // Flush logs periodically
    if (!this.isDevelopment) {
      setInterval(() => this.flush(), this.flushInterval);
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry;
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    const errorStr = error ? ` Error: ${JSON.stringify(error)}` : '';

    return `[${timestamp}] [${level}] ${message}${contextStr}${errorStr}`;
  }

  private writeLog(entry: LogEntry) {
    const formattedLog = this.formatLog(entry);

    // In development, log to console with colors
    if (this.isDevelopment) {
      const colors = {
        [LogLevel.DEBUG]: '\x1b[36m', // Cyan
        [LogLevel.INFO]: '\x1b[32m', // Green
        [LogLevel.WARN]: '\x1b[33m', // Yellow
        [LogLevel.ERROR]: '\x1b[31m', // Red
        [LogLevel.FATAL]: '\x1b[35m', // Magenta
      };

      console.log(`${colors[entry.level]}${formattedLog}\x1b[0m`);
    } else {
      // In production, add to buffer for batch sending
      this.logBuffer.push(entry);

      if (this.logBuffer.length >= this.bufferSize) {
        this.flush();
      }
    }
  }

  private async flush() {
    if (this.logBuffer.length === 0) return;

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      // In production, send to logging service
      // This could be Datadog, LogRocket, Sentry, etc.
      if (!this.isDevelopment) {
        await this.sendToLoggingService(logsToSend);
      }
    } catch (error) {
      // If logging service fails, at least console log
      console.error('Failed to send logs:', error);
      logsToSend.forEach((entry) => console.log(this.formatLog(entry)));
    }
  }

  private async sendToLoggingService(logs: LogEntry[]) {
    // Implement integration with your logging service
    // Example: Send to an endpoint or use a logging SDK

    if (process.env.LOGGING_ENDPOINT) {
      const response = await fetch(process.env.LOGGING_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.LOGGING_API_KEY}`,
        },
        body: JSON.stringify({ logs }),
      });

      if (!response.ok) {
        throw new Error(`Logging service returned ${response.status}`);
      }
    }
  }

  debug(message: string, context?: LogContext) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message,
      context,
    });
  }

  info(message: string, context?: LogContext) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      context,
    });
  }

  warn(message: string, context?: LogContext) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      context,
    });
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    });
  }

  fatal(message: string, error?: Error, context?: LogContext) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.FATAL,
      message,
      context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    });

    // Flush immediately for fatal errors
    this.flush();
  }

  // Helper method to log API requests
  logApiRequest(request: NextRequest, response: { status: number }, duration: number) {
    const context: LogContext = {
      apiRoute: request.url,
      method: request.method,
      statusCode: response.status,
      duration,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
    };

    const level =
      response.status >= 500
        ? LogLevel.ERROR
        : response.status >= 400
        ? LogLevel.WARN
        : LogLevel.INFO;

    this.writeLog({
      timestamp: new Date().toISOString(),
      level,
      message: `API ${request.method} ${request.url} ${response.status} ${duration}ms`,
      context,
    });
  }

  // Performance monitoring
  startTimer(label: string): () => void {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      this.debug(`Performance: ${label} took ${duration.toFixed(2)}ms`, {
        metric: label,
        duration,
      });
    };
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Middleware for automatic API logging
export function withLogging<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  options?: { skipLogging?: boolean }
): T {
  return (async (...args: Parameters<T>) => {
    if (options?.skipLogging) {
      return handler(...args);
    }

    const [request] = args as [NextRequest];
    const startTime = Date.now();
    const endTimer = logger.startTimer(`API ${request.method} ${request.url}`);

    try {
      const response = await handler(...args);
      const duration = Date.now() - startTime;

      logger.logApiRequest(request, { status: response.status }, duration);
      endTimer();

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(`API Error: ${request.method} ${request.url}`, error as Error, {
        apiRoute: request.url,
        method: request.method,
        duration,
      });

      endTimer();
      throw error;
    }
  }) as T;
}

// Performance metrics collector
export class MetricsCollector {
  private static metrics = new Map<string, number[]>();

  static record(metric: string, value: number) {
    if (!this.metrics.has(metric)) {
      this.metrics.set(metric, []);
    }

    const values = this.metrics.get(metric)!;
    values.push(value);

    // Keep only last 1000 values
    if (values.length > 1000) {
      values.shift();
    }
  }

  static getStats(metric: string) {
    const values = this.metrics.get(metric) || [];
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      mean: sum / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p90: sorted[Math.floor(sorted.length * 0.9)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      min: sorted[0],
      max: sorted[sorted.length - 1],
    };
  }

  static getAllStats() {
    const stats: Record<string, any> = {};

    this.metrics.forEach((_, metric) => {
      stats[metric] = this.getStats(metric);
    });

    return stats;
  }
}
