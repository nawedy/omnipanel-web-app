// packages/config/src/database.ts
import { z } from 'zod';

// Database provider enum
export const DatabaseProvider = z.enum(['neon', 'supabase']);
export type DatabaseProvider = z.infer<typeof DatabaseProvider>;

// Database configuration schema
export const DatabaseConfigSchema = z.object({
  // Database provider selection
  provider: DatabaseProvider.default('neon'),
  
  // NeonDB configuration (primary)
  neon: z.object({
    connectionString: z.string().min(1),
    projectId: z.string().min(1).optional(),
    branchId: z.string().min(1).optional(),
    database: z.string().default('neondb'),
    pooling: z.boolean().default(true),
  }).optional(),
  
  // Supabase configuration (legacy support)
  supabase: z.object({
    url: z.string().url(),
    anon_key: z.string().min(1),
    service_role_key: z.string().min(1).optional(),
    project_id: z.string().min(1).optional(),
  }).optional(),
  
  // Authentication configuration
  auth: z.object({
    stack_project_id: z.string().min(1).optional(),
    stack_publishable_key: z.string().min(1).optional(),
    stack_secret_key: z.string().min(1).optional(),
    jwks_url: z.string().url().optional(),
  }).default({}),
  
  // Connection settings
  connection: z.object({
    pool_size: z.number().positive().default(20),
    timeout_ms: z.number().positive().default(5000),
    idle_timeout_ms: z.number().positive().default(30000),
    max_retries: z.number().nonnegative().default(3),
    retry_delay_ms: z.number().positive().default(1000),
    max_uses: z.number().positive().default(7500),
  }).default({}),
  
  // Performance settings
  performance: z.object({
    enable_realtime: z.boolean().default(false), // Custom implementation needed for Neon
    enable_row_level_security: z.boolean().default(true),
    enable_query_logging: z.boolean().default(false),
    slow_query_threshold_ms: z.number().positive().default(1000),
    enable_connection_pooling: z.boolean().default(true),
    cache_connections: z.boolean().default(true),
  }).default({}),
  
  // Backup and monitoring
  backup: z.object({
    enable_auto_backup: z.boolean().default(false),
    backup_interval_hours: z.number().positive().default(24),
    retention_days: z.number().positive().default(30),
    backup_location: z.string().optional(),
  }).default({}),
});

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

// Create database configuration from environment variables
export const createDatabaseConfig = (): DatabaseConfig => {
  const provider = (process.env.DATABASE_PROVIDER || 'neon') as DatabaseProvider;
  
  const config = {
    provider,
    
    neon: {
      connectionString: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL,
      projectId: process.env.NEON_PROJECT_ID,
      branchId: process.env.NEON_BRANCH_ID,
      database: process.env.NEON_DATABASE || 'neondb',
      pooling: process.env.NEON_POOLING !== 'false',
    },
    
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
      anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
      service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY,
      project_id: process.env.SUPABASE_PROJECT_ID,
    },
    
    auth: {
      stack_project_id: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
      stack_publishable_key: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
      stack_secret_key: process.env.STACK_SECRET_SERVER_KEY,
      jwks_url: process.env.STACK_JWKS_URL,
    },
    
    connection: {
      pool_size: parseInt(process.env.DB_POOL_SIZE || '20'),
      timeout_ms: parseInt(process.env.DB_TIMEOUT_MS || '5000'),
      idle_timeout_ms: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000'),
      max_retries: parseInt(process.env.DB_MAX_RETRIES || '3'),
      retry_delay_ms: parseInt(process.env.DB_RETRY_DELAY_MS || '1000'),
      max_uses: parseInt(process.env.DB_MAX_USES || '7500'),
    },
    
    performance: {
      enable_realtime: process.env.DB_ENABLE_REALTIME === 'true',
      enable_row_level_security: process.env.DB_ENABLE_RLS !== 'false',
      enable_query_logging: process.env.DB_ENABLE_QUERY_LOGGING === 'true',
      slow_query_threshold_ms: parseInt(process.env.DB_SLOW_QUERY_THRESHOLD_MS || '1000'),
      enable_connection_pooling: process.env.DB_ENABLE_POOLING !== 'false',
      cache_connections: process.env.DB_CACHE_CONNECTIONS !== 'false',
    },
    
    backup: {
      enable_auto_backup: process.env.DB_ENABLE_AUTO_BACKUP === 'true',
      backup_interval_hours: parseInt(process.env.DB_BACKUP_INTERVAL_HOURS || '24'),
      retention_days: parseInt(process.env.DB_RETENTION_DAYS || '30'),
      backup_location: process.env.DB_BACKUP_LOCATION,
    },
  };

  return DatabaseConfigSchema.parse(config);
};

// Validate database configuration
export const validateDatabaseConfig = (config: unknown): DatabaseConfig => {
  try {
    return DatabaseConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Database configuration validation failed:');
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw new Error('Invalid database configuration');
  }
};

// Get database URL for different environments
export const getDatabaseUrl = (config: DatabaseConfig): string => {
  if (config.provider === 'neon' && config.neon?.connectionString) {
    return config.neon.connectionString;
  }
  
  if (config.provider === 'supabase' && config.supabase?.url) {
    return config.supabase.url;
  }
  
  throw new Error(`No connection URL found for provider: ${config.provider}`);
};

// Check if configuration is for production
export const isProductionDatabase = (config: DatabaseConfig): boolean => {
  const url = getDatabaseUrl(config);
  
  if (config.provider === 'neon') {
    return url.includes('neon.tech') && !url.includes('localhost');
  }
  
  if (config.provider === 'supabase') {
    return url.includes('supabase.co') && !url.includes('localhost');
  }
  
  return false;
};

// Get authentication configuration
export const getAuthConfig = (config: DatabaseConfig) => {
  return config.auth;
};

// Check if NeonDB is configured
export const isNeonConfigured = (config: DatabaseConfig): boolean => {
  return config.provider === 'neon' && !!config.neon?.connectionString;
};

// Check if Supabase is configured
export const isSupabaseConfigured = (config: DatabaseConfig): boolean => {
  return config.provider === 'supabase' && !!config.supabase?.url && !!config.supabase?.anon_key;
};