// packages/config/src/environments.ts
import { z } from 'zod';

// Environment types
export type Environment = 'development' | 'staging' | 'production' | 'test';

// Environment detection
export const getCurrentEnvironment = (): Environment => {
  const env = process.env.NODE_ENV;
  
  if (env === 'production') return 'production';
  if (env === 'staging') return 'staging';
  if (env === 'test') return 'test';
  
  return 'development';
};

// Environment validation schema
export const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  DEBUG: z.string().optional(),
  PORT: z.string().optional(),
  HOST: z.string().optional(),
});

// Load and validate environment variables
export const loadEnvironmentVariables = (): Record<string, string | undefined> => {
  // In Node.js environments, load from process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env;
  }
  
  // In browser environments, return empty object
  return {};
};

// Validate required environment variables
export const validateRequiredEnvVars = (required: string[]): void => {
  const missing: string[] = [];
  const env = loadEnvironmentVariables();
  
  for (const key of required) {
    if (!env[key]) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Get environment variable with fallback
export const getEnvVar = (key: string, fallback?: string): string | undefined => {
  const env = loadEnvironmentVariables();
  return env[key] || fallback;
};

// Check if running in specific environment
export const isDevelopment = (): boolean => getCurrentEnvironment() === 'development';
export const isProduction = (): boolean => getCurrentEnvironment() === 'production';
export const isStaging = (): boolean => getCurrentEnvironment() === 'staging';
export const isTest = (): boolean => getCurrentEnvironment() === 'test';

// Environment-specific configuration loader
export const loadEnvironmentConfig = <T>(
  configs: Record<Environment, T>,
  currentEnv?: Environment
): T => {
  const env = currentEnv || getCurrentEnvironment();
  
  if (!(env in configs)) {
    throw new Error(`Configuration not found for environment: ${env}`);
  }
  
  return configs[env];
};

// Configuration file loader utility
export const loadConfigFromFile = async <T>(
  filename: string,
  parser: (content: string) => T
): Promise<T> => {
  try {
    // This would be implemented differently in Node.js vs browser
    if (typeof require !== 'undefined') {
      // Node.js environment
      const fs = require('fs');
      const path = require('path');
      
      const configPath = path.resolve(process.cwd(), filename);
      const content = fs.readFileSync(configPath, 'utf-8');
      return parser(content);
    }
    
    throw new Error('File loading not supported in browser environment');
  } catch (error) {
    throw new Error(`Failed to load config from file ${filename}: ${error}`);
  }
};

// Environment variable type conversion utilities
export const parseEnvBoolean = (value: string | undefined, defaultValue = false): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
};

export const parseEnvNumber = (value: string | undefined, defaultValue = 0): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const parseEnvArray = (value: string | undefined, separator = ',', defaultValue: string[] = []): string[] => {
  if (!value) return defaultValue;
  return value.split(separator).map(item => item.trim()).filter(Boolean);
};

// Configuration merging utility - FIXED VERSION
export const mergeConfigs = <T extends Record<string, any>>(
  base: T,
  override: Partial<T>
): T => {
  // Create a copy with proper typing
  const result = { ...base } as T;
  
  for (const [key, value] of Object.entries(override)) {
    if (value !== undefined) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Type assertion to handle the generic constraint properly
        result[key as keyof T] = mergeConfigs(
          (result[key as keyof T] as Record<string, any>) || {}, 
          value as Record<string, any>
        ) as T[keyof T];
      } else {
        result[key as keyof T] = value as T[keyof T];
      }
    }
  }
  
  return result;
};