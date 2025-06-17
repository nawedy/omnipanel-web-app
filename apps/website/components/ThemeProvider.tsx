'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
// import { ThemeEngine, ThemeProvider as OmniThemeProvider } from '@omnipanel/theme-engine'; // TODO: Implement in Sprint 2

// Temporary implementation until theme-engine package is implemented
interface ThemeEngineConfig {
  defaultTheme: string;
  themes: string[];
  storage: Storage | null;
  storageKey: string;
}

class ThemeEngine {
  private config: ThemeEngineConfig;
  private currentTheme: string;

  constructor(config: ThemeEngineConfig) {
    this.config = config;
    this.currentTheme = config.defaultTheme;
  }

  getCurrentTheme(): string {
    if (typeof window !== 'undefined' && this.config.storage) {
      return this.config.storage.getItem(this.config.storageKey) || this.config.defaultTheme;
    }
    return this.currentTheme;
  }

  setTheme(theme: string): void {
    this.currentTheme = theme;
    if (typeof window !== 'undefined' && this.config.storage) {
      this.config.storage.setItem(this.config.storageKey, theme);
    }
  }
}

// Temporary OmniThemeProvider until theme-engine package is implemented
const OmniThemeProvider = ({ children, theme }: { children: React.ReactNode; theme: string; engine: ThemeEngine }) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.className = theme;
    }
  }, [theme]);

  return <>{children}</>;
};

// Initialize the theme engine with default configuration
const themeEngine = new ThemeEngine({
  defaultTheme: 'dark',
  themes: ['light', 'dark', 'system'],
  storage: typeof window !== 'undefined' ? window.localStorage : null,
  storageKey: 'omnipanel-website-theme',
});

// Create context for theme state
type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
  themeEngine: ThemeEngine;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<string>(themeEngine.getCurrentTheme());
  
  // Set theme in the DOM
  const setTheme = (newTheme: string) => {
    themeEngine.setTheme(newTheme);
    setThemeState(newTheme);
  };

  // Initialize theme on mount
  useEffect(() => {
    // Sync with system preference changes
    const handleSystemPreferenceChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
    systemDarkMode.addEventListener('change', handleSystemPreferenceChange);

    // Initialize theme
    const savedTheme = themeEngine.getCurrentTheme();
    setThemeState(savedTheme);

    return () => {
      systemDarkMode.removeEventListener('change', handleSystemPreferenceChange);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeEngine }}>
      <OmniThemeProvider theme={theme} engine={themeEngine}>
        {children}
      </OmniThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
