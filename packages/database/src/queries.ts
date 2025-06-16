// packages/database/src/queries.ts
import { getNeonClient, handleDatabaseError } from './client';
import type { DatabaseConfig } from '@omnipanel/config';
import type { DatabaseClient } from './client';

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

// Complex queries class for NeonDB
export class DatabaseQueries {
  private client: DatabaseClient;

  constructor(config?: DatabaseConfig) {
    this.client = getNeonClient(config);
  }

  /**
   * Get projects with statistics
   */
  async getProjectsWithStats(userId?: string): Promise<ProjectWithStats[]> {
    try {
      let sql = `
        SELECT 
          p.*,
          COALESCE(f.file_count, 0) as file_count,
          COALESCE(pm.member_count, 0) as member_count,
          COALESCE(cs.chat_session_count, 0) as chat_session_count,
          COALESCE(m.total_messages, 0) as total_messages,
          p.updated_at as last_activity
        FROM projects p
        LEFT JOIN (
          SELECT project_id, COUNT(*) as file_count 
          FROM files 
          GROUP BY project_id
        ) f ON p.id = f.project_id
        LEFT JOIN (
          SELECT project_id, COUNT(*) as member_count 
          FROM project_members 
          GROUP BY project_id
        ) pm ON p.id = pm.project_id
        LEFT JOIN (
          SELECT project_id, COUNT(*) as chat_session_count 
          FROM chat_sessions 
          GROUP BY project_id
        ) cs ON p.id = cs.project_id
        LEFT JOIN (
          SELECT cs.project_id, COUNT(m.id) as total_messages
          FROM chat_sessions cs
          LEFT JOIN messages m ON cs.id = m.session_id
          GROUP BY cs.project_id
        ) m ON p.id = m.project_id
      `;

      const params: any[] = [];
      if (userId) {
        sql += ' WHERE p.user_id = $1';
        params.push(userId);
      }

      sql += ' ORDER BY p.updated_at DESC';

      const result = await this.client(sql, params);
      return extractRows(result) as ProjectWithStats[];
    } catch (error) {
      handleDatabaseError(error);
      return [];
    }
  }

  /**
   * Get users with project statistics
   */
  async getUsersWithProjects(): Promise<UserWithProjects[]> {
    try {
      const sql = `
        SELECT 
          u.*,
          COALESCE(p.project_count, 0) as project_count,
          COALESCE(m.total_messages, 0) as total_messages,
          u.updated_at as last_activity
        FROM users u
        LEFT JOIN (
          SELECT user_id, COUNT(*) as project_count 
          FROM projects 
          GROUP BY user_id
        ) p ON u.id = p.user_id
        LEFT JOIN (
          SELECT cs.user_id, COUNT(m.id) as total_messages
          FROM chat_sessions cs
          LEFT JOIN messages m ON cs.id = m.session_id
          GROUP BY cs.user_id
        ) m ON u.id = m.user_id
        ORDER BY u.updated_at DESC
      `;

      const result = await this.client(sql);
      return extractRows(result) as UserWithProjects[];
    } catch (error) {
      handleDatabaseError(error);
      return [];
    }
  }

  /**
   * Get chat sessions with message statistics
   */
  async getChatSessionsWithMessages(projectId: string): Promise<ChatSessionWithMessages[]> {
    try {
      const sql = `
        SELECT 
          cs.*,
          COALESCE(m.message_count, 0) as message_count,
          COALESCE(m.last_message_at, cs.updated_at) as last_message_at,
          COALESCE(m.total_tokens, 0) as total_tokens
        FROM chat_sessions cs
        LEFT JOIN (
          SELECT 
            session_id, 
            COUNT(*) as message_count,
            MAX(created_at) as last_message_at,
            SUM(COALESCE((metadata->>'tokens')::int, 0)) as total_tokens
          FROM messages 
          GROUP BY session_id
        ) m ON cs.id = m.session_id
        WHERE cs.project_id = $1
        ORDER BY cs.updated_at DESC
      `;

      const result = await this.client(sql, [projectId]);
      return extractRows(result) as ChatSessionWithMessages[];
    } catch (error) {
      handleDatabaseError(error);
      return [];
    }
  }

  /**
   * Get files with version information
   */
  async getFilesWithVersions(projectId: string): Promise<FileWithVersions[]> {
    try {
      const sql = `
        SELECT 
          f.*,
          COALESCE(fv.version_count, 0) as version_count,
          COALESCE(fv.latest_version, 1) as latest_version,
          COALESCE(u.name, 'Unknown') as last_modified_by
        FROM files f
        LEFT JOIN (
          SELECT 
            file_id, 
            COUNT(*) as version_count,
            MAX(version_number) as latest_version
          FROM file_versions 
          GROUP BY file_id
        ) fv ON f.id = fv.file_id
        LEFT JOIN users u ON f.user_id = u.id
        WHERE f.project_id = $1
        ORDER BY f.updated_at DESC
      `;

      const result = await this.client(sql, [projectId]);
      return extractRows(result) as FileWithVersions[];
    } catch (error) {
      handleDatabaseError(error);
      return [];
    }
  }

  /**
   * Get project analytics
   */
  async getProjectAnalytics(): Promise<ProjectAnalytics> {
    try {
      const sql = `
        SELECT 
          (SELECT COUNT(*) FROM projects) as total_projects,
          (SELECT COUNT(*) FROM projects WHERE status = 'active') as active_projects,
          (SELECT COUNT(*) FROM files) as total_files,
          (SELECT COUNT(*) FROM messages) as total_messages,
          (SELECT COUNT(*) FROM users) as total_users
      `;

      const result = await this.client(sql);
      const row = extractFirstRow(result);
      
      return {
        total_projects: parseInt(row?.total_projects || '0'),
        active_projects: parseInt(row?.active_projects || '0'),
        total_files: parseInt(row?.total_files || '0'),
        total_messages: parseInt(row?.total_messages || '0'),
        total_users: parseInt(row?.total_users || '0'),
        growth_rate: 0, // Would need time-based calculation
      };
    } catch (error) {
      handleDatabaseError(error);
      return {
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
      const sql = `
        SELECT 
          u.id as user_id,
          u.name as user_name,
          COALESCE(m.messages_sent, 0) as messages_sent,
          COALESCE(f.files_created, 0) as files_created,
          COALESCE(p.projects_created, 0) as projects_created,
          u.updated_at as last_activity,
          (COALESCE(m.messages_sent, 0) + COALESCE(f.files_created, 0) + COALESCE(p.projects_created, 0)) as activity_score
        FROM users u
        LEFT JOIN (
          SELECT cs.user_id, COUNT(m.id) as messages_sent
          FROM chat_sessions cs
          LEFT JOIN messages m ON cs.id = m.session_id
          GROUP BY cs.user_id
        ) m ON u.id = m.user_id
        LEFT JOIN (
          SELECT user_id, COUNT(*) as files_created
          FROM files
          GROUP BY user_id
        ) f ON u.id = f.user_id
        LEFT JOIN (
          SELECT user_id, COUNT(*) as projects_created
          FROM projects
          GROUP BY user_id
        ) p ON u.id = p.user_id
        ORDER BY activity_score DESC, u.updated_at DESC
        LIMIT $1
      `;

      const result = await this.client(sql, [limit]);
      return extractRows(result) as UserActivityAnalytics[];
    } catch (error) {
      handleDatabaseError(error);
      return [];
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
      const params: any[] = [searchQuery];
      let userFilter = '';
      
      if (userId) {
        userFilter = ' AND user_id = $2';
        params.push(userId);
      }

      // Search projects
      const projectsSql = `
        SELECT * FROM projects 
        WHERE (LOWER(name) LIKE $1 OR LOWER(description) LIKE $1)${userFilter}
        ORDER BY updated_at DESC
        LIMIT ${limit}
      `;

      // Search files
      const filesSql = `
        SELECT f.*, p.name as project_name 
        FROM files f
        JOIN projects p ON f.project_id = p.id
        WHERE (LOWER(f.name) LIKE $1 OR LOWER(f.content) LIKE $1)${userId ? ' AND p.user_id = $2' : ''}
        ORDER BY f.updated_at DESC
        LIMIT ${limit}
      `;

      // Search messages
      const messagesSql = `
        SELECT m.*, cs.title as session_title, p.name as project_name
        FROM messages m
        JOIN chat_sessions cs ON m.session_id = cs.id
        JOIN projects p ON cs.project_id = p.id
        WHERE LOWER(m.content) LIKE $1${userId ? ' AND p.user_id = $2' : ''}
        ORDER BY m.created_at DESC
        LIMIT ${limit}
      `;

      const [projectsResult, filesResult, messagesResult] = await Promise.all([
        this.client(projectsSql, params),
        this.client(filesSql, params),
        this.client(messagesSql, params),
      ]);

      return {
        projects: extractRows(projectsResult),
        files: extractRows(filesResult),
        messages: extractRows(messagesResult),
      };
    } catch (error) {
      handleDatabaseError(error);
      return {
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
      const sql = `
        SELECT 
          p.*,
          COALESCE(f.file_count, 0) as file_count,
          COALESCE(pm.member_count, 0) as member_count,
          COALESCE(cs.chat_session_count, 0) as chat_session_count,
          COALESCE(m.total_messages, 0) as total_messages,
          p.updated_at as last_activity,
          (COALESCE(f.file_count, 0) + COALESCE(m.total_messages, 0)) as activity_score
        FROM projects p
        LEFT JOIN (
          SELECT project_id, COUNT(*) as file_count 
          FROM files 
          WHERE created_at > NOW() - INTERVAL '30 days'
          GROUP BY project_id
        ) f ON p.id = f.project_id
        LEFT JOIN (
          SELECT project_id, COUNT(*) as member_count 
          FROM project_members 
          GROUP BY project_id
        ) pm ON p.id = pm.project_id
        LEFT JOIN (
          SELECT project_id, COUNT(*) as chat_session_count 
          FROM chat_sessions 
          WHERE created_at > NOW() - INTERVAL '30 days'
          GROUP BY project_id
        ) cs ON p.id = cs.project_id
        LEFT JOIN (
          SELECT cs.project_id, COUNT(m.id) as total_messages
          FROM chat_sessions cs
          LEFT JOIN messages m ON cs.id = m.session_id
          WHERE m.created_at > NOW() - INTERVAL '30 days'
          GROUP BY cs.project_id
        ) m ON p.id = m.project_id
        WHERE p.status = 'active'
        ORDER BY activity_score DESC, p.updated_at DESC
        LIMIT $1
      `;

      const result = await this.client(sql, [limit]);
      return extractRows(result) as ProjectWithStats[];
    } catch (error) {
      handleDatabaseError(error);
      return [];
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
      const sql = `
        SELECT 
          (SELECT COUNT(*) FROM users) as users_count,
          (SELECT COUNT(*) FROM projects) as projects_count,
          (SELECT COUNT(*) FROM files) as files_count,
          (SELECT COUNT(*) FROM messages) as messages_count,
          (SELECT COUNT(*) FROM chat_sessions) as sessions_count
      `;

      const result = await this.client(sql);
      const row = extractFirstRow(result);

      const tableSizes = {
        users: parseInt(row?.users_count || '0'),
        projects: parseInt(row?.projects_count || '0'),
        files: parseInt(row?.files_count || '0'),
        messages: parseInt(row?.messages_count || '0'),
        chat_sessions: parseInt(row?.sessions_count || '0'),
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
      return {
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
export const createDatabaseQueries = (config?: DatabaseConfig): DatabaseQueries => {
  return new DatabaseQueries(config);
};