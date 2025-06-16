'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { errorMonitor, ErrorReporter, type ErrorDetails } from '@/utils/errorMonitoring';
import { performanceMonitor } from '@/utils/performanceMonitoring';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

// Context type definition
interface MonitoringContextType {
  // Error monitoring
  captureError: (error: Error, context?: Record<string, unknown>) => void;
  captureMessage: (message: string, level?: 'info' | 'warning' | 'error', context?: Record<string, unknown>) => void;
  errorHistory: ErrorDetails[];
  clearErrorHistory: () => void;
  
  // Performance monitoring
  startMeasure: (name: string, tags?: Record<string, string>, data?: Record<string, unknown>) => string;
  endMeasure: (id: string, additionalData?: Record<string, unknown>) => {
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    tags?: Record<string, string>;
    data?: Record<string, unknown>;
  } | null;
  measure: <T>(name: string, fn: () => T | Promise<T>, tags?: Record<string, string>) => Promise<T>;
  performanceReport: {
    metrics: Array<{
      name: string;
      startTime: number;
      endTime?: number;
      duration?: number;
      tags?: Record<string, string>;
      data?: Record<string, unknown>;
    }>;
    summary: {
      totalMetrics: number;
      averageDuration: number;
      slowestOperation: { name: string; duration: number } | null;
      fastestOperation: { name: string; duration: number } | null;
    };
    vitals: {
      fcp?: number;
      lcp?: number;
      fid?: number;
      cls?: number;
      ttfb?: number;
    };
  };
  clearPerformanceMetrics: () => void;
}

// Create context
const MonitoringContext = createContext<MonitoringContextType>({
  // Error monitoring defaults
  captureError: () => {},
  captureMessage: () => {},
  errorHistory: [],
  clearErrorHistory: () => {},
  
  // Performance monitoring defaults
  startMeasure: () => '',
  endMeasure: () => null,
  measure: async () => null as any,
  performanceReport: { 
    metrics: [], 
    summary: {
      totalMetrics: 0,
      averageDuration: 0,
      slowestOperation: null,
      fastestOperation: null
    }, 
    vitals: {} 
  },
  clearPerformanceMetrics: () => {},
});

// Custom hook to use the monitoring context
export const useMonitoring = () => useContext(MonitoringContext);

interface MonitoringProviderProps {
  children: React.ReactNode;
  customErrorReporter?: ErrorReporter;
}

export function MonitoringProvider({ 
  children,
  customErrorReporter
}: MonitoringProviderProps) {
  const [errorHistory, setErrorHistory] = useState<ErrorDetails[]>([]);
  const [performanceReport, setPerformanceReport] = useState<MonitoringContextType['performanceReport']>({
    metrics: [],
    summary: {
      totalMetrics: 0,
      averageDuration: 0,
      slowestOperation: null,
      fastestOperation: null
    },
    vitals: {}
  });
  
  // Initialize monitoring systems
  useEffect(() => {
    // Initialize error monitoring
    errorMonitor.initialize();
    if (customErrorReporter) {
      errorMonitor.setReporter(customErrorReporter);
    }
    
    // Initialize performance monitoring
    performanceMonitor.initialize();
    
    // Update error history initially
    setErrorHistory(errorMonitor.getErrorHistory());
    
    // Update performance report initially
    setPerformanceReport(performanceMonitor.getReport());
    
    // Set up periodic updates for performance report
    const intervalId = setInterval(() => {
      setPerformanceReport(performanceMonitor.getReport());
    }, 30000); // Update every 30 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [customErrorReporter]);
  
  // Error monitoring functions
  const captureError = (error: Error, context?: Record<string, unknown>) => {
    errorMonitor.captureError(error, context);
    setErrorHistory(errorMonitor.getErrorHistory());
  };
  
  const captureMessage = (message: string, level?: 'info' | 'warning' | 'error', context?: Record<string, unknown>) => {
    errorMonitor.captureMessage(message, level, context);
    if (level === 'error') {
      setErrorHistory(errorMonitor.getErrorHistory());
    }
  };
  
  const clearErrorHistory = () => {
    errorMonitor.clearErrorHistory();
    setErrorHistory([]);
  };
  
  // Performance monitoring functions
  const startMeasure = (name: string, tags?: Record<string, string>, data?: Record<string, unknown>) => {
    return performanceMonitor.startMeasure(name, tags, data);
  };
  
  const endMeasure = (id: string, additionalData?: Record<string, unknown>) => {
    const result = performanceMonitor.endMeasure(id, additionalData);
    setPerformanceReport(performanceMonitor.getReport());
    return result;
  };
  
  const measure = async <T,>(name: string, fn: () => T | Promise<T>, tags?: Record<string, string>): Promise<T> => {
    const result = await performanceMonitor.measure(name, fn, tags);
    setPerformanceReport(performanceMonitor.getReport());
    return result;
  };
  
  const clearPerformanceMetrics = () => {
    performanceMonitor.clearMetrics();
    setPerformanceReport(performanceMonitor.getReport());
  };
  
  // Combine all monitoring functions into context value
  const contextValue: MonitoringContextType = {
    // Error monitoring
    captureError,
    captureMessage,
    errorHistory,
    clearErrorHistory,
    
    // Performance monitoring
    startMeasure,
    endMeasure,
    measure,
    performanceReport,
    clearPerformanceMetrics,
  };
  
  // Handle React errors
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    captureError(error, { 
      componentStack: errorInfo.componentStack,
      source: 'react',
      type: 'react-error-boundary'
    });
  };
  
  return (
    <MonitoringContext.Provider value={contextValue}>
      <ErrorBoundary onError={handleError}>
        {children}
      </ErrorBoundary>
    </MonitoringContext.Provider>
  );
}
