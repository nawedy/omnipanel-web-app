// packages/database/src/index.ts
// OmniPanel Database Package - Main exports

// Configuration types only
export type { DatabaseConfig } from '@omnipanel/config';

// Main database client
export {
  initializeDatabase,
  getDatabaseClient,
  getDatabasePool,
  testDatabaseConnection,
  getDatabaseHealth,
  executeTransaction,
  batchOperations,
  buildQuery,
  handleDatabaseError,
  setupRealtimeSubscription,
  getDatabaseConfig,
  resetDatabaseConnection,
  // NeonDB-specific functions
  createNeonClient,
  createNeonPool,
  getNeonClient,
  getNeonPool,
  extractRows,
  extractFirstRow,
  type Database,
  type DatabaseClient,
  type DatabasePool,
} from './client';

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

// Export specific repository classes for convenience
export {
  UserRepository,
  ProjectRepository,
  MessageRepository,
  FileRepository,
  ChatSessionRepository,
  ProjectMemberRepository,
  FileVersionRepository,
  RepositoryFactory
} from './models';

// Service exports
export { AnalyticsService } from './services/analytics';
export { SalesService } from './services/sales';

// Additional type exports for better compatibility
export type {
  AnalyticsEvent,
  AnalyticsMetrics,
  PageMetrics
} from './services/analytics';

export type {
  Sale,
  Customer,
  Product,
  SalesMetrics
} from './services/sales';

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
  initializeDatabase(config);
  
  const health = await getDatabaseHealth();
  const connection = await testDatabaseConnection();
  
  return {
    health,
    connection,
    config: {
      provider: 'neon', // NeonDB PostgreSQL
      projectId: 'yellow-snow-91973663', // Would need actual config
    },
  };
};