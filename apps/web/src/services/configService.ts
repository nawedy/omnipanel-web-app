// apps/web/src/services/configService.ts
// Centralized configuration management service using robust @omnipanel packages

"use client";

import { AIProvider, AIProviderConfig } from '@omnipanel/types';

// Database configuration interface using robust types
export interface DatabaseConfig extends AIProviderConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  connectionPoolMin: number;
  connectionPoolMax: number;
  provider: 'postgresql' | 'mysql' | 'sqlite' | 'neondb';
  connectionString?: string;
}

// Theme configuration
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  density: 'compact' | 'comfortable' | 'spacious';
}

// Keyboard shortcuts configuration
export interface KeyboardShortcutsConfig {
  enabled: boolean;
  shortcuts: Record<string, string>;
  customShortcuts: Record<string, string>;
}

// General settings configuration
export interface GeneralConfig {
  language: string;
  timezone: string;
  dateFormat: string;
  fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  fontFamily: 'inter' | 'system' | 'mono';
}

// AI provider configuration using robust types
export interface AIConfig {
  defaultProvider: AIProvider;
  aiProviders: Record<AIProvider, AIProviderConfig>;
  globalRules: string[];
  projectRules: Record<string, string[]>;
  localModels: {
    enabled: boolean;
    endpoint: string;
    models: string[];
  };
}

// Complete application configuration
export interface AppConfig {
  database: DatabaseConfig;
  theme: ThemeConfig;
  keyboardShortcuts: KeyboardShortcutsConfig;
  general: GeneralConfig;
  ai: AIConfig;
}

// Configuration validation schemas
const defaultConfig: AppConfig = {
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'omnipanel',
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    ssl: process.env.DATABASE_SSL === 'true',
    connectionPoolMin: 2,
    connectionPoolMax: 10,
    provider: 'neondb'
  },
  theme: {
    mode: 'dark',
    primaryColor: '#6366f1',
    accentColor: '#8b5cf6',
    borderRadius: 'md',
    density: 'comfortable'
  },
  keyboardShortcuts: {
    enabled: true,
    shortcuts: {
      'cmd+k': 'Open command palette',
      'cmd+shift+p': 'Open project switcher',
      'cmd+b': 'Toggle sidebar',
      'cmd+j': 'Toggle terminal',
      'cmd+enter': 'Send chat message',
      'esc': 'Close modals'
    },
    customShortcuts: {}
  },
  general: {
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'YYYY-MM-DD',
    fontSize: 'base',
    fontFamily: 'inter'
  },
  ai: {
    defaultProvider: AIProvider.OPENAI,
    aiProviders: {
      [AIProvider.OPENAI]: {
        apiKey: process.env.OPENAI_API_KEY || '',
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
      },
      [AIProvider.ANTHROPIC]: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        baseUrl: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1'
      },
      [AIProvider.GOOGLE]: {
        apiKey: process.env.GOOGLE_API_KEY || '',
        baseUrl: process.env.GOOGLE_BASE_URL || 'https://api.google.com/v1'
      },
      [AIProvider.MISTRAL]: {
        apiKey: process.env.MISTRAL_API_KEY || '',
        baseUrl: process.env.MISTRAL_BASE_URL || 'https://api.mistral.com/v1'
      },
      [AIProvider.DEEPSEEK]: {
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1'
      },
      [AIProvider.HUGGINGFACE]: {
        apiKey: process.env.HUGGINGFACE_API_KEY || '',
        baseUrl: process.env.HUGGINGFACE_BASE_URL || 'https://api.huggingface.com/v1'
      },
      [AIProvider.OLLAMA]: {
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
      },
      [AIProvider.LLAMACPP]: {
        baseUrl: process.env.LLAMACPP_BASE_URL || 'http://localhost:8080'
      },
      [AIProvider.VLLM]: {
        endpoint: process.env.VLLM_ENDPOINT || 'http://localhost:8000',
        model: process.env.VLLM_MODEL || 'meta-llama/Llama-2-7b-chat-hf'
      },
      [AIProvider.QWEN]: {
        apiKey: process.env.QWEN_API_KEY || '',
        region: 'cn-beijing'
      }
    },
    globalRules: [
      'Be helpful and accurate',
      'Provide code examples when relevant',
      'Ask for clarification when needed'
    ],
    projectRules: {},
    localModels: {
      enabled: false,
      endpoint: 'http://localhost:11434',
      models: []
    }
  }
};

export class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;
  private listeners: Set<(config: AppConfig) => void> = new Set();

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadConfig(): AppConfig {
    if (typeof window === 'undefined') {
      return defaultConfig;
    }

    try {
      const stored = localStorage.getItem('omnipanel-config');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultConfig, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load config from localStorage:', error);
    }

    return defaultConfig;
  }

  private saveConfig(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('omnipanel-config', JSON.stringify(this.config));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save config to localStorage:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.config));
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  getDatabaseConfig(): DatabaseConfig {
    return { ...this.config.database };
  }

  updateDatabaseConfig(updates: Partial<DatabaseConfig>): void {
    this.config.database = { ...this.config.database, ...updates };
    this.saveConfig();
  }

  validateDatabaseConfig(config: Partial<DatabaseConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.connectionString) {
      // If using connection string, validate its format
      try {
        new URL(config.connectionString);
      } catch {
        errors.push('Invalid connection string format');
      }
    } else {
      // If using individual fields, validate required ones
      if (!config.host) {
        errors.push('Database host is required');
      }
      if (!config.database) {
        errors.push('Database name is required');
      }
      if (!config.username) {
        errors.push('Database username is required');
      }
      if (config.port && (config.port < 1 || config.port > 65535)) {
        errors.push('Database port must be between 1 and 65535');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  saveDatabaseConfig(config: Partial<DatabaseConfig>): boolean {
    try {
      const validation = this.validateDatabaseConfig(config);
      if (!validation.valid) {
        console.error('Database config validation failed:', validation.errors);
        return false;
      }

      this.updateDatabaseConfig(config);
      return true;
    } catch (error) {
      console.error('Failed to save database config:', error);
      return false;
    }
  }

  getThemeConfig(): ThemeConfig {
    return { ...this.config.theme };
  }

  updateThemeConfig(updates: Partial<ThemeConfig>): void {
    this.config.theme = { ...this.config.theme, ...updates };
    this.saveConfig();
  }

  getKeyboardShortcutsConfig(): KeyboardShortcutsConfig {
    return { ...this.config.keyboardShortcuts };
  }

  updateKeyboardShortcutsConfig(updates: Partial<KeyboardShortcutsConfig>): void {
    this.config.keyboardShortcuts = { ...this.config.keyboardShortcuts, ...updates };
    this.saveConfig();
  }

  getGeneralConfig(): GeneralConfig {
    return { ...this.config.general };
  }

  updateGeneralConfig(updates: Partial<GeneralConfig>): void {
    this.config.general = { ...this.config.general, ...updates };
    this.saveConfig();
  }

  getAIConfig(): AIConfig {
    return { ...this.config.ai };
  }

  updateAIConfig(updates: Partial<AIConfig>): void {
    this.config.ai = { ...this.config.ai, ...updates };
    this.saveConfig();
  }

  subscribe(listener: (config: AppConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reset(): void {
    this.config = { ...defaultConfig };
    this.saveConfig();
  }

  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfig(configJson: string): boolean {
    try {
      const imported = JSON.parse(configJson);
      this.config = { ...defaultConfig, ...imported };
      this.saveConfig();
      return true;
    } catch (error) {
      console.error('Failed to import config:', error);
      return false;
    }
  }

  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate database config
    if (!this.config.database.host) {
      errors.push('Database host is required');
    }
    if (!this.config.database.database) {
      errors.push('Database name is required');
    }

    // Validate theme config
    if (!['light', 'dark', 'system'].includes(this.config.theme.mode)) {
      errors.push('Invalid theme mode');
    }

    // Validate general config
    if (!this.config.general.language) {
      errors.push('Language is required');
    }
    if (!this.config.general.timezone) {
      errors.push('Timezone is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const configService = ConfigService.getInstance(); 