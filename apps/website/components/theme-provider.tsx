// apps/website/components/theme-provider.tsx
// Temporary fallback theme provider until theme-engine dependency is resolved

"use client";

import * as React from "react";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  themes: string[];
  isLoading: boolean;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

interface EnhancedThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: string;
  enableHotReload?: boolean;
}

export function ThemeProvider({ 
  children,
  initialTheme = "dark",
  // enableHotReload = process.env.NODE_ENV === "development" // Unused variable removed
}: EnhancedThemeProviderProps): React.JSX.Element {
  const [theme, setThemeState] = React.useState<string>(initialTheme);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Load theme from localStorage
    const saved = localStorage.getItem("omnipanel-website-theme");
    if (saved) {
      setThemeState(saved);
    }
  }, []);

  React.useEffect(() => {
    if (mounted) {
      // Apply theme to document
      document.documentElement.className = theme;
      document.documentElement.setAttribute("data-theme", theme);
      // Save to localStorage
      localStorage.setItem("omnipanel-website-theme", theme);
    }
  }, [theme, mounted]);

  const setTheme = React.useCallback((newTheme: string) => {
    setThemeState(newTheme);
  }, []);

  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    themes: ["light", "dark"],
    isLoading: !mounted
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeProvider;
