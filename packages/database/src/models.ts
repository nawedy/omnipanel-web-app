// packages/database/src/models.ts
import { getNeonClient } from './client';
import type { DatabaseConfig } from '@omnipanel/config';
import type {
  DatabaseUser,
  DatabaseProject,
  DatabaseChatSession,
  DatabaseMessage,
  DatabaseFile,
  DatabaseProjectMember,
  DatabaseFileVersion,
} from '@omnipanel/types';

// Base model interfaces
export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface BaseModelWithoutUpdate {
  id: string;
  created_at: string;
}

export interface BaseModelMember {
  id: string;
  joined_at: string;
}

// Helper function to extract rows from neon result
const extractRows = (result: any): any[] => {
  if (Array.isArray(result)) return result;
  if (result && result.rows) return result.rows;
  return [];
};

const extractFirstRow = (result: any): any | null => {
  const rows = extractRows(result);
  return rows.length > 0 ? rows[0] : null;
};

// Generic CRUD operations for NeonDB
export class BaseRepository<T extends BaseModel, InsertT, UpdateT> {
  protected client;

  constructor(
    config?: DatabaseConfig,
    protected tableName: string = ''
  ) {
    this.client = getNeonClient(config);
  }

  async findById(id: string): Promise<T | null> {
    try {
      const result = await this.client(
        `SELECT * FROM ${this.tableName} WHERE id = $1`,
        [id]
      );
      return extractFirstRow(result) as T || null;
    } catch (error) {
      console.error(`Error finding ${this.tableName} by id:`, error);
      return null;
    }
  }

  async findMany(
    filters: Record<string, any> = {},
    options: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      ascending?: boolean;
    } = {}
  ): Promise<T[]> {
    try {
      let sql = `SELECT * FROM ${this.tableName}`;
      const values: any[] = [];
      let paramCount = 1;

      // Apply filters
      if (Object.keys(filters).length > 0) {
        const filterClauses = Object.entries(filters).map(([key, value]) => {
          values.push(value);
          return `${key} = $${paramCount++}`;
        });
        sql += ` WHERE ${filterClauses.join(' AND ')}`;
      }

      // Apply ordering
      if (options.orderBy) {
        sql += ` ORDER BY ${options.orderBy} ${options.ascending ? 'ASC' : 'DESC'}`;
      }

      // Apply pagination
      if (options.limit) {
        sql += ` LIMIT $${paramCount++}`;
        values.push(options.limit);
      }
      if (options.offset) {
        sql += ` OFFSET $${paramCount++}`;
        values.push(options.offset);
      }

      const result = await this.client(sql, values);
      return extractRows(result) as T[];
    } catch (error) {
      console.error(`Error finding ${this.tableName}:`, error);
      return [];
    }
  }

  async create(data: InsertT): Promise<T> {
    try {
      const keys = Object.keys(data as any);
      const values = Object.values(data as any);
      const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
      
      const sql = `
        INSERT INTO ${this.tableName} (${keys.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await this.client(sql, values);
      return extractFirstRow(result) as T;
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw new Error(`Failed to create ${this.tableName}`);
    }
  }

  async update(id: string, data: UpdateT): Promise<T> {
    try {
      const entries = Object.entries(data as any).filter(([, value]) => value !== undefined);
      const setClause = entries.map(([key], index) => `${key} = $${index + 2}`).join(', ');
              const values = [id, ...entries.map(([, value]) => value)];

      const sql = `
        UPDATE ${this.tableName} 
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await this.client(sql, values);
      return extractFirstRow(result) as T;
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw new Error(`Failed to update ${this.tableName}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.client(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw new Error(`Failed to delete ${this.tableName}`);
    }
  }

  async count(filters: Record<string, any> = {}): Promise<number> {
    try {
      let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
      const values: any[] = [];
      let paramCount = 1;

      if (Object.keys(filters).length > 0) {
        const filterClauses = Object.entries(filters).map(([key, value]) => {
          values.push(value);
          return `${key} = $${paramCount++}`;
        });
        sql += ` WHERE ${filterClauses.join(' AND ')}`;
      }

      const result = await this.client(sql, values);
      const row = extractFirstRow(result);
      return parseInt(row?.count || '0');
    } catch (error) {
      console.error(`Error counting ${this.tableName}:`, error);
      return 0;
    }
  }
}

// User repository
export class UserRepository extends BaseRepository<
  DatabaseUser,
  Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>,
  Partial<Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>>
> {
  constructor(config?: DatabaseConfig) {
    super(config, 'users');
  }

  async findByEmail(email: string): Promise<DatabaseUser | null> {
    try {
      const result = await this.client(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return extractFirstRow(result) as DatabaseUser || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async updatePreferences(
    userId: string, 
    preferences: DatabaseUser['preferences']
  ): Promise<DatabaseUser> {
    return this.update(userId, { preferences } as any);
  }

  async updateSubscriptionTier(
    userId: string, 
    tier: DatabaseUser['subscription_tier']
  ): Promise<DatabaseUser> {
    return this.update(userId, { subscription_tier: tier } as any);
  }
}

// Project repository
export class ProjectRepository extends BaseRepository<
  DatabaseProject,
  Omit<DatabaseProject, 'id' | 'created_at' | 'updated_at'>,
  Partial<Omit<DatabaseProject, 'id' | 'created_at' | 'updated_at'>>
> {
  constructor(config?: DatabaseConfig) {
    super(config, 'projects');
  }

  async findByUserId(userId: string): Promise<DatabaseProject[]> {
    return this.findMany({ user_id: userId });
  }

  async findByStatus(status: DatabaseProject['status']): Promise<DatabaseProject[]> {
    return this.findMany({ status });
  }

  async updateSettings(
    projectId: string, 
    settings: DatabaseProject['settings']
  ): Promise<DatabaseProject> {
    return this.update(projectId, { settings } as any);
  }
}

// Base repository for member tables (with joined_at instead of updated_at)
export class BaseRepositoryMember<T extends BaseModelMember, InsertT, UpdateT> {
  protected client;

  constructor(
    config?: DatabaseConfig,
    protected tableName: string = ''
  ) {
    this.client = getNeonClient(config);
  }

  async findById(id: string): Promise<T | null> {
    try {
      const result = await this.client(
        `SELECT * FROM ${this.tableName} WHERE id = $1`,
        [id]
      );
      return extractFirstRow(result) as T || null;
    } catch (error) {
      console.error(`Error finding ${this.tableName} by id:`, error);
      return null;
    }
  }

  async findMany(
    filters: Record<string, any> = {},
    options: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      ascending?: boolean;
    } = {}
  ): Promise<T[]> {
    try {
      let sql = `SELECT * FROM ${this.tableName}`;
      const values: any[] = [];
      let paramCount = 1;

      if (Object.keys(filters).length > 0) {
        const filterClauses = Object.entries(filters).map(([key, value]) => {
          values.push(value);
          return `${key} = $${paramCount++}`;
        });
        sql += ` WHERE ${filterClauses.join(' AND ')}`;
      }

      if (options.orderBy) {
        sql += ` ORDER BY ${options.orderBy} ${options.ascending ? 'ASC' : 'DESC'}`;
      }

      if (options.limit) {
        sql += ` LIMIT $${paramCount++}`;
        values.push(options.limit);
      }
      if (options.offset) {
        sql += ` OFFSET $${paramCount++}`;
        values.push(options.offset);
      }

      const result = await this.client(sql, values);
      return extractRows(result) as T[];
    } catch (error) {
      console.error(`Error finding ${this.tableName}:`, error);
      return [];
    }
  }

  async create(data: InsertT): Promise<T> {
    try {
      const keys = Object.keys(data as any);
      const values = Object.values(data as any);
      const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
      
      const sql = `
        INSERT INTO ${this.tableName} (${keys.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await this.client(sql, values);
      return extractFirstRow(result) as T;
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw new Error(`Failed to create ${this.tableName}`);
    }
  }

  async update(id: string, data: UpdateT): Promise<T> {
    try {
      const entries = Object.entries(data as any).filter(([, value]) => value !== undefined);
      const setClause = entries.map(([key], index) => `${key} = $${index + 2}`).join(', ');
      const values = [id, ...entries.map(([, value]) => value)];

      const sql = `
        UPDATE ${this.tableName} 
        SET ${setClause}
        WHERE id = $1
        RETURNING *
      `;

      const result = await this.client(sql, values);
      return extractFirstRow(result) as T;
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw new Error(`Failed to update ${this.tableName}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.client(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw new Error(`Failed to delete ${this.tableName}`);
    }
  }

  async count(filters: Record<string, any> = {}): Promise<number> {
    try {
      let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
      const values: any[] = [];
      let paramCount = 1;

      if (Object.keys(filters).length > 0) {
        const filterClauses = Object.entries(filters).map(([key, value]) => {
          values.push(value);
          return `${key} = $${paramCount++}`;
        });
        sql += ` WHERE ${filterClauses.join(' AND ')}`;
      }

      const result = await this.client(sql, values);
      const row = extractFirstRow(result);
      return parseInt(row?.count || '0');
    } catch (error) {
      console.error(`Error counting ${this.tableName}:`, error);
      return 0;
    }
  }
}

// Project member repository
export class ProjectMemberRepository extends BaseRepositoryMember<
  DatabaseProjectMember,
  Omit<DatabaseProjectMember, 'id' | 'joined_at'>,
  Partial<Omit<DatabaseProjectMember, 'id' | 'joined_at'>>
> {
  constructor(config?: DatabaseConfig) {
    super(config, 'project_members');
  }

  async findByProjectId(projectId: string): Promise<DatabaseProjectMember[]> {
    return this.findMany({ project_id: projectId });
  }

  async findByUserId(userId: string): Promise<DatabaseProjectMember[]> {
    return this.findMany({ user_id: userId });
  }

  async findMember(
    projectId: string, 
    userId: string
  ): Promise<DatabaseProjectMember | null> {
    try {
      const result = await this.client(
        'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, userId]
      );
      return extractFirstRow(result) as DatabaseProjectMember || null;
    } catch (error) {
      console.error('Error finding project member:', error);
      return null;
    }
  }

  async updateRole(
    projectId: string, 
    userId: string, 
    role: DatabaseProjectMember['role']
  ): Promise<DatabaseProjectMember> {
    try {
      const result = await this.client(
        'UPDATE project_members SET role = $3 WHERE project_id = $1 AND user_id = $2 RETURNING *',
        [projectId, userId, role]
      );
      return extractFirstRow(result) as DatabaseProjectMember;
    } catch (error) {
      console.error('Error updating member role:', error);
      throw new Error('Failed to update member role');
    }
  }
}

// Chat session repository
export class ChatSessionRepository extends BaseRepository<
  DatabaseChatSession,
  Omit<DatabaseChatSession, 'id' | 'created_at' | 'updated_at'>,
  Partial<Omit<DatabaseChatSession, 'id' | 'created_at' | 'updated_at'>>
> {
  constructor(config?: DatabaseConfig) {
    super(config, 'chat_sessions');
  }

  async findByProjectId(projectId: string): Promise<DatabaseChatSession[]> {
    return this.findMany({ project_id: projectId });
  }

  async findByUserId(userId: string): Promise<DatabaseChatSession[]> {
    return this.findMany({ user_id: userId });
  }

  async updateTitle(sessionId: string, title: string): Promise<DatabaseChatSession> {
    return this.update(sessionId, { title } as any);
  }
}

// Base repository for tables without updated_at
export class BaseRepositoryWithoutUpdate<T extends BaseModelWithoutUpdate, InsertT, UpdateT> {
  protected client;

  constructor(
    config?: DatabaseConfig,
    protected tableName: string = ''
  ) {
    this.client = getNeonClient(config);
  }

  async findById(id: string): Promise<T | null> {
    try {
      const result = await this.client(
        `SELECT * FROM ${this.tableName} WHERE id = $1`,
        [id]
      );
      return extractFirstRow(result) as T || null;
    } catch (error) {
      console.error(`Error finding ${this.tableName} by id:`, error);
      return null;
    }
  }

  async findMany(
    filters: Record<string, any> = {},
    options: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      ascending?: boolean;
    } = {}
  ): Promise<T[]> {
    try {
      let sql = `SELECT * FROM ${this.tableName}`;
      const values: any[] = [];
      let paramCount = 1;

      if (Object.keys(filters).length > 0) {
        const filterClauses = Object.entries(filters).map(([key, value]) => {
          values.push(value);
          return `${key} = $${paramCount++}`;
        });
        sql += ` WHERE ${filterClauses.join(' AND ')}`;
      }

      if (options.orderBy) {
        sql += ` ORDER BY ${options.orderBy} ${options.ascending ? 'ASC' : 'DESC'}`;
      }

      if (options.limit) {
        sql += ` LIMIT $${paramCount++}`;
        values.push(options.limit);
      }
      if (options.offset) {
        sql += ` OFFSET $${paramCount++}`;
        values.push(options.offset);
      }

      const result = await this.client(sql, values);
      return extractRows(result) as T[];
    } catch (error) {
      console.error(`Error finding ${this.tableName}:`, error);
      return [];
    }
  }

  async create(data: InsertT): Promise<T> {
    try {
      const keys = Object.keys(data as any);
      const values = Object.values(data as any);
      const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
      
      const sql = `
        INSERT INTO ${this.tableName} (${keys.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await this.client(sql, values);
      return extractFirstRow(result) as T;
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw new Error(`Failed to create ${this.tableName}`);
    }
  }

  async update(id: string, data: UpdateT): Promise<T> {
    try {
      const entries = Object.entries(data as any).filter(([, value]) => value !== undefined);
      const setClause = entries.map(([key], index) => `${key} = $${index + 2}`).join(', ');
      const values = [id, ...entries.map(([, value]) => value)];

      const sql = `
        UPDATE ${this.tableName} 
        SET ${setClause}
        WHERE id = $1
        RETURNING *
      `;

      const result = await this.client(sql, values);
      return extractFirstRow(result) as T;
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw new Error(`Failed to update ${this.tableName}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.client(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw new Error(`Failed to delete ${this.tableName}`);
    }
  }

  async count(filters: Record<string, any> = {}): Promise<number> {
    try {
      let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
      const values: any[] = [];
      let paramCount = 1;

      if (Object.keys(filters).length > 0) {
        const filterClauses = Object.entries(filters).map(([key, value]) => {
          values.push(value);
          return `${key} = $${paramCount++}`;
        });
        sql += ` WHERE ${filterClauses.join(' AND ')}`;
      }

      const result = await this.client(sql, values);
      const row = extractFirstRow(result);
      return parseInt(row?.count || '0');
    } catch (error) {
      console.error(`Error counting ${this.tableName}:`, error);
      return 0;
    }
  }
}

// Message repository
export class MessageRepository extends BaseRepositoryWithoutUpdate<
  DatabaseMessage,
  Omit<DatabaseMessage, 'id' | 'created_at'>,
  Partial<Omit<DatabaseMessage, 'id' | 'created_at'>>
> {
  constructor(config?: DatabaseConfig) {
    super(config, 'messages');
  }

  async findBySessionId(sessionId: string): Promise<DatabaseMessage[]> {
    return this.findMany({ session_id: sessionId }, { orderBy: 'created_at', ascending: true });
  }

  async findByRole(
    sessionId: string, 
    role: DatabaseMessage['role']
  ): Promise<DatabaseMessage[]> {
    return this.findMany({ session_id: sessionId, role });
  }
}

// File repository
export class FileRepository extends BaseRepository<
  DatabaseFile,
  Omit<DatabaseFile, 'id' | 'created_at' | 'updated_at'>,
  Partial<Omit<DatabaseFile, 'id' | 'created_at' | 'updated_at'>>
> {
  constructor(config?: DatabaseConfig) {
    super(config, 'files');
  }

  async findByProjectId(projectId: string): Promise<DatabaseFile[]> {
    return this.findMany({ project_id: projectId });
  }

  async findByPath(projectId: string, path: string): Promise<DatabaseFile | null> {
    try {
      const result = await this.client(
        'SELECT * FROM files WHERE project_id = $1 AND path = $2',
        [projectId, path]
      );
      return extractFirstRow(result) as DatabaseFile || null;
    } catch (error) {
      console.error('Error finding file by path:', error);
      return null;
    }
  }

  async findByParentId(parentId: string): Promise<DatabaseFile[]> {
    return this.findMany({ parent_id: parentId });
  }

  async updateContent(fileId: string, content: string): Promise<DatabaseFile> {
    return this.update(fileId, { content } as any);
  }
}

// File version repository
export class FileVersionRepository extends BaseRepositoryWithoutUpdate<
  DatabaseFileVersion,
  Omit<DatabaseFileVersion, 'id' | 'created_at'>,
  Partial<Omit<DatabaseFileVersion, 'id' | 'created_at'>>
> {
  constructor(config?: DatabaseConfig) {
    super(config, 'file_versions');
  }

  async findByFileId(fileId: string): Promise<DatabaseFileVersion[]> {
    return this.findMany({ file_id: fileId }, { orderBy: 'version_number', ascending: false });
  }

  async getLatestVersion(fileId: string): Promise<DatabaseFileVersion | null> {
    try {
      const result = await this.client(
        'SELECT * FROM file_versions WHERE file_id = $1 ORDER BY version_number DESC LIMIT 1',
        [fileId]
      );
      return extractFirstRow(result) as DatabaseFileVersion || null;
    } catch (error) {
      console.error('Error getting latest file version:', error);
      return null;
    }
  }
}

// Repository factory for NeonDB
export class RepositoryFactory {
  constructor(private config?: DatabaseConfig) {}

  get users(): UserRepository {
    return new UserRepository(this.config);
  }

  get projects(): ProjectRepository {
    return new ProjectRepository(this.config);
  }

  get projectMembers(): ProjectMemberRepository {
    return new ProjectMemberRepository(this.config);
  }

  get chatSessions(): ChatSessionRepository {
    return new ChatSessionRepository(this.config);
  }

  get messages(): MessageRepository {
    return new MessageRepository(this.config);
  }

  get files(): FileRepository {
    return new FileRepository(this.config);
  }

  get fileVersions(): FileVersionRepository {
    return new FileVersionRepository(this.config);
  }
}

export const createRepositoryFactory = (config?: DatabaseConfig): RepositoryFactory => {
  return new RepositoryFactory(config);
};