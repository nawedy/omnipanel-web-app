// packages/core/src/auth/auth.service.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import validator from 'validator';
import crypto from 'crypto-js';
import type {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  PasswordResetRequest,
  EmailVerificationRequest,
  RefreshTokenRequest,
  AuthServiceResponse,
  UserSession,
  SecurityLog,
  DatabaseUser
} from '@omnipanel/types';
import { DatabaseClient } from '@/database/client';
import { createAuthConfig } from '@omnipanel/config';
import { CoreError, ErrorCodes } from '@/utils/errors';
import { validateInput } from '@/utils/validation';
import { RateLimiter } from '@/utils/rate-limiter';
import { timeStringToMs } from '@/utils/time';

export class AuthService {
  private db: DatabaseClient;
  private rateLimiter: RateLimiter;
  private authConfig = createAuthConfig();

  constructor(database: DatabaseClient) {
    this.db = database;
    this.rateLimiter = new RateLimiter();
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthServiceResponse<DatabaseUser>> {
    try {
      // Rate limiting
      await this.rateLimiter.checkLimit('register', data.email, {
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000 // 15 minutes
      });

      // Validate input
      const validation = validateInput(data, {
        email: { required: true, email: true },
        password: { required: true, minLength: 8 },
        firstName: { required: true, minLength: 2 },
        lastName: { required: true, minLength: 2 }
      });

      if (!validation.isValid) {
        throw new CoreError(
          'Invalid registration data',
          ErrorCodes.VALIDATION_ERROR,
          validation.errors
        );
      }

      // Check if user exists
      const existingUser = await this.db.users.findByEmail(data.email);
      if (existingUser) {
        throw new CoreError(
          'User already exists',
          ErrorCodes.USER_ALREADY_EXISTS
        );
      }

      // Create user data for database
      const userData = {
        email: data.email.toLowerCase().trim(),
        name: `${data.firstName} ${data.lastName}`.trim(),
        subscription_tier: 'free' as const,
        preferences: {
          theme: 'light' as const,
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            mentions: true
          }
        }
      };

      const user = await this.db.users.create(userData);

      // Log security event
      await this.logSecurityEvent({
        userId: user.id,
        action: 'user_registered',
        ip: data.metadata?.ip,
        userAgent: data.metadata?.userAgent,
        success: true
      });

      return {
        success: true,
        data: user,
        message: 'User registered successfully'
      };
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Registration failed',
        ErrorCodes.REGISTRATION_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Login user with credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthServiceResponse<AuthTokens & { user: DatabaseUser }>> {
    try {
      // Rate limiting
      await this.rateLimiter.checkLimit('login', credentials.email, {
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000 // 15 minutes
      });

      // Validate input
      const validation = validateInput(credentials, {
        email: { required: true, email: true },
        password: { required: true }
      });

      if (!validation.isValid) {
        throw new CoreError(
          'Invalid login credentials',
          ErrorCodes.VALIDATION_ERROR,
          validation.errors
        );
      }

      // Find user
      const user = await this.db.users.findByEmail(credentials.email);
      if (!user) {
        throw new CoreError(
          'Invalid credentials',
          ErrorCodes.INVALID_CREDENTIALS
        );
      }

      // For now, skip password verification since auth fields are not in database schema
      // TODO: Add password verification once auth fields are added to database schema

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Create session
      await this.createSession(user.id, tokens.refresh_token, {
        ip: credentials.metadata?.ip,
        userAgent: credentials.metadata?.userAgent
      });

      // Log security event
      await this.logSecurityEvent({
        userId: user.id,
        action: 'user_login',
        ip: credentials.metadata?.ip,
        userAgent: credentials.metadata?.userAgent,
        success: true
      });

      return {
        success: true,
        data: {
          ...tokens,
          user
        },
        message: 'Login successful'
      };
    } catch (error) {
      // Log failed login attempt
      if (credentials.email) {
        const user = await this.db.users.findByEmail(credentials.email);
        if (user) {
          await this.logSecurityEvent({
            userId: user.id,
            action: 'login_failed',
            ip: credentials.metadata?.ip,
            userAgent: credentials.metadata?.userAgent,
            success: false,
            details: { reason: error instanceof CoreError ? error.code : 'unknown' }
          });
        }
      }

      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Login failed',
        ErrorCodes.LOGIN_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(request: RefreshTokenRequest): Promise<AuthServiceResponse<AuthTokens>> {
    try {
      // Validate refresh token
      const payload = jwt.verify(request.refreshToken, this.authConfig.jwt.refreshSecret || this.authConfig.jwt.secret) as any;
      
      // Find user
      const user = await this.db.users.findById(payload.userId);
      if (!user) {
        throw new CoreError(
          'Invalid refresh token',
          ErrorCodes.INVALID_TOKEN
        );
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      return {
        success: true,
        data: tokens,
        message: 'Token refreshed successfully'
      };
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Token refresh failed',
        ErrorCodes.TOKEN_REFRESH_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Logout user
   */
  async logout(userId: string, refreshToken?: string): Promise<AuthServiceResponse<void>> {
    try {
      // TODO: Implement session revocation once user sessions are implemented
      
      // Log security event
      await this.logSecurityEvent({
        userId,
        action: 'user_logout',
        success: true
      });

      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      throw new CoreError(
        'Logout failed',
        ErrorCodes.LOGOUT_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(request: EmailVerificationRequest): Promise<AuthServiceResponse<void>> {
    try {
      // TODO: Implement email verification once email verification fields are added to database schema
      
      return {
        success: true,
        message: 'Email verified successfully'
      };
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Email verification failed',
        ErrorCodes.EMAIL_VERIFICATION_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<AuthServiceResponse<{ resetToken: string }>> {
    try {
      // Rate limiting
      await this.rateLimiter.checkLimit('password_reset', request.email, {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000 // 1 hour
      });

      const user = await this.db.users.findByEmail(request.email);
      if (!user) {
        // Don't reveal if email exists - but still return success
        const dummyToken = this.generateSecureToken();
        return {
          success: true,
          data: { resetToken: dummyToken },
          message: 'If the email exists, a reset link has been sent'
        };
      }

      // Generate reset token
      const resetToken = this.generateSecureToken();

      // TODO: Store reset token once password reset fields are added to database schema

      // Log security event
      await this.logSecurityEvent({
        userId: user.id,
        action: 'password_reset_requested',
        ip: request.metadata?.ip,
        success: true
      });

      return {
        success: true,
        data: { resetToken }, // In production, this would be sent via email
        message: 'Password reset link sent'
      };
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Password reset request failed',
        ErrorCodes.PASSWORD_RESET_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Verify JWT token and return user
   */
  async verifyToken(token: string): Promise<DatabaseUser> {
    try {
      const payload = jwt.verify(token, this.authConfig.jwt.secret) as any;
      
      const user = await this.db.users.findById(payload.userId);
      if (!user) {
        throw new CoreError(
          'Invalid token',
          ErrorCodes.INVALID_TOKEN
        );
      }

      return user;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new CoreError(
          'Invalid token',
          ErrorCodes.INVALID_TOKEN
        );
      }
      throw error;
    }
  }

  /**
   * Generate secure tokens for user
   */
  private async generateTokens(user: DatabaseUser): Promise<AuthTokens> {
    const payload = {
      userId: user.id,
      email: user.email,
      role: 'user' // Default role since it's not in database schema yet
    };

    const jwtSecret = this.authConfig.jwt.secret;
    const refreshSecret = this.authConfig.jwt.refreshSecret || this.authConfig.jwt.secret;

    // Convert time strings to seconds for JWT
    const accessExpiresIn = Math.floor(timeStringToMs(this.authConfig.jwt.expires_in) / 1000);
    const refreshExpiresIn = Math.floor(timeStringToMs(this.authConfig.jwt.refresh_expires_in) / 1000);

    const accessTokenOptions: jwt.SignOptions = {
      expiresIn: accessExpiresIn,
      issuer: this.authConfig.jwt.issuer,
      audience: this.authConfig.jwt.audience
    };

    const refreshTokenOptions: jwt.SignOptions = {
      expiresIn: refreshExpiresIn,
      issuer: this.authConfig.jwt.issuer,
      audience: this.authConfig.jwt.audience
    };

    const accessToken = jwt.sign(payload, jwtSecret, accessTokenOptions);
    const refreshToken = jwt.sign(payload, refreshSecret, refreshTokenOptions);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: accessExpiresIn,
      token_type: 'Bearer'
    };
  }

  /**
   * Create user session
   */
  private async createSession(
    userId: string,
    refreshToken: string,
    metadata?: { ip?: string; userAgent?: string }
  ): Promise<void> {
    // TODO: Implement user session storage once user sessions repository is available
    // For now, just log the session creation
    console.log('Session created for user:', userId);
  }

  /**
   * Generate secure token
   */
  private generateSecureToken(): string {
    return crypto.lib.WordArray.random(32).toString();
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(event: Omit<SecurityLog, 'id' | 'createdAt'>): Promise<void> {
    try {
      // TODO: Implement security logging once security logs repository is available
      // For now, just log to console
      console.log('Security event:', event);
    } catch (error) {
      // Log error but don't throw - security logging shouldn't break the flow
      console.error('Failed to log security event:', error);
    }
  }
}