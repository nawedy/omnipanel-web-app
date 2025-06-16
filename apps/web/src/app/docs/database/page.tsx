'use client';

import React from 'react';
import Link from 'next/link';
import { Database, Server, Shield, Code, Activity, Settings } from 'lucide-react';

export default function DatabaseDocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Database Integration</h1>
        <p className="text-muted-foreground text-lg">
          Connect to and manage NeonDB PostgreSQL databases
        </p>
      </div>
      
      <div className="bg-app-card-gradient border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">
          The <code>@omnipanel/database</code> package provides a seamless integration with 
          NeonDB PostgreSQL databases. It offers connection management, health monitoring, 
          and a simple API for database operations.
        </p>
        
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <div className="bg-background border border-border rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Connection Management</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure and manage database connections with support for multiple environments.
            </p>
          </div>
          
          <div className="bg-background border border-border rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Secure Configuration</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Securely store and manage database credentials and connection strings.
            </p>
          </div>
          
          <div className="bg-background border border-border rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Health Monitoring</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Monitor database health, connection status, and performance metrics.
            </p>
          </div>
          
          <div className="bg-background border border-border rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Query API</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Simple and type-safe API for executing queries and transactions.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="bg-muted/50 p-4 border-b border-border">
          <h2 className="font-semibold">Integration Guide</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-medium text-lg mb-3">1. Installation</h3>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
              <code>npm install @omnipanel/database</code>
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-3">2. Environment Setup</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Configure your environment variables:
            </p>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
              <code>{`# .env.local
NEXT_PUBLIC_NEON_PROJECT_ID=your-project-id
NEON_API_KEY=your-api-key
DATABASE_URL=postgres://user:password@host:port/database`}</code>
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-3">3. Database Service</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Create a service to manage database connections:
            </p>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
              <code>{`// databaseService.ts
import { OmniPanelDatabaseService } from '@omnipanel/database';

// Singleton instance
let databaseService: OmniPanelDatabaseService | null = null;

export function getOmniPanelDatabaseService(): OmniPanelDatabaseService {
  if (!databaseService) {
    databaseService = new OmniPanelDatabaseService({
      projectId: process.env.NEXT_PUBLIC_NEON_PROJECT_ID || '',
      apiKey: process.env.NEON_API_KEY || '',
      connectionString: process.env.DATABASE_URL || '',
    });
  }
  
  return databaseService;
}

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const service = getOmniPanelDatabaseService();
    const result = await service.healthCheck();
    return result.status === 'healthy';
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}`}</code>
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-3">4. React Context Provider</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Create a React context provider for database access:
            </p>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
              <code>{`// DatabaseProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getOmniPanelDatabaseService, testDatabaseConnection } from '@/services/databaseService';

// Context definition
export const DatabaseContext = createContext<DatabaseContextType>({
  databaseService: null,
  isConnected: false,
  isLoading: true,
  error: null,
  testConnection: async () => false,
  resetConnection: async () => false,
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize database connection
  useEffect(() => {
    initializeDatabase();
  }, []);
  
  // Initialize database connection
  const initializeDatabase = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const connected = await testDatabaseConnection();
      setIsConnected(connected);
      
      if (!connected) {
        setError(new Error('Failed to connect to database'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown database error'));
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Test database connection
  const testConnection = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const connected = await testDatabaseConnection();
      setIsConnected(connected);
      
      if (!connected) {
        setError(new Error('Failed to connect to database'));
      }
      
      return connected;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown database error'));
      setIsConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset database connection
  const resetConnection = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get a fresh instance of the database service
      const service = getOmniPanelDatabaseService();
      await service.reset();
      
      const connected = await testDatabaseConnection();
      setIsConnected(connected);
      
      if (!connected) {
        setError(new Error('Failed to reset database connection'));
      }
      
      return connected;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown database error'));
      setIsConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <DatabaseContext.Provider value={{
      databaseService: getOmniPanelDatabaseService(),
      isConnected,
      isLoading,
      error,
      testConnection,
      resetConnection,
    }}>
      {children}
    </DatabaseContext.Provider>
  );
}

// Custom hook for using the database context
export function useDatabaseContext() {
  return useContext(DatabaseContext);
}`}</code>
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-3">5. Custom Hook for Database Access</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Create a custom hook for simplified database access:
            </p>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
              <code>{`// useDatabase.ts
import { useState } from 'react';
import { useDatabaseContext } from '@/components/providers/DatabaseProvider';

export function useDatabase() {
  const context = useDatabaseContext();
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState<Error | null>(null);
  
  // Execute a query
  const executeQuery = async <T,>(query: string, params?: any[]): Promise<T | null> => {
    if (!context.databaseService || !context.isConnected) {
      setQueryError(new Error('Database not connected'));
      return null;
    }
    
    try {
      setQueryLoading(true);
      setQueryError(null);
      
      const result = await context.databaseService.query<T>(query, params);
      return result;
    } catch (err) {
      setQueryError(err instanceof Error ? err : new Error('Query execution failed'));
      return null;
    } finally {
      setQueryLoading(false);
    }
  };
  
  // Execute a transaction
  const executeTransaction = async <T,>(queries: { query: string; params?: any[] }[]): Promise<T | null> => {
    if (!context.databaseService || !context.isConnected) {
      setQueryError(new Error('Database not connected'));
      return null;
    }
    
    try {
      setQueryLoading(true);
      setQueryError(null);
      
      const result = await context.databaseService.transaction<T>(queries);
      return result;
    } catch (err) {
      setQueryError(err instanceof Error ? err : new Error('Transaction execution failed'));
      return null;
    } finally {
      setQueryLoading(false);
    }
  };
  
  return {
    ...context,
    executeQuery,
    executeTransaction,
    queryLoading,
    queryError,
  };
}`}</code>
            </pre>
          </div>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="bg-muted/50 p-4 border-b border-border">
          <h2 className="font-semibold">Database Status Component</h2>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Create a component to display database status:
          </p>
          
          <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
            <code>{`// DatabaseStatus.tsx
'use client';

import React from 'react';
import { useDatabase } from '@/hooks/useDatabase';
import { Database, Check, AlertCircle, Loader2 } from 'lucide-react';

export function DatabaseStatus() {
  const { isConnected, isLoading, error, testConnection } = useDatabase();

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className={\`p-2 rounded-full \${
          isLoading 
            ? 'bg-amber-100 dark:bg-amber-900/30' 
            : isConnected 
              ? 'bg-emerald-100 dark:bg-emerald-900/30' 
              : 'bg-red-100 dark:bg-red-900/30'
        }\`}>
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
                ? \`Error: \${error.message}\` 
                : 'Unable to connect to database'}
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <button 
          onClick={() => testConnection()}
          disabled={isLoading}
          className="text-sm bg-primary/10 text-primary px-3 py-1 rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          Test Connection
        </button>
      </div>
    </div>
  );
}`}</code>
          </pre>
        </div>
      </div>
      
      <div className="bg-muted/30 border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Database Settings</h2>
        <p className="mb-4">
          Check out our database settings page for a complete example of database configuration:
        </p>
        
        <Link 
          href="/settings/database"
          className="bg-primary/10 text-primary px-4 py-2 rounded-md inline-flex items-center gap-2 hover:bg-primary/20 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Database Settings
        </Link>
        
        <div className="mt-6 text-sm text-muted-foreground">
          <p>
            The database settings page demonstrates how to configure and manage database connections,
            test connectivity, and display database information.
          </p>
        </div>
      </div>
    </div>
  );
}
