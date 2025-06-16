'use client';

import React from 'react';
import { AlertTriangle, Clock, Trash2, RefreshCw, ExternalLink } from 'lucide-react';
import { useMonitoring } from '@/components/providers/MonitoringProvider';
import { Card } from '@omnipanel/ui';
import Link from 'next/link';


export default function ErrorMonitoringPage() {
  const { errorHistory, clearErrorHistory } = useMonitoring();
  
  // Format timestamp to readable format
  const formatTime = (timestamp: Date | number) => {
    if (timestamp instanceof Date) {
      return timestamp.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    }
    // Handle milliseconds
    if (timestamp < 1000) {
      return `${timestamp.toFixed(1)}ms`;
    } else if (timestamp < 60000) {
      return `${(timestamp / 1000).toFixed(2)}s`;
    } else {
      const minutes = Math.floor(timestamp / 60000);
      const seconds = ((timestamp % 60000) / 1000).toFixed(1);
      return `${minutes}m ${seconds}s`;
    }
  };
  
  // Truncate long text
  const truncate = (text: string | undefined, length = 100) => {
    if (!text) return 'N/A';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-8 h-8" />
            Error Monitoring
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and analyze application errors
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={clearErrorHistory}
            className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Errors
          </button>
        </div>
      </div>
      
      {/* Error Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Error Summary</h2>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Total Errors</h3>
            <p className="text-2xl font-bold">{errorHistory.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Errors captured in current session
            </p>
          </Card>
          
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Most Recent Error</h3>
            <p className="text-lg font-medium truncate">
              {errorHistory.length > 0 
                ? truncate(errorHistory[errorHistory.length - 1].message, 30)
                : 'No errors recorded'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {errorHistory.length > 0 
                ? formatTime(errorHistory[errorHistory.length - 1].timestamp)
                : 'N/A'}
            </p>
          </Card>
          
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Error Sources</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {errorHistory.length > 0 ? (
                Array.from(new Set<string>(errorHistory.map(err => 
                  (err.context?.source as string) || 'unknown'
                ))).map((source, index) => (
                  <span 
                    key={`${source}-${index}`} 
                    className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded"
                  >
                    {source}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">No error sources</span>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Error List */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Error History
          </h2>
          
          <button
            onClick={() => window.location.reload()}
            className="text-sm flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
        
        {errorHistory.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">No errors recorded</h3>
            <p className="text-muted-foreground">
              Your application is running smoothly with no recorded errors
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {errorHistory
              .slice()
              .reverse()
              .map((error, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 border-b border-red-200 dark:border-red-800/50">
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 dark:bg-red-800/30 p-2 rounded-full flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-red-800 dark:text-red-300 truncate">
                          {error.message}
                        </h3>
                        <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                          {formatTime(error.timestamp)} • 
                          {error.context?.source ? ` Source: ${error.context.source} •` : ''} 
                          {` URL: ${truncate(error.url, 30)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Stack Trace</h4>
                      <pre className="bg-muted/50 p-3 rounded text-xs overflow-x-auto max-h-[200px]">
                        {error.stack || 'No stack trace available'}
                      </pre>
                    </div>
                    
                    {error.componentStack && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Component Stack</h4>
                        <pre className="bg-muted/50 p-3 rounded text-xs overflow-x-auto max-h-[150px]">
                          {error.componentStack}
                        </pre>
                      </div>
                    )}
                    
                    {error.context && Object.keys(error.context).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Additional Context</h4>
                        <pre className="bg-muted/50 p-3 rounded text-xs overflow-x-auto max-h-[150px]">
                          {JSON.stringify(error.context, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
          </div>
        )}
      </div>
      
      {/* Error Handling Tips */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Error Handling Best Practices</h2>
        
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Using Error Boundaries</h3>
              <p className="text-sm text-muted-foreground mb-2">
                The application includes a global ErrorBoundary component that catches errors in the React component tree.
                You can also use it for specific sections of your application:
              </p>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                {`import { ErrorBoundary } from '@/components/error/ErrorBoundary';

// Wrap components that might error
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>`}
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Manual Error Tracking</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Use the useMonitoring hook to manually capture errors and messages:
              </p>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                {`import { useMonitoring } from '@/components/providers/MonitoringProvider';

function YourComponent() {
  const { captureError, captureMessage } = useMonitoring();
  
  try {
    // Risky code
  } catch (error) {
    captureError(error, { source: 'YourComponent' });
  }
  
  // Log informational messages
  captureMessage('User action completed', 'info', { userId: '123' });
}`}
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Resources</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <Link 
                    href="/docs/error-handling"
                    className="text-primary hover:underline flex items-center gap-1"                  >
                    Error Handling Documentation
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link 
                    href="https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary" 
                    className="text-primary hover:underline flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    React Error Boundaries
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
