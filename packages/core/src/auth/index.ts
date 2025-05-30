// packages/core/src/auth/index.ts
export { AuthService } from './auth.service';
export { PermissionsService } from './permissions';
export { 
  AuthMiddleware,
  isAdmin,
  hasProFeatures,
  requireRole,
  hasAnyPermission,
  hasAllPermissions
} from './middleware';

export type {
  AuthContext,
  AuthMiddlewareOptions
} from './middleware';