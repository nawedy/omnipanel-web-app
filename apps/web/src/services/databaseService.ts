/**
 * Database Service for the OmniPanel Web Application
 * Integrates with @omnipanel/database package to provide database functionality
 */

import { 
  createDatabaseService,
  type DatabaseService,
  type DatabaseConfig
} from '@omnipanel/database';

// Environment variables for database configuration
const DATABASE_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '';
const NEON_PROJECT_ID = process.env.NEON_PROJECT_ID || process.env.NEXT_PUBLIC_NEON_PROJECT_ID || '';
const NEON_API_KEY = process.env.NEON_API_KEY || '';

/**
 * Creates a database configuration based on environment variables
 * @returns DatabaseConfig object
 */
export function getOmniPanelDatabaseConfig(): DatabaseConfig {
  return {
    provider: 'neon',
    neon: {
      connectionString: DATABASE_URL,
      projectId: NEON_PROJECT_ID,
      database: 'neondb',
      pooling: true,
    },
    auth: {
      session_duration: 3600, // 1 hour in seconds
      stack_project_id: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
      stack_publishable_key: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
      stack_secret_key: process.env.STACK_SECRET_SERVER_KEY,
    },
    pool: {
      min: 0,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
  };
}

// Singleton instance of the database service
let dbServiceInstance: DatabaseService | null = null;

/**
 * Gets or creates the OmniPanel database service instance
 * @returns DatabaseService instance
 */
export function getOmniPanelDatabaseService(): DatabaseService {
  if (!dbServiceInstance) {
    const config = getOmniPanelDatabaseConfig();
    dbServiceInstance = createDatabaseService(config);
  }
  return dbServiceInstance;
}

/**
 * Tests the database connection
 * @returns Promise resolving to a boolean indicating connection status
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const dbService = getOmniPanelDatabaseService();
    return await dbService.testConnection();
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Gets the database health status
 * @returns Promise resolving to the database health information
 */
export async function getDatabaseHealth(): Promise<any> {
  try {
    const dbService = getOmniPanelDatabaseService();
    return await dbService.getHealth();
  } catch (error) {
    console.error('Failed to get database health:', error);
    return { status: 'error', error };
  }
}

/**
 * Resets the database service instance
 * Useful for testing or when configuration changes
 */
export function resetDatabaseService(): void {
  dbServiceInstance = null;
}

export default {
  getOmniPanelDatabaseService,
  testDatabaseConnection,
  getDatabaseHealth,
  resetDatabaseService,
};
