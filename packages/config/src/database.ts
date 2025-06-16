// packages/config/src/database.ts
import { z } from 'zod';

// Database provider - only NeonDB now
export const DatabaseProvider = z.enum(['neon']);

// Database configuration schema
export const DatabaseConfigSchema = z.object({
  // Database provider selection - only neon
  provider: DatabaseProvider.default('neon'),
  
  // NeonDB configuration
  neon: z.object({
    connectionString: z.string().min(1),
    projectId: z.string().min(1).optional(),
    branchId: z.string().min(1).optional(),
    database: z.string().default('neondb'),
    pooling: z.boolean().default(true),
  }),
  
  // Authentication configuration
  auth: z.object({
    stack_project_id: z.string().min(1).optional(),
    stack_publishable_key: z.string().min(1).optional(),
    stack_secret_key: z.string().min(1).optional(),
    jwt_secret: z.string().min(1).optional(),
    session_duration: z.number().default(7 * 24 * 60 * 60), // 7 days in seconds
  }).optional(),
  
  // Connection pool settings
  pool: z.object({
    min: z.number().default(0),
    max: z.number().default(10),
    idleTimeoutMillis: z.number().default(30000),
    connectionTimeoutMillis: z.number().default(2000),
  }).optional(),
  
  // SSL configuration
  ssl: z.object({
    rejectUnauthorized: z.boolean().default(true),
    ca: z.string().optional(),
    cert: z.string().optional(),
    key: z.string().optional(),
  }).optional(),
  
  // Migration settings
  migrations: z.object({
    directory: z.string().default('./migrations'),
    tableName: z.string().default('migrations'),
    schemaName: z.string().default('public'),
  }).optional(),
}).refine((data) => {
  // Ensure NeonDB configuration is provided
  return data.neon?.connectionString;
}, {
  message: "NeonDB connection string is required",
  path: ["neon", "connectionString"]
});

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

// Default database configuration
export const getDefaultDatabaseConfig = (): DatabaseConfig => ({
  provider: 'neon',
  neon: {
    connectionString: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '',
    projectId: process.env.NEON_PROJECT_ID,
    branchId: process.env.NEON_BRANCH_ID,
    database: process.env.NEON_DATABASE || 'neondb',
    pooling: process.env.NEON_POOLING !== 'false',
  },
  auth: {
    stack_project_id: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
    stack_publishable_key: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
    stack_secret_key: process.env.STACK_SECRET_SERVER_KEY,
    jwt_secret: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
    session_duration: parseInt(process.env.SESSION_DURATION || '604800'), // 7 days
  },
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '0'),
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
  },
  ssl: {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
  },
  migrations: {
    directory: process.env.MIGRATIONS_DIR || './migrations',
    tableName: process.env.MIGRATIONS_TABLE || 'migrations',
    schemaName: process.env.MIGRATIONS_SCHEMA || 'public',
  },
});

// Create database configuration from environment variables
export const createDatabaseConfig = (): DatabaseConfig => {
  return getDefaultDatabaseConfig();
};

// Validate database configuration
export const validateDatabaseConfig = (config: unknown): DatabaseConfig => {
  return DatabaseConfigSchema.parse(config);
};

// Get database URL from configuration
export const getDatabaseUrl = (config: DatabaseConfig): string => {
  return config.neon.connectionString;
};

// Check if database is in production mode
export const isDatabaseProduction = (config: DatabaseConfig): boolean => {
  const url = getDatabaseUrl(config);
  return url.includes('neon.tech') && !url.includes('localhost');
};

// Get database name from configuration
export const getDatabaseName = (config: DatabaseConfig): string => {
  return config.neon.database;
};

// Check if NeonDB is configured
export const isNeonConfigured = (config: DatabaseConfig): boolean => {
  return !!config.neon?.connectionString;
};

// Database connection status
export type DatabaseStatus = 'connected' | 'disconnected' | 'error' | 'connecting';

// Database connection info
export interface DatabaseConnectionInfo {
  status: DatabaseStatus;
  provider: 'neon';
  database: string;
  host?: string;
  port?: number;
  ssl?: boolean;
  poolSize?: number;
  lastConnected?: Date;
  error?: string;
}

// Get connection info from config
export const getConnectionInfo = (config: DatabaseConfig): Omit<DatabaseConnectionInfo, 'status' | 'lastConnected' | 'error'> => {
  const url = new URL(config.neon.connectionString);
  
  return {
    provider: 'neon',
    database: config.neon.database,
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    ssl: config.ssl?.rejectUnauthorized !== false,
    poolSize: config.pool?.max || 10,
  };
};