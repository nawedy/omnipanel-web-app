// apps/web/src/components/errors/use-error-handler.ts
// Custom error handler hook for React components

'use client';

import { useCallback } from 'react';
import { useMonitoring } from '@/components/providers/MonitoringProvider';
import { createConsoleError, isConsoleErrorSuppressed, type ConsoleErrorDetails } from './console-error';

export interface ErrorHandlerOptions {
  component?: string;
  suppressCommonErrors?: boolean;
  logToConsole?: boolean;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const { captureError, captureMessage } = useMonitoring();
  const { component, suppressCommonErrors = true, logToConsole = true } = options;

  const handleError = useCallback((error: Error | string, metadata?: Record<string, any>) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    if (suppressCommonErrors && isConsoleErrorSuppressed(errorMessage)) {
      return;
    }

    if (logToConsole) {
      console.error('[ErrorHandler]', error, metadata);
    }

    captureError(error, {
      component,
      ...metadata
    });
  }, [captureError, component, suppressCommonErrors, logToConsole]);

  const handleConsoleError = useCallback((
    message: string,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error
  ) => {
    const consoleError = createConsoleError(message, source, lineno, colno, error);
    
    if (suppressCommonErrors && isConsoleErrorSuppressed(message)) {
      return;
    }

    if (logToConsole) {
      console.error('[ConsoleErrorHandler]', consoleError);
    }

    captureError(error || new Error(message), {
      component: component || 'ConsoleErrorHandler',
      source,
      lineno,
      colno,
      consoleError: true
    });
  }, [captureError, component, suppressCommonErrors, logToConsole]);

  const handleWarning = useCallback((message: string, metadata?: Record<string, any>) => {
    if (logToConsole) {
      console.warn('[WarningHandler]', message, metadata);
    }

    captureMessage(message, 'warning', {
      component,
      ...metadata
    });
  }, [captureMessage, component, logToConsole]);

  const handleInfo = useCallback((message: string, metadata?: Record<string, any>) => {
    if (logToConsole) {
      console.info('[InfoHandler]', message, metadata);
    }

    captureMessage(message, 'info', {
      component,
      ...metadata
    });
  }, [captureMessage, component, logToConsole]);

  return {
    handleError,
    handleConsoleError,
    handleWarning,
    handleInfo
  };
} 