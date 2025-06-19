'use client';

import React, { useEffect } from 'react';
import { useDatabase } from '@/hooks/useDatabase';
import { Database, Check, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useMonitoring } from '@/components/providers/MonitoringProvider';

export function DatabaseStatusWidget() {
  const { isConnected, isLoading, error, testConnection } = useDatabase();
  const { captureError, captureMessage, startTimer } = useMonitoring();

  // Test connection on mount
  useEffect(() => {
    let isMounted = true;
    
    if (!isConnected && !isLoading) {
      // Measure database connection performance
      const endTimer = startTimer('database.testConnection');
      
      testConnection()
        .then(() => {
          if (isMounted) {
            captureMessage('Database connection test completed', 'info');
          }
        })
        .catch((err) => {
          if (isMounted) {
            captureError(err instanceof Error ? err : new Error('Database connection failed'), {
              component: 'DatabaseStatusWidget',
              operation: 'testConnection',
              source: 'database'
            });
          }
        })
        .finally(() => {
          if (isMounted) {
            endTimer();
          }
        });
    }
    
    return () => {
      isMounted = false;
    };
  }, [isConnected, isLoading, testConnection, startTimer, captureMessage, captureError]);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="bg-muted/50 p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <Database className="w-4 h-4" />
          Database Status
        </h3>
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            isLoading 
              ? 'bg-amber-100 dark:bg-amber-900/30' 
              : isConnected 
                ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                : 'bg-red-100 dark:bg-red-900/30'
          }`}>
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-spin" />
            ) : isConnected ? (
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
          </div>
          
          <div>
            <div className="font-medium">
              {isLoading ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <div className="text-sm text-muted-foreground">
              {isConnected 
                ? 'Database is operational' 
                : error 
                  ? `Error: ${error.message}` 
                  : 'Unable to connect to database'}
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <button 
            onClick={() => {
              // Measure manual connection test performance
              const endTimer = startTimer('database.manualTestConnection');
              
              testConnection()
                .then(() => {
                  captureMessage('Manual database connection test completed', 'info');
                })
                .catch((err) => {
                  captureError(err instanceof Error ? err : new Error('Manual database connection failed'), {
                    component: 'DatabaseStatusWidget',
                    operation: 'manualTestConnection',
                    source: 'database'
                  });
                })
                .finally(() => {
                  endTimer();
                });
            }}
            disabled={isLoading}
            className="text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
          >
            Test Connection
          </button>
          
          <Link 
            href="/settings/database"
            className="text-sm flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            Settings
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
