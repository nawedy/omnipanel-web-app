/**
 * Performance monitoring utility for tracking and optimizing application performance
 */

// Types for performance monitoring
export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags?: Record<string, string>;
  data?: Record<string, unknown>;
}

export interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    totalMetrics: number;
    averageDuration: number;
    slowestOperation: {
      name: string;
      duration: number;
    } | null;
    fastestOperation: {
      name: string;
      duration: number;
    } | null;
  };
  vitals: {
    fcp?: number; // First Contentful Paint
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    ttfb?: number; // Time to First Byte
  };
}

// Class for performance monitoring
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric> = new Map();
  private completedMetrics: PerformanceMetric[] = [];
  private maxHistorySize = 100;
  private isInitialized = false;
  private webVitals: PerformanceReport['vitals'] = {};

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Initialize the performance monitor
   */
  public initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Observe web vitals if Performance API is available
    if ('performance' in window && 'PerformanceObserver' in window) {
      this.observeWebVitals();
    }

    this.isInitialized = true;
  }

  /**
   * Start timing an operation
   */
  public startMeasure(name: string, tags?: Record<string, string>, data?: Record<string, unknown>): string {
    const id = `${name}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.metrics.set(id, {
      name,
      startTime: performance.now(),
      tags,
      data,
    });
    return id;
  }

  /**
   * End timing an operation
   */
  public endMeasure(id: string, additionalData?: Record<string, unknown>): PerformanceMetric | null {
    const metric = this.metrics.get(id);
    if (!metric) return null;

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    
    if (additionalData) {
      metric.data = { ...metric.data, ...additionalData };
    }

    this.metrics.delete(id);
    this.completedMetrics.push(metric);

    // Keep history size limited
    if (this.completedMetrics.length > this.maxHistorySize) {
      this.completedMetrics = this.completedMetrics.slice(-this.maxHistorySize);
    }

    return metric;
  }

  /**
   * Measure a function execution time
   */
  /**
   * Measure a function execution time with improved error handling
   */
  public async measure<T>(
    name: string,
    fn: () => T | Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const id = this.startMeasure(name, tags);
    try {
      const result = await fn();
      this.endMeasure(id);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      this.endMeasure(id, { 
        error: true, 
        errorMessage, 
        errorName,
        errorStack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * Get performance report
   */
  public getReport(): PerformanceReport {
    const metrics = [...this.completedMetrics];
    
    // Calculate summary statistics
    let totalDuration = 0;
    let slowestOperation: { name: string; duration: number } | null = null;
    let fastestOperation: { name: string; duration: number } | null = null;

    metrics.forEach(metric => {
      if (metric.duration !== undefined) {
        totalDuration += metric.duration;
        
        if (!slowestOperation || metric.duration > slowestOperation.duration) {
          slowestOperation = { name: metric.name, duration: metric.duration };
        }
        
        if (!fastestOperation || metric.duration < fastestOperation.duration) {
          fastestOperation = { name: metric.name, duration: metric.duration };
        }
      }
    });

    return {
      metrics,
      summary: {
        totalMetrics: metrics.length,
        averageDuration: metrics.length > 0 ? totalDuration / metrics.length : 0,
        slowestOperation,
        fastestOperation,
      },
      vitals: this.webVitals,
    };
  }

  /**
   * Clear metrics history
   */
  public clearMetrics(): void {
    this.completedMetrics = [];
  }

  /**
   * Observe web vitals metrics
   */
  /**
   * Set up observers for Web Vitals metrics
   * Uses the Performance Observer API to track key metrics
   */
  private observeWebVitals(): void {
    try {
      // Observe First Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          this.webVitals.fcp = entries[0].startTime;
        }
      }).observe({ type: 'paint', buffered: true });

      // Observe Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          this.webVitals.lcp = lastEntry.startTime;
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // Observe First Input Delay
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          this.webVitals.fid = entries[0].processingStart - entries[0].startTime;
        }
      }).observe({ type: 'first-input', buffered: true });

      // Observe Layout Shifts
      let cumulativeLayoutShift = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // Only count layout shifts without recent user input
          if (!(entry as any).hadRecentInput) {
            cumulativeLayoutShift += (entry as any).value;
          }
        }
        this.webVitals.cls = cumulativeLayoutShift;
      }).observe({ type: 'layout-shift', buffered: true });

      // Observe Time to First Byte (using Navigation Timing API)
      if (performance.getEntriesByType) {
        const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navEntry) {
          this.webVitals.ttfb = navEntry.responseStart;
        }
      }
    } catch (error) {
      console.error('Error setting up performance observers:', error);
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.initialize();
}

// React hook for performance measurement
/**
 * React hook for performance measurement
 * Provides a convenient interface for React components to measure performance
 */
export function usePerformanceMeasure() {
  return {
    measure: <T>(name: string, fn: () => T | Promise<T>, tags?: Record<string, string>) => 
      performanceMonitor.measure(name, fn, tags),
    startMeasure: (name: string, tags?: Record<string, string>, data?: Record<string, unknown>) => 
      performanceMonitor.startMeasure(name, tags, data),
    endMeasure: (id: string, additionalData?: Record<string, unknown>) => 
      performanceMonitor.endMeasure(id, additionalData),
    getReport: () => performanceMonitor.getReport(),
  };
}
