import { useCallback, useEffect, useMemo, useState } from 'react';
import { useThemeContext } from './provider';
import { Theme, ColorPalette, ThemeValidationResult } from '../types';
import { ThemeBuilder, createTheme } from '../builder';
import { ColorUtils } from '../utils/colors';

/**
 * Hook for basic theme management
 */
export function useTheme() {
  const { currentTheme, setTheme, themes, isLoading, error } = useThemeContext();
  
  return {
    theme: currentTheme,
    setTheme,
    themes,
    isLoading,
    error,
    isDark: currentTheme?.category === 'dark',
    isLight: currentTheme?.category === 'light'
  };
}

/**
 * Hook for accessing compiled theme CSS and variables
 */
export function useCompiledTheme() {
  const { compiledTheme } = useThemeContext();
  
  return {
    css: compiledTheme?.css || '',
    variables: compiledTheme?.variables || {},
    isReady: !!compiledTheme
  };
}

/**
 * Hook for accessing theme colors
 */
export function useThemeColors() {
  const { currentTheme } = useThemeContext();
  
  return {
    colors: currentTheme?.colors,
    primary: currentTheme?.colors.primary,
    secondary: currentTheme?.colors.secondary,
    accent: currentTheme?.colors.accent,
    neutral: currentTheme?.colors.neutral,
    semantic: currentTheme?.colors.semantic,
    surface: currentTheme?.colors.surface,
    state: currentTheme?.colors.state,
    syntax: currentTheme?.colors.syntax
  };
}

/**
 * Hook for accessing theme typography
 */
export function useThemeTypography() {
  const { currentTheme } = useThemeContext();
  
  return {
    typography: currentTheme?.typography,
    fonts: currentTheme?.typography.fonts,
    sizes: currentTheme?.typography.sizes,
    weights: currentTheme?.typography.weights,
    lineHeights: currentTheme?.typography.lineHeights,
    letterSpacing: currentTheme?.typography.letterSpacing,
    textStyles: currentTheme?.typography.textStyles
  };
}

/**
 * Hook for accessing theme spacing
 */
export function useThemeSpacing() {
  const { currentTheme } = useThemeContext();
  
  return {
    spacing: currentTheme?.spacing,
    scale: currentTheme?.spacing.scale,
    component: currentTheme?.spacing.component,
    layout: currentTheme?.spacing.layout
  };
}

/**
 * Hook for accessing theme effects
 */
export function useThemeEffects() {
  const { currentTheme } = useThemeContext();
  
  return {
    effects: currentTheme?.effects,
    shadows: currentTheme?.effects.shadows,
    borders: currentTheme?.effects.borders,
    animations: currentTheme?.effects.animations,
    transitions: currentTheme?.effects.transitions,
    filters: currentTheme?.effects.filters
  };
}

/**
 * Hook for creating and editing themes
 */
export function useThemeBuilder(initialTheme?: Theme) {
  const { addTheme } = useThemeContext();
  const [builder, setBuilder] = useState<ThemeBuilder>(() => 
    initialTheme ? ThemeBuilder.fromTheme(initialTheme) : createTheme()
  );
  const [validation, setValidation] = useState<ThemeValidationResult | null>(null);

  const updateBuilder = useCallback((updater: (builder: ThemeBuilder) => ThemeBuilder) => {
    setBuilder(prev => {
      const newBuilder = updater(prev);
      setValidation(newBuilder.validate());
      return newBuilder;
    });
  }, []);

  const setPrimaryColor = useCallback((color: string) => {
    updateBuilder(b => b.setPrimaryColor(color));
  }, [updateBuilder]);

  const setSecondaryColor = useCallback((color: string) => {
    updateBuilder(b => b.setSecondaryColor(color));
  }, [updateBuilder]);

  const setAccentColor = useCallback((color: string) => {
    updateBuilder(b => b.setAccentColor(color));
  }, [updateBuilder]);

  const setFonts = useCallback((fonts: Parameters<ThemeBuilder['setFonts']>[0]) => {
    updateBuilder(b => b.setFonts(fonts));
  }, [updateBuilder]);

  const setBorderRadius = useCallback((style: 'sharp' | 'rounded' | 'pill') => {
    updateBuilder(b => b.setBorderRadius(style));
  }, [updateBuilder]);

  const setDarkMode = useCallback((isDark: boolean) => {
    updateBuilder(b => b.setDarkMode(isDark));
  }, [updateBuilder]);

  const setAnimations = useCallback((enabled: boolean) => {
    updateBuilder(b => b.setAnimations(enabled));
  }, [updateBuilder]);

  const buildTheme = useCallback(() => {
    return builder.build();
  }, [builder]);

  const saveTheme = useCallback(() => {
    const theme = buildTheme();
    addTheme(theme);
    return theme;
  }, [buildTheme, addTheme]);

  return {
    builder,
    validation,
    isValid: validation?.valid || false,
    errors: validation?.errors || [],
    warnings: validation?.warnings || [],
    
    // Actions
    setPrimaryColor,
    setSecondaryColor,
    setAccentColor,
    setFonts,
    setBorderRadius,
    setDarkMode,
    setAnimations,
    buildTheme,
    saveTheme,
    
    // Manual builder access
    updateBuilder
  };
}

/**
 * Hook for color palette generation and manipulation
 */
export function useColorPalette(baseColor?: string) {
  const [palette, setPalette] = useState<ColorPalette | null>(null);
  const [variations, setVariations] = useState<any>(null);

  useEffect(() => {
    if (baseColor) {
      try {
        const generated = ColorUtils.generatePalette(baseColor);
        const colorVariations = ColorUtils.getVariations(baseColor);
        
        setPalette(generated);
        setVariations(colorVariations);
      } catch (error) {
        setPalette(null);
        setVariations(null);
      }
    }
  }, [baseColor]);

  const generatePalette = useCallback((color: string) => {
    try {
      const generated = ColorUtils.generatePalette(color);
      const colorVariations = ColorUtils.getVariations(color);
      
      setPalette(generated);
      setVariations(colorVariations);
      return generated;
    } catch (error) {
      setPalette(null);
      setVariations(null);
      return null;
    }
  }, []);

  const getComplementary = useCallback((color: string) => {
    return ColorUtils.getComplementary(color);
  }, []);

  const getTriadic = useCallback((color: string) => {
    return ColorUtils.getTriadic(color);
  }, []);

  const getAnalogous = useCallback((color: string, count?: number) => {
    return ColorUtils.getAnalogous(color, count);
  }, []);

  const checkAccessibility = useCallback((foreground: string, background: string) => {
    return {
      ratio: ColorUtils.getContrastRatio(foreground, background),
      accessible: ColorUtils.isAccessible(foreground, background),
      accessibleAAA: ColorUtils.isAccessible(foreground, background, 'AAA')
    };
  }, []);

  return {
    palette,
    variations,
    generatePalette,
    getComplementary,
    getTriadic,
    getAnalogous,
    checkAccessibility
  };
}

/**
 * Hook for dark mode detection and management
 */
export function useDarkMode() {
  const { currentTheme, setTheme, themes } = useThemeContext();
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  // Detect system dark mode preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemPrefersDark(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setSystemPrefersDark(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const isDark = currentTheme?.category === 'dark';
  
  const toggleDarkMode = useCallback(async () => {
    // Find corresponding light/dark theme
    const currentId = currentTheme?.id;
    if (!currentId) return;

    const targetCategory = isDark ? 'light' : 'dark';
    const targetTheme = themes.find(t => 
      t.category === targetCategory && 
      (t.id.includes(currentId.replace('-dark', '').replace('-light', '')) ||
       currentId.includes(t.id.replace('-dark', '').replace('-light', '')))
    );

    if (targetTheme) {
      await setTheme(targetTheme.id);
    }
  }, [currentTheme, isDark, themes, setTheme]);

  const setDarkMode = useCallback(async (dark: boolean) => {
    if (dark === isDark) return;
    await toggleDarkMode();
  }, [isDark, toggleDarkMode]);

  return {
    isDark,
    isLight: !isDark,
    systemPrefersDark,
    toggleDarkMode,
    setDarkMode
  };
}

/**
 * Hook for theme performance monitoring
 */
export function useThemePerformance() {
  const { engine } = useThemeContext();
  const [stats, setStats] = useState(engine.getStats());

  useEffect(() => {
    const updateStats = () => setStats(engine.getStats());
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [engine]);

  const clearCache = useCallback(() => {
    engine.clearCache();
    setStats(engine.getStats());
  }, [engine]);

  return {
    stats,
    clearCache,
    memoryUsage: stats.memoryUsage,
    totalThemes: stats.totalThemes,
    compiledThemes: stats.compiledThemes
  };
}

/**
 * Hook for CSS variable access
 */
export function useCSSVariables() {
  const { compiledTheme } = useThemeContext();

  const getVariable = useCallback((variable: string) => {
    if (typeof document === 'undefined') return '';
    
    const value = compiledTheme?.variables[variable] || 
                  getComputedStyle(document.documentElement).getPropertyValue(variable);
    return value;
  }, [compiledTheme]);

  const setVariable = useCallback((variable: string, value: string) => {
    if (typeof document === 'undefined') return;
    
    document.documentElement.style.setProperty(variable, value);
  }, []);

  return {
    variables: compiledTheme?.variables || {},
    getVariable,
    setVariable
  };
}

/**
 * Hook for responsive theme utilities
 */
export function useResponsiveTheme() {
  const { currentTheme } = useThemeContext();
  const [screenSize, setScreenSize] = useState<string>('md');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateScreenSize = () => {
      const width = window.innerWidth;
      const breakpoints = currentTheme?.layout.breakpoints;
      
      if (!breakpoints) {
        setScreenSize('md');
        return;
      }

      if (width >= parseInt(breakpoints['2xl'])) setScreenSize('2xl');
      else if (width >= parseInt(breakpoints.xl)) setScreenSize('xl');
      else if (width >= parseInt(breakpoints.lg)) setScreenSize('lg');
      else if (width >= parseInt(breakpoints.md)) setScreenSize('md');
      else if (width >= parseInt(breakpoints.sm)) setScreenSize('sm');
      else setScreenSize('xs');
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [currentTheme]);

  return {
    screenSize,
    breakpoints: currentTheme?.layout.breakpoints,
    isMobile: ['xs', 'sm'].includes(screenSize),
    isTablet: screenSize === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(screenSize)
  };
} 