// apps/web/src/types/settings.ts
// Settings type definitions for OmniPanel configuration

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'mistral' | 'cohere' | 'meta' | 'deepseek' | 'qwen' | 'huggingface' | 'openrouter' | 'ollama' | 'local' | 'custom';

export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
  endpoint?: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt?: string;
  enabled: boolean;
}

export interface GeneralConfig {
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

export interface AppSettings {
  general: GeneralConfig;
  editor: EditorConfig;
  ai: AIModelConfig;
  theme: 'light' | 'dark' | 'system';
  autoSave: boolean;
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReports: boolean;
    usage: boolean;
  };
  performance: {
    animationsEnabled: boolean;
    hardwareAcceleration: boolean;
    maxConcurrentRequests: number;
  };
}

export type SettingsCategory = keyof AppSettings;

export interface SettingsPreset {
  name: string;
  description: string;
  settings: Partial<AppSettings>;
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  borderRadius: number;
  fontScale: number;
}

export interface EditorConfig {
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