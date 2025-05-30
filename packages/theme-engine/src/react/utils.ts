import { Theme, CompiledTheme } from '../types';
import { ThemeEngine } from '../engine';

/**
 * React utility functions for theme management
 */
export class ReactThemeUtils {
  /**
   * Generate CSS variables from theme
   */
  static generateCSSVariables(theme: Theme, prefix: string = '--'): Record<string, string> {
    const variables: Record<string, string> = {};
    
    // Generate color variables
    if (theme.colors.primary) {
      Object.entries(theme.colors.primary).forEach(([shade, color]) => {
        variables[`${prefix}color-primary-${shade}`] = color;
      });
    }
    
    if (theme.colors.secondary) {
      Object.entries(theme.colors.secondary).forEach(([shade, color]) => {
        variables[`${prefix}color-secondary-${shade}`] = color;
      });
    }
    
    if (theme.colors.accent) {
      Object.entries(theme.colors.accent).forEach(([shade, color]) => {
        variables[`${prefix}color-accent-${shade}`] = color;
      });
    }
    
    if (theme.colors.neutral) {
      Object.entries(theme.colors.neutral).forEach(([shade, color]) => {
        variables[`${prefix}color-neutral-${shade}`] = color;
      });
    }
    
    // Generate semantic color variables
    if (theme.colors.semantic) {
      if (theme.colors.semantic.text) {
        Object.entries(theme.colors.semantic.text).forEach(([key, color]) => {
          variables[`${prefix}text-${key}`] = color;
        });
      }
      
      if (theme.colors.semantic.border) {
        Object.entries(theme.colors.semantic.border).forEach(([key, color]) => {
          variables[`${prefix}border-${key}`] = color;
        });
      }
    }
    
    // Generate surface color variables
    if (theme.colors.surface) {
      Object.entries(theme.colors.surface).forEach(([key, color]) => {
        variables[`${prefix}surface-${key}`] = color;
      });
    }
    
    // Generate spacing variables
    if (theme.spacing?.scale) {
      Object.entries(theme.spacing.scale).forEach(([size, value]) => {
        variables[`${prefix}spacing-${size}`] = value;
      });
    }
    
    // Generate typography variables
    if (theme.typography?.sizes) {
      Object.entries(theme.typography.sizes).forEach(([size, value]) => {
        variables[`${prefix}font-size-${size}`] = value;
      });
    }
    
    if (theme.typography?.fonts) {
      Object.entries(theme.typography.fonts).forEach(([family, stack]) => {
        variables[`${prefix}font-${family}`] = stack;
      });
    }
    
    // Generate effect variables
    if (theme.effects?.shadows) {
      Object.entries(theme.effects.shadows).forEach(([name, shadow]) => {
        variables[`${prefix}shadow-${name}`] = shadow;
      });
    }
    
    if (theme.effects?.borders?.radius) {
      Object.entries(theme.effects.borders.radius).forEach(([size, value]) => {
        variables[`${prefix}radius-${size}`] = value;
      });
    }
    
    return variables;
  }

  /**
   * Apply CSS variables to document root
   */
  static applyCSSVariables(variables: Record<string, string>): void {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }

  /**
   * Remove CSS variables from document root
   */
  static removeCSSVariables(variables: Record<string, string>): void {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    Object.keys(variables).forEach(property => {
      root.style.removeProperty(property);
    });
  }

  /**
   * Create style object for React components
   */
  static createStyleObject(theme: Theme): Record<string, any> {
    return {
      colors: {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        accent: theme.colors.accent,
        neutral: theme.colors.neutral,
        text: theme.colors.semantic?.text,
        border: theme.colors.semantic?.border,
        surface: theme.colors.surface
      },
      typography: {
        fonts: theme.typography?.fonts,
        sizes: theme.typography?.sizes,
        weights: theme.typography?.weights,
        lineHeights: theme.typography?.lineHeights
      },
      spacing: theme.spacing?.scale,
      effects: {
        shadows: theme.effects?.shadows,
        borders: theme.effects?.borders,
        animations: theme.effects?.animations
      }
    };
  }

  /**
   * Generate inline styles for theme-aware components
   */
  static generateInlineStyles(theme: Theme, componentType: string): Record<string, any> {
    const baseStyles: Record<string, any> = {
      fontFamily: theme.typography?.fonts?.sans,
      fontSize: theme.typography?.sizes?.base,
      lineHeight: theme.typography?.lineHeights?.normal,
      color: theme.colors.semantic?.text?.primary
    };

    switch (componentType) {
      case 'button':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.primary?.[500],
          color: '#ffffff',
          border: 'none',
          borderRadius: theme.effects?.borders?.radius?.md,
          padding: `${theme.spacing?.scale?.[2]} ${theme.spacing?.scale?.[4]}`,
          fontSize: theme.typography?.sizes?.sm,
          fontWeight: theme.typography?.weights?.medium,
          cursor: 'pointer',
          transition: 'all 150ms ease-in-out'
        };
        
      case 'input':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.surface?.background,
          border: `1px solid ${theme.colors.semantic?.border?.default}`,
          borderRadius: theme.effects?.borders?.radius?.md,
          padding: `${theme.spacing?.scale?.[2]} ${theme.spacing?.scale?.[3]}`,
          fontSize: theme.typography?.sizes?.sm
        };
        
      case 'card':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.surface?.card,
          border: `1px solid ${theme.colors.semantic?.border?.default}`,
          borderRadius: theme.effects?.borders?.radius?.lg,
          padding: theme.spacing?.scale?.[6],
          boxShadow: theme.effects?.shadows?.sm
        };
        
      default:
        return baseStyles;
    }
  }

  /**
   * Create media query object for responsive design
   */
  static createMediaQueries(theme: Theme): Record<string, string> {
    const breakpoints = theme.layout?.breakpoints;
    if (!breakpoints) return {};
    
    return {
      xs: `@media (min-width: ${breakpoints.xs})`,
      sm: `@media (min-width: ${breakpoints.sm})`,
      md: `@media (min-width: ${breakpoints.md})`,
      lg: `@media (min-width: ${breakpoints.lg})`,
      xl: `@media (min-width: ${breakpoints.xl})`,
      '2xl': `@media (min-width: ${breakpoints['2xl']})`
    };
  }

  /**
   * Get computed theme values for runtime use
   */
  static getComputedTheme(theme: Theme): CompiledTheme {
    // For now, return a simple compiled theme structure
    // In the future, this should integrate with ThemeEngine.compileTheme when available
    return {
      id: theme.id,
      css: '',
      variables: this.generateCSSVariables(theme),
      components: {},
      metadata: theme.metadata
    };
  }

  /**
   * Create theme-aware className generator
   */
  static createClassNameGenerator(prefix: string = 'theme') {
    return {
      color: (palette: string, shade: string) => `${prefix}-${palette}-${shade}`,
      text: (variant: string) => `${prefix}-text-${variant}`,
      bg: (variant: string) => `${prefix}-bg-${variant}`,
      border: (variant: string) => `${prefix}-border-${variant}`,
      spacing: (size: string) => `${prefix}-spacing-${size}`,
      typography: (size: string) => `${prefix}-text-${size}`,
      component: (component: string, variant?: string) => 
        variant ? `${prefix}-${component}-${variant}` : `${prefix}-${component}`
    };
  }

  /**
   * Create CSS-in-JS object for styled-components or emotion
   */
  static createStyledObject(theme: Theme) {
    return {
      colors: theme.colors,
      typography: theme.typography,
      spacing: theme.spacing?.scale,
      effects: theme.effects,
      layout: theme.layout,
      // Helper functions with safe property access
      color: (path: string) => this.getNestedValue(theme.colors, path),
      space: (size: string | number) => {
        const scale = theme.spacing?.scale;
        return scale ? (scale as any)[size] : undefined;
      },
      fontSize: (size: string) => {
        const sizes = theme.typography?.sizes;
        return sizes ? (sizes as any)[size] : undefined;
      },
      fontFamily: (family: string) => {
        const fonts = theme.typography?.fonts;
        return fonts ? (fonts as any)[family] : undefined;
      },
      shadow: (name: string) => {
        const shadows = theme.effects?.shadows;
        return shadows ? (shadows as any)[name] : undefined;
      },
      radius: (size: string) => {
        const radius = theme.effects?.borders?.radius;
        return radius ? (radius as any)[size] : undefined;
      }
    };
  }

  /**
   * Get nested value from object using dot notation
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Create theme-aware CSS custom properties
   */
  static createCustomProperties(theme: Theme, options: {
    prefix?: string;
    includeMetadata?: boolean;
  } = {}): string {
    const { prefix = '--theme', includeMetadata = false } = options;
    const variables = this.generateCSSVariables(theme, prefix + '-');
    
    let css = ':root {\n';
    
    if (includeMetadata) {
      css += `  /* Theme: ${theme.name} v${theme.version} */\n`;
      css += `  /* Category: ${theme.category} */\n`;
      css += `  /* Generated: ${new Date().toISOString()} */\n\n`;
    }
    
    Object.entries(variables).forEach(([property, value]) => {
      css += `  ${property}: ${value};\n`;
    });
    
    css += '}\n';
    return css;
  }

  /**
   * Validate theme for React usage
   */
  static validateReactTheme(theme: Theme): {
    valid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    
    // Check for commonly used properties in React
    if (!theme.colors.semantic?.text?.primary) {
      warnings.push('Missing semantic text primary color');
    }
    
    if (!theme.colors.surface?.background) {
      warnings.push('Missing surface background color');
    }
    
    if (!theme.typography?.fonts?.sans) {
      warnings.push('Missing sans serif font family');
    }
    
    if (!theme.spacing?.scale) {
      warnings.push('Missing spacing scale');
    }
    
    // Check for CSS custom property compatibility
    Object.entries(theme.colors).forEach(([palette, colors]) => {
      if (colors && typeof colors === 'object') {
        Object.keys(colors).forEach(shade => {
          if (!/^[a-zA-Z0-9-_]+$/.test(shade)) {
            warnings.push(`Invalid shade name for CSS variables: ${palette}.${shade}`);
          }
        });
      }
    });
    
    return {
      valid: warnings.length === 0,
      warnings
    };
  }
}

// Export utility functions
export function generateCSSVariables(theme: Theme, prefix?: string): Record<string, string> {
  return ReactThemeUtils.generateCSSVariables(theme, prefix);
}

export function applyCSSVariables(variables: Record<string, string>): void {
  return ReactThemeUtils.applyCSSVariables(variables);
}

export function removeCSSVariables(variables: Record<string, string>): void {
  return ReactThemeUtils.removeCSSVariables(variables);
}

export function createStyleObject(theme: Theme): Record<string, any> {
  return ReactThemeUtils.createStyleObject(theme);
}

export function generateInlineStyles(theme: Theme, componentType: string): Record<string, any> {
  return ReactThemeUtils.generateInlineStyles(theme, componentType);
}

export function createMediaQueries(theme: Theme): Record<string, string> {
  return ReactThemeUtils.createMediaQueries(theme);
}

export function createStyledObject(theme: Theme): ReturnType<typeof ReactThemeUtils.createStyledObject> {
  return ReactThemeUtils.createStyledObject(theme);
}

export function createCustomProperties(theme: Theme, options?: Parameters<typeof ReactThemeUtils.createCustomProperties>[1]): string {
  return ReactThemeUtils.createCustomProperties(theme, options);
}

export function validateReactTheme(theme: Theme): ReturnType<typeof ReactThemeUtils.validateReactTheme> {
  return ReactThemeUtils.validateReactTheme(theme);
} 