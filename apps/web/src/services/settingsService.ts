// apps/web/src/services/settingsService.ts
// Settings persistence service with validation and real-time updates

"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Settings interfaces
interface GeneralSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  fontFamily: string;
  compactMode: boolean;
  showWelcomeScreen: boolean;
  autoCheckUpdates: boolean;
  sendTelemetry: boolean;
  enableExperimentalFeatures: boolean;
}

interface EditorSettings {
  tabSize: number;
  insertSpaces: boolean;
  wordWrap: boolean;
  showLineNumbers: boolean;
  showMinimap: boolean;
  autoSave: 'off' | 'afterDelay' | 'onFocusChange' | 'onWindowChange';
  autoSaveDelay: number;
  formatOnSave: boolean;
  formatOnPaste: boolean;
  trimTrailingWhitespace: boolean;
  insertFinalNewline: true;
  detectIndentation: boolean;
  bracketPairColorization: boolean;
  highlightActiveIndentGuide: boolean;
  renderWhitespace: 'none' | 'boundary' | 'selection' | 'all';
  cursorStyle: 'line' | 'block' | 'underline';
  cursorBlinking: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
  mouseWheelZoom: boolean;
  quickSuggestionsDelay: number;
}

export interface AISettings {
  // Legacy compatibility properties
  apiKey: string;
  provider: 'openai' | 'anthropic' | 'deepseek' | 'gemini' | 'ollama' | 'custom';
  endpoint: string;
  model: string;
  enabled: boolean;
  systemPrompt: string;
  // New properties
  defaultProvider: string;
  defaultModel: string;
  apiKeys: Record<string, string>;
  customProviders: CustomProvider[];
  enableContextAwareness: boolean;
  maxContextTokens: number;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  enableStreaming: boolean;
  autoSaveConversations: boolean;
  conversationRetentionDays: number;
}

interface CustomProvider {
  id: string;
  name: string;
  displayName: string;
  baseUrl: string;
  apiKeyHeader: string;
  models: string[];
  supportedFeatures: string[];
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DatabaseSettings {
  provider: 'neon' | 'postgresql' | 'mysql' | 'sqlite';
  connectionString: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl: boolean;
  poolSize: number;
  timeout: number;
  enableLogging: boolean;
  autoMigrate: boolean;
}

interface SecuritySettings {
  enableTwoFactor: boolean;
  sessionTimeout: number;
  lockScreenTimeout: number;
  enableBiometrics: boolean;
  encryptLocalData: boolean;
  allowRemoteConnections: boolean;
  trustedDomains: string[];
  enableCSRFProtection: boolean;
  enableRateLimiting: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;
}

interface PerformanceSettings {
  enableGPUAcceleration: boolean;
  maxMemoryUsage: number;
  enableDiskCache: boolean;
  diskCacheSize: number;
  enableImageOptimization: boolean;
  enableCodeSplitting: boolean;
  enableServiceWorker: boolean;
  enablePrefetching: boolean;
  networkTimeout: number;
  retryAttempts: number;
  enableCompressions: boolean;
}

interface KeyboardSettings {
  shortcuts: Record<string, KeyboardShortcut>;
  enableVimMode: boolean;
  enableEmacsMode: boolean;
  customKeymaps: CustomKeymap[];
}

interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  category: string;
  keys: string[];
  command: string;
  context?: string;
  isEnabled: boolean;
  isCustom: boolean;
}

interface CustomKeymap {
  id: string;
  name: string;
  description: string;
  mappings: Record<string, string>;
  isActive: boolean;
  createdAt: Date;
}

interface NotificationSettings {
  enableDesktopNotifications: boolean;
  enableSoundNotifications: boolean;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  notificationTypes: Record<string, boolean>;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    days: number[];
  };
  emailFrequency: 'immediate' | 'daily' | 'weekly' | 'never';
}

interface PrivacySettings {
  dataCollection: {
    usage: boolean;
    performance: boolean;
    errors: boolean;
    diagnostics: boolean;
  };
  sharing: {
    allowAnonymousData: boolean;
    allowPersonalizedAds: boolean;
    allowThirdPartyIntegrations: boolean;
  };
  retention: {
    conversationHistory: number; // days
    searchHistory: number; // days
    fileHistory: number; // days
    activityLogs: number; // days
  };
  cookies: {
    essential: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
  };
}

// Combined settings interface
export interface AppSettings {
  general: GeneralSettings;
  editor: EditorSettings;
  ai: AISettings;
  database: DatabaseSettings;
  security: SecuritySettings;
  performance: PerformanceSettings;
  keyboard: KeyboardSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

// Settings validation schemas
interface SettingsValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Settings state interface
interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  
  // Actions
  updateSettings: <T extends keyof AppSettings>(
    category: T,
    updates: Partial<AppSettings[T]>
  ) => void;
  
  validateSettings: <T extends keyof AppSettings>(
    category: T,
    settings: Partial<AppSettings[T]>
  ) => SettingsValidation;
  
  resetSettings: <T extends keyof AppSettings>(category: T) => void;
  resetAllSettings: () => void;
  
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
  
  exportSettings: () => string;
  importSettings: (data: string) => Promise<void>;
  
  // Utility methods
  getSettingValue: <T extends keyof AppSettings, K extends keyof AppSettings[T]>(
    category: T,
    key: K
  ) => AppSettings[T][K];
  
  watchSetting: <T extends keyof AppSettings, K extends keyof AppSettings[T]>(
    category: T,
    key: K,
    callback: (value: AppSettings[T][K]) => void
  ) => () => void;
}

// Default settings
const defaultSettings: AppSettings = {
  general: {
    language: 'en-US',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    theme: 'dark',
    fontSize: 14,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    compactMode: false,
    showWelcomeScreen: true,
    autoCheckUpdates: true,
    sendTelemetry: false,
    enableExperimentalFeatures: false,
  },
  
  editor: {
    tabSize: 2,
    insertSpaces: true,
    wordWrap: false,
    showLineNumbers: true,
    showMinimap: true,
    autoSave: 'afterDelay',
    autoSaveDelay: 1000,
    formatOnSave: true,
    formatOnPaste: true,
    trimTrailingWhitespace: true,
    insertFinalNewline: true,
    detectIndentation: true,
    bracketPairColorization: true,
    highlightActiveIndentGuide: true,
    renderWhitespace: 'none',
    cursorStyle: 'line',
    cursorBlinking: 'blink',
    mouseWheelZoom: true,
    quickSuggestionsDelay: 300,
  },
  
  ai: {
    // Legacy compatibility properties
    apiKey: '',
    provider: 'openai',
    endpoint: '',
    model: 'gpt-4o',
    enabled: true,
    systemPrompt: '',
    // New properties
    defaultProvider: 'openai',
    defaultModel: 'gpt-4o',
    apiKeys: {},
    customProviders: [],
    enableContextAwareness: true,
    maxContextTokens: 8000,
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    enableStreaming: true,
    autoSaveConversations: true,
    conversationRetentionDays: 30,
  },
  
  database: {
    provider: 'neon',
    connectionString: '',
    ssl: true,
    poolSize: 10,
    timeout: 30000,
    enableLogging: false,
    autoMigrate: true,
  },
  
  security: {
    enableTwoFactor: false,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    lockScreenTimeout: 15 * 60 * 1000, // 15 minutes
    enableBiometrics: false,
    encryptLocalData: true,
    allowRemoteConnections: false,
    trustedDomains: [],
    enableCSRFProtection: true,
    enableRateLimiting: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },
  
  performance: {
    enableGPUAcceleration: true,
    maxMemoryUsage: 2048, // MB
    enableDiskCache: true,
    diskCacheSize: 500, // MB
    enableImageOptimization: true,
    enableCodeSplitting: true,
    enableServiceWorker: true,
    enablePrefetching: true,
    networkTimeout: 30000,
    retryAttempts: 3,
    enableCompressions: true,
  },
  
  keyboard: {
    shortcuts: {},
    enableVimMode: false,
    enableEmacsMode: false,
    customKeymaps: [],
  },
  
  notifications: {
    enableDesktopNotifications: true,
    enableSoundNotifications: true,
    enableEmailNotifications: false,
    enablePushNotifications: true,
    notificationTypes: {
      'ai-response': true,
      'file-change': true,
      'project-update': true,
      'error': true,
      'warning': true,
      'system': true,
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      days: [0, 1, 2, 3, 4, 5, 6], // All days
    },
    emailFrequency: 'daily',
  },
  
  privacy: {
    dataCollection: {
      usage: false,
      performance: false,
      errors: true,
      diagnostics: false,
    },
    sharing: {
      allowAnonymousData: false,
      allowPersonalizedAds: false,
      allowThirdPartyIntegrations: true,
    },
    retention: {
      conversationHistory: 30,
      searchHistory: 7,
      fileHistory: 30,
      activityLogs: 7,
    },
    cookies: {
      essential: true,
      functional: true,
      analytics: false,
      marketing: false,
    },
  },
};

// Settings validation functions
const validateGeneralSettings = (settings: Partial<GeneralSettings>): SettingsValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (settings.fontSize && (settings.fontSize < 8 || settings.fontSize > 72)) {
    errors.push('Font size must be between 8 and 72 pixels');
  }
  
  if (settings.language && !settings.language.match(/^[a-z]{2}-[A-Z]{2}$/)) {
    errors.push('Language must be in format: xx-XX (e.g., en-US)');
  }
  
  if (settings.timezone) {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: settings.timezone });
    } catch {
      errors.push('Invalid timezone specified');
    }
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

const validateAISettings = (settings: Partial<AISettings>): SettingsValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (settings.temperature && (settings.temperature < 0 || settings.temperature > 2)) {
    errors.push('Temperature must be between 0 and 2');
  }
  
  if (settings.maxTokens && settings.maxTokens < 1) {
    errors.push('Max tokens must be greater than 0');
  }
  
  if (settings.maxContextTokens && settings.maxContextTokens < 100) {
    warnings.push('Very low context token limit may affect AI performance');
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

const validateDatabaseSettings = (settings: Partial<DatabaseSettings>): SettingsValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (settings.connectionString && !settings.connectionString.startsWith('postgresql://')) {
    if (settings.provider === 'neon' || settings.provider === 'postgresql') {
      errors.push('PostgreSQL connection string must start with postgresql://');
    }
  }
  
  if (settings.port && (settings.port < 1 || settings.port > 65535)) {
    errors.push('Port must be between 1 and 65535');
  }
  
  if (settings.poolSize && settings.poolSize < 1) {
    errors.push('Pool size must be at least 1');
  }
  
  if (settings.timeout && settings.timeout < 1000) {
    warnings.push('Very low timeout may cause connection failures');
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

// Settings store implementation
export const useSettingsStore: any = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isLoading: false,
      error: null as string | null,
      hasUnsavedChanges: false,
      lastSaved: null,
      
      updateSettings: <T extends keyof AppSettings>(
        category: T,
        updates: Partial<AppSettings[T]>
      ) => {
        set(state => ({
          settings: {
            ...state.settings,
            [category]: {
              ...state.settings[category],
              ...updates,
            },
          },
          hasUnsavedChanges: true,
        }));
        
        // Auto-save after delay
        const autoSaveTimeout = setTimeout(() => {
          get().saveSettings();
        }, 2000);
        
        // Store timeout for potential cleanup
        (get() as any).autoSaveTimeout = autoSaveTimeout;
      },
      
      validateSettings: <T extends keyof AppSettings>(
        category: T,
        settings: Partial<AppSettings[T]>
      ) => {
        switch (category) {
          case 'general':
            return validateGeneralSettings(settings as Partial<GeneralSettings>);
          case 'ai':
            return validateAISettings(settings as Partial<AISettings>);
          case 'database':
            return validateDatabaseSettings(settings as Partial<DatabaseSettings>);
          default:
            return { isValid: true, errors: [], warnings: [] };
        }
      },
      
      resetSettings: <T extends keyof AppSettings>(category: T) => {
        set(state => ({
          settings: {
            ...state.settings,
            [category]: defaultSettings[category],
          },
          hasUnsavedChanges: true,
        }));
      },
      
      resetAllSettings: () => {
        set({
          settings: defaultSettings,
          hasUnsavedChanges: true,
        });
      },
      
      saveSettings: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Clear auto-save timeout if exists
          const autoSaveTimeout = (get() as any).autoSaveTimeout;
          if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
          }
          
          // In a real implementation, this would sync with a backend
          // For now, we rely on Zustand persist middleware
          
          set({
            isLoading: false,
            hasUnsavedChanges: false,
            lastSaved: new Date(),
          });
          
          // Emit settings change event for other components
          const event = new CustomEvent('settingsChanged', {
            detail: get().settings,
          });
          window.dispatchEvent(event);
          
        } catch (error) {
          set({
            error: `Failed to save settings: ${error}`,
            isLoading: false,
          });
          throw error;
        }
      },
      
      loadSettings: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // In a real implementation, this would load from backend
          // For now, settings are automatically loaded by persist middleware
          
          set({ isLoading: false });
          
        } catch (error) {
          set({
            error: `Failed to load settings: ${error}`,
            isLoading: false,
          });
          throw error;
        }
      },
      
      exportSettings: () => {
        const { settings } = get();
        return JSON.stringify({
          settings,
          exportedAt: new Date().toISOString(),
          version: '1.0.0',
        }, null, 2);
      },
      
      importSettings: async (data: string) => {
        try {
          const parsed = JSON.parse(data);
          
          if (!parsed.settings) {
            throw new Error('Invalid settings file format');
          }
          
          // Validate imported settings
          const validations = Object.keys(parsed.settings).map(category => 
            get().validateSettings(category as keyof AppSettings, parsed.settings[category])
          );
          
          const hasErrors = validations.some(v => !v.isValid);
          if (hasErrors) {
            const allErrors = validations.flatMap(v => v.errors);
            throw new Error(`Invalid settings: ${allErrors.join(', ')}`);
          }
          
          // Merge with default settings to ensure all keys exist
          const mergedSettings = { ...defaultSettings };
          Object.keys(parsed.settings).forEach(category => {
            if (mergedSettings[category as keyof AppSettings]) {
              mergedSettings[category as keyof AppSettings] = {
                ...mergedSettings[category as keyof AppSettings],
                ...parsed.settings[category],
              };
            }
          });
          
          set({
            settings: mergedSettings,
            hasUnsavedChanges: true,
          });
          
          await get().saveSettings();
          
        } catch (error) {
          set({ error: `Failed to import settings: ${error}` });
          throw error;
        }
      },
      
      getSettingValue: <T extends keyof AppSettings, K extends keyof AppSettings[T]>(
        category: T,
        key: K
      ) => {
        return get().settings[category][key];
      },
      
      watchSetting: <T extends keyof AppSettings, K extends keyof AppSettings[T]>(
        category: T,
        key: K,
        callback: (value: AppSettings[T][K]) => void
      ) => {
        const unsubscribe: any = useSettingsStore.subscribe(
          (state: any) => state.settings[category][key],
          (value: any) => callback(value)
        );
        
        return unsubscribe;
      },
    }),
    {
      name: 'app-settings',
      partialize: (state) => ({
        settings: state.settings,
        lastSaved: state.lastSaved,
      }),
    }
  )
);

// Settings service for direct access
export const settingsService = {
  // Get current settings
  getSettings: () => useSettingsStore.getState().settings,
  
  // Get specific setting
  getSetting: <T extends keyof AppSettings>(category: T) => 
    useSettingsStore.getState().settings[category],
  
  // Update settings
  updateSetting: <T extends keyof AppSettings>(
    category: T,
    updates: Partial<AppSettings[T]>
  ) => useSettingsStore.getState().updateSettings(category, updates),
  
  // Subscribe to changes
  subscribe: (callback: (settings: AppSettings) => void) =>
    useSettingsStore.subscribe((state: any) => callback(state.settings)),
  
  // Validation helpers
  validateSetting: <T extends keyof AppSettings>(
    category: T,
    settings: Partial<AppSettings[T]>
  ) => useSettingsStore.getState().validateSettings(category, settings),
  
  // Missing methods for compatibility
  loadSettings: () => useSettingsStore.getState().loadSettings(),
  updateSettings: (updates: Partial<AppSettings>) => {
    const state = useSettingsStore.getState();
    Object.keys(updates).forEach(category => {
      if (updates[category as keyof AppSettings]) {
        state.updateSettings(category as keyof AppSettings, updates[category as keyof AppSettings]);
      }
    });
  },
  resetSettings: () => useSettingsStore.getState().resetAllSettings(),
  exportSettings: () => useSettingsStore.getState().exportSettings(),
  importSettings: (data: string) => useSettingsStore.getState().importSettings(data),
  
  // Utility methods
  isValidTheme: (theme: string): theme is 'light' | 'dark' | 'auto' =>
    ['light', 'dark', 'auto'].includes(theme),
  
  isValidLanguage: (lang: string) => /^[a-z]{2}-[A-Z]{2}$/.test(lang),
  
  isValidTimezone: (tz: string) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  },
  
  // Settings presets
  getPreset: (presetName: 'minimal' | 'developer' | 'power-user') => {
    const baseSettings = { ...defaultSettings };
    
    switch (presetName) {
      case 'minimal':
        return {
          ...baseSettings,
          general: {
            ...baseSettings.general,
            compactMode: true,
            showWelcomeScreen: false,
            sendTelemetry: false,
          },
          editor: {
            ...baseSettings.editor,
            showMinimap: false,
            wordWrap: true,
          },
        };
      
      case 'developer':
        return {
          ...baseSettings,
          editor: {
            ...baseSettings.editor,
            fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
            renderWhitespace: 'boundary',
            bracketPairColorization: true,
          },
          keyboard: {
            ...baseSettings.keyboard,
            enableVimMode: false,
          },
        };
      
      case 'power-user':
        return {
          ...baseSettings,
          general: {
            ...baseSettings.general,
            enableExperimentalFeatures: true,
          },
          performance: {
            ...baseSettings.performance,
            enableGPUAcceleration: true,
            maxMemoryUsage: 4096,
          },
        };
      
      default:
        return baseSettings;
    }
  },
  
  applyPreset: (presetName: 'minimal' | 'developer' | 'power-user') => {
    const presetSettings = settingsService.getPreset(presetName);
    useSettingsStore.setState({ 
      settings: presetSettings,
      hasUnsavedChanges: true 
    });
  },
};

// Export types
export type {
  GeneralSettings,
  EditorSettings,
  DatabaseSettings,
  SecuritySettings,
  PerformanceSettings,
  KeyboardSettings,
  NotificationSettings,
  PrivacySettings,
  CustomProvider,
  KeyboardShortcut,
  CustomKeymap,
  SettingsValidation,
}; 