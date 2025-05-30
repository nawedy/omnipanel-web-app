// packages/config/src/index.ts
// Main configuration exports

// Export all types and utilities from each module
export * from './environments';
export * from './database';
export * from './app';
export * from './auth';
export * from './ai';

// Create default configuration instances
import { createAuthConfig } from './auth';
import { createDatabaseConfig } from './database';
import { createAppConfig } from './app';
import { createAIConfig } from './ai';

// Export default configuration instances
export const authConfig = createAuthConfig();
export const databaseConfig = createDatabaseConfig();
export const appConfig = createAppConfig();
export const aiConfig = createAIConfig();

// Export configuration factory functions
export { 
  createAuthConfig,
  createDatabaseConfig,
  createAppConfig,
  createAIConfig
}; 