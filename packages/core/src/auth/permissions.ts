// packages/core/src/auth/permissions.ts
import type {
  User,
  Project,
  ProjectMember,
  UserRole,
  ProjectRole,
  Permission,
  Resource,
  Action,
  DatabaseUser,
  DatabaseProject
} from '@omnipanel/types';
import { DatabaseClient } from '@/database/client';
import { CoreError, ErrorCodes } from '@/utils/errors';

export class PermissionsService {
  private db: DatabaseClient;

  // Define role hierarchy (higher number = more permissions)
  private readonly roleHierarchy: Record<UserRole, number> = {
    'viewer': 0,
    'editor': 1,
    'user': 2,
    'moderator': 3,
    'owner': 4,
    'admin': 5
  };

  private readonly projectRoleHierarchy: Record<ProjectRole, number> = {
    'viewer': 1,
    'contributor': 2,
    'editor': 3,
    'admin': 4,
    'owner': 5
  };

  // Permission definitions
  private readonly permissions: Record<string, Permission[]> = {
    // User permissions
    'user': [
      { resource: 'profile', actions: ['read', 'update'] },
      { resource: 'project', actions: ['create', 'read'] },
      { resource: 'chat', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'file', actions: ['create', 'read', 'update', 'delete'] }
    ],
    'admin': [
      { resource: '*', actions: ['*'] }
    ],

    // Project-specific permissions
    'project_viewer': [
      { resource: 'project', actions: ['read'] },
      { resource: 'chat', actions: ['read'] },
      { resource: 'file', actions: ['read'] }
    ],
    'project_contributor': [
      { resource: 'project', actions: ['read'] },
      { resource: 'chat', actions: ['create', 'read', 'update'] },
      { resource: 'file', actions: ['create', 'read', 'update'] }
    ],
    'project_editor': [
      { resource: 'project', actions: ['read', 'update'] },
      { resource: 'chat', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'file', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'settings', actions: ['read', 'update'] }
    ],
    'project_admin': [
      { resource: 'project', actions: ['read', 'update', 'delete'] },
      { resource: 'chat', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'file', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'settings', actions: ['read', 'update'] },
      { resource: 'user', actions: ['create', 'read', 'update', 'delete'] }
    ],
    'project_owner': [
      { resource: '*', actions: ['*'] }
    ]
  };

  constructor(database: DatabaseClient) {
    this.db = database;
  }

  /**
   * Check if user has permission for a specific action on a resource
   */
  async hasPermission(
    userId: string,
    resource: Resource,
    action: Action,
    context?: { projectId?: string; resourceId?: string }
  ): Promise<boolean> {
    try {
      const user = await this.db.users.findById(userId);
      if (!user) {
        return false;
      }

      // Admin has all permissions (assuming 'user' role for now since role is not in database schema)
      // TODO: Add role field to database schema
      const userRole = 'user' as UserRole; // Default role

      // Check global permissions first
      const hasGlobalPermission = this.checkGlobalPermission(userRole, resource, action);
      if (hasGlobalPermission) {
        return true;
      }

      // Check project-specific permissions if context is provided
      if (context?.projectId) {
        const hasProjectPermission = await this.checkProjectPermission(
          userId,
          context.projectId,
          resource,
          action,
          context.resourceId
        );
        if (hasProjectPermission) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  /**
   * Check if user can access a specific resource
   */
  async canAccess(
    userId: string,
    resource: Resource,
    resourceId: string,
    action: Action = 'read'
  ): Promise<boolean> {
    try {
      // For project resources, check project membership
      if (resource === 'project') {
        return await this.canAccessProject(userId, resourceId, action);
      }

      // For other resources, check if they belong to user's projects
      const projectId = await this.getResourceProjectId(resource, resourceId);
      if (projectId) {
        return await this.hasPermission(userId, resource, action, { projectId });
      }

      // Check global permission
      return await this.hasPermission(userId, resource, action);
    } catch (error) {
      console.error('Access check failed:', error);
      return false;
    }
  }

  /**
   * Get user's role in a specific project
   */
  async getUserProjectRole(userId: string, projectId: string): Promise<ProjectRole | null> {
    try {
      // TODO: Implement findByUserAndProject method in database package
      // For now, return null
      return null;
    } catch (error) {
      console.error('Failed to get user project role:', error);
      return null;
    }
  }

  /**
   * Check if user can perform action in project
   */
  async canPerformInProject(
    userId: string,
    projectId: string,
    resource: Resource,
    action: Action
  ): Promise<boolean> {
    const role = await this.getUserProjectRole(userId, projectId);
    if (!role) {
      return false;
    }

    return this.checkProjectPermission(userId, projectId, resource, action);
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string, projectId?: string): Promise<Permission[]> {
    try {
      const user = await this.db.users.findById(userId);
      if (!user) {
        return [];
      }

      // Default to 'user' role since role is not in database schema yet
      const userRole = 'user' as UserRole;
      let permissions = this.permissions[userRole] || [];

      // Add project-specific permissions
      if (projectId) {
        const projectRole = await this.getUserProjectRole(userId, projectId);
        if (projectRole) {
          const projectPermissions = this.permissions[`project_${projectRole}`] || [];
          permissions = [...permissions, ...projectPermissions];
        }
      }

      return this.deduplicatePermissions(permissions);
    } catch (error) {
      console.error('Failed to get user permissions:', error);
      return [];
    }
  }

  /**
   * Check if user has higher or equal role than required
   */
  hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
    return this.roleHierarchy[userRole] >= this.roleHierarchy[requiredRole];
  }

  /**
   * Check if user has higher or equal project role than required
   */
  hasMinimumProjectRole(userRole: ProjectRole, requiredRole: ProjectRole): boolean {
    return this.projectRoleHierarchy[userRole] >= this.projectRoleHierarchy[requiredRole];
  }

  /**
   * Validate project member permissions
   */
  async validateProjectMemberAction(
    actorId: string,
    targetUserId: string,
    projectId: string,
    action: 'invite' | 'remove' | 'change_role'
  ): Promise<boolean> {
    try {
      const actorRole = await this.getUserProjectRole(actorId, projectId);
      const targetRole = await this.getUserProjectRole(targetUserId, projectId);

      if (!actorRole) {
        return false;
      }

      // Only admins and owners can manage members
      if (!this.hasMinimumProjectRole(actorRole, 'admin')) {
        return false;
      }

      // Can't modify owner unless you're owner
      if (targetRole === 'owner' && actorRole !== 'owner') {
        return false;
      }

      // Can't promote someone to owner unless you're owner
      if (action === 'change_role' && actorRole !== 'owner') {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to validate project member action:', error);
      return false;
    }
  }

  /**
   * Check global permission
   */
  private checkGlobalPermission(role: UserRole, resource: Resource, action: Action): boolean {
    const rolePermissions = this.permissions[role] || [];
    
    return rolePermissions.some(permission => {
      const resourceMatch = permission.resource === '*' || permission.resource === resource;
      const actionMatch = permission.actions.includes('*') || permission.actions.includes(action);
      return resourceMatch && actionMatch;
    });
  }

  /**
   * Check project-specific permission
   */
  private async checkProjectPermission(
    userId: string,
    projectId: string,
    resource: Resource,
    action: Action,
    resourceId?: string
  ): Promise<boolean> {
    try {
      const projectRole = await this.getUserProjectRole(userId, projectId);
      if (!projectRole) {
        return false;
      }

      const rolePermissions = this.permissions[`project_${projectRole}`] || [];
      
      const hasPermission = rolePermissions.some(permission => {
        const resourceMatch = permission.resource === '*' || permission.resource === resource;
        const actionMatch = permission.actions.includes('*') || permission.actions.includes(action);
        return resourceMatch && actionMatch;
      });

      if (!hasPermission) {
        return false;
      }

      // Additional checks for resource ownership
      if (resourceId && resource !== 'project') {
        return await this.checkResourceOwnership(userId, resource, resourceId);
      }

      return true;
    } catch (error) {
      console.error('Project permission check failed:', error);
      return false;
    }
  }

  /**
   * Check if user can access a specific project
   */
  private async canAccessProject(userId: string, projectId: string, action: Action): Promise<boolean> {
    try {
      const project = await this.db.projects.findById(projectId);
      if (!project) {
        return false;
      }

      // Owner always has access
      if (project.user_id === userId) {
        return true;
      }

      // TODO: Check membership once project members are implemented
      return false;
    } catch (error) {
      console.error('Project access check failed:', error);
      return false;
    }
  }

  /**
   * Get project ID for a resource
   */
  private async getResourceProjectId(resource: Resource, resourceId: string): Promise<string | null> {
    try {
      switch (resource) {
        case 'chat':
          const session = await this.db.chatSessions.findById(resourceId);
          return session?.project_id || null;
        
        case 'file':
          const file = await this.db.files.findById(resourceId);
          return file?.project_id || null;
        
        default:
          return null;
      }
    } catch (error) {
      console.error('Failed to get resource project ID:', error);
      return null;
    }
  }

  /**
   * Check resource ownership for user-owned resources
   */
  private async checkResourceOwnership(
    userId: string,
    resource: Resource,
    resourceId: string
  ): Promise<boolean> {
    try {
      switch (resource) {
        case 'chat':
          const session = await this.db.chatSessions.findById(resourceId);
          return session?.user_id === userId;
        
        case 'file':
          // Files are owned by projects, not individual users
          // Check if user has access to the project that owns the file
          const file = await this.db.files.findById(resourceId);
          if (!file) return false;
          
          return await this.canAccessProject(userId, file.project_id, 'read');
        
        default:
          return true; // Default to allowing access if ownership can't be determined
      }
    } catch (error) {
      console.error('Resource ownership check failed:', error);
      return false;
    }
  }

  /**
   * Remove duplicate permissions
   */
  private deduplicatePermissions(permissions: Permission[]): Permission[] {
    const seen = new Set<string>();
    const result: Permission[] = [];

    for (const permission of permissions) {
      const key = `${permission.resource}:${permission.actions.join(',')}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(permission);
      }
    }

    return result;
  }

  /**
   * Create a permission check middleware function
   */
  createPermissionMiddleware(resource: Resource, action: Action) {
    return async (userId: string, context?: { projectId?: string; resourceId?: string }): Promise<boolean> => {
      return await this.hasPermission(userId, resource, action, context);
    };
  }

  /**
   * Batch permission check for multiple resources
   */
  async checkMultiplePermissions(
    userId: string,
    checks: Array<{ resource: Resource; action: Action; context?: { projectId?: string; resourceId?: string } }>
  ): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    await Promise.all(
      checks.map(async (check, index) => {
        const key = `${check.resource}_${check.action}_${index}`;
        results[key] = await this.hasPermission(userId, check.resource, check.action, check.context);
      })
    );

    return results;
  }
}