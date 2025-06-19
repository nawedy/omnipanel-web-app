"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { settingsService } from '@/services/settingsService';
import type { AISettings, AppSettings } from '@/services/settingsService';
import type { ThemeConfig, EditorConfig } from '@/types/settings';

interface SettingsContextType {
  // State
  settings: AppSettings | null;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
  
  // Actions
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  updateAIModel: (config: Partial<AISettings>) => Promise<void>;
  updateTheme: (config: Partial<ThemeConfig>) => Promise<void>;
  updateEditor: (config: Partial<EditorConfig>) => Promise<void>;
  resetSettings: () => Promise<void>;
  exportSettings: () => Promise<string>;
  importSettings: (settingsData: string) => Promise<void>;
  reloadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps): React.JSX.Element {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await settingsService.loadSettings();
        const loadedSettings = settingsService.getSettings();
        setSettings(loadedSettings);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load settings';
        setError(message);
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const contextValue: SettingsContextType = {
    // State
    settings,
    isLoading,
    error,
    isDirty,
    
    // Actions
    updateSettings: async (updates: Partial<AppSettings>) => {
      try {
        setError(null);
        if (!settings) throw new Error('Settings not loaded');
        
        const updatedSettings = { ...settings, ...updates };
        settingsService.updateSettings(updates);
        setSettings(updatedSettings);
        setIsDirty(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update settings';
        setError(message);
        throw err;
      }
    },

    updateAIModel: async (config: Partial<AISettings>) => {
      try {
        setError(null);
        if (!settings) throw new Error('Settings not loaded');
        
        const updatedSettings = {
          ...settings,
          ai: { ...settings.ai, ...config }
        };
        settingsService.updateSetting('ai', config);
        setSettings(updatedSettings);
        setIsDirty(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update AI model settings';
        setError(message);
        throw err;
      }
    },

    updateTheme: async (config: Partial<ThemeConfig>) => {
      try {
        setError(null);
        if (!settings) throw new Error('Settings not loaded');
        
        // Map ThemeConfig to GeneralSettings properties
        const generalUpdates: Partial<typeof settings.general> = {};
        if (config.mode) generalUpdates.theme = config.mode === 'system' ? 'auto' : config.mode;
        if (config.fontScale) generalUpdates.fontSize = Math.round(config.fontScale * 14);
        
        const updatedSettings = {
          ...settings,
          general: { ...settings.general, ...generalUpdates }
        };
        settingsService.updateSetting('general', generalUpdates);
        setSettings(updatedSettings);
        setIsDirty(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update theme settings';
        setError(message);
        throw err;
      }
    },

    updateEditor: async (config: Partial<EditorConfig>) => {
      try {
        setError(null);
        if (!settings) throw new Error('Settings not loaded');
        
        const updatedSettings = {
          ...settings,
          editor: { ...settings.editor, ...config }
        };
        settingsService.updateSetting('editor', config);
        setSettings(updatedSettings);
        setIsDirty(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update editor settings';
        setError(message);
        throw err;
      }
    },

    resetSettings: async () => {
      try {
        setError(null);
        setIsLoading(true);
        settingsService.resetSettings();
        const defaultSettings = settingsService.getSettings();
        setSettings(defaultSettings);
        setIsDirty(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to reset settings';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },

    exportSettings: async () => {
      try {
        setError(null);
        if (!settings) throw new Error('Settings not loaded');
        return settingsService.exportSettings();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to export settings';
        setError(message);
        throw err;
      }
    },

    importSettings: async (settingsData: string) => {
      try {
        setError(null);
        setIsLoading(true);
        await settingsService.importSettings(settingsData);
        const importedSettings = settingsService.getSettings();
        setSettings(importedSettings);
        setIsDirty(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to import settings';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },

    reloadSettings: async () => {
      try {
        setError(null);
        setIsLoading(true);
        await settingsService.loadSettings();
        const reloadedSettings = settingsService.getSettings();
        setSettings(reloadedSettings);
        setIsDirty(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to reload settings';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Listen for settings changes to mark dirty state
  useEffect(() => {
    if (settings) {
      setIsDirty(true);
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 