// packages/core/src/auth/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import type { User, UserRole, Resource, Action, DatabaseUser } from '@omnipanel/types';
import { AuthService } from './auth.service';
import { PermissionsService } from './permissions';
import type { DatabaseClient } from '../database/client';
import { CoreError, ErrorCodes } from '../utils/errors';

export interface AuthContext {
  user: DatabaseUser;
  permissions: PermissionsService;
}

export interface AuthMiddlewareOptions {
  requiredRole?: UserRole;
  resource?: Resource;
  action?: Action;
  optional?: boolean;
  checkEmailVerification?: boolean;
}

export class AuthMiddleware {
  private authService: AuthService;
  private permissionsService: PermissionsService;

  constructor(database: DatabaseClient) {
    this.authService = new AuthService(database);
    this.permissionsService = new PermissionsService(database);
  }

  /**
   * Express/Next.js middleware for authentication
   */
  authenticate(options: AuthMiddlewareOptions = {}) {
    return async (req: NextRequest): Promise<NextResponse | { user: DatabaseUser; permissions: PermissionsService }> => {
      try {
        // Extract token from Authorization header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
          if (options.optional) {
            return NextResponse.next();
          }
          return this.unauthorizedResponse('Missing authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        if (!token) {
          if (options.optional) {
            return NextResponse.next();
          }
          return this.unauthorizedResponse('Invalid authorization format');
        }

        // Verify token and get user
        const user = await this.authService.verifyToken(token);

        // Check email verification if required (skip for now since not in database schema)
        // TODO: Add email verification check once implemented

        // Check required role (skip for now since role is not in database schema)
        // TODO: Add role check once role field is added to database schema

        // Check specific permission
        if (options.resource && options.action) {
          const hasPermission = await this.permissionsService.hasPermission(
            user.id,
            options.resource,
            options.action
          );
          if (!hasPermission) {
            return this.forbiddenResponse('Insufficient permissions for this action');
          }
        }

        // Return auth context for successful authentication
        return {
          user,
          permissions: this.permissionsService
        };
      } catch (error) {
        if (error instanceof CoreError) {
          return this.unauthorizedResponse(error.message);
        }
        return this.unauthorizedResponse('Authentication failed');
      }
    };
  }

  /**
   * Project-specific authentication middleware
   */
  authenticateProject(requiredRole?: string) {
    return async (
      req: NextRequest,
      projectId: string
    ): Promise<NextResponse | { user: DatabaseUser; permissions: PermissionsService; projectRole: string }> => {
      try {
        // First authenticate the user
        const authResult = await this.authenticate()(req);
        if (authResult instanceof NextResponse) {
          return authResult;
        }

        const { user, permissions } = authResult;

        // Check project access
        const canAccess = await permissions.canAccess(user.id, 'project', projectId);
        if (!canAccess) {
          return this.forbiddenResponse('Project access denied');
        }

        // Get project role
        const projectRole = await permissions.getUserProjectRole(user.id, projectId);
        if (!projectRole) {
          return this.forbiddenResponse('Not a project member');
        }

        // Check required project role
        if (requiredRole && !permissions.hasMinimumProjectRole(projectRole, requiredRole as any)) {
          return this.forbiddenResponse('Insufficient project permissions');
        }

        return {
          user,
          permissions,
          projectRole
        };
      } catch (error) {
        return this.unauthorizedResponse('Project authentication failed');
      }
    };
  }

  /**
   * Create a permission checker for specific resource and action
   */
  requirePermission(resource: Resource, action: Action) {
    return async (req: NextRequest, context?: { projectId?: string; resourceId?: string }) => {
      try {
        const authResult = await this.authenticate()(req);
        if (authResult instanceof NextResponse) {
          return authResult;
        }

        const { user, permissions } = authResult;

        const hasPermission = await permissions.hasPermission(user.id, resource, action, context);
        if (!hasPermission) {
          return this.forbiddenResponse(`Permission denied for ${action} on ${resource}`);
        }

        return { user, permissions };
      } catch (error) {
        return this.unauthorizedResponse('Permission check failed');
      }
    };
  }

  /**
   * Middleware for API routes with automatic error handling
   */
  withAuth(options: AuthMiddlewareOptions = {}) {
    return (handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>) => {
      return async (req: NextRequest): Promise<NextResponse> => {
        try {
          const authResult = await this.authenticate(options)(req);
          if (authResult instanceof NextResponse) {
            return authResult;
          }

          const { user, permissions } = authResult;
          return await handler(req, { user, permissions });
        } catch (error) {
          console.error('Auth middleware error:', error);
          return this.errorResponse('Internal server error');
        }
      };
    };
  }

  /**
   * Middleware for project-specific API routes
   */
  withProjectAuth(requiredRole?: string) {
    return (
      handler: (
        req: NextRequest,
        context: AuthContext & { projectRole: string },
        projectId: string
      ) => Promise<NextResponse>
    ) => {
      return async (req: NextRequest, { params }: { params: { projectId: string } }): Promise<NextResponse> => {
        try {
          const projectId = params.projectId;
          const authResult = await this.authenticateProject(requiredRole)(req, projectId);
          
          if (authResult instanceof NextResponse) {
            return authResult;
          }

          const { user, permissions, projectRole } = authResult;
          return await handler(req, { user, permissions, projectRole }, projectId);
        } catch (error) {
          console.error('Project auth middleware error:', error);
          return this.errorResponse('Internal server error');
        }
      };
    };
  }

  /**
   * Extract user from request (for use in server components)
   */
  async getUserFromRequest(req: NextRequest): Promise<DatabaseUser | null> {
    try {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return null;
      }

      const token = authHeader.replace('Bearer ', '');
      if (!token) {
        return null;
      }

      return await this.authService.verifyToken(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if request has valid authentication
   */
  async isAuthenticated(req: NextRequest): Promise<boolean> {
    const user = await this.getUserFromRequest(req);
    return user !== null;
  }

  /**
   * Get authorization context from request
   */
  async getAuthContext(req: NextRequest): Promise<AuthContext | null> {
    try {
      const user = await this.getUserFromRequest(req);
      if (!user) {
        return null;
      }

      return {
        user,
        permissions: this.permissionsService
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Response helpers
   */
  private unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
    return NextResponse.json(
      { error: message, code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  private forbiddenResponse(message: string = 'Forbidden'): NextResponse {
    return NextResponse.json(
      { error: message, code: 'FORBIDDEN' },
      { status: 403 }
    );
  }

  private errorResponse(message: string = 'Internal Server Error'): NextResponse {
    return NextResponse.json(
      { error: message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * Utility functions for common authentication patterns
 */

/**
 * Check if user is admin
 */
export const isAdmin = (user: DatabaseUser): boolean => {
  // TODO: Add role check once role field is added to database schema
  return false; // Default to false for now
};

/**
 * Check if user has pro features
 */
export const hasProFeatures = (user: DatabaseUser): boolean => {
  return user.subscription_tier === 'pro' || user.subscription_tier === 'enterprise';
};

// Role hierarchy for permission checking
const ROLE_HIERARCHY: Record<UserRole, number> = {
  'viewer': 0,
  'editor': 1,
  'owner': 2,
  'moderator': 3,
  'user': 4,
  'admin': 5
};

/**
 * Create role-based route guard
 */
export function requireRole(requiredRole: UserRole) {
  return (userRole: UserRole): boolean => {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
  };
}

/**
 * Combine multiple permission checks
 */
export async function hasAnyPermission(
  permissions: PermissionsService,
  userId: string,
  checks: Array<{ resource: Resource; action: Action; context?: any }>
): Promise<boolean> {
  const results = await Promise.all(
    checks.map(check => permissions.hasPermission(userId, check.resource, check.action, check.context))
  );

  return results.some(result => result === true);
}

/**
 * Check if all permissions are granted
 */
export async function hasAllPermissions(
  permissions: PermissionsService,
  userId: string,
  checks: Array<{ resource: Resource; action: Action; context?: any }>
): Promise<boolean> {
  const results = await Promise.all(
    checks.map(check => permissions.hasPermission(userId, check.resource, check.action, check.context))
  );

  return results.every(result => result === true);
}