'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

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

const OmniThemeProvider = ({ children, theme }: { children: React.ReactNode; theme: string; engine: ThemeEngine }) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.className = theme;
    }
  }, [theme]);

  return <>{children}</>;
};

const themeEngine = new ThemeEngine({
  defaultTheme: 'dark',
  themes: ['light', 'dark', 'system'],
  storage: typeof window !== 'undefined' ? window.localStorage : null,
  storageKey: 'omnipanel-website-theme',
});

type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
  themeEngine: ThemeEngine;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<string>(themeEngine.getCurrentTheme());
  
  const setTheme = (newTheme: string) => {
    themeEngine.setTheme(newTheme);
    setThemeState(newTheme);
  };

  useEffect(() => {
    const handleSystemPreferenceChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
    systemDarkMode.addEventListener('change', handleSystemPreferenceChange);

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
