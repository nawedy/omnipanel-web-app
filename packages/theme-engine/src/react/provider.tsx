import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, CompiledTheme } from '../types';
import { ThemeEngine, getThemeEngine } from '../engine';
import { defaultTheme } from '../themes/default';

interface ThemeContextValue {
  engine: ThemeEngine;
  currentTheme: Theme | null;
  compiledTheme: CompiledTheme | null;
  themes: Theme[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTheme: (themeId: string) => Promise<void>;
  addTheme: (theme: Theme) => void;
  removeTheme: (themeId: string) => void;
  refreshThemes: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: string;
  themes?: Theme[];
  enableHotReload?: boolean;
}

export function ThemeProvider({
  children,
  initialTheme = 'omnipanel-default',
  themes = [defaultTheme],
  enableHotReload = process.env.NODE_ENV === 'development'
}: ThemeProviderProps) {
  const [engine] = useState(() => getThemeEngine());
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [compiledTheme, setCompiledTheme] = useState<CompiledTheme | null>(null);
  const [allThemes, setAllThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize themes and engine
  useEffect(() => {
    const initializeEngine = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Add default themes
        for (const theme of themes) {
          if (!engine.getTheme(theme.id)) {
            engine.addTheme(theme);
          }
        }

        // Set initial theme
        await engine.setTheme(initialTheme);
        
        setCurrentTheme(engine.getCurrentTheme());
        setAllThemes(engine.listThemes());
        
        if (engine.getCurrentTheme()) {
          const compiled = engine.compileTheme(engine.getCurrentTheme()!);
          setCompiledTheme(compiled);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize theme engine');
      } finally {
        setIsLoading(false);
      }
    };

    initializeEngine();
  }, [engine, initialTheme, themes]);

  // Set up event listeners
  useEffect(() => {
    const handleThemeChange = (event: any) => {
      setCurrentTheme(event.current);
      if (event.current) {
        const compiled = engine.compileTheme(event.current);
        setCompiledTheme(compiled);
      }
    };

    const handleThemeAdded = () => {
      setAllThemes(engine.listThemes());
    };

    const handleThemeRemoved = () => {
      setAllThemes(engine.listThemes());
    };

    const unsubscribeThemeChange = engine.onThemeChange(handleThemeChange);
    const unsubscribeThemeAdded = engine.on('theme:added', handleThemeAdded);
    const unsubscribeThemeRemoved = engine.on('theme:removed', handleThemeRemoved);

    return () => {
      unsubscribeThemeChange();
      unsubscribeThemeAdded();
      unsubscribeThemeRemoved();
    };
  }, [engine]);

  // Hot reload support
  useEffect(() => {
    if (!enableHotReload) return;

    const handleHotReload = () => {
      if (currentTheme) {
        const compiled = engine.compileTheme(currentTheme);
        setCompiledTheme(compiled);
        engine.applyTheme(compiled);
      }
    };

    // Hot reload support in development
    if (typeof module !== 'undefined' && (module as any).hot) {
      (module as any).hot.accept(['../themes/default'], handleHotReload);
      
      // Cleanup on hot reload
      if (typeof module !== 'undefined' && (module as any).hot) {
        (module as any).hot.dispose(() => {
          // Cleanup theme subscriptions
        });
      }
    }
  }, [enableHotReload, currentTheme, engine]);

  // Theme management actions
  const handleSetTheme = async (themeId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await engine.setTheme(themeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set theme');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTheme = (theme: Theme) => {
    try {
      engine.addTheme(theme);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add theme');
    }
  };

  const handleRemoveTheme = (themeId: string) => {
    try {
      engine.removeTheme(themeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove theme');
    }
  };

  const handleRefreshThemes = () => {
    setAllThemes(engine.listThemes());
  };

  const contextValue: ThemeContextValue = {
    engine,
    currentTheme,
    compiledTheme,
    themes: allThemes,
    isLoading,
    error,
    setTheme: handleSetTheme,
    addTheme: handleAddTheme,
    removeTheme: handleRemoveTheme,
    refreshThemes: handleRefreshThemes
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
} 