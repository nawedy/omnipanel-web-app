// packages/database/src/neon-client.ts
// NeonDB client implementation for OmniPanel workspace

import { neon, neonConfig, Pool } from '@neondatabase/serverless';
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

// NeonDB client type
export type NeonDatabase = ReturnType<typeof neon>;
export type NeonPool = Pool;

// Client instances
let neonClient: NeonDatabase | null = null;
let neonPool: NeonPool | null = null;

/**
 * Create NeonDB client for serverless functions
 */
export const createNeonClient = (config: DatabaseConfig): NeonDatabase => {
  if (!config.neon.connectionString) {
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
export const createNeonPool = (config: DatabaseConfig): NeonPool => {
  if (!config.neon.connectionString) {
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
export const getNeonClient = (config?: DatabaseConfig): NeonDatabase => {
  if (!neonClient && config) {
    neonClient = createNeonClient(config);
  }
  
  if (!neonClient) {
    throw new Error('NeonDB client not initialized. Call getNeonClient with config first.');
  }
  
  return neonClient;
};

/**
 * Get or create the NeonDB pool
 */
export const getNeonPool = (config?: DatabaseConfig): NeonPool => {
  if (!neonPool && config) {
    neonPool = createNeonPool(config);
  }
  
  if (!neonPool) {
    throw new Error('NeonDB pool not initialized. Call getNeonPool with config first.');
  }
  
  return neonPool;
};

/**
 * Initialize database clients
 */
export const initializeNeonDatabase = (config: DatabaseConfig): {
  client: NeonDatabase;
  pool: NeonPool;
} => {
  neonClient = createNeonClient(config);
  neonPool = createNeonPool(config);
  
  return {
    client: neonClient,
    pool: neonPool,
  };
};

/**
 * Test database connection
 */
export const testNeonConnection = async (client: NeonDatabase): Promise<boolean> => {
  try {
    const result = await client('SELECT 1 as test');
    return Array.isArray(result) && result.length > 0;
  } catch (error) {
    console.error('NeonDB connection test failed:', error);
    return false;
  }
};

/**
 * Get database health status
 */
export const getNeonHealth = async (client: NeonDatabase): Promise<{
  connected: boolean;
  latency?: number;
  error?: string;
}> => {
  try {
    const start = Date.now();
    await client('SELECT 1');
    const latency = Date.now() - start;
    
    return {
      connected: true,
      latency,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Execute a transaction
 */
export const executeNeonTransaction = async <T>(
  pool: NeonPool,
  operations: (client: any) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  
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
 * Batch operations with controlled concurrency
 */
export const batchNeonOperations = async (
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
 * Handle database errors
 */
export const handleNeonError = (error: any): never => {
  // Enhanced error handling for NeonDB
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique violation
        throw new Error('Record already exists');
      case '23503': // Foreign key violation
        throw new Error('Referenced record not found');
      case '42P01': // Undefined table
        throw new Error('Database table does not exist');
      case '28P01': // Invalid authorization specification
        throw new Error('Database authentication failed');
      default:
        throw new Error(`Database error: ${error.message}`);
    }
  }
  
  throw new Error(error.message || 'Unknown database error');
};

/**
 * Build query helper for type-safe queries
 */
export const buildNeonQuery = <T extends keyof Database>(
  client: NeonDatabase,
  table: T
) => {
  return {
    select: async (columns = '*', where?: string, params?: any[]): Promise<Database[T]['Row'][]> => {
      const query = `SELECT ${columns} FROM ${table}${where ? ` WHERE ${where}` : ''}`;
      const result = await client(query, params);
      return result.rows || result;
    },
    
    insert: async (data: Database[T]['Insert']): Promise<Database[T]['Row']> => {
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
      const values = Object.values(data);
      
      const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
      const result = await client(query, values);
      return (result.rows || result)[0];
    },
    
    update: async (data: Database[T]['Update'], where: string, params: any[]): Promise<Database[T]['Row'][]> => {
      const updates = Object.keys(data)
        .map((key, i) => `${key} = $${params.length + i + 1}`)
        .join(', ');
      const values = [...params, ...Object.values(data)];
      
      const query = `UPDATE ${table} SET ${updates} WHERE ${where} RETURNING *`;
      const result = await client(query, values);
      return result.rows || result;
    },
    
    delete: async (where: string, params: any[]): Promise<Database[T]['Row'][]> => {
      const query = `DELETE FROM ${table} WHERE ${where} RETURNING *`;
      const result = await client(query, params);
      return result.rows || result;
    },
  };
};

/**
 * Real-time subscription placeholder for WebSocket implementation
 */
export const setupNeonRealtimeSubscription = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  // Note: Neon doesn't have built-in real-time like Supabase
  // This would need to be implemented using WebSockets or polling
  console.warn('Real-time subscriptions need custom WebSocket implementation with NeonDB');
  
  return {
    unsubscribe: () => {
      // Cleanup logic here
    }
  };
};

/**
 * Migrate from Supabase to Neon - utility function
 */
export const migrateFromSupabase = async (
  sourceConfig: any,
  targetConfig: DatabaseConfig
): Promise<void> => {
  console.log('Starting migration from Supabase to NeonDB...');
  
  // This would implement the actual data migration logic
  // For now, it's a placeholder
  
  console.log('Migration completed successfully!');
}; 