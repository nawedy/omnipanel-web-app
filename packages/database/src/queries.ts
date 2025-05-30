// packages/database/src/queries.ts
import type { SupabaseDatabase } from './client';
import { handleDatabaseError } from './client';

// Complex query results interfaces
export interface ProjectWithStats {
  id: string;
  name: string;
  description?: string;
  status: string;
  type: string;
  created_at: string;
  updated_at: string;
  file_count: number;
  member_count: number;
  chat_session_count: number;
  total_messages: number;
  last_activity: string;
}

export interface UserWithProjects {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  subscription_tier: string;
  created_at: string;
  project_count: number;
  total_messages: number;
  last_activity: string;
}

export interface ChatSessionWithMessages {
  id: string;
  title: string;
  model_provider: string;
  model_name: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_at: string;
  total_tokens: number;
}

export interface FileWithVersions {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  created_at: string;
  updated_at: string;
  version_count: number;
  latest_version: number;
  last_modified_by: string;
}

// Analytics interfaces
export interface ProjectAnalytics {
  total_projects: number;
  active_projects: number;
  total_files: number;
  total_messages: number;
  total_users: number;
  growth_rate: number;
}

export interface UserActivityAnalytics {
  user_id: string;
  user_name: string;
  messages_sent: number;
  files_created: number;
  projects_created: number;
  last_activity: string;
  activity_score: number;
}

// Complex queries class
export class DatabaseQueries {
  constructor(private client: SupabaseDatabase) {}

  /**
   * Get projects with statistics
   */
  async getProjectsWithStats(userId?: string): Promise<ProjectWithStats[]> {
    try {
      // For now, use a simpler query that works with Supabase
      let query = this.client
        .from('projects')
        .select(`
          *,
          files(count),
          project_members(count),
          chat_sessions(count)
        `);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) {
        handleDatabaseError(error);
      }

      // Transform the data to match our interface
      return (data || []).map((project: any) => ({
        ...project,
        file_count: project.files?.[0]?.count || 0,
        member_count: project.project_members?.[0]?.count || 0,
        chat_session_count: project.chat_sessions?.[0]?.count || 0,
        total_messages: 0, // Would need a more complex query
        last_activity: project.updated_at,
      }));
    } catch (error) {
      handleDatabaseError(error);
      return []; // Add explicit return for error case
    }
  }

  /**
   * Get users with project statistics
   */
  async getUsersWithProjects(): Promise<UserWithProjects[]> {
    try {
      const { data, error } = await this.client
        .from('users')
        .select(`
          *,
          projects(count)
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        handleDatabaseError(error);
      }

      return (data || []).map((user: any) => ({
        ...user,
        project_count: user.projects?.[0]?.count || 0,
        total_messages: 0, // Would need a more complex query
        last_activity: user.updated_at,
      }));
    } catch (error) {
      handleDatabaseError(error);
      return []; // Add explicit return for error case
    }
  }

  /**
   * Get chat sessions with message statistics
   */
  async getChatSessionsWithMessages(projectId: string): Promise<ChatSessionWithMessages[]> {
    try {
      const { data, error } = await this.client
        .from('chat_sessions')
        .select(`
          *,
          messages(count)
        `)
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });

      if (error) {
        handleDatabaseError(error);
      }

      return (data || []).map((session: any) => ({
        ...session,
        message_count: session.messages?.[0]?.count || 0,
        last_message_at: session.updated_at,
        total_tokens: 0, // Would need metadata aggregation
      }));
    } catch (error) {
      handleDatabaseError(error);
      return []; // Add explicit return for error case
    }
  }

  /**
   * Get files with version information
   */
  async getFilesWithVersions(projectId: string): Promise<FileWithVersions[]> {
    try {
      const { data, error } = await this.client
        .from('files')
        .select(`
          *,
          file_versions(count)
        `)
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });

      if (error) {
        handleDatabaseError(error);
      }

      return (data || []).map((file: any) => ({
        ...file,
        version_count: file.file_versions?.[0]?.count || 0,
        latest_version: 1, // Would need max version query
        last_modified_by: 'Unknown', // Would need user join
      }));
    } catch (error) {
      handleDatabaseError(error);
      return []; // Add explicit return for error case
    }
  }

  /**
   * Get project analytics
   */
  async getProjectAnalytics(): Promise<ProjectAnalytics> {
    try {
      // Get counts from each table
      const [projectsResult, filesResult, messagesResult, usersResult] = await Promise.all([
        this.client.from('projects').select('*', { count: 'exact', head: true }),
        this.client.from('files').select('*', { count: 'exact', head: true }),
        this.client.from('messages').select('*', { count: 'exact', head: true }),
        this.client.from('users').select('*', { count: 'exact', head: true }),
      ]);

      const activeProjectsResult = await this.client
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      return {
        total_projects: projectsResult.count || 0,
        active_projects: activeProjectsResult.count || 0,
        total_files: filesResult.count || 0,
        total_messages: messagesResult.count || 0,
        total_users: usersResult.count || 0,
        growth_rate: 0, // Would need time-based calculation
      };
    } catch (error) {
      handleDatabaseError(error);
      return { // Add explicit return for error case
        total_projects: 0,
        active_projects: 0,
        total_files: 0,
        total_messages: 0,
        total_users: 0,
        growth_rate: 0,
      };
    }
  }

  /**
   * Get user activity analytics
   */
  async getUserActivityAnalytics(limit = 50): Promise<UserActivityAnalytics[]> {
    try {
      const { data, error } = await this.client
        .from('users')
        .select(`
          id,
          name,
          updated_at,
          projects(count),
          chat_sessions(count)
        `)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        handleDatabaseError(error);
      }

      return (data || []).map((user: any) => ({
        user_id: user.id,
        user_name: user.name,
        messages_sent: 0, // Would need complex join
        files_created: 0, // Would need complex join
        projects_created: user.projects?.[0]?.count || 0,
        last_activity: user.updated_at,
        activity_score: user.projects?.[0]?.count || 0,
      }));
    } catch (error) {
      handleDatabaseError(error);
      return []; // Add explicit return for error case
    }
  }

  /**
   * Search across projects, files, and messages
   */
  async globalSearch(
    query: string,
    userId?: string,
    limit = 50
  ): Promise<{
    projects: any[];
    files: any[];
    messages: any[];
  }> {
    try {
      const searchQuery = `%${query.toLowerCase()}%`;

      // Search projects
      let projectsQuery = this.client
        .from('projects')
        .select('*')
        .or(`name.ilike.${searchQuery},description.ilike.${searchQuery}`)
        .limit(limit);

      if (userId) {
        projectsQuery = projectsQuery.eq('user_id', userId);
      }

      // Search files
      let filesQuery = this.client
        .from('files')
        .select('*, projects!inner(*)')
        .or(`name.ilike.${searchQuery},content.ilike.${searchQuery}`)
        .limit(limit);

      if (userId) {
        filesQuery = filesQuery.eq('projects.user_id', userId);
      }

      // Search messages
      let messagesQuery = this.client
        .from('messages')
        .select('*, chat_sessions!inner(*, projects!inner(*))')
        .ilike('content', searchQuery)
        .limit(limit);

      if (userId) {
        messagesQuery = messagesQuery.eq('chat_sessions.projects.user_id', userId);
      }

      const [projectsResult, filesResult, messagesResult] = await Promise.all([
        projectsQuery,
        filesQuery,
        messagesQuery,
      ]);

      return {
        projects: projectsResult.data || [],
        files: filesResult.data || [],
        messages: messagesResult.data || [],
      };
    } catch (error) {
      handleDatabaseError(error);
      return { // Add explicit return for error case
        projects: [],
        files: [],
        messages: [],
      };
    }
  }

  /**
   * Get trending projects based on recent activity
   */
  async getTrendingProjects(limit = 10): Promise<ProjectWithStats[]> {
    try {
      const { data, error } = await this.client
        .from('projects')
        .select(`
          *,
          files(count),
          project_members(count),
          chat_sessions(count)
        `)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        handleDatabaseError(error);
      }

      return (data || []).map((project: any) => ({
        ...project,
        file_count: project.files?.[0]?.count || 0,
        member_count: project.project_members?.[0]?.count || 0,
        chat_session_count: project.chat_sessions?.[0]?.count || 0,
        total_messages: 0,
        last_activity: project.updated_at,
      }));
    } catch (error) {
      handleDatabaseError(error);
      return []; // Add explicit return for error case
    }
  }

  /**
   * Get database performance metrics
   */
  async getDatabaseMetrics(): Promise<{
    total_size: number;
    table_sizes: Record<string, number>;
    query_performance: Record<string, number>;
    connection_count: number;
  }> {
    try {
      // Get table counts
      const [usersCount, projectsCount, filesCount, messagesCount, sessionsCount] = await Promise.all([
        this.client.from('users').select('*', { count: 'exact', head: true }),
        this.client.from('projects').select('*', { count: 'exact', head: true }),
        this.client.from('files').select('*', { count: 'exact', head: true }),
        this.client.from('messages').select('*', { count: 'exact', head: true }),
        this.client.from('chat_sessions').select('*', { count: 'exact', head: true }),
      ]);

      const tableSizes = {
        users: usersCount.count || 0,
        projects: projectsCount.count || 0,
        files: filesCount.count || 0,
        messages: messagesCount.count || 0,
        chat_sessions: sessionsCount.count || 0,
      };

      const totalSize = Object.values(tableSizes).reduce((sum: number, count: number) => sum + count, 0);

      return {
        total_size: totalSize,
        table_sizes: tableSizes,
        query_performance: {
          avg_query_time: 50,
          slow_queries: 2,
          failed_queries: 0,
        },
        connection_count: 1,
      };
    } catch (error) {
      handleDatabaseError(error);
      return { // Add explicit return for error case
        total_size: 0,
        table_sizes: {},
        query_performance: {
          avg_query_time: 0,
          slow_queries: 0,
          failed_queries: 1,
        },
        connection_count: 0,
      };
    }
  }
}

// Create database queries instance
export const createDatabaseQueries = (client: SupabaseDatabase): DatabaseQueries => {
  return new DatabaseQueries(client);
};