'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Clock, BarChart, Zap, AlertTriangle, RefreshCw } from 'lucide-react';
import { useMonitoring } from '@/components/providers/MonitoringProvider';
import { Card } from '@omnipanel/ui';

export default function PerformancePage() {
  const { performanceReport, clearPerformanceMetrics } = useMonitoring();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Force refresh the component every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Format milliseconds to readable format
  const formatTime = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="w-8 h-8" />
            Performance Monitoring
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor application performance metrics and web vitals
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={clearPerformanceMetrics}
            className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Clear Metrics
          </button>
        </div>
      </div>
      
      {/* Web Vitals */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Web Vitals
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* First Contentful Paint */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">First Contentful Paint</h3>
              <div className={`w-2 h-2 rounded-full ${
                performanceReport.vitals.fcp && performanceReport.vitals.fcp < 1800 
                  ? 'bg-emerald-500' 
                  : performanceReport.vitals.fcp && performanceReport.vitals.fcp < 3000 
                    ? 'bg-amber-500' 
                    : 'bg-red-500'
              }`} />
            </div>
            <p className="text-2xl font-bold">
              {performanceReport.vitals.fcp 
                ? formatTime(performanceReport.vitals.fcp) 
                : 'Not available'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Time until first content appears
            </p>
          </Card>
          
          {/* Largest Contentful Paint */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Largest Contentful Paint</h3>
              <div className={`w-2 h-2 rounded-full ${
                performanceReport.vitals.lcp && performanceReport.vitals.lcp < 2500 
                  ? 'bg-emerald-500' 
                  : performanceReport.vitals.lcp && performanceReport.vitals.lcp < 4000 
                    ? 'bg-amber-500' 
                    : 'bg-red-500'
              }`} />
            </div>
            <p className="text-2xl font-bold">
              {performanceReport.vitals.lcp 
                ? formatTime(performanceReport.vitals.lcp) 
                : 'Not available'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Time until largest element appears
            </p>
          </Card>
          
          {/* First Input Delay */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">First Input Delay</h3>
              <div className={`w-2 h-2 rounded-full ${
                performanceReport.vitals.fid && performanceReport.vitals.fid < 100 
                  ? 'bg-emerald-500' 
                  : performanceReport.vitals.fid && performanceReport.vitals.fid < 300 
                    ? 'bg-amber-500' 
                    : 'bg-red-500'
              }`} />
            </div>
            <p className="text-2xl font-bold">
              {performanceReport.vitals.fid 
                ? formatTime(performanceReport.vitals.fid) 
                : 'Not available'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Time until first interaction response
            </p>
          </Card>
          
          {/* Cumulative Layout Shift */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Cumulative Layout Shift</h3>
              <div className={`w-2 h-2 rounded-full ${
                performanceReport.vitals.cls && performanceReport.vitals.cls < 0.1 
                  ? 'bg-emerald-500' 
                  : performanceReport.vitals.cls && performanceReport.vitals.cls < 0.25 
                    ? 'bg-amber-500' 
                    : 'bg-red-500'
              }`} />
            </div>
            <p className="text-2xl font-bold">
              {performanceReport.vitals.cls 
                ? performanceReport.vitals.cls.toFixed(3) 
                : 'Not available'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Visual stability score (lower is better)
            </p>
          </Card>
        </div>
      </div>
      
      {/* Performance Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart className="w-5 h-5" />
          Performance Summary
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Total Operations</h3>
            <p className="text-2xl font-bold">
              {performanceReport.summary.totalMetrics || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tracked operations
            </p>
          </Card>
          
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Average Duration</h3>
            <p className="text-2xl font-bold">
              {formatTime(performanceReport.summary.averageDuration || 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Average operation time
            </p>
          </Card>
          
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Slowest Operation</h3>
            <p className="text-2xl font-bold">
              {performanceReport.summary.slowestOperation 
                ? formatTime(performanceReport.summary.slowestOperation.duration) 
                : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {performanceReport.summary.slowestOperation?.name || 'No operations recorded'}
            </p>
          </Card>
          
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Fastest Operation</h3>
            <p className="text-2xl font-bold">
              {performanceReport.summary.fastestOperation 
                ? formatTime(performanceReport.summary.fastestOperation.duration) 
                : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {performanceReport.summary.fastestOperation?.name || 'No operations recorded'}
            </p>
          </Card>
        </div>
      </div>
      
      {/* Operations Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Operations
        </h2>
        
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Operation</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Tags</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {performanceReport.metrics.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                      No operations recorded yet
                    </td>
                  </tr>
                ) : (
                  performanceReport.metrics
                    .slice()
                    .reverse()
                    .slice(0, 10)
                    .map((metric, index) => (
                      <tr key={index} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm">
                          {metric.name}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {metric.duration !== undefined ? formatTime(metric.duration) : 'Incomplete'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {metric.metadata ? (
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(metric.metadata).map(([key, value]) => (
                                <span 
                                  key={key}
                                  className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded"
                                >
                                  {key}:{String(value)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {metric.metadata?.error ? (
                            <span className="flex items-center gap-1 text-red-500">
                              <AlertTriangle className="w-3 h-3" />
                              Error
                            </span>
                          ) : metric.duration !== undefined ? (
                            <span className="text-emerald-500">Completed</span>
                          ) : (
                            <span className="text-amber-500">In Progress</span>
                          )}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      
      {/* Performance Tips */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Performance Tips</h2>
        
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Optimizing React Components</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Use React.memo for components that render often with the same props</li>
                <li>Implement useMemo and useCallback for expensive calculations and callbacks</li>
                <li>Avoid unnecessary re-renders by optimizing state management</li>
                <li>Use the LazyLoadWrapper component for components below the fold</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Improving Load Times</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Implement code splitting with dynamic imports</li>
                <li>Optimize images with next/image and proper sizing</li>
                <li>Use font optimization techniques</li>
                <li>Minimize JavaScript bundle size</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Monitoring Performance</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Use the useMonitoring hook to track performance of critical operations</li>
                <li>Regularly check this dashboard for performance regressions</li>
                <li>Set performance budgets for key metrics</li>
                <li>Test performance on various devices and network conditions</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
