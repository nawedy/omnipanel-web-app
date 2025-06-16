'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDatabaseContext } from '@/components/providers/DatabaseProvider';
import { type DatabaseService } from '@omnipanel/database';

/**
 * Custom hook for interacting with the database service
 * Provides access to the database service instance and connection status
 * along with utility functions for common database operations
 */
export function useDatabase() {
  const { 
    databaseService, 
    isConnected, 
    isLoading, 
    error, 
    testConnection 
  } = useDatabaseContext();
  
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [lastError, setLastError] = useState<Error | null>(error);
  
  // Update last error when context error changes
  useEffect(() => {
    if (error) {
      setLastError(error);
    }
  }, [error]);
  
  /**
   * Execute a database operation with loading state and error handling
   */
  const executeOperation = useCallback(async <T,>(
    operation: () => Promise<T>,
    errorMessage = 'Database operation failed'
  ): Promise<T | null> => {
    if (!isConnected) {
      setLastError(new Error('Database is not connected'));
      return null;
    }
    
    setIsExecuting(true);
    setLastError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const error = err instanceof Error 
        ? err 
        : new Error(`${errorMessage}: ${String(err)}`);
      
      setLastError(error);
      return null;
    } finally {
      setIsExecuting(false);
    }
  }, [isConnected]);
  
  /**
   * Reset any database errors
   */
  const resetError = useCallback(() => {
    setLastError(null);
  }, []);
  
  /**
   * Check database health
   */
  const checkHealth = useCallback(async () => {
    return executeOperation(
      async () => {
        const health = await databaseService?.getHealth();
        return health;
      },
      'Database health check failed'
    );
  }, [databaseService, executeOperation]);
  
  /**
   * Reset the database connection
   */
  const resetConnection = useCallback(async () => {
    return executeOperation(
      async () => {
        await databaseService?.testConnection();
        const connected = await testConnection();
        return connected;
      },
      'Database reset failed'
    );
  }, [databaseService, executeOperation, testConnection]);
  
  return {
    // Core properties
    db: databaseService,
    isConnected,
    isLoading,
    isExecuting,
    error: lastError,
    
    // Core operations
    testConnection,
    resetError,
    checkHealth,
    resetConnection,
    executeOperation,
  };
}
