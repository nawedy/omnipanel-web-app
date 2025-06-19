// apps/web/src/components/providers/MonitoringProvider.tsx
// Monitoring provider for error tracking and performance monitoring

'use client';

import React, { createContext, useContext, useCallback, ReactNode, useState, useEffect } from 'react';
import { setupConsoleErrorInterceptor, teardownConsoleErrorInterceptor } from '@/components/errors/intercept-console-error';
import { performanceMonitoringService, PerformanceReport } from '@/services/performanceMonitoring';

export interface ErrorDetails {
  message: string;
  stack?: string;
  component?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
  url?: string;
  componentStack?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  duration?: number;
  metadata?: Record<string, any>;
}

// PerformanceReport interface moved to performanceMonitoring service

interface MonitoringContextType {
  // Error reporting
  reportError: (error: ErrorDetails) => void;
  captureError: (error: Error | string, metadata?: Record<string, any>) => void;
  captureMessage: (message: string, level?: 'info' | 'warning' | 'error', metadata?: Record<string, any>) => void;
  errorHistory: ErrorDetails[];
  clearErrorHistory: () => void;
  
  // Performance monitoring
  reportPerformance: (metric: PerformanceMetric) => void;
  startTimer: (name: string) => () => void;
  measure: (name: string, fn: () => void) => void;
  startMeasure: (name: string, metadata?: Record<string, any>) => string;
  endMeasure: (measureId: string, metadata?: Record<string, any>) => void;
  performanceReport: PerformanceReport;
  clearPerformanceMetrics: () => void;
}

const MonitoringContext = createContext<MonitoringContextType | null>(null);

interface MonitoringProviderProps {
  children: ReactNode;
}

export function MonitoringProvider({ children }: MonitoringProviderProps) {
  const [errorHistory, setErrorHistory] = useState<ErrorDetails[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [activeMeasures, setActiveMeasures] = useState<Map<string, { startTime: number; metadata?: Record<string, any> }>>(new Map());
  
  // Rate limiting and recursion prevention
  const [isReporting, setIsReporting] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [lastErrorTime, setLastErrorTime] = useState(0);
  const MAX_ERRORS_PER_SECOND = 5;
  const ERROR_COOLDOWN = 1000; // 1 second

  const reportError = useCallback((error: ErrorDetails) => {
    // Prevent recursive error reporting
    if (isReporting) return;
    
    // Rate limiting
    const now = Date.now();
    if (now - lastErrorTime < ERROR_COOLDOWN) {
      setErrorCount(prev => prev + 1);
      if (errorCount >= MAX_ERRORS_PER_SECOND) {
        return; // Skip this error to prevent spam
      }
    } else {
      setErrorCount(1);
      setLastErrorTime(now);
    }

    // Use setTimeout to avoid state updates during render
    setTimeout(() => {
      try {
        setIsReporting(true);
        
        // Safely log error without triggering interceptor
        if (typeof window !== 'undefined' && window.console && window.console.warn) {
          window.console.warn('[MonitoringProvider] Error:', {
            message: error.message,
            component: error.component,
            severity: error.severity,
            timestamp: error.timestamp
          });
        }
        
        setErrorHistory(prev => [...prev, error].slice(-100)); // Keep last 100 errors
        
        // In production, send to error tracking service
        if (process.env.NODE_ENV === 'production') {
          // Send to error tracking service (Sentry, LogRocket, etc.)
        }
      } catch (err) {
        // Silently fail to prevent infinite loops
      } finally {
        setIsReporting(false);
      }
    }, 0);
  }, [isReporting, errorCount, lastErrorTime]);

  const captureError = useCallback((error: Error | string, metadata?: Record<string, any>) => {
    if (isReporting) return;
    
    try {
      const errorDetails: ErrorDetails = {
        message: typeof error === 'string' ? error : (error.message || 'Unknown error'),
        stack: typeof error === 'object' ? error.stack : undefined,
        component: metadata?.component,
        timestamp: new Date(),
        severity: 'medium',
        context: metadata ? { ...metadata, contextSize: Object.keys(metadata).length } : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        componentStack: metadata?.componentStack
      };
      reportError(errorDetails);
    } catch (err) {
      // Silently fail
    }
  }, [reportError, isReporting]);

  const captureMessage = useCallback((message: string, level: 'info' | 'warning' | 'error' = 'info', metadata?: Record<string, any>) => {
    if (isReporting) return;
    
    try {
      // Filter out monitoring-related messages to prevent loops
      if (message.includes('MonitoringProvider') || message.includes('console interceptor')) {
        return;
      }
      
      const errorDetails: ErrorDetails = {
        message: typeof message === 'string' ? message : String(message),
        timestamp: new Date(),
        severity: level === 'error' ? 'high' : level === 'warning' ? 'medium' : 'low',
        component: metadata?.component,
        context: metadata ? { ...metadata, contextSize: Object.keys(metadata).length } : undefined
      };
      reportError(errorDetails);
    } catch (err) {
      // Silently fail
    }
  }, [reportError, isReporting]);

  const clearErrorHistory = useCallback(() => {
    setErrorHistory([]);
  }, []);

  const reportPerformance = useCallback((metric: PerformanceMetric) => {
    // Use the real performance monitoring service
    performanceMonitoringService.addMetric({
      name: metric.name,
      value: metric.value,
      duration: metric.duration,
      category: 'custom',
      metadata: metric.metadata
    });
    
    // Also keep local copy for backwards compatibility
    setPerformanceMetrics(prev => [...prev, metric].slice(-100));
  }, []);

  const startTimer = useCallback((name: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      reportPerformance({
        name,
        value: duration,
        timestamp: new Date(),
        duration,
        metadata: { unit: 'ms' }
      });
    };
  }, [reportPerformance]);

  const measure = useCallback((name: string, fn: () => void) => {
    const startTime = performance.now();
    fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    reportPerformance({
      name,
      value: duration,
      timestamp: new Date(),
      duration,
      metadata: { unit: 'ms' }
    });
  }, [reportPerformance]);

  const startMeasure = useCallback((name: string, metadata?: Record<string, any>): string => {
    const measureId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setActiveMeasures(prev => new Map(prev).set(measureId, { 
      startTime: performance.now(), 
      metadata 
    }));
    return measureId;
  }, []);

  const endMeasure = useCallback((measureId: string, metadata?: Record<string, any>) => {
    setActiveMeasures(prev => {
      const newMap = new Map(prev);
      const measure = newMap.get(measureId);
      if (measure) {
        const duration = performance.now() - measure.startTime;
        reportPerformance({
          name: measureId.split('_')[0],
          value: duration,
          timestamp: new Date(),
          duration,
          metadata: { ...measure.metadata, ...metadata, unit: 'ms' }
        });
        newMap.delete(measureId);
      }
      return newMap;
    });
  }, [reportPerformance]);

  const clearPerformanceMetrics = useCallback(() => {
    setPerformanceMetrics([]);
    performanceMonitoringService.clearMetrics();
  }, []);

  // Generate performance report using real monitoring service
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport>(() => 
    performanceMonitoringService.getReport()
  );

  // Update performance report periodically
  useEffect(() => {
    const updateReport = () => {
      setPerformanceReport(performanceMonitoringService.getReport());
    };

    // Update immediately
    updateReport();

    // Update every 5 seconds
    const interval = setInterval(updateReport, 5000);

    return () => clearInterval(interval);
  }, []);

  // Set up error interceptor on mount - temporarily disabled to prevent loops
  useEffect(() => {
    // TODO: Re-enable after fixing the error loop issue
    // setupConsoleErrorInterceptor({
    //   onError: (interceptedError) => {
    //     if (interceptedError.type === 'console.error') {
    //       captureMessage(interceptedError.message, 'error', {
    //         component: 'ConsoleErrorInterceptor',
    //         interceptedAt: interceptedError.timestamp,
    //         args: interceptedError.args
    //       });
    //     } else if (interceptedError.type === 'window.onerror') {
    //       captureError(new Error(interceptedError.consoleError.message), {
    //         component: 'WindowErrorInterceptor',
    //         consoleError: interceptedError.consoleError,
    //         interceptedAt: interceptedError.timestamp
    //       });
    //     } else if (interceptedError.type === 'unhandledrejection') {
    //       captureError(interceptedError.reason, {
    //         component: 'UnhandledRejectionInterceptor',
    //         promise: interceptedError.promise,
    //         interceptedAt: interceptedError.timestamp
    //       });
    //     }
    //   },
    //   suppressCommonErrors: true,
    //   logOriginalErrors: process.env.NODE_ENV === 'development'
    // });

    return () => {
      teardownConsoleErrorInterceptor();
    };
  }, [captureError, captureMessage]);

  const value: MonitoringContextType = {
    reportError,
    captureError,
    captureMessage,
    errorHistory,
    clearErrorHistory,
    reportPerformance,
    startTimer,
    measure,
    startMeasure,
    endMeasure,
    performanceReport,
    clearPerformanceMetrics
  };

  return (
    <MonitoringContext.Provider value={value}>
      {children}
    </MonitoringContext.Provider>
  );
}

export function useMonitoring(): MonitoringContextType {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
} 