// packages/types/src/auth.ts
// === AUTHENTICATION TYPES ONLY ===

// User entity
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  profilePicture?: string;
  preferences: Record<string, any>;
  metadata: Record<string, any>;
  failedLoginAttempts: number;
  accountLocked: boolean;
  lockoutExpiry?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'user' | 'moderator' | 'owner' | 'editor' | 'viewer';

// Auth requests
export interface LoginCredentials {
  email: string;
  password: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  profilePicture?: string;
  preferences?: Record<string, any>;
  metadata?: {
    ip?: string;
    userAgent?: string;
  };
}

export interface PasswordResetRequest {
  email: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
  };
}

export interface EmailVerificationRequest {
  token: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
  };
}

// Auth responses
export interface AuthServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityLog {
  id: string;
  userId?: string;
  action: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  details?: Record<string, any>;
  createdAt: Date;
}

// Permissions
export type Resource = 'user' | 'project' | 'file' | 'chat' | 'admin' | 'settings';
export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'invite' | 'share';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  roles: AuthUserRole[];
  permissions: AuthPermission[];
  subscription_tier: string;
}

export type AuthUserRole = 'admin' | 'user' | 'moderator';

export interface AuthPermission {
  resource: string;
  actions: string[];
}

export interface AuthJWTPayload {
  sub: string;
  email: string;
  name: string;
  roles: AuthUserRole[];
  iat: number;
  exp: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthRegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthRefreshTokenRequest {
  refresh_token: string;
}

export interface AuthPasswordResetRequest {
  email: string;
}

export interface AuthPasswordUpdateRequest {
  current_password: string;
  new_password: string;
}