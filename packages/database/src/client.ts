// packages/database/src/client.ts
// NeonDB database client for OmniPanel workspace

import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import type { FullQueryResults } from '@neondatabase/serverless';
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

// Configure Neon for optimal performance
neonConfig.fetchConnectionCache = true;

// Database schema types for NeonDB
export interface Database {
  users: {
    Row: DatabaseUser;
    Insert: Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>>;
  };
  projects: {
    Row: DatabaseProject;
    Insert: Omit<DatabaseProject, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<Omit<DatabaseProject, 'id' | 'created_at' | 'updated_at'>>;
  };
  project_members: {
    Row: DatabaseProjectMember;
    Insert: Omit<DatabaseProjectMember, 'id' | 'joined_at'>;
    Update: Partial<Omit<DatabaseProjectMember, 'id' | 'joined_at'>>;
  };
  chat_sessions: {
    Row: DatabaseChatSession;
    Insert: Omit<DatabaseChatSession, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<Omit<DatabaseChatSession, 'id' | 'created_at' | 'updated_at'>>;
  };
  messages: {
    Row: DatabaseMessage;
    Insert: Omit<DatabaseMessage, 'id' | 'created_at'>;
    Update: Partial<Omit<DatabaseMessage, 'id' | 'created_at'>>;
  };
  files: {
    Row: DatabaseFile;
    Insert: Omit<DatabaseFile, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<Omit<DatabaseFile, 'id' | 'created_at' | 'updated_at'>>;
  };
  file_versions: {
    Row: DatabaseFileVersion;
    Insert: Omit<DatabaseFileVersion, 'id' | 'created_at'>;
    Update: Partial<Omit<DatabaseFileVersion, 'id' | 'created_at'>>;
  };
}

// NeonDB client types
export type DatabaseClient = ReturnType<typeof neon<false, true>>;
export type DatabasePool = Pool;

// Client instances
let primaryClient: DatabaseClient | null = null;
let primaryPool: DatabasePool | null = null;
let clientConfig: DatabaseConfig | null = null;

// Helper functions to extract rows from neon result
export function extractRows(result: FullQueryResults<false>): Record<string, unknown>[] {
  return result.rows || [];
}

export function extractFirstRow(result: FullQueryResults<false>): Record<string, unknown> | null {
  const rows = extractRows(result);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Create NeonDB client for serverless functions
 */
export const createNeonClient = (config: DatabaseConfig): DatabaseClient => {
  if (!config.neon?.connectionString) {
    throw new Error('NeonDB connection string is required');
  }

  const client = neon(config.neon.connectionString, {
    fetchOptions: {
      cache: 'no-store',
    },
    fullResults: true,
  });

  return client;
};

/**
 * Create NeonDB connection pool for server environments
 */
export const createNeonPool = (config: DatabaseConfig): DatabasePool => {
  if (!config.neon?.connectionString) {
    throw new Error('NeonDB connection string is required');
  }

  const pool = new Pool({
    connectionString: config.neon.connectionString,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection cannot be established
    maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
  });

  return pool;
};

/**
 * Get or create the NeonDB client
 */
export const getNeonClient = (config?: DatabaseConfig): DatabaseClient => {
  if (!primaryClient && config) {
    primaryClient = createNeonClient(config);
    clientConfig = config;
  }
  
  if (!primaryClient) {
    throw new Error('NeonDB client not initialized. Call getNeonClient with config first.');
  }
  
  return primaryClient;
};

/**
 * Get or create the NeonDB pool
 */
export const getNeonPool = (config?: DatabaseConfig): DatabasePool => {
  if (!primaryPool && config) {
    primaryPool = createNeonPool(config);
    clientConfig = config;
  }
  
  if (!primaryPool) {
    throw new Error('NeonDB pool not initialized. Call getNeonPool with config first.');
  }
  
  return primaryPool;
};

/**
 * Initialize NeonDB database
 */
export const initializeDatabase = (config: DatabaseConfig): {
  client: DatabaseClient;
  pool: DatabasePool;
} => {
  clientConfig = config;
  
  if (!config.neon?.connectionString) {
    throw new Error('NeonDB connection string is required');
  }
  
  console.log('🔗 Initializing NeonDB connection...');
  primaryClient = createNeonClient(config);
  primaryPool = createNeonPool(config);
  
  return {
    client: primaryClient,
    pool: primaryPool,
  };
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
 * Get the active database pool
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
  if (!primaryClient) {
    return false;
  }
  
  try {
    const result = await primaryClient('SELECT 1 as test');
    return Array.isArray(result) && result.length > 0;
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
  if (!primaryClient) {
    return {
      connected: false,
      provider: 'neon',
      error: 'Database not initialized',
    };
  }
  
  try {
    const start = Date.now();
    await primaryClient('SELECT 1');
    const latency = Date.now() - start;
    
    return {
      connected: true,
      provider: 'neon',
      latency,
    };
  } catch (error) {
    return {
      connected: false,
      provider: 'neon',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Execute a transaction
 */
export const executeTransaction = async <T>(
  operations: (client: any) => Promise<T>
): Promise<T> => {
  if (!primaryPool) {
    throw new Error('Database pool not available');
  }
  
  const client = await primaryPool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await operations(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Execute batch operations with concurrency control
 */
export const batchOperations = async (
  operations: Array<() => Promise<any>>,
  batchSize = 10
): Promise<any[]> => {
  const results: any[] = [];
  
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(op => op()));
    results.push(...batchResults);
  }
  
  return results;
};

/**
 * Query builder for type-safe queries
 */
export const buildQuery = <T extends keyof Database>(table: T) => {
  if (!primaryClient) {
    throw new Error('Database not initialized');
  }
  
  return {
    select: (columns?: string) => ({
      from: table,
      columns: columns || '*',
      where: (condition: string, params: any[] = []) => ({
        query: `SELECT ${columns || '*'} FROM ${String(table)} WHERE ${condition}`,
        params,
        execute: () => primaryClient!(`SELECT ${columns || '*'} FROM ${String(table)} WHERE ${condition}`, params)
      }),
      execute: () => primaryClient!(`SELECT ${columns || '*'} FROM ${String(table)}`)
    }),
    insert: (data: Database[T]['Insert']) => ({
      query: `INSERT INTO ${String(table)}`,
      data,
      execute: async () => {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        
        return primaryClient!(
          `INSERT INTO ${String(table)} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
          values
        );
      }
    }),
    update: (data: Database[T]['Update']) => ({
      where: (condition: string, params: any[] = []) => ({
        execute: async () => {
          const keys = Object.keys(data);
          const values = Object.values(data);
          const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
          const conditionParams = params.map((_, i) => `$${values.length + i + 1}`);
          
          return primaryClient!(
            `UPDATE ${String(table)} SET ${setClause} WHERE ${condition.replace(/\$(\d+)/g, (_, num) => conditionParams[parseInt(num) - 1])} RETURNING *`,
            [...values, ...params]
          );
        }
      })
    }),
    delete: () => ({
      where: (condition: string, params: any[] = []) => ({
        execute: () => primaryClient!(`DELETE FROM ${String(table)} WHERE ${condition}`, params)
      })
    })
  };
};

/**
 * Handle database errors
 */
export const handleDatabaseError = (error: any): never => {
  console.error('Database error:', error);
  
  if (error.code) {
    switch (error.code) {
      case '23505': // unique_violation
        throw new Error('A record with this information already exists');
      case '23503': // foreign_key_violation
        throw new Error('Referenced record does not exist');
      case '23502': // not_null_violation
        throw new Error('Required field is missing');
      case '42P01': // undefined_table
        throw new Error('Database table not found');
      case '42703': // undefined_column
        throw new Error('Database column not found');
      default:
        throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }
  }
  
  throw new Error(error.message || 'Database operation failed');
};

/**
 * Setup real-time subscriptions (placeholder for WebSocket implementation)
 */
export const setupRealtimeSubscription = () => {
  console.warn('Real-time subscriptions require custom WebSocket implementation with NeonDB');
  
  return {
    unsubscribe: () => {
      // Placeholder for WebSocket cleanup
    }
  };
};

/**
 * Get database configuration
 */
export const getDatabaseConfig = (): DatabaseConfig | null => {
  return clientConfig;
};

/**
 * Reset database connection (useful for testing)
 */
export const resetDatabaseConnection = (): void => {
  primaryClient = null;
  primaryPool = null;
  clientConfig = null;
};

// Re-export types for convenience
export type {
  DatabaseUser,
  DatabaseProject,
  DatabaseChatSession,
  DatabaseMessage,
  DatabaseFile,
  DatabaseProjectMember,
  DatabaseFileVersion,
} from '@omnipanel/types';

export async function subscribeToChanges(): Promise<void> {
  console.log('Real-time subscriptions not implemented for NeonDB');
  // Placeholder for future implementation
  // Could use polling or webhook-based approach
}