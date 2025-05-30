// packages/core/src/database/client.ts
import { 
  createDatabaseService,
  type DatabaseService,
  UserRepository,
  ProjectRepository,
  MessageRepository,
  FileRepository
} from '@omnipanel/database';
import { createDatabaseConfig } from '@omnipanel/config';

export class DatabaseClient {
  private databaseService: DatabaseService;

  constructor() {
    const config = createDatabaseConfig();
    this.databaseService = createDatabaseService(config);
  }

  get users(): UserRepository {
    return this.databaseService.users;
  }

  get projects(): ProjectRepository {
    return this.databaseService.projects;
  }

  get projectMembers() {
    return this.databaseService.projectMembers;
  }

  get projectInvites() {
    // Return a placeholder for now - will need to implement
    return this.databaseService.repositories.projects; // Temporary
  }

  get chatSessions() {
    return this.databaseService.chatSessions;
  }

  get messages(): MessageRepository {
    return this.databaseService.messages;
  }

  get files(): FileRepository {
    return this.databaseService.files;
  }

  get fileVersions() {
    return this.databaseService.fileVersions;
  }

  get notebooks() {
    // Return a placeholder for now - will need to implement
    return this.databaseService.repositories.files; // Temporary
  }

  get userSessions() {
    // Return a placeholder for now - will need to implement
    return this.databaseService.repositories.users; // Temporary
  }

  get securityLogs() {
    // Return a placeholder for now - will need to implement
    return this.databaseService.repositories.users; // Temporary
  }

  // Expose the underlying service for advanced usage
  get service(): DatabaseService {
    return this.databaseService;
  }
}