'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { type DatabaseService } from '@omnipanel/database';

interface DatabaseContextType {
  databaseService: DatabaseService | null;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  testConnection: () => Promise<boolean>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [databaseService, setDatabaseService] = useState<DatabaseService | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Initialize database service after component mounts (client-side only)
  useEffect(() => {
    setIsMounted(true);
    
    const initializeDatabase = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Only initialize on client side
        if (typeof window !== 'undefined') {
          // Dynamic import to avoid SSR issues
          const { getOmniPanelDatabaseService, testDatabaseConnection } = await import('@/services/databaseService');
          
          const service = getOmniPanelDatabaseService();
          setDatabaseService(service);
          
          if (service) {
            // Test the connection only if service is available
            const connected = await testDatabaseConnection();
            setIsConnected(connected);
            
            if (!connected) {
              setError(new Error('Database connection failed'));
            }
          } else {
            // Database service not configured, but this is not an error in development
            console.info('Database service not configured - running in offline mode');
            setIsConnected(false);
            setError(null); // Don't set error for missing configuration
          }
        }
      } catch (err) {
        console.error('Database initialization error:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  const checkConnection = async (): Promise<boolean> => {
    if (!databaseService) {
      return false;
    }
    
    try {
      setIsLoading(true);
      const { testDatabaseConnection } = await import('@/services/databaseService');
      const connected = await testDatabaseConnection();
      setIsConnected(connected);
      if (!connected) {
        setError(new Error('Database connection failed'));
      } else {
        setError(null);
      }
      return connected;
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DatabaseContext.Provider
      value={{
        databaseService,
        isConnected,
        isLoading,
        error,
        testConnection: checkConnection,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export const useDatabaseContext = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider');
  }
  return context;
};
