// packages/config/src/app.ts
import { z } from 'zod';

// Application configuration schema
export const AppConfigSchema = z.object({
  name: z.string().default('OmniPanel'),
  version: z.string().default('1.0.0'),
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  debug: z.boolean().default(false),
  
  // URLs and endpoints
  app_url: z.string().url().default('http://localhost:3000'),
  api_url: z.string().url().default('http://localhost:3000/api'),
  
  // Features flags
  features: z.object({
    ai_chat: z.boolean().default(true),
    code_editor: z.boolean().default(true),
    collaboration: z.boolean().default(true),
    notifications: z.boolean().default(true),
    analytics: z.boolean().default(false),
    offline_mode: z.boolean().default(false),
  }).default({}),
  
  // Limits and quotas
  limits: z.object({
    max_projects_per_user: z.number().positive().default(10),
    max_files_per_project: z.number().positive().default(1000),
    max_file_size_mb: z.number().positive().default(10),
    max_message_length: z.number().positive().default(10000),
    max_session_duration_hours: z.number().positive().default(24),
  }).default({}),
  
  // Performance settings
  performance: z.object({
    request_timeout_ms: z.number().positive().default(30000),
    max_concurrent_requests: z.number().positive().default(100),
    cache_ttl_seconds: z.number().positive().default(300),
    rate_limit_per_minute: z.number().positive().default(60),
  }).default({}),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

// Create app configuration from environment variables
export const createAppConfig = (): AppConfig => {
  const config = {
    name: process.env.NEXT_PUBLIC_APP_NAME || process.env.APP_NAME,
    version: process.env.NEXT_PUBLIC_APP_VERSION || process.env.APP_VERSION,
    environment: process.env.NODE_ENV,
    debug: process.env.DEBUG === 'true' || process.env.NEXT_PUBLIC_DEBUG === 'true',
    
    app_url: process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL,
    api_url: process.env.NEXT_PUBLIC_API_URL || process.env.API_URL,
    
    features: {
      ai_chat: process.env.FEATURE_AI_CHAT !== 'false',
      code_editor: process.env.FEATURE_CODE_EDITOR !== 'false',
      collaboration: process.env.FEATURE_COLLABORATION !== 'false',
      notifications: process.env.FEATURE_NOTIFICATIONS !== 'false',
      analytics: process.env.FEATURE_ANALYTICS === 'true',
      offline_mode: process.env.FEATURE_OFFLINE_MODE === 'true',
    },
    
    limits: {
      max_projects_per_user: parseInt(process.env.MAX_PROJECTS_PER_USER || '10'),
      max_files_per_project: parseInt(process.env.MAX_FILES_PER_PROJECT || '1000'),
      max_file_size_mb: parseInt(process.env.MAX_FILE_SIZE_MB || '10'),
      max_message_length: parseInt(process.env.MAX_MESSAGE_LENGTH || '10000'),
      max_session_duration_hours: parseInt(process.env.MAX_SESSION_DURATION_HOURS || '24'),
    },
    
    performance: {
      request_timeout_ms: parseInt(process.env.REQUEST_TIMEOUT_MS || '30000'),
      max_concurrent_requests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '100'),
      cache_ttl_seconds: parseInt(process.env.CACHE_TTL_SECONDS || '300'),
      rate_limit_per_minute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '60'),
    },
  };

  return AppConfigSchema.parse(config);
};

// Validate configuration at startup
export const validateAppConfig = (config: unknown): AppConfig => {
  try {
    return AppConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('App configuration validation failed:');
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw new Error('Invalid app configuration');
  }
};

// Get configuration value with fallback
export const getConfigValue = <T>(
  config: AppConfig,
  path: string,
  fallback: T
): T => {
  const keys = path.split('.');
  let value: any = config;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return fallback;
    }
  }
  
  return value ?? fallback;
};