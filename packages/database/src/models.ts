// packages/database/src/models.ts
import type { SupabaseDatabase } from './client';
import { handleDatabaseError } from './client';
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

// Generic CRUD operations
export class BaseRepository<T extends BaseModel, InsertT, UpdateT> {
  constructor(
    protected client: SupabaseDatabase,
    protected tableName: string
  ) {}

  async findById(id: string): Promise<T | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        handleDatabaseError(error);
      }

      return data as T;
    } catch (error) {
      handleDatabaseError(error);
    }
    return null;
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
      let query = this.client.from(this.tableName).select('*');

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1);
      }

      const { data, error } = await query;

      if (error) handleDatabaseError(error);

      return (data as T[]) || [];
    } catch (error) {
      handleDatabaseError(error);
    }
    return [];
  }

  async create(data: InsertT): Promise<T> {
    try {
      const { data: result, error } = await this.client
        .from(this.tableName)
        .insert(data as any)
        .select()
        .single();

      if (error) handleDatabaseError(error);

      return result as T;
    } catch (error) {
      handleDatabaseError(error);
    }
    throw new Error('Failed to create record');
  }

  async update(id: string, data: UpdateT): Promise<T> {
    try {
      const { data: result, error } = await this.client
        .from(this.tableName)
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) handleDatabaseError(error);

      return result as T;
    } catch (error) {
      handleDatabaseError(error);
    }
    throw new Error('Failed to update record');
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) handleDatabaseError(error);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async count(filters: Record<string, any> = {}): Promise<number> {
    try {
      let query = this.client
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { count, error } = await query;

      if (error) handleDatabaseError(error);

      return count || 0;
    } catch (error) {
      handleDatabaseError(error);
    }
    return 0;
  }
}

// User repository
export class UserRepository extends BaseRepository<
  DatabaseUser,
  Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>,
  Partial<Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>>
> {
  constructor(client: SupabaseDatabase) {
    super(client, 'users');
  }

  async findByEmail(email: string): Promise<DatabaseUser | null> {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        handleDatabaseError(error);
      }

      return data;
    } catch (error) {
      handleDatabaseError(error);
    }
    return null;
  }

  async updatePreferences(
    userId: string, 
    preferences: DatabaseUser['preferences']
  ): Promise<DatabaseUser> {
    return this.update(userId, { preferences });
  }

  async updateSubscriptionTier(
    userId: string, 
    tier: DatabaseUser['subscription_tier']
  ): Promise<DatabaseUser> {
    return this.update(userId, { subscription_tier: tier });
  }
}

// Project repository
export class ProjectRepository extends BaseRepository<
  DatabaseProject,
  Omit<DatabaseProject, 'id' | 'created_at' | 'updated_at'>,
  Partial<Omit<DatabaseProject, 'id' | 'created_at' | 'updated_at'>>
> {
  constructor(client: SupabaseDatabase) {
    super(client, 'projects');
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
    return this.update(projectId, { settings });
  }
}

// Project member repository - using separate base class
export class BaseRepositoryMember<T extends BaseModelMember, InsertT, UpdateT> {
  constructor(
    protected client: SupabaseDatabase,
    protected tableName: string
  ) {}

  async findById(id: string): Promise<T | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        handleDatabaseError(error);
      }

      return data as T;
    } catch (error) {
      handleDatabaseError(error);
    }
    return null;
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
      let query = this.client.from(this.tableName).select('*');

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true });
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1);
      }

      const { data, error } = await query;

      if (error) handleDatabaseError(error);

      return (data as T[]) || [];
    } catch (error) {
      handleDatabaseError(error);
    }
    return [];
  }

  async create(data: InsertT): Promise<T> {
    try {
      const { data: result, error } = await this.client
        .from(this.tableName)
        .insert(data as any)
        .select()
        .single();

      if (error) handleDatabaseError(error);

      return result as T;
    } catch (error) {
      handleDatabaseError(error);
    }
    throw new Error('Failed to create record');
  }

  async update(id: string, data: UpdateT): Promise<T> {
    try {
      const { data: result, error } = await this.client
        .from(this.tableName)
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) handleDatabaseError(error);

      return result as T;
    } catch (error) {
      handleDatabaseError(error);
    }
    throw new Error('Failed to update record');
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) handleDatabaseError(error);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async count(filters: Record<string, any> = {}): Promise<number> {
    try {
      let query = this.client
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { count, error } = await query;

      if (error) handleDatabaseError(error);

      return count || 0;
    } catch (error) {
      handleDatabaseError(error);
    }
    return 0;
  }
}

export class ProjectMemberRepository extends BaseRepositoryMember<
  DatabaseProjectMember,
  Omit<DatabaseProjectMember, 'id' | 'joined_at'>,
  Partial<Omit<DatabaseProjectMember, 'id' | 'joined_at'>>
> {
  constructor(client: SupabaseDatabase) {
    super(client, 'project_members');
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
      const { data, error } = await this.client
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        handleDatabaseError(error);
      }

      return data;
    } catch (error) {
      handleDatabaseError(error);
    }
    return null;
  }

  async updateRole(
    projectId: string, 
    userId: string, 
    role: DatabaseProjectMember['role']
  ): Promise<DatabaseProjectMember> {
    try {
      const { data, error } = await this.client
        .from('project_members')
        .update({ role })
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) handleDatabaseError(error);

      return data;
    } catch (error) {
      handleDatabaseError(error);
    }
    throw new Error('Failed to update role');
  }
}

// Chat session repository
export class ChatSessionRepository extends BaseRepository<
  DatabaseChatSession,
  Omit<DatabaseChatSession, 'id' | 'created_at' | 'updated_at'>,
  Partial<Omit<DatabaseChatSession, 'id' | 'created_at' | 'updated_at'>>
> {
  constructor(client: SupabaseDatabase) {
    super(client, 'chat_sessions');
  }

  async findByProjectId(projectId: string): Promise<DatabaseChatSession[]> {
    return this.findMany({ project_id: projectId });
  }

  async findByUserId(userId: string): Promise<DatabaseChatSession[]> {
    return this.findMany({ user_id: userId });
  }

  async updateTitle(sessionId: string, title: string): Promise<DatabaseChatSession> {
    return this.update(sessionId, { title });
  }
}

// Message repository - using separate base class for models without updated_at
export class BaseRepositoryWithoutUpdate<T extends BaseModelWithoutUpdate, InsertT, UpdateT> {
  constructor(
    protected client: SupabaseDatabase,
    protected tableName: string
  ) {}

  async findById(id: string): Promise<T | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        handleDatabaseError(error);
      }

      return data as T;
    } catch (error) {
      handleDatabaseError(error);
    }
    return null;
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
      let query = this.client.from(this.tableName).select('*');

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true });
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1);
      }

      const { data, error } = await query;

      if (error) handleDatabaseError(error);

      return (data as T[]) || [];
    } catch (error) {
      handleDatabaseError(error);
    }
    return [];
  }

  async create(data: InsertT): Promise<T> {
    try {
      const { data: result, error } = await this.client
        .from(this.tableName)
        .insert(data as any)
        .select()
        .single();

      if (error) handleDatabaseError(error);

      return result as T;
    } catch (error) {
      handleDatabaseError(error);
    }
    throw new Error('Failed to create record');
  }

  async update(id: string, data: UpdateT): Promise<T> {
    try {
      const { data: result, error } = await this.client
        .from(this.tableName)
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) handleDatabaseError(error);

      return result as T;
    } catch (error) {
      handleDatabaseError(error);
    }
    throw new Error('Failed to update record');
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) handleDatabaseError(error);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async count(filters: Record<string, any> = {}): Promise<number> {
    try {
      let query = this.client
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { count, error } = await query;

      if (error) handleDatabaseError(error);

      return count || 0;
    } catch (error) {
      handleDatabaseError(error);
    }
    return 0;
  }
}

// Message repository
export class MessageRepository extends BaseRepositoryWithoutUpdate<
  DatabaseMessage,
  Omit<DatabaseMessage, 'id' | 'created_at'>,
  Partial<Omit<DatabaseMessage, 'id' | 'created_at'>>
> {
  constructor(client: SupabaseDatabase) {
    super(client, 'messages');
  }

  async findBySessionId(sessionId: string): Promise<DatabaseMessage[]> {
    return this.findMany({ session_id: sessionId }, { orderBy: 'created_at' });
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
  constructor(client: SupabaseDatabase) {
    super(client, 'files');
  }

  async findByProjectId(projectId: string): Promise<DatabaseFile[]> {
    return this.findMany({ project_id: projectId });
  }

  async findByPath(projectId: string, path: string): Promise<DatabaseFile | null> {
    try {
      const { data, error } = await this.client
        .from('files')
        .select('*')
        .eq('project_id', projectId)
        .eq('path', path)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        handleDatabaseError(error);
      }

      return data;
    } catch (error) {
      handleDatabaseError(error);
    }
    return null;
  }

  async findByParentId(parentId: string): Promise<DatabaseFile[]> {
    return this.findMany({ parent_id: parentId });
  }

  async updateContent(fileId: string, content: string): Promise<DatabaseFile> {
    return this.update(fileId, { content });
  }
}

// File version repository
export class FileVersionRepository extends BaseRepositoryWithoutUpdate<
  DatabaseFileVersion,
  Omit<DatabaseFileVersion, 'id' | 'created_at'>,
  Partial<Omit<DatabaseFileVersion, 'id' | 'created_at'>>
> {
  constructor(client: SupabaseDatabase) {
    super(client, 'file_versions');
  }

  async findByFileId(fileId: string): Promise<DatabaseFileVersion[]> {
    return this.findMany({ file_id: fileId }, { orderBy: 'version_number', ascending: false });
  }

  async getLatestVersion(fileId: string): Promise<DatabaseFileVersion | null> {
    try {
      const { data, error } = await this.client
        .from('file_versions')
        .select('*')
        .eq('file_id', fileId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        handleDatabaseError(error);
      }

      return data;
    } catch (error) {
      handleDatabaseError(error);
    }
    return null;
  }
}

// Repository factory
export class RepositoryFactory {
  constructor(private client: SupabaseDatabase) {}

  get users(): UserRepository {
    return new UserRepository(this.client);
  }

  get projects(): ProjectRepository {
    return new ProjectRepository(this.client);
  }

  get projectMembers(): ProjectMemberRepository {
    return new ProjectMemberRepository(this.client);
  }

  get chatSessions(): ChatSessionRepository {
    return new ChatSessionRepository(this.client);
  }

  get messages(): MessageRepository {
    return new MessageRepository(this.client);
  }

  get files(): FileRepository {
    return new FileRepository(this.client);
  }

  get fileVersions(): FileVersionRepository {
    return new FileVersionRepository(this.client);
  }
}

// Create repository factory
export const createRepositoryFactory = (client: SupabaseDatabase): RepositoryFactory => {
  return new RepositoryFactory(client);
};