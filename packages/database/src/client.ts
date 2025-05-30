// packages/database/src/client.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
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

// Database schema type for Supabase
export interface Database {
  public: {
    Tables: {
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Supabase client type
export type SupabaseDatabase = SupabaseClient<Database>;

// Client instances
let supabaseClient: SupabaseDatabase | null = null;
let supabaseServiceClient: SupabaseDatabase | null = null;

/**
 * Create Supabase client (public/anon key)
 */
export const createSupabaseClient = (config: DatabaseConfig): SupabaseDatabase => {
  if (!config.supabase.url || !config.supabase.anon_key) {
    throw new Error('Supabase URL and anonymous key are required');
  }

  const client = createClient<Database>(
    config.supabase.url,
    config.supabase.anon_key,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      global: {
        headers: {
          'X-Client-Info': 'omnipanel-database',
        },
      },
    }
  );

  return client;
};

/**
 * Create Supabase service client (service role key)
 */
export const createSupabaseServiceClient = (config: DatabaseConfig): SupabaseDatabase => {
  if (!config.supabase.url || !config.supabase.service_role_key) {
    throw new Error('Supabase URL and service role key are required');
  }

  const client = createClient<Database>(
    config.supabase.url,
    config.supabase.service_role_key,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          'X-Client-Info': 'omnipanel-database-service',
        },
      },
    }
  );

  return client;
};

/**
 * Get or create the public Supabase client
 */
export const getSupabaseClient = (config?: DatabaseConfig): SupabaseDatabase => {
  if (!supabaseClient && config) {
    supabaseClient = createSupabaseClient(config);
  }
  
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call getSupabaseClient with config first.');
  }
  
  return supabaseClient;
};

/**
 * Get or create the service Supabase client
 */
export const getSupabaseServiceClient = (config?: DatabaseConfig): SupabaseDatabase => {
  if (!supabaseServiceClient && config) {
    supabaseServiceClient = createSupabaseServiceClient(config);
  }
  
  if (!supabaseServiceClient) {
    throw new Error('Supabase service client not initialized. Call getSupabaseServiceClient with config first.');
  }
  
  return supabaseServiceClient;
};

/**
 * Initialize database clients
 */
export const initializeDatabase = (config: DatabaseConfig): {
  client: SupabaseDatabase;
  serviceClient: SupabaseDatabase;
} => {
  supabaseClient = createSupabaseClient(config);
  supabaseServiceClient = createSupabaseServiceClient(config);
  
  return {
    client: supabaseClient,
    serviceClient: supabaseServiceClient,
  };
};

/**
 * Test database connection
 */
export const testDatabaseConnection = async (client: SupabaseDatabase): Promise<boolean> => {
  try {
    const { error } = await client
      .from('users')
      .select('id')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

/**
 * Get database health status
 */
export const getDatabaseHealth = async (client: SupabaseDatabase): Promise<{
  connected: boolean;
  latency: number;
  error?: string;
}> => {
  const startTime = Date.now();
  
  try {
    const { error } = await client
      .from('users')
      .select('id')
      .limit(1);
    
    const latency = Date.now() - startTime;
    
    if (error) {
      return {
        connected: false,
        latency,
        error: error.message,
      };
    }
    
    return {
      connected: true,
      latency,
    };
  } catch (error) {
    return {
      connected: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Set up real-time subscriptions
 */
export const setupRealtimeSubscription = (
  client: SupabaseDatabase,
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  const channel = client
    .channel(`realtime:${table}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: filter,
      },
      callback
    )
    .subscribe();

  return {
    unsubscribe: () => {
      client.removeChannel(channel);
    },
  };
};

/**
 * Execute a transaction
 */
export const executeTransaction = async <T>(
  client: SupabaseDatabase,
  operations: (client: SupabaseDatabase) => Promise<T>
): Promise<T> => {
  // Note: Supabase doesn't have explicit transactions in the client
  // This is a wrapper for consistency and future enhancement
  try {
    return await operations(client);
  } catch (error) {
    // In a real implementation, you might want to implement
    // compensation logic or use Supabase Edge Functions for transactions
    throw error;
  }
};

/**
 * Batch operations utility
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
 * Handle database errors
 */
export const handleDatabaseError = (error: any): never => {
  console.error('Database error:', error);
  
  if (error?.code === 'PGRST116') {
    throw new Error('Record not found');
  }
  
  if (error?.code === '23505') {
    throw new Error('Record already exists');
  }
  
  if (error?.code === '23503') {
    throw new Error('Referenced record does not exist');
  }
  
  throw new Error(error?.message || 'Database operation failed');
};

/**
 * Query builder helper
 */
export const buildQuery = (client: SupabaseDatabase, table: string) => {
  return {
    select: (columns: string = '*') => client.from(table).select(columns),
    insert: (data: any) => client.from(table).insert(data),
    update: (data: any) => client.from(table).update(data),
    delete: () => client.from(table).delete(),
    upsert: (data: any) => client.from(table).upsert(data),
  };
};