// packages/database/src/index.ts
// OmniPanel Database Package - Main exports

// Configuration
export { 
  createDatabaseConfig, 
  validateDatabaseConfig,
  getDatabaseUrl,
  isProductionDatabase,
  getAuthConfig,
  isNeonConfigured,
  isSupabaseConfigured,
  DatabaseProvider,
  type DatabaseConfig 
} from '@omnipanel/config';

// Main database client (universal)
export {
  initializeDatabase,
  getDatabaseClient,
  getDatabasePool,
  testDatabaseConnection,
  getDatabaseHealth,
  executeTransaction,
  buildQuery,
  handleDatabaseError,
  setupRealtimeSubscription,
  migrateToNeon,
  type Database,
  type DatabaseClient,
  type DatabasePool,
} from './client';

// NeonDB-specific exports
export {
  createNeonClient,
  createNeonPool,
  getNeonClient,
  getNeonPool,
  testNeonConnection,
  getNeonHealth,
  executeNeonTransaction,
  buildNeonQuery,
  handleNeonError,
  setupNeonRealtimeSubscription,
  migrateFromSupabase,
  type NeonDatabase,
  type NeonPool,
} from './neon-client';

// Database types
export type {
  User as DatabaseUser,
  DatabaseProject,
  DatabaseChatSession,
  DatabaseMessage,
  DatabaseFile,
  DatabaseProjectMember,
  DatabaseFileVersion,
} from '@omnipanel/types';

// Re-export all database modules
export * from './client';
export * from './models';
export * from './queries';

// Import main classes for convenience
import type { DatabaseConfig } from '@omnipanel/config';
import { 
  initializeDatabase,
  getDatabaseHealth,
  testDatabaseConnection,
  type DatabaseClient 
} from './client';

// Main database service interface
export interface DatabaseService {
  client: DatabaseClient;
  pool?: any; // NeonDB pool for server-side operations
  
  // Health monitoring
  testConnection: () => Promise<boolean>;
  getHealth: () => Promise<any>;
}

// Create database service function
export const createDatabaseService = (config: DatabaseConfig): DatabaseService => {
  const { client, pool } = initializeDatabase(config);
  
  return {
    client,
    pool,
    testConnection: testDatabaseConnection,
    getHealth: getDatabaseHealth,
  };
};

// Singleton database service
let databaseService: DatabaseService | null = null;

export const getDatabaseService = (config?: DatabaseConfig): DatabaseService => {
  if (!databaseService && config) {
    databaseService = createDatabaseService(config);
  }
  
  if (!databaseService) {
    throw new Error('Database service not initialized. Call getDatabaseService with config first.');
  }
  
  return databaseService;
};

export const resetDatabaseService = (): void => {
  databaseService = null;
};

// Database health check and monitoring
export const getDatabaseStatus = async (config: DatabaseConfig) => {
  const { client } = initializeDatabase(config);
  
  const health = await getDatabaseHealth();
  const connection = await testDatabaseConnection();
  
  return {
    health,
    connection,
    config: {
      provider: config.provider,
      projectId: config.provider === 'neon' ? config.neon?.projectId : config.supabase?.project_id,
    },
  };
};