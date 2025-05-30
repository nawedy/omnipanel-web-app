import { Theme, ThemeCategory, ThemeType, ColorSystem, ThemeExportOptions, ThemeImportOptions, CompiledTheme } from '../types';
import { ColorUtils } from './colors';

/**
 * Theme utility functions for theme management
 */
export class ThemeUtils {
  /**
   * Deep clone a theme
   */
  static cloneTheme(theme: Theme): Theme {
    return JSON.parse(JSON.stringify(theme));
  }

  /**
   * Merge multiple themes with priority
   */
  static mergeThemes(baseTheme: Theme, ...overrideThemes: Partial<Theme>[]): Theme {
    let result = this.cloneTheme(baseTheme);

    for (const override of overrideThemes) {
      result = this.deepMerge(result, override);
    }

    // Update metadata
    result.metadata = {
      ...result.metadata,
      updated: new Date().toISOString()
    };

    return result;
  }

  /**
   * Deep merge objects
   */
  private static deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Convert theme to dark mode variant
   */
  static convertToDarkMode(theme: Theme): Theme {
    const darkTheme = this.cloneTheme(theme);
    
    // Update metadata
    darkTheme.id = `${theme.id}-dark`;
    darkTheme.name = `${theme.name} Dark`;
    darkTheme.category = 'dark';
    darkTheme.metadata.created = new Date().toISOString();
    darkTheme.metadata.updated = new Date().toISOString();

    // Invert surface colors
    if (darkTheme.colors.surface) {
      const surface = darkTheme.colors.surface;
      surface.background = '#0f172a';
      surface.foreground = '#1e293b';
      surface.card = '#1e293b';
      surface.popover = '#334155';
      surface.modal = '#1e293b';
      surface.sidebar = '#0f172a';
      surface.header = '#1e293b';
      surface.footer = '#0f172a';
    }

    // Adjust text colors for dark background
    if (darkTheme.colors.semantic?.text) {
      const text = darkTheme.colors.semantic.text;
      text.primary = '#f8fafc';
      text.secondary = '#cbd5e1';
      text.muted = '#94a3b8';
      text.disabled = '#64748b';
      text.inverse = '#0f172a';
    }

    // Adjust border colors
    if (darkTheme.colors.semantic?.border) {
      const border = darkTheme.colors.semantic.border;
      border.default = '#334155';
      border.muted = '#1e293b';
      border.subtle = '#475569';
      border.strong = '#64748b';
    }

    return darkTheme;
  }

  /**
   * Convert theme to light mode variant
   */
  static convertToLightMode(theme: Theme): Theme {
    const lightTheme = this.cloneTheme(theme);
    
    // Update metadata
    lightTheme.id = `${theme.id}-light`;
    lightTheme.name = `${theme.name} Light`;
    lightTheme.category = 'light';
    lightTheme.metadata.created = new Date().toISOString();
    lightTheme.metadata.updated = new Date().toISOString();

    // Set light surface colors
    if (lightTheme.colors.surface) {
      const surface = lightTheme.colors.surface;
      surface.background = '#ffffff';
      surface.foreground = '#f8fafc';
      surface.card = '#ffffff';
      surface.popover = '#ffffff';
      surface.modal = '#ffffff';
      surface.sidebar = '#f8fafc';
      surface.header = '#ffffff';
      surface.footer = '#f8fafc';
    }

    // Adjust text colors for light background
    if (lightTheme.colors.semantic?.text) {
      const text = lightTheme.colors.semantic.text;
      text.primary = '#0f172a';
      text.secondary = '#475569';
      text.muted = '#64748b';
      text.disabled = '#cbd5e1';
      text.inverse = '#ffffff';
    }

    // Adjust border colors
    if (lightTheme.colors.semantic?.border) {
      const border = lightTheme.colors.semantic.border;
      border.default = '#e2e8f0';
      border.muted = '#f1f5f9';
      border.subtle = '#cbd5e1';
      border.strong = '#94a3b8';
    }

    return lightTheme;
  }

  /**
   * Extract color palette from theme
   */
  static extractColorPalette(theme: Theme): Record<string, string[]> {
    const palette: Record<string, string[]> = {};

    // Extract main color palettes
    if (theme.colors.primary) {
      palette.primary = Object.values(theme.colors.primary);
    }
    if (theme.colors.secondary) {
      palette.secondary = Object.values(theme.colors.secondary);
    }
    if (theme.colors.accent) {
      palette.accent = Object.values(theme.colors.accent);
    }
    if (theme.colors.neutral) {
      palette.neutral = Object.values(theme.colors.neutral);
    }

    return palette;
  }

  /**
   * Generate theme variants
   */
  static generateVariants(baseTheme: Theme): {
    light: Theme;
    dark: Theme;
    highContrast: Theme;
  } {
    const light = this.convertToLightMode(baseTheme);
    const dark = this.convertToDarkMode(baseTheme);
    const highContrast = this.createHighContrastVariant(baseTheme);

    return { light, dark, highContrast };
  }

  /**
   * Create high contrast variant
   */
  static createHighContrastVariant(theme: Theme): Theme {
    const highContrastTheme = this.cloneTheme(theme);
    
    // Update metadata
    highContrastTheme.id = `${theme.id}-high-contrast`;
    highContrastTheme.name = `${theme.name} High Contrast`;
    highContrastTheme.category = 'high-contrast';
    highContrastTheme.metadata.created = new Date().toISOString();
    highContrastTheme.metadata.updated = new Date().toISOString();

    // Set high contrast colors
    if (highContrastTheme.colors.surface) {
      const surface = highContrastTheme.colors.surface;
      surface.background = '#000000';
      surface.foreground = '#ffffff';
      surface.card = '#000000';
      surface.popover = '#000000';
      surface.modal = '#000000';
      surface.sidebar = '#000000';
      surface.header = '#000000';
      surface.footer = '#000000';
    }

    if (highContrastTheme.colors.semantic?.text) {
      const text = highContrastTheme.colors.semantic.text;
      text.primary = '#ffffff';
      text.secondary = '#ffffff';
      text.muted = '#cccccc';
      text.disabled = '#999999';
      text.inverse = '#000000';
    }

    return highContrastTheme;
  }

  /**
   * Export theme to different formats
   */
  static exportTheme(theme: Theme, options: ThemeExportOptions): string {
    switch (options.format) {
      case 'json':
        return this.exportToJSON(theme, options);
      case 'css':
        return this.exportToCSS(theme, options);
      case 'scss':
        return this.exportToSCSS(theme, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export theme to JSON
   */
  private static exportToJSON(theme: Theme, options: ThemeExportOptions): string {
    const data = options.includeMeta ? theme : { ...theme };
    if (!options.includeMeta) {
      delete (data as any).metadata;
    }

    return options.minify 
      ? JSON.stringify(data)
      : JSON.stringify(data, null, 2);
  }

  /**
   * Export theme to CSS
   */
  private static exportToCSS(theme: Theme, options: ThemeExportOptions): string {
    let css = ':root {\n';
    
    // Export colors as CSS custom properties
    if (theme.colors.primary) {
      for (const [shade, color] of Object.entries(theme.colors.primary)) {
        css += `  --color-primary-${shade}: ${color};\n`;
      }
    }

    if (theme.colors.secondary) {
      for (const [shade, color] of Object.entries(theme.colors.secondary)) {
        css += `  --color-secondary-${shade}: ${color};\n`;
      }
    }

    // Export spacing
    if (theme.spacing?.scale) {
      for (const [size, value] of Object.entries(theme.spacing.scale)) {
        css += `  --spacing-${size}: ${value};\n`;
      }
    }

    // Export typography
    if (theme.typography?.sizes) {
      for (const [size, value] of Object.entries(theme.typography.sizes)) {
        css += `  --font-size-${size}: ${value};\n`;
      }
    }

    css += '}\n';

    return options.minify 
      ? css.replace(/\s+/g, ' ').replace(/;\s*/g, ';').replace(/\{\s*/g, '{').replace(/\s*\}/g, '}')
      : css;
  }

  /**
   * Export theme to SCSS
   */
  private static exportToSCSS(theme: Theme, options: ThemeExportOptions): string {
    let scss = '// Theme Variables\n\n';
    
    // Export colors as SCSS variables
    if (theme.colors.primary) {
      scss += '// Primary Colors\n';
      for (const [shade, color] of Object.entries(theme.colors.primary)) {
        scss += `$color-primary-${shade}: ${color};\n`;
      }
      scss += '\n';
    }

    if (theme.colors.secondary) {
      scss += '// Secondary Colors\n';
      for (const [shade, color] of Object.entries(theme.colors.secondary)) {
        scss += `$color-secondary-${shade}: ${color};\n`;
      }
      scss += '\n';
    }

    // Export spacing
    if (theme.spacing?.scale) {
      scss += '// Spacing Scale\n';
      for (const [size, value] of Object.entries(theme.spacing.scale)) {
        scss += `$spacing-${size}: ${value};\n`;
      }
      scss += '\n';
    }

    // Export typography
    if (theme.typography?.sizes) {
      scss += '// Typography Sizes\n';
      for (const [size, value] of Object.entries(theme.typography.sizes)) {
        scss += `$font-size-${size}: ${value};\n`;
      }
      scss += '\n';
    }

    return scss;
  }

  /**
   * Compare two themes and highlight differences
   */
  static compareThemes(theme1: Theme, theme2: Theme): {
    differences: Array<{
      path: string;
      oldValue: any;
      newValue: any;
    }>;
    added: string[];
    removed: string[];
  } {
    const differences: Array<{ path: string; oldValue: any; newValue: any }> = [];
    const added: string[] = [];
    const removed: string[] = [];

    this.compareObjects(theme1, theme2, '', differences, added, removed);

    return { differences, added, removed };
  }

  /**
   * Compare objects recursively
   */
  private static compareObjects(
    obj1: any,
    obj2: any,
    path: string,
    differences: Array<{ path: string; oldValue: any; newValue: any }>,
    added: string[],
    removed: string[]
  ): void {
    const keys1 = Object.keys(obj1 || {});
    const keys2 = Object.keys(obj2 || {});
    const allKeys = new Set([...keys1, ...keys2]);

    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;
      const val1 = obj1?.[key];
      const val2 = obj2?.[key];

      if (!(key in obj1)) {
        added.push(currentPath);
      } else if (!(key in obj2)) {
        removed.push(currentPath);
      } else if (typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null) {
        this.compareObjects(val1, val2, currentPath, differences, added, removed);
      } else if (val1 !== val2) {
        differences.push({
          path: currentPath,
          oldValue: val1,
          newValue: val2
        });
      }
    }
  }

  /**
   * Validate theme against schema
   */
  static validateThemeStructure(theme: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required top-level properties
    const requiredProps = ['id', 'name', 'version', 'colors', 'typography', 'spacing'];
    for (const prop of requiredProps) {
      if (!(prop in theme)) {
        errors.push(`Missing required property: ${prop}`);
      }
    }

    // Check color system structure
    if (theme.colors) {
      const requiredColorProps = ['primary', 'secondary', 'accent', 'neutral'];
      for (const prop of requiredColorProps) {
        if (!(prop in theme.colors)) {
          errors.push(`Missing required color property: colors.${prop}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate theme size (for performance monitoring)
   */
  static calculateThemeSize(theme: Theme): {
    totalSize: number;
    breakdown: Record<string, number>;
  } {
    const serialized = JSON.stringify(theme);
    const totalSize = new Blob([serialized]).size;
    
    const breakdown: Record<string, number> = {};
    breakdown.colors = new Blob([JSON.stringify(theme.colors)]).size;
    breakdown.typography = new Blob([JSON.stringify(theme.typography)]).size;
    breakdown.spacing = new Blob([JSON.stringify(theme.spacing)]).size;
    breakdown.components = new Blob([JSON.stringify(theme.components)]).size;
    breakdown.effects = new Blob([JSON.stringify(theme.effects)]).size;
    breakdown.layout = new Blob([JSON.stringify(theme.layout)]).size;

    return { totalSize, breakdown };
  }
}

// Export utility functions
export function cloneTheme(theme: Theme): Theme {
  return ThemeUtils.cloneTheme(theme);
}

export function mergeThemes(baseTheme: Theme, ...overrideThemes: Partial<Theme>[]): Theme {
  return ThemeUtils.mergeThemes(baseTheme, ...overrideThemes);
}

export function convertToDarkMode(theme: Theme): Theme {
  return ThemeUtils.convertToDarkMode(theme);
}

export function convertToLightMode(theme: Theme): Theme {
  return ThemeUtils.convertToLightMode(theme);
}

export function generateThemeVariants(baseTheme: Theme): ReturnType<typeof ThemeUtils.generateVariants> {
  return ThemeUtils.generateVariants(baseTheme);
}

export function exportTheme(theme: Theme, options: ThemeExportOptions): string {
  return ThemeUtils.exportTheme(theme, options);
}

export function compareThemes(theme1: Theme, theme2: Theme): ReturnType<typeof ThemeUtils.compareThemes> {
  return ThemeUtils.compareThemes(theme1, theme2);
}

export function validateThemeStructure(theme: any): ReturnType<typeof ThemeUtils.validateThemeStructure> {
  return ThemeUtils.validateThemeStructure(theme);
}

export function calculateThemeSize(theme: Theme): ReturnType<typeof ThemeUtils.calculateThemeSize> {
  return ThemeUtils.calculateThemeSize(theme);
} 