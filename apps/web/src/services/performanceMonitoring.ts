// apps/web/src/services/performanceMonitoring.ts
// Real-time performance monitoring service for tracking application metrics

'use client';

export interface WebVitals {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  inp?: number; // Interaction to Next Paint
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  timestamp: Date;
  duration?: number;
  metadata?: Record<string, any>;
  category: 'navigation' | 'user-interaction' | 'api-call' | 'render' | 'error' | 'custom';
}

export interface ErrorMetric {
  id: string;
  message: string;
  stack?: string;
  timestamp: Date;
  url: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  vitals: WebVitals;
  summary: {
    totalMetrics: number;
    averageDuration: number;
    slowestOperation?: {
      name: string;
      duration: number;
      timestamp: Date;
    };
    fastestOperation?: {
      name: string;
      duration: number;
      timestamp: Date;
    };
    errorRate: number;
    totalErrors: number;
  };
  metrics: PerformanceMetric[];
  errors: ErrorMetric[];
  trends: {
    performanceScore: number;
    improvementSuggestions: string[];
  };
}

class PerformanceMonitoringService {
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorMetric[] = [];
  private vitals: WebVitals = {};
  private observers: Map<string, PerformanceObserver> = new Map();
  private activeMeasures: Map<string, { startTime: number; metadata?: Record<string, any> }> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebVitals();
      this.initializePerformanceObservers();
      this.initializeErrorTracking();
    }
  }

  private initializeWebVitals() {
    // Track Core Web Vitals using the web-vitals library pattern
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      this.observePerformanceEntry('paint', (entries) => {
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.vitals.fcp = fcpEntry.startTime;
        }
      });

      // Largest Contentful Paint
      this.observePerformanceEntry('largest-contentful-paint', (entries) => {
        const lcpEntry = entries[entries.length - 1];
        if (lcpEntry) {
          this.vitals.lcp = lcpEntry.startTime;
        }
      });

      // First Input Delay
      this.observePerformanceEntry('first-input', (entries) => {
        const fidEntry = entries[0];
        if (fidEntry) {
          this.vitals.fid = fidEntry.processingStart - fidEntry.startTime;
        }
      });

      // Cumulative Layout Shift
      let clsValue = 0;
      this.observePerformanceEntry('layout-shift', (entries) => {
        for (const entry of entries) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.vitals.cls = clsValue;
      });

      // Navigation timing
      this.observePerformanceEntry('navigation', (entries) => {
        const navEntry = entries[0] as PerformanceNavigationTiming;
        if (navEntry) {
          this.vitals.ttfb = navEntry.responseStart - navEntry.requestStart;
        }
      });
    }
  }

  private observePerformanceEntry(type: string, callback: (entries: PerformanceEntry[]) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.set(type, observer);
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }

  private initializePerformanceObservers() {
    // Track resource loading times
    this.observePerformanceEntry('resource', (entries) => {
      entries.forEach((entry) => {
        const resourceEntry = entry as PerformanceResourceTiming;
        this.addMetric({
          name: `Resource Load: ${entry.name}`,
          value: resourceEntry.duration,
          category: 'navigation',
          metadata: {
            resourceType: resourceEntry.initiatorType,
            transferSize: resourceEntry.transferSize,
            encodedBodySize: resourceEntry.encodedBodySize,
          }
        });
      });
    });

    // Track long tasks (blocking the main thread)
    this.observePerformanceEntry('longtask', (entries) => {
      entries.forEach((entry) => {
        this.addMetric({
          name: 'Long Task',
          value: entry.duration,
          category: 'render',
          metadata: {
            startTime: entry.startTime,
            attribution: (entry as any).attribution,
          }
        });
      });
    });

    // Track measure entries
    this.observePerformanceEntry('measure', (entries) => {
      entries.forEach((entry) => {
        this.addMetric({
          name: entry.name,
          value: entry.duration,
          category: 'custom',
          metadata: {
            startTime: entry.startTime,
          }
        });
      });
    });
  }

  private initializeErrorTracking() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.addError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        severity: 'high',
        metadata: {
          lineno: event.lineno,
          colno: event.colno,
          type: 'javascript-error'
        }
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.addError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        severity: 'medium',
        metadata: {
          type: 'promise-rejection',
          reason: event.reason
        }
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.addError({
          message: `Resource failed to load: ${(event.target as any)?.src || (event.target as any)?.href}`,
          url: window.location.href,
          severity: 'medium',
          metadata: {
            type: 'resource-error',
            element: event.target?.tagName,
            source: (event.target as any)?.src || (event.target as any)?.href
          }
        });
      }
    }, true);
  }

  public addMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    const newMetric: PerformanceMetric = {
      ...metric,
      id: this.generateId(),
      timestamp: new Date(),
    };

    this.metrics.push(newMetric);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  public addError(error: Omit<ErrorMetric, 'id' | 'timestamp' | 'userAgent'>): void {
    const newError: ErrorMetric = {
      ...error,
      id: this.generateId(),
      timestamp: new Date(),
      userAgent: navigator.userAgent,
    };

    this.errors.push(newError);
    
    // Keep only last 500 errors
    if (this.errors.length > 500) {
      this.errors = this.errors.slice(-500);
    }
  }

  public startMeasure(name: string, metadata?: Record<string, any>): string {
    const measureId = this.generateId();
    const startTime = performance.now();
    
    this.activeMeasures.set(measureId, { startTime, metadata });
    performance.mark(`${name}-start-${measureId}`);
    
    return measureId;
  }

  public endMeasure(measureId: string, name?: string): void {
    const measure = this.activeMeasures.get(measureId);
    if (!measure) return;

    const endTime = performance.now();
    const duration = endTime - measure.startTime;
    const measureName = name || `measure-${measureId}`;

    performance.mark(`${measureName}-end-${measureId}`);
    performance.measure(measureName, `${measureName}-start-${measureId}`, `${measureName}-end-${measureId}`);

    this.addMetric({
      name: measureName,
      value: duration,
      duration,
      category: 'custom',
      metadata: measure.metadata
    });

    this.activeMeasures.delete(measureId);
  }

  public measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const measureId = this.startMeasure(name, metadata);
      
      try {
        const result = await fn();
        this.endMeasure(measureId, name);
        resolve(result);
      } catch (error) {
        this.endMeasure(measureId, name);
        this.addError({
          message: `Error in ${name}: ${error instanceof Error ? error.message : String(error)}`,
          stack: error instanceof Error ? error.stack : undefined,
          url: window.location.href,
          severity: 'medium',
          component: name,
          metadata: { ...metadata, type: 'async-operation-error' }
        });
        reject(error);
      }
    });
  }

  public getReport(): PerformanceReport {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp.getTime() < 24 * 60 * 60 * 1000); // Last 24 hours
    const recentErrors = this.errors.filter(e => now - e.timestamp.getTime() < 24 * 60 * 60 * 1000);

    const durations = recentMetrics
      .filter(m => m.duration !== undefined)
      .map(m => ({ name: m.name, duration: m.duration!, timestamp: m.timestamp }));

    const slowestOperation = durations.length > 0 
      ? durations.reduce((prev, current) => prev.duration > current.duration ? prev : current)
      : undefined;

    const fastestOperation = durations.length > 0
      ? durations.reduce((prev, current) => prev.duration < current.duration ? prev : current)
      : undefined;

    const averageDuration = durations.length > 0
      ? durations.reduce((sum, d) => sum + d.duration, 0) / durations.length
      : 0;

    const errorRate = recentMetrics.length > 0 ? (recentErrors.length / recentMetrics.length) * 100 : 0;

    return {
      vitals: this.vitals,
      summary: {
        totalMetrics: recentMetrics.length,
        averageDuration,
        slowestOperation,
        fastestOperation,
        errorRate,
        totalErrors: recentErrors.length,
      },
      metrics: recentMetrics,
      errors: recentErrors,
      trends: {
        performanceScore: this.calculatePerformanceScore(),
        improvementSuggestions: this.generateImprovementSuggestions(),
      }
    };
  }

  private calculatePerformanceScore(): number {
    let score = 100;
    
    // Deduct points for poor Core Web Vitals
    if (this.vitals.fcp && this.vitals.fcp > 3000) score -= 20;
    if (this.vitals.lcp && this.vitals.lcp > 4000) score -= 25;
    if (this.vitals.fid && this.vitals.fid > 300) score -= 20;
    if (this.vitals.cls && this.vitals.cls > 0.25) score -= 15;
    
    // Deduct points for errors
    const recentErrors = this.errors.filter(e => Date.now() - e.timestamp.getTime() < 60 * 60 * 1000); // Last hour
    score -= Math.min(recentErrors.length * 2, 20);
    
    return Math.max(score, 0);
  }

  private generateImprovementSuggestions(): string[] {
    const suggestions: string[] = [];
    
    if (this.vitals.fcp && this.vitals.fcp > 3000) {
      suggestions.push('Optimize critical rendering path to improve First Contentful Paint');
    }
    
    if (this.vitals.lcp && this.vitals.lcp > 4000) {
      suggestions.push('Optimize largest content elements and reduce server response times');
    }
    
    if (this.vitals.fid && this.vitals.fid > 300) {
      suggestions.push('Reduce JavaScript execution time and optimize event handlers');
    }
    
    if (this.vitals.cls && this.vitals.cls > 0.25) {
      suggestions.push('Add size attributes to images and reserve space for dynamic content');
    }
    
    const longTasks = this.metrics.filter(m => m.name === 'Long Task' && m.value > 50);
    if (longTasks.length > 0) {
      suggestions.push('Break up long-running JavaScript tasks to improve responsiveness');
    }
    
    const recentErrors = this.errors.filter(e => Date.now() - e.timestamp.getTime() < 60 * 60 * 1000);
    if (recentErrors.length > 5) {
      suggestions.push('Address recent JavaScript errors to improve stability');
    }
    
    return suggestions;
  }

  public clearMetrics(): void {
    this.metrics = [];
    this.errors = [];
    this.vitals = {};
  }

  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.activeMeasures.clear();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const performanceMonitoringService = new PerformanceMonitoringService(); 