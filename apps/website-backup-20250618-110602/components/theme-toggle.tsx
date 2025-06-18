"use client";

import * as React from "react";
import { useTheme } from "@/components/theme-provider";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: "default" | "minimal" | "icon-only";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ThemeToggle({ 
  className = "", 
  showLabel = false,
  variant = "default",
  size = "default" 
}: ThemeToggleProps): React.JSX.Element {
  const { theme, setTheme, themes, isLoading } = useTheme();

  if (isLoading) {
    return (
      <Button 
        variant="outline" 
        size={size}
        className={`opacity-50 ${className}`}
        disabled
      >
        <div className="h-4 w-4 animate-pulse rounded bg-muted" />
      </Button>
    );
  }
  
  const toggleTheme = (): void => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    setTheme(nextTheme);
  };

  const getIcon = (): React.JSX.Element => {
    return theme === "dark" 
      ? <MoonIcon className="h-4 w-4" />
      : <SunIcon className="h-4 w-4" />;
  };

  const getLabel = (): string => {
    return theme === "dark" ? "Dark" : "Light";
  };

  const getNextThemeLabel = (): string => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    return nextTheme === "dark" ? "Dark" : "Light";
  };

  if (variant === "icon-only") {
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={toggleTheme}
        className={`transition-all duration-200 hover:scale-105 ${className}`}
        aria-label={`Switch to ${getNextThemeLabel()}`}
      >
        {getIcon()}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 ${className}`}
      aria-label={`Current theme: ${getLabel()}. Click to switch theme.`}
    >
      {getIcon()}
      {showLabel && <span className="text-sm font-medium">{getLabel()}</span>}
    </Button>
  );
}

export default ThemeToggle;
