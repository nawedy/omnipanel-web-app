// packages/database/src/index.ts

// Re-export all database modules
export * from './client';
export * from './models';
export * from './queries';

// Import main classes for convenience
import type { DatabaseConfig } from '@omnipanel/config';
import { 
  initializeDatabase, 
  type SupabaseDatabase 
} from './client';
import { ChatSessionRepository, createRepositoryFactory, FileRepository, FileVersionRepository, MessageRepository, ProjectMemberRepository, ProjectRepository, UserRepository, type RepositoryFactory } from './models';
import { createDatabaseQueries, type DatabaseQueries } from './queries';

// Main database service interface
// packages/database/src/index.ts - UPDATE THE DatabaseService INTERFACE

export interface DatabaseService {
  client: SupabaseDatabase;
  serviceClient: SupabaseDatabase;
  repositories: RepositoryFactory;
  queries: DatabaseQueries;
  
  // Add convenience properties for backward compatibility
  users: UserRepository;
  projects: ProjectRepository;
  projectMembers: ProjectMemberRepository;
  chatSessions: ChatSessionRepository;
  messages: MessageRepository;
  files: FileRepository;
  fileVersions: FileVersionRepository;
}

// Update createDatabaseService function
export const createDatabaseService = (config: DatabaseConfig): DatabaseService => {
  const { client, serviceClient } = initializeDatabase(config);
  const repositories = createRepositoryFactory(client);
  const queries = createDatabaseQueries(client);
  
  return {
    client,
    serviceClient,
    repositories,
    queries,
    
    // Add convenience properties
    users: repositories.users,
    projects: repositories.projects,
    projectMembers: repositories.projectMembers,
    chatSessions: repositories.chatSessions,
    messages: repositories.messages,
    files: repositories.files,
    fileVersions: repositories.fileVersions,
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

// Export types
export type {
  SupabaseDatabase,
  RepositoryFactory,
  DatabaseQueries,
};

// Export repository classes
export {
  UserRepository,
  ProjectRepository,
  MessageRepository,
  FileRepository,
} from './models';

// Export query result types
export type {
  ProjectWithStats,
  UserWithProjects,
  ProjectAnalytics,
} from './queries';