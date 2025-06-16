// packages/core/src/database/client.ts
import { 
  createDatabaseService,
  type DatabaseService
} from '@omnipanel/database';
// import { databaseConfig } from '@omnipanel/config'; // Temporarily disabled due to build issues

export class DatabaseClient {
  private databaseService: DatabaseService;

  constructor() {
    // Temporary inline config using correct NeonDB structure
    const config = {
      provider: 'neon' as const,
      neon: {
        connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '',
        projectId: process.env.NEON_PROJECT_ID,
        database: 'neondb',
        pooling: true,
      },
      auth: {
        stack_project_id: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
        stack_publishable_key: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
        stack_secret_key: process.env.STACK_SECRET_SERVER_KEY,
        session_duration: 604800, // 7 days in seconds
      },
    };
    this.databaseService = createDatabaseService(config);
  }

  // Simplified database access methods
  // TODO: Implement proper repository pattern once database package is fixed
  
  async testConnection(): Promise<boolean> {
    try {
      return await this.databaseService.testConnection();
    } catch {
      return false;
    }
  }

  async getHealth() {
    try {
      return await this.databaseService.getHealth();
    } catch (error) {
      return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Placeholder methods for compatibility
  get users(): any {
    return {}; // TODO: Implement when database package is fixed
  }

  get projects(): any {
    return {}; // TODO: Implement when database package is fixed
  }

  get projectMembers(): any {
    return {}; // TODO: Implement when database package is fixed
  }

  get projectInvites(): any {
    return {}; // TODO: Implement when database package is fixed
  }

  get chatSessions(): any {
    return {}; // TODO: Implement when database package is fixed
  }

  get messages(): any {
    return {}; // TODO: Implement when database package is fixed
  }

  get files(): any {
    return {}; // TODO: Implement when database package is fixed
  }

  get fileVersions(): any {
    return {}; // TODO: Implement when database package is fixed
  }

  get notebooks(): any {
    return {}; // TODO: Implement when database package is fixed
  }

  get userSessions(): any {
    return {}; // TODO: Implement when database package is fixed
  }

  get securityLogs(): any {
    return {}; // TODO: Implement when database package is fixed
  }

  // Expose the underlying service for advanced usage
  get service(): DatabaseService {
    return this.databaseService;
  }
}