'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

/**
 * Enhanced Error Boundary component that catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the whole app
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
    
    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    
    // Call the onReset callback if provided
    this.props.onReset?.();
  };

  private toggleDetails = (): void => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="bg-red-100 dark:bg-red-800/30 p-2 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-300">
                Something went wrong
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-100 dark:bg-red-800/50 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800/80 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Try again
                </button>
                
                <button
                  onClick={this.toggleDetails}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white/50 dark:bg-white/5 text-red-700 dark:text-red-300 rounded-md hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${this.state.showDetails ? 'rotate-180' : ''}`} />
                  {this.state.showDetails ? 'Hide' : 'Show'} details
                </button>
              </div>
              
              {this.state.showDetails && (
                <div className="mt-4 overflow-auto max-h-[300px] bg-white/80 dark:bg-black/20 p-3 rounded border border-red-200 dark:border-red-800/50">
                  <p className="text-xs font-medium mb-1 text-red-800 dark:text-red-300">Error Stack:</p>
                  <pre className="text-xs whitespace-pre-wrap text-red-700 dark:text-red-400 overflow-x-auto">
                    {this.state.error?.stack || 'No stack trace available'}
                  </pre>
                  
                  {this.state.errorInfo && (
                    <>
                      <p className="text-xs font-medium mt-3 mb-1 text-red-800 dark:text-red-300">Component Stack:</p>
                      <pre className="text-xs whitespace-pre-wrap text-red-700 dark:text-red-400 overflow-x-auto">
                        {this.state.errorInfo.componentStack || 'No component stack available'}
                      </pre>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

/**
 * Wrapper component for easier usage with React hooks
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
): React.FC<P> {
  const WithErrorBoundary: React.FC<P> = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  // Preserve the display name for better debugging
  WithErrorBoundary.displayName = `WithErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
  
  return WithErrorBoundary;
}
