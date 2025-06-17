// apps/web/src/components/errors/intercept-console-error.ts
// Global console error interceptor for OmniPanel

'use client';

import { createConsoleError, isConsoleErrorSuppressed } from './console-error';

interface ErrorInterceptorOptions {
  onError?: (error: any) => void;
  suppressCommonErrors?: boolean;
  logOriginalErrors?: boolean;
}

let isInterceptorActive = false;
let originalConsoleError: typeof console.error;
let originalWindowErrorHandler: typeof window.onerror;
let originalUnhandledRejectionHandler: typeof window.onunhandledrejection;
let isProcessingError = false; // Prevent recursive calls

// Safe JSON stringify with size limits
function safeStringify(obj: any, maxLength = 1000): string {
  if (isProcessingError) return '[Error during processing]';
  
  try {
    if (typeof obj === 'string') {
      return obj.length > maxLength ? obj.substring(0, maxLength) + '...' : obj;
    }
    
    if (obj === null || obj === undefined) {
      return String(obj);
    }
    
    if (typeof obj === 'object') {
      // Handle circular references and large objects
      const seen = new WeakSet();
      const result = JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      });
      
      return result.length > maxLength ? result.substring(0, maxLength) + '...' : result;
    }
    
    return String(obj);
  } catch (error) {
    return `[Stringify Error: ${error instanceof Error ? error.message : 'Unknown'}]`;
  }
}

export function setupConsoleErrorInterceptor(options: ErrorInterceptorOptions = {}) {
  if (isInterceptorActive || typeof window === 'undefined') {
    return;
  }

  const { onError, suppressCommonErrors = true, logOriginalErrors = false } = options;

  // Store original handlers
  originalConsoleError = console.error;
  originalWindowErrorHandler = window.onerror;
  originalUnhandledRejectionHandler = window.onunhandledrejection;

  // Intercept console.error with safety checks
  console.error = (...args: any[]) => {
    // Prevent infinite loops
    if (isProcessingError) {
      if (originalConsoleError) {
        originalConsoleError.apply(console, args);
      }
      return;
    }

    try {
      isProcessingError = true;
      
      const message = args.map(arg => safeStringify(arg, 500)).join(' ');

      if (!suppressCommonErrors || !isConsoleErrorSuppressed(message)) {
        if (onError) {
          // Use setTimeout to break the call stack and prevent recursion
          setTimeout(() => {
            try {
              onError({
                type: 'console.error',
                message,
                args: args.map(arg => safeStringify(arg, 200)), // Smaller limit for args
                timestamp: new Date()
              });
            } catch (err) {
              // Silently fail to prevent further recursion
              if (originalConsoleError) {
                originalConsoleError('Error in console interceptor:', err);
              }
            }
          }, 0);
        }
      }

      if (logOriginalErrors && originalConsoleError) {
        originalConsoleError.apply(console, args);
      }
    } catch (err) {
      // Fallback to original console.error
      if (originalConsoleError) {
        originalConsoleError.apply(console, args);
        originalConsoleError('Console interceptor error:', err);
      }
    } finally {
      isProcessingError = false;
    }
  };

  // Intercept window.onerror with safety checks
  window.onerror = (message, source, lineno, colno, error) => {
    if (isProcessingError) {
      if (originalWindowErrorHandler) {
        return originalWindowErrorHandler(message, source, lineno, colno, error);
      }
      return false;
    }

    try {
      isProcessingError = true;
      
      const errorMessage = typeof message === 'string' ? message : String(message);
      
      if (!suppressCommonErrors || !isConsoleErrorSuppressed(errorMessage)) {
        const consoleError = createConsoleError(errorMessage, source, lineno, colno, error);
        
        if (onError) {
          setTimeout(() => {
            try {
              onError({
                type: 'window.onerror',
                consoleError,
                timestamp: new Date()
              });
            } catch (err) {
              // Silently fail to prevent further recursion
            }
          }, 0);
        }
      }
    } catch (err) {
      // Silently handle errors
    } finally {
      isProcessingError = false;
    }

    // Call original handler if it exists
    if (originalWindowErrorHandler) {
      return originalWindowErrorHandler(message, source, lineno, colno, error);
    }

    return false;
  };

  // Intercept unhandled promise rejections with safety checks
  window.onunhandledrejection = (event) => {
    if (isProcessingError) {
      if (originalUnhandledRejectionHandler) {
        return originalUnhandledRejectionHandler.call(window, event);
      }
      return;
    }

    try {
      isProcessingError = true;
      
      const message = event.reason?.message || String(event.reason);
      
      if (!suppressCommonErrors || !isConsoleErrorSuppressed(message)) {
        if (onError) {
          setTimeout(() => {
            try {
              onError({
                type: 'unhandledrejection',
                reason: safeStringify(event.reason, 500),
                promise: '[Promise]', // Don't stringify promises
                timestamp: new Date()
              });
            } catch (err) {
              // Silently fail to prevent further recursion
            }
          }, 0);
        }
      }
    } catch (err) {
      // Silently handle errors
    } finally {
      isProcessingError = false;
    }

    // Call original handler if it exists
    if (originalUnhandledRejectionHandler) {
      return originalUnhandledRejectionHandler.call(window, event);
    }
  };

  isInterceptorActive = true;
}

export function teardownConsoleErrorInterceptor() {
  if (!isInterceptorActive || typeof window === 'undefined') {
    return;
  }

  // Restore original handlers
  if (originalConsoleError) {
    console.error = originalConsoleError;
  }

  if (originalWindowErrorHandler !== undefined) {
    window.onerror = originalWindowErrorHandler;
  }

  if (originalUnhandledRejectionHandler !== undefined) {
    window.onunhandledrejection = originalUnhandledRejectionHandler;
  }

  isInterceptorActive = false;
  isProcessingError = false;
}

export function isConsoleErrorInterceptorActive(): boolean {
  return isInterceptorActive;
} 