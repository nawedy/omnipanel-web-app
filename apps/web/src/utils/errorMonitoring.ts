/**
 * Global error monitoring and reporting utility
 * Centralizes error handling and provides hooks for error reporting services
 */

// Types for error handling
export interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  context?: Record<string, unknown>;
  timestamp: number;
  url: string;
  userAgent?: string;
  type?: string;
  severity?: 'info' | 'warning' | 'error' | 'fatal';
}

export interface ErrorReporter {
  captureError: (error: Error, context?: Record<string, unknown>) => void;
  captureMessage: (message: string, level?: 'info' | 'warning' | 'error', context?: Record<string, unknown>) => void;
}

// Default error reporter that logs to console
const defaultReporter: ErrorReporter = {
  captureError: (error: Error, context?: Record<string, unknown>) => {
    console.error('[ErrorMonitor] Error:', error, context);
  },
  captureMessage: (message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, unknown>) => {
    switch (level) {
      case 'info':
        console.info('[ErrorMonitor] Info:', message, context);
        break;
      case 'warning':
        console.warn('[ErrorMonitor] Warning:', message, context);
        break;
      case 'error':
        console.error('[ErrorMonitor] Error:', message, context);
        break;
    }
  },
};

// Class for error monitoring
class ErrorMonitor {
  private static instance: ErrorMonitor;
  private reporter: ErrorReporter = defaultReporter;
  private errorHistory: ErrorDetails[] = [];
  private maxHistorySize = 50;
  private isInitialized = false;

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor();
    }
    return ErrorMonitor.instance;
  }

  /**
   * Initialize the error monitor with global handlers
   */
  public initialize(): void {
    if (this.isInitialized) return;
    
    if (typeof window !== 'undefined') {
      // Set up global error handler
      window.addEventListener('error', (event) => {
        try {
          this.handleGlobalError(event.error || new Error(event.message), {
            lineNumber: event.lineno,
            columnNumber: event.colno,
            filename: event.filename,
          });
        } catch (handlerError) {
          console.error('[ErrorMonitor] Error in error handler:', handlerError);
        }
        
        // Don't prevent default to allow browser's default error handling
        return false;
      });

      // Set up unhandled promise rejection handler
      window.addEventListener('unhandledrejection', (event) => {
        try {
          const error = event.reason instanceof Error 
            ? event.reason 
            : new Error(String(event.reason));
          
          this.handleGlobalError(error, { type: 'unhandledrejection' });
        } catch (handlerError) {
          console.error('[ErrorMonitor] Error in promise rejection handler:', handlerError);
        }
        
        // Don't prevent default to allow browser's default error handling
        return false;
      });
    }

    this.isInitialized = true;
  }

  /**
   * Set a custom error reporter
   */
  public setReporter(reporter: ErrorReporter): void {
    this.reporter = reporter;
  }

  /**
   * Handle an error with context
   */
  public captureError(error: Error, context?: Record<string, unknown>): void {
    const errorDetails = this.createErrorDetails(error, context);
    this.addToHistory(errorDetails);
    this.reporter.captureError(error, context);
  }

  /**
   * Capture a message with a specific level
   */
  public captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, unknown>): void {
    this.reporter.captureMessage(message, level, context);
    
    if (level === 'error') {
      const errorDetails = this.createErrorDetails(new Error(message), context);
      this.addToHistory(errorDetails);
    }
  }

  /**
   * Get error history
   */
  public getErrorHistory(): ErrorDetails[] {
    return [...this.errorHistory];
  }

  /**
   * Clear error history
   */
  public clearErrorHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Handle a global error
   */
  private handleGlobalError(error: Error, context?: Record<string, unknown>): void {
    const errorDetails = this.createErrorDetails(error, context);
    this.addToHistory(errorDetails);
    this.reporter.captureError(error, context);
  }

  /**
   * Create error details object
   */
  private createErrorDetails(error: Error, context?: Record<string, unknown>): ErrorDetails {
    return {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      type: error.name || 'Error',
      severity: 'error',
    };
  }

  /**
   * Add error to history with size limit
   */
  private addToHistory(errorDetails: ErrorDetails): void {
    this.errorHistory.push(errorDetails);
    
    // Keep history size limited
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
    }
  }
}

// Export singleton instance
export const errorMonitor = ErrorMonitor.getInstance();

// React error handler for use with ErrorBoundary
export function handleReactError(error: Error, errorInfo: React.ErrorInfo): void {
  errorMonitor.captureError(error, {
    componentStack: errorInfo.componentStack,
    source: 'react',
  });
}

// Initialize error monitoring
if (typeof window !== 'undefined') {
  errorMonitor.initialize();
}
