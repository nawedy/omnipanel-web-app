// packages/config/src/database.ts
import { z } from 'zod';

// Database configuration schema
export const DatabaseConfigSchema = z.object({
  // Supabase configuration
  supabase: z.object({
    url: z.string().url(),
    anon_key: z.string().min(1),
    service_role_key: z.string().min(1).optional(),
    project_id: z.string().min(1).optional(),
  }),
  
  // Connection settings
  connection: z.object({
    pool_size: z.number().positive().default(10),
    timeout_ms: z.number().positive().default(20000),
    idle_timeout_ms: z.number().positive().default(30000),
    max_retries: z.number().nonnegative().default(3),
    retry_delay_ms: z.number().positive().default(1000),
  }).default({}),
  
  // Performance settings
  performance: z.object({
    enable_realtime: z.boolean().default(true),
    enable_row_level_security: z.boolean().default(true),
    enable_query_logging: z.boolean().default(false),
    slow_query_threshold_ms: z.number().positive().default(1000),
  }).default({}),
  
  // Backup and sync
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
  const config = {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
      anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
      service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY,
      project_id: process.env.SUPABASE_PROJECT_ID,
    },
    
    connection: {
      pool_size: parseInt(process.env.DB_POOL_SIZE || '10'),
      timeout_ms: parseInt(process.env.DB_TIMEOUT_MS || '20000'),
      idle_timeout_ms: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000'),
      max_retries: parseInt(process.env.DB_MAX_RETRIES || '3'),
      retry_delay_ms: parseInt(process.env.DB_RETRY_DELAY_MS || '1000'),
    },
    
    performance: {
      enable_realtime: process.env.DB_ENABLE_REALTIME !== 'false',
      enable_row_level_security: process.env.DB_ENABLE_RLS !== 'false',
      enable_query_logging: process.env.DB_ENABLE_QUERY_LOGGING === 'true',
      slow_query_threshold_ms: parseInt(process.env.DB_SLOW_QUERY_THRESHOLD_MS || '1000'),
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

// Validate database connection
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
  return config.supabase.url;
};

// Check if configuration is for production
export const isProductionDatabase = (config: DatabaseConfig): boolean => {
  return config.supabase.url.includes('supabase.co') && 
         !config.supabase.url.includes('localhost');
};