// packages/config/src/auth.ts
import { z } from 'zod';

// Authentication configuration schema
export const AuthConfigSchema = z.object({
  // JWT settings
  jwt: z.object({
    secret: z.string().min(32),
    refreshSecret: z.string().min(32).optional(),
    algorithm: z.enum(['HS256', 'HS384', 'HS512', 'RS256']).default('HS256'),
    expires_in: z.string().default('24h'),
    refresh_expires_in: z.string().default('7d'),
    expiresIn: z.string().default('24h'), // Legacy support
    refreshExpiresIn: z.string().default('7d'), // Legacy support
    issuer: z.string().default('omnipanel'),
    audience: z.string().default('omnipanel-users'),
  }),
  
  // Bcrypt settings
  bcrypt: z.object({
    saltRounds: z.number().positive().default(12),
  }).default({}),
  
  // Email verification
  requireEmailVerification: z.boolean().default(false),
  
  // Session settings
  session: z.object({
    cookie_name: z.string().default('omnipanel-session'),
    cookie_secure: z.boolean().default(true),
    cookie_http_only: z.boolean().default(true),
    cookie_same_site: z.enum(['strict', 'lax', 'none']).default('lax'),
    max_age_seconds: z.number().positive().default(86400), // 24 hours
    rolling_expiration: z.boolean().default(true),
  }).default({}),
  
  // Password requirements
  password: z.object({
    min_length: z.number().positive().default(8),
    require_uppercase: z.boolean().default(true),
    require_lowercase: z.boolean().default(true),
    require_numbers: z.boolean().default(true),
    require_special_chars: z.boolean().default(false),
    max_attempts: z.number().positive().default(5),
    lockout_duration_minutes: z.number().positive().default(15),
  }).default({}),
  
  // OAuth providers
  oauth: z.object({
    google: z.object({
      client_id: z.string().optional(),
      client_secret: z.string().optional(),
      enabled: z.boolean().default(false),
    }).default({}),
    github: z.object({
      client_id: z.string().optional(),
      client_secret: z.string().optional(),
      enabled: z.boolean().default(false),
    }).default({}),
    discord: z.object({
      client_id: z.string().optional(),
      client_secret: z.string().optional(),
      enabled: z.boolean().default(false),
    }).default({}),
  }).default({}),
  
  // Security settings
  security: z.object({
    enable_rate_limiting: z.boolean().default(true),
    max_login_attempts: z.number().positive().default(10),
    maxFailedAttempts: z.number().positive().default(5), // Legacy support
    rate_limit_window_minutes: z.number().positive().default(15),
    lockoutDuration: z.number().positive().default(900), // 15 minutes in seconds
    enable_captcha: z.boolean().default(false),
    captcha_threshold: z.number().positive().default(3),
    enable_2fa: z.boolean().default(false),
    enforce_2fa: z.boolean().default(false),
  }).default({}),
});

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

// Create auth configuration from environment variables
export const createAuthConfig = (): AuthConfig => {
  const config = {
    jwt: {
      secret: process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'default-secret-key-change-in-production',
      refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'default-refresh-secret-change-in-production',
      algorithm: (process.env.JWT_ALGORITHM as any) || 'HS256',
      expires_in: process.env.JWT_EXPIRES_IN || '24h',
      refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: process.env.JWT_ISSUER || 'omnipanel',
      audience: process.env.JWT_AUDIENCE || 'omnipanel-users',
    },
    
    bcrypt: {
      saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
    },
    
    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
    
    session: {
      cookie_name: process.env.SESSION_COOKIE_NAME || 'omnipanel-session',
      cookie_secure: process.env.NODE_ENV === 'production',
      cookie_http_only: process.env.SESSION_HTTP_ONLY !== 'false',
      cookie_same_site: (process.env.SESSION_SAME_SITE as any) || 'lax',
      max_age_seconds: parseInt(process.env.SESSION_MAX_AGE_SECONDS || '86400'),
      rolling_expiration: process.env.SESSION_ROLLING_EXPIRATION !== 'false',
    },
    
    password: {
      min_length: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
      require_uppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
      require_lowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
      require_numbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
      require_special_chars: process.env.PASSWORD_REQUIRE_SPECIAL_CHARS === 'true',
      max_attempts: parseInt(process.env.PASSWORD_MAX_ATTEMPTS || '5'),
      lockout_duration_minutes: parseInt(process.env.PASSWORD_LOCKOUT_DURATION_MINUTES || '15'),
    },
    
    oauth: {
      google: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      },
      github: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      },
      discord: {
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        enabled: !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
      },
    },
    
    security: {
      enable_rate_limiting: process.env.AUTH_ENABLE_RATE_LIMITING !== 'false',
      max_login_attempts: parseInt(process.env.AUTH_MAX_LOGIN_ATTEMPTS || '10'),
      maxFailedAttempts: parseInt(process.env.AUTH_MAX_FAILED_ATTEMPTS || '5'),
      rate_limit_window_minutes: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MINUTES || '15'),
      lockoutDuration: parseInt(process.env.AUTH_LOCKOUT_DURATION_SECONDS || '900'),
      enable_captcha: process.env.AUTH_ENABLE_CAPTCHA === 'true',
      captcha_threshold: parseInt(process.env.AUTH_CAPTCHA_THRESHOLD || '3'),
      enable_2fa: process.env.AUTH_ENABLE_2FA === 'true',
      enforce_2fa: process.env.AUTH_ENFORCE_2FA === 'true',
    },
  };

  return AuthConfigSchema.parse(config);
};

// Validate auth configuration
export const validateAuthConfig = (config: unknown): AuthConfig => {
  try {
    return AuthConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Auth configuration validation failed:');
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw new Error('Invalid auth configuration');
  }
};

// Check if OAuth provider is enabled
export const isOAuthEnabled = (config: AuthConfig, provider: 'google' | 'github' | 'discord'): boolean => {
  return config.oauth[provider].enabled;
};

// Get enabled OAuth providers
export const getEnabledOAuthProviders = (config: AuthConfig): string[] => {
  return Object.entries(config.oauth)
    .filter(([_, providerConfig]) => providerConfig.enabled)
    .map(([provider]) => provider);
};