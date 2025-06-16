'use client';

import React from 'react';
import { Activity, AlertTriangle, Code, ExternalLink, Zap } from 'lucide-react';
import Link from 'next/link';
import { useMonitoring } from '@/components/providers/MonitoringProvider';

export default function MonitoringDocPage() {
  const { captureError, captureMessage } = useMonitoring();
  
  // Log page visit for analytics
  React.useEffect(() => {
    try {
      captureMessage('Monitoring documentation page visited', 'info', {
        page: 'monitoring-docs',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Failed to log page visit'), {
        component: 'MonitoringDocPage',
        operation: 'pageVisit'
      });
    }
  }, [captureMessage, captureError]);
  
  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Error & Performance Monitoring</h1>
        <p className="text-muted-foreground">
          Comprehensive documentation for OmniPanel's error handling and performance monitoring systems
        </p>
      </div>

      <div className="space-y-12">
        {/* Overview Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <div className="prose dark:prose-invert max-w-none">
            <p>
              OmniPanel includes built-in error handling and performance monitoring capabilities to help you 
              build robust, high-performance applications. These systems are designed to work seamlessly with 
              the rest of the OmniPanel ecosystem while providing detailed insights into your application's 
              behavior.
            </p>
            <p>
              The monitoring system consists of two main components:
            </p>
            <ul>
              <li><strong>Error Monitoring</strong> - Captures and reports errors throughout your application</li>
              <li><strong>Performance Monitoring</strong> - Tracks performance metrics and web vitals</li>
            </ul>
            <p>
              Both systems are integrated into the application via the <code>MonitoringProvider</code> component, 
              which is included in the main <code>Providers</code> wrapper.
            </p>
          </div>
        </section>

        {/* Error Monitoring Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-semibold">Error Monitoring</h2>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h3>Key Features</h3>
            <ul>
              <li>Global error capturing for unhandled exceptions</li>
              <li>React error boundary integration</li>
              <li>Detailed error reporting with stack traces and component stacks</li>
              <li>Error history with context preservation</li>
              <li>Customizable error reporters for external services</li>
            </ul>

            <h3>Installation</h3>
            <p>
              The error monitoring system is already integrated into the OmniPanel core. The <code>MonitoringProvider</code> is 
              included in the main <code>Providers</code> component, so you don't need to add it manually.
            </p>

            <h3>Basic Usage</h3>
            <p>
              To manually capture errors or log messages in your components:
            </p>

            <pre><code>{`import { useMonitoring } from '@/components/providers/MonitoringProvider';

function YourComponent() {
  const { captureError, captureMessage } = useMonitoring();
  
  // Capture an error
  try {
    // Risky code
  } catch (error) {
    captureError(error, { 
      source: 'YourComponent',
      userId: 'user-123',
      // Any additional context
    });
  }
  
  // Log messages with different severity levels
  captureMessage('Operation completed', 'info', { operationId: '123' });
  captureMessage('Warning condition detected', 'warning');
  captureMessage('Critical issue', 'error');
  
  return <div>Your component content</div>;
}`}</code></pre>

            <h3>Using Error Boundaries</h3>
            <p>
              While there's a global error boundary wrapping the entire application, you can add more specific 
              error boundaries to prevent errors from crashing large sections of your UI:
            </p>

            <pre><code>{`import { ErrorBoundary } from '@/components/error/ErrorBoundary';

function YourComponent() {
  return (
    <ErrorBoundary 
      fallback={<div>Something went wrong in this section</div>}
      onError={(error, errorInfo) => {
        // Custom error handling
        console.error("Caught error:", error, errorInfo);
      }}
    >
      <RiskyComponent />
    </ErrorBoundary>
  );
}`}</code></pre>

            <h3>Higher-Order Component</h3>
            <p>
              For functional components, you can use the <code>withErrorBoundary</code> HOC:
            </p>

            <pre><code>{`import { withErrorBoundary } from '@/components/error/ErrorBoundary';

function RiskyComponent() {
  // Component that might throw errors
}

export default withErrorBoundary(RiskyComponent, {
  fallback: <div>Custom fallback UI</div>,
  onError: (error, errorInfo) => {
    // Custom error handling
  }
});`}</code></pre>

            <h3>Viewing Errors</h3>
            <p>
              You can view all captured errors in the Error Monitoring dashboard:
            </p>
            <div className="not-prose">
              <Link 
                              href="/settings/errors"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"              >
                <AlertTriangle className="w-4 h-4" />
                View Error Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Performance Monitoring Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-6 h-6 text-emerald-500" />
            <h2 className="text-2xl font-semibold">Performance Monitoring</h2>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h3>Key Features</h3>
            <ul>
              <li>Web Vitals tracking (FCP, LCP, FID, CLS, TTFB)</li>
              <li>Custom performance measurements</li>
              <li>Operation timing with tags and context</li>
              <li>Performance reports with summary statistics</li>
              <li>React hook for easy integration</li>
            </ul>

            <h3>Basic Usage</h3>
            <p>
              To measure performance in your components:
            </p>

            <pre><code>{`import { useMonitoring } from '@/components/providers/MonitoringProvider';

function YourComponent() {
  const { startMeasure, endMeasure, measure } = useMonitoring();
  
  // Method 1: Start and end measurements manually
  const handleClick = async () => {
    const id = startMeasure('user-action', { action: 'button-click' });
    
    try {
      // Perform some operation
      await fetchData();
      endMeasure(id);
    } catch (error) {
      endMeasure(id, { error: true });
      throw error;
    }
  };
  
  // Method 2: Measure a function call automatically
  const handleSubmit = async () => {
    await measure('form-submission', async () => {
      // This function will be timed
      await submitForm();
    }, { formType: 'contact' });
  };
  
  return <div>Your component content</div>;
}`}</code></pre>

            <h3>Lazy Loading Components</h3>
            <p>
              Use the <code>LazyLoadWrapper</code> component to defer rendering of components until they're visible:
            </p>

            <pre><code>{`import { LazyLoadWrapper } from '@/components/performance/LazyLoadWrapper';

function YourComponent() {
  return (
    <div>
      <div>Above-the-fold content (loads immediately)</div>
      
      <LazyLoadWrapper 
        placeholder={<div>Loading...</div>}
        threshold={0.1} // Start loading when 10% visible
      >
        <HeavyComponent />
      </LazyLoadWrapper>
    </div>
  );
}`}</code></pre>

            <h3>Viewing Performance Metrics</h3>
            <p>
              You can view all performance metrics in the Performance Monitoring dashboard:
            </p>
            <div className="not-prose">
              <Link 
                              href="/settings/performance"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"              >
                <Activity className="w-4 h-4" />
                View Performance Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Integration with Other OmniPanel Packages */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-semibold">Integration with OmniPanel Packages</h2>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h3>Database Integration</h3>
            <p>
              The monitoring system integrates with the database package to track query performance and errors:
            </p>

            <pre><code>{`import { useDatabase } from '@/hooks/useDatabase';
import { useMonitoring } from '@/components/providers/MonitoringProvider';

function YourComponent() {
  const { db } = useDatabase();
  const { measure } = useMonitoring();
  
  const fetchUsers = async () => {
    return await measure('db-query-users', async () => {
      return await db.query('SELECT * FROM users');
    }, { queryType: 'select' });
  };
  
  return <div>Your component content</div>;
}`}</code></pre>

            <h3>Plugin SDK Integration</h3>
            <p>
              Monitor plugin performance and errors:
            </p>

            <pre><code>{`import { usePlugins } from '@/hooks/usePlugins';
import { useMonitoring } from '@/components/providers/MonitoringProvider';

function YourComponent() {
  const { plugins } = usePlugins();
  const { captureError } = useMonitoring();
  
  const handlePluginMessage = (message) => {
    try {
      // Process plugin message
      plugins.sendResponse(message.id, { success: true });
    } catch (error) {
      captureError(error, { 
        source: 'plugin-message-handler',
        pluginId: message.pluginId 
      });
      plugins.sendResponse(message.id, { error: error.message });
    }
  };
  
  return <div>Your component content</div>;
}`}</code></pre>
          </div>
        </section>

        {/* Advanced Configuration */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-semibold">Advanced Configuration</h2>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h3>Custom Error Reporter</h3>
            <p>
              You can configure a custom error reporter to send errors to external services:
            </p>

            <pre><code>{`// In your app initialization
import { errorMonitor } from '@/utils/errorMonitoring';

// Example integration with a hypothetical error service
const customReporter = {
  captureError: (error, context) => {
    // Send to your error reporting service
    ErrorService.report(error, {
      ...context,
      environment: process.env.NODE_ENV,
      version: process.env.APP_VERSION,
    });
    
    // You can still log to console if desired
    console.error('[Custom Reporter] Error:', error, context);
  },
  captureMessage: (message, level, context) => {
    // Send to your error reporting service
    ErrorService.reportMessage(message, level, {
      ...context,
      environment: process.env.NODE_ENV,
      version: process.env.APP_VERSION,
    });
  },
};

// Set the custom reporter
errorMonitor.setReporter(customReporter);`}</code></pre>

            <h3>Extending the MonitoringProvider</h3>
            <p>
              You can extend the MonitoringProvider to add additional functionality:
            </p>

            <pre><code>{`// In your app's providers setup
import { MonitoringProvider } from '@/components/providers/MonitoringProvider';

function AppProviders({ children }) {
  // Create a custom error reporter
  const customReporter = {
    captureError: (error, context) => {
      // Your custom implementation
    },
    captureMessage: (message, level, context) => {
      // Your custom implementation
    },
  };
  
  return (
    <MonitoringProvider customErrorReporter={customReporter}>
      {/* Other providers */}
      {children}
    </MonitoringProvider>
  );
}`}</code></pre>
          </div>
        </section>

        {/* Resources Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Additional Resources</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link 
              href="/settings/performance"
              className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <h3 className="font-medium">Performance Dashboard</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                View real-time performance metrics and web vitals
              </p>
            </Link>
            
            <Link 
              href="/settings/errors"
              className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-medium">Error Dashboard</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Monitor and analyze application errors
              </p>
            </Link>
            
            <a 
              href="https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium">React Error Boundaries</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Official React documentation on error boundaries
              </p>
            </a>
            
            <a 
              href="https://web.dev/articles/vitals"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium">Web Vitals</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Learn more about Core Web Vitals and performance metrics
              </p>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
