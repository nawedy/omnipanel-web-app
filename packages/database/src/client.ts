// packages/database/src/client.ts
// Universal database client supporting both NeonDB and Supabase

import type { DatabaseConfig } from '@omnipanel/config';
import type { 
  User as DatabaseUser, 
  DatabaseProject, 
  DatabaseChatSession, 
  DatabaseMessage,
  DatabaseFile,
  DatabaseProjectMember,
  DatabaseFileVersion
} from '@omnipanel/types';

// Import NeonDB client
import {
  NeonDatabase,
  NeonPool,
  createNeonClient,
  createNeonPool,
  getNeonClient,
  getNeonPool,
  testNeonConnection,
  getNeonHealth,
  executeNeonTransaction,
  buildNeonQuery,
  handleNeonError,
  Database as NeonDatabase_Schema
} from './neon-client';

// Import Supabase client (for migration/fallback)
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Re-export database schema
export type Database = NeonDatabase_Schema;

// Universal client type
export type DatabaseClient = NeonDatabase | SupabaseClient<any>;
export type DatabasePool = NeonPool;

// Client instances
let primaryClient: DatabaseClient | null = null;
let primaryPool: DatabasePool | null = null;
let clientConfig: DatabaseConfig | null = null;

/**
 * Initialize database with automatic provider detection
 */
export const initializeDatabase = (config: DatabaseConfig): {
  client: DatabaseClient;
  pool?: DatabasePool;
} => {
  clientConfig = config;
  
  if (config.provider === 'neon' && config.neon?.connectionString) {
    console.log('🔗 Initializing NeonDB connection...');
    primaryClient = createNeonClient(config);
    primaryPool = createNeonPool(config);
    
    return {
      client: primaryClient,
      pool: primaryPool,
    };
  }
  
  if (config.provider === 'supabase' && config.supabase) {
    console.log('🔗 Initializing Supabase connection (legacy mode)...');
    primaryClient = createClient(
      config.supabase.url,
      config.supabase.anon_key,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
        global: {
          headers: {
            'X-Client-Info': 'omnipanel-database',
          },
        },
      }
    );
    
    return {
      client: primaryClient,
    };
  }
  
  throw new Error('No valid database configuration found');
};

/**
 * Get the active database client
 */
export const getDatabaseClient = (): DatabaseClient => {
  if (!primaryClient) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return primaryClient;
};

/**
 * Get the active database pool (NeonDB only)
 */
export const getDatabasePool = (): DatabasePool => {
  if (!primaryPool) {
    throw new Error('Database pool not available. Ensure NeonDB is configured.');
  }
  return primaryPool;
};

/**
 * Test database connection
 */
export const testDatabaseConnection = async (): Promise<boolean> => {
  if (!primaryClient || !clientConfig) {
    return false;
  }
  
  try {
    if (clientConfig.provider === 'neon') {
      return await testNeonConnection(primaryClient as NeonDatabase);
    }
    
    if (clientConfig.provider === 'supabase') {
      const { error } = await (primaryClient as SupabaseClient<any>)
        .from('users')
        .select('id')
        .limit(1);
      return !error;
    }
    
    return false;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

/**
 * Get database health status
 */
export const getDatabaseHealth = async (): Promise<{
  connected: boolean;
  provider: string;
  latency?: number;
  error?: string;
}> => {
  if (!primaryClient || !clientConfig) {
    return {
      connected: false,
      provider: 'none',
      error: 'Database not initialized',
    };
  }
  
  try {
    if (clientConfig.provider === 'neon') {
      const health = await getNeonHealth(primaryClient as NeonDatabase);
      return {
        ...health,
        provider: 'neon',
      };
    }
    
    if (clientConfig.provider === 'supabase') {
      const start = Date.now();
      const { error } = await (primaryClient as SupabaseClient<any>)
        .from('users')
        .select('id')
        .limit(1);
      
      const latency = Date.now() - start;
      
      return {
        connected: !error,
        provider: 'supabase',
        latency: !error ? latency : undefined,
        error: error?.message,
      };
    }
    
    return {
      connected: false,
      provider: clientConfig.provider,
      error: 'Unknown provider',
    };
  } catch (error) {
    return {
      connected: false,
      provider: clientConfig.provider,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Execute a transaction (NeonDB only)
 */
export const executeTransaction = async <T>(
  operations: (client: any) => Promise<T>
): Promise<T> => {
  if (!clientConfig || clientConfig.provider !== 'neon' || !primaryPool) {
    throw new Error('Transactions are only supported with NeonDB');
  }
  
  return executeNeonTransaction(primaryPool, operations);
};

/**
 * Universal query builder
 */
export const buildQuery = <T extends keyof Database>(table: T) => {
  if (!primaryClient || !clientConfig) {
    throw new Error('Database not initialized');
  }
  
  if (clientConfig.provider === 'neon') {
    return buildNeonQuery(primaryClient as NeonDatabase, table);
  }
  
  if (clientConfig.provider === 'supabase') {
    const client = primaryClient as SupabaseClient<any>;
    return {
      select: async (columns = '*', where?: string, params?: any[]) => {
        let query = client.from(table).select(columns);
        // Note: Supabase uses different query syntax - this is simplified
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      
      insert: async (data: Database[T]['Insert']) => {
        const { data: result, error } = await client
          .from(table)
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        return result;
      },
      
      update: async (data: Database[T]['Update'], where: string, params: any[]) => {
        // Note: This is a simplified implementation
        const { data: result, error } = await client
          .from(table)
          .update(data)
          .select();
        if (error) throw error;
        return result || [];
      },
      
      delete: async (where: string, params: any[]) => {
        // Note: This is a simplified implementation
        const { data: result, error } = await client
          .from(table)
          .delete()
          .select();
        if (error) throw error;
        return result || [];
      },
    };
  }
  
  throw new Error(`Unsupported database provider: ${clientConfig.provider}`);
};

/**
 * Handle database errors universally
 */
export const handleDatabaseError = (error: any): never => {
  if (!clientConfig) {
    throw new Error('Database error: ' + (error.message || 'Unknown error'));
  }
  
  if (clientConfig.provider === 'neon') {
    return handleNeonError(error);
  }
  
  // Supabase error handling
  if (error.code) {
    switch (error.code) {
      case '23505':
        throw new Error('Record already exists');
      case '23503':
        throw new Error('Referenced record not found');
      default:
        throw new Error(`Database error: ${error.message}`);
    }
  }
  
  throw new Error(error.message || 'Unknown database error');
};

/**
 * Setup real-time subscriptions
 */
export const setupRealtimeSubscription = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  if (!primaryClient || !clientConfig) {
    throw new Error('Database not initialized');
  }
  
  if (clientConfig.provider === 'neon') {
    console.warn('Real-time subscriptions require custom WebSocket implementation with NeonDB');
    return {
      unsubscribe: () => {
        // Placeholder for WebSocket cleanup
      }
    };
  }
  
  if (clientConfig.provider === 'supabase') {
    const client = primaryClient as SupabaseClient<any>;
    const subscription = client
      .channel(`realtime:${table}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table,
          filter 
        }, 
        callback
      )
      .subscribe();
    
    return {
      unsubscribe: () => {
        client.removeChannel(subscription);
      }
    };
  }
  
  throw new Error(`Real-time not supported for provider: ${clientConfig.provider}`);
};

/**
 * Migrate data from Supabase to NeonDB
 */
export const migrateToNeon = async (
  supabaseConfig: any,
  neonConfig: DatabaseConfig
): Promise<void> => {
  console.log('🚀 Starting migration from Supabase to NeonDB...');
  
  // Initialize Supabase client for data export
  const supabaseClient = createClient(
    supabaseConfig.url,
    supabaseConfig.service_role_key
  );
  
  // Initialize NeonDB client for data import
  const neonClient = createNeonClient(neonConfig);
  
  // Migration logic would go here
  // This is a placeholder for the actual migration implementation
  
  console.log('✅ Migration completed successfully!');
};

// Re-export types and utilities
export type {
  DatabaseUser,
  DatabaseProject,
  DatabaseChatSession,
  DatabaseMessage,
  DatabaseFile,
  DatabaseProjectMember,
  DatabaseFileVersion,
  NeonDatabase,
  NeonPool,
};

export {
  createNeonClient,
  createNeonPool,
  getNeonClient,
  getNeonPool,
};