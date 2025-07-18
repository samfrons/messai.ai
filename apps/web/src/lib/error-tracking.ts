import { logger } from './logger';

export interface ErrorReport {
  timestamp: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: {
    url?: string;
    userAgent?: string;
    userId?: string;
    sessionId?: string;
    environment: string;
    release?: string;
  };
  breadcrumbs: Breadcrumb[];
}

export interface Breadcrumb {
  timestamp: string;
  type: 'navigation' | 'action' | 'console' | 'error' | 'http';
  category: string;
  message: string;
  data?: Record<string, any>;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 50;
  private errorQueue: ErrorReport[] = [];
  private flushInterval = 10000; // 10 seconds
  private isInitialized = false;

  private constructor() {
    this.initialize();
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  private initialize() {
    if (this.isInitialized) return;

    // Set up global error handlers
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleWindowError);
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    } else {
      process.on('uncaughtException', this.handleUncaughtException);
      process.on('unhandledRejection', this.handleUnhandledRejection);
    }

    // Periodic flush of error queue
    setInterval(() => this.flush(), this.flushInterval);

    this.isInitialized = true;
  }

  private handleWindowError = (event: ErrorEvent) => {
    this.captureError(event.error || new Error(event.message), {
      type: 'window-error',
      url: event.filename,
      line: event.lineno,
      column: event.colno,
    });
  };

  private handleUncaughtException = (error: Error) => {
    logger.fatal('Uncaught exception', error);
    this.captureError(error, { type: 'uncaught-exception' });

    // In production, you might want to gracefully shut down
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  };

  private handleUnhandledRejection = (reason: any) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error('Unhandled promise rejection', error);
    this.captureError(error, { type: 'unhandled-rejection' });
  };

  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>) {
    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: new Date().toISOString(),
    });

    // Keep only the most recent breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  captureError(error: Error, additionalContext?: Record<string, any>) {
    const errorReport: ErrorReport = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context: {
        environment: process.env.NODE_ENV || 'development',
        release: process.env.VERCEL_GIT_COMMIT_SHA,
        ...additionalContext,
      },
      breadcrumbs: [...this.breadcrumbs],
    };

    // Log locally
    logger.error('Error captured', error, errorReport.context);

    // Add to queue for batch sending
    this.errorQueue.push(errorReport);

    // In development, log immediately
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Report:', errorReport);
    }

    // Flush if queue is getting large
    if (this.errorQueue.length >= 10) {
      this.flush();
    }
  }

  captureException(error: unknown, context?: Record<string, any>) {
    if (error instanceof Error) {
      this.captureError(error, context);
    } else {
      this.captureError(new Error(String(error)), context);
    }
  }

  private async flush() {
    if (this.errorQueue.length === 0) return;

    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // In production, send to error tracking service (e.g., Sentry)
      if (process.env.NODE_ENV === 'production' && process.env.ERROR_REPORTING_ENDPOINT) {
        await this.sendToErrorService(errorsToSend);
      }
    } catch (error) {
      logger.error('Failed to send error reports', error as Error);
      // Re-queue errors if sending failed
      this.errorQueue.unshift(...errorsToSend);
    }
  }

  private async sendToErrorService(errors: ErrorReport[]) {
    const response = await fetch(process.env.ERROR_REPORTING_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ERROR_REPORTING_API_KEY}`,
      },
      body: JSON.stringify({ errors }),
    });

    if (!response.ok) {
      throw new Error(`Error service returned ${response.status}`);
    }
  }

  // Utility method to wrap async functions with error tracking
  withErrorTracking<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: Record<string, any>
  ): T {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.captureException(error, context);
        throw error;
      }
    }) as T;
  }
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance();

// React Error Boundary integration
export function logErrorToService(error: Error, errorInfo: any) {
  errorTracker.captureError(error, {
    componentStack: errorInfo.componentStack,
    type: 'react-error-boundary',
  });
}

// Performance monitoring integration
export function trackPerformance(metric: string, value: number, tags?: Record<string, string>) {
  errorTracker.addBreadcrumb({
    type: 'action',
    category: 'performance',
    message: `${metric}: ${value}ms`,
    data: tags,
  });
}

// User action tracking
export function trackUserAction(action: string, data?: Record<string, any>) {
  errorTracker.addBreadcrumb({
    type: 'action',
    category: 'user',
    message: action,
    data,
  });
}

// API request tracking
export function trackApiRequest(method: string, url: string, status: number, duration: number) {
  errorTracker.addBreadcrumb({
    type: 'http',
    category: 'api',
    message: `${method} ${url}`,
    data: {
      status,
      duration,
    },
  });
}
