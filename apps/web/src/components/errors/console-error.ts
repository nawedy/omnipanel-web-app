// apps/web/src/components/errors/console-error.ts
// Console error handling utilities for OmniPanel

export interface ConsoleErrorDetails {
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
  timestamp: Date;
  userAgent: string;
  url: string;
}

export function createConsoleError(
  message: string,
  source?: string,
  lineno?: number,
  colno?: number,
  error?: Error
): ConsoleErrorDetails {
  return {
    message,
    source,
    lineno,
    colno,
    error,
    timestamp: new Date(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
  };
}

export function formatConsoleError(errorDetails: ConsoleErrorDetails): string {
  const { message, source, lineno, colno, timestamp } = errorDetails;
  
  let formatted = `[${timestamp.toISOString()}] ${message}`;
  
  if (source) {
    formatted += `\n  at ${source}`;
    if (lineno !== undefined) {
      formatted += `:${lineno}`;
      if (colno !== undefined) {
        formatted += `:${colno}`;
      }
    }
  }
  
  return formatted;
}

export function isConsoleErrorSuppressed(message: string): boolean {
  // Suppress common non-critical errors
  const suppressedPatterns = [
    /ResizeObserver loop limit exceeded/,
    /Non-passive event listener/,
    /Failed to load resource.*favicon/,
    /Hydration failed because the initial UI does not match/,
    /Text content does not match server-rendered HTML/
  ];
  
  return suppressedPatterns.some(pattern => pattern.test(message));
} 