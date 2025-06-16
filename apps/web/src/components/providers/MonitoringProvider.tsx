// apps/web/src/components/providers/MonitoringProvider.tsx
// Monitoring provider for error tracking and performance monitoring

'use client';

import React, { createContext, useContext, useCallback, ReactNode, useState } from 'react';

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

export interface PerformanceReport {
  vitals: {
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
  };
  summary: {
    totalMetrics: number;
    averageDuration: number;
    slowestOperation?: {
      name: string;
      duration: number;
    };
    fastestOperation?: {
      name: string;
      duration: number;
    };
  };
  metrics: PerformanceMetric[];
}

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

  const reportError = useCallback((error: ErrorDetails) => {
    console.error('[MonitoringProvider] Error:', error);
    setErrorHistory(prev => [...prev, error].slice(-100)); // Keep last 100 errors
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service (Sentry, LogRocket, etc.)
    }
  }, []);

  const captureError = useCallback((error: Error | string, metadata?: Record<string, any>) => {
    const errorDetails: ErrorDetails = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      component: metadata?.component,
      timestamp: new Date(),
      severity: 'medium',
      context: metadata,
      url: metadata?.url,
      componentStack: metadata?.componentStack
    };
    reportError(errorDetails);
  }, [reportError]);

  const captureMessage = useCallback((message: string, level: 'info' | 'warning' | 'error' = 'info', metadata?: Record<string, any>) => {
    const errorDetails: ErrorDetails = {
      message,
      timestamp: new Date(),
      severity: level === 'error' ? 'high' : level === 'warning' ? 'medium' : 'low',
      component: metadata?.component,
      context: metadata
    };
    reportError(errorDetails);
  }, [reportError]);

  const clearErrorHistory = useCallback(() => {
    setErrorHistory([]);
  }, []);

  const reportPerformance = useCallback((metric: PerformanceMetric) => {
    console.log('[MonitoringProvider] Performance:', metric);
    setPerformanceMetrics(prev => [...prev, metric].slice(-100)); // Keep last 100 metrics
    
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Send to analytics service
    }
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
  }, []);

  // Generate performance report
  const performanceReport: PerformanceReport = {
    vitals: {
      fcp: performanceMetrics.find(m => m.name === 'FCP')?.value,
      lcp: performanceMetrics.find(m => m.name === 'LCP')?.value,
      fid: performanceMetrics.find(m => m.name === 'FID')?.value,
      cls: performanceMetrics.find(m => m.name === 'CLS')?.value,
    },
    summary: {
      totalMetrics: performanceMetrics.length,
      averageDuration: performanceMetrics.length > 0 
        ? performanceMetrics.reduce((sum, m) => sum + (m.duration || m.value), 0) / performanceMetrics.length 
        : 0,
      slowestOperation: performanceMetrics.length > 0 
        ? (() => {
            const slowest = performanceMetrics.reduce((slowest, current) => 
              (current.duration || current.value) > (slowest.duration || slowest.value) ? current : slowest
            );
            return {
              name: slowest.name,
              duration: slowest.duration || slowest.value
            };
          })()
        : undefined,
      fastestOperation: performanceMetrics.length > 0 
        ? (() => {
            const fastest = performanceMetrics.reduce((fastest, current) => 
              (current.duration || current.value) < (fastest.duration || fastest.value) ? current : fastest
            );
            return {
              name: fastest.name,
              duration: fastest.duration || fastest.value
            };
          })()
        : undefined,
    },
    metrics: performanceMetrics
  };

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