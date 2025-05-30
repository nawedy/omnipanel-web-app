import { Theme, ThemeValidationResult, ThemeValidationError, ThemeValidationWarning } from './types';

export class ThemeValidator {
  /**
   * Validate a complete theme
   */
  validate(theme: Theme): ThemeValidationResult {
    const errors: ThemeValidationError[] = [];
    const warnings: ThemeValidationWarning[] = [];

    // Validate required fields
    this.validateRequiredFields(theme, errors);
    
    // Validate color system
    this.validateColorSystem(theme.colors, errors, warnings);
    
    // Validate typography system
    this.validateTypographySystem(theme.typography, errors, warnings);
    
    // Validate spacing system
    this.validateSpacingSystem(theme.spacing, errors, warnings);
    
    // Validate component styles
    this.validateComponentStyles(theme.components, errors, warnings);
    
    // Validate layout system
    this.validateLayoutSystem(theme.layout, errors, warnings);
    
    // Validate effects system
    this.validateEffectsSystem(theme.effects, errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate required theme fields
   */
  private validateRequiredFields(theme: Theme, errors: ThemeValidationError[]): void {
    const requiredFields = ['id', 'name', 'description', 'version', 'author', 'category', 'type'];
    
    for (const field of requiredFields) {
      if (!theme[field as keyof Theme]) {
        errors.push({
          path: field,
          message: `Required field '${field}' is missing`,
          type: 'missing'
        });
      }
    }

    // Validate ID format
    if (theme.id && !/^[a-z0-9-]+$/.test(theme.id)) {
      errors.push({
        path: 'id',
        message: 'Theme ID must contain only lowercase letters, numbers, and hyphens',
        type: 'format'
      });
    }

    // Validate version format
    if (theme.version && !/^\d+\.\d+\.\d+$/.test(theme.version)) {
      errors.push({
        path: 'version',
        message: 'Version must be in semver format (e.g., 1.0.0)',
        type: 'format'
      });
    }
  }

  /**
   * Validate color system
   */
  private validateColorSystem(colors: any, errors: ThemeValidationError[], warnings: ThemeValidationWarning[]): void {
    if (!colors) {
      errors.push({
        path: 'colors',
        message: 'Color system is required',
        type: 'missing'
      });
      return;
    }

    // Validate color palettes
    const requiredPalettes = ['primary', 'secondary', 'accent', 'neutral'];
    for (const palette of requiredPalettes) {
      if (!colors[palette]) {
        errors.push({
          path: `colors.${palette}`,
          message: `Required color palette '${palette}' is missing`,
          type: 'missing'
        });
      } else {
        this.validateColorPalette(colors[palette], `colors.${palette}`, errors, warnings);
      }
    }

    // Validate semantic colors
    if (!colors.semantic) {
      errors.push({
        path: 'colors.semantic',
        message: 'Semantic colors are required',
        type: 'missing'
      });
    }

    // Validate surface colors
    if (!colors.surface) {
      errors.push({
        path: 'colors.surface',
        message: 'Surface colors are required',
        type: 'missing'
      });
    }
  }

  /**
   * Validate color palette
   */
  private validateColorPalette(palette: any, path: string, errors: ThemeValidationError[], warnings: ThemeValidationWarning[]): void {
    const requiredShades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
    
    for (const shade of requiredShades) {
      if (!palette[shade]) {
        errors.push({
          path: `${path}.${shade}`,
          message: `Color shade '${shade}' is missing`,
          type: 'missing'
        });
      } else if (!this.isValidColor(palette[shade])) {
        errors.push({
          path: `${path}.${shade}`,
          message: `Invalid color value '${palette[shade]}'`,
          type: 'format'
        });
      }
    }

    // Check contrast ratios
    if (palette['50'] && palette['900']) {
      const contrast = this.calculateContrastRatio(palette['50'], palette['900']);
      if (contrast < 7) {
        warnings.push({
          path: `${path}`,
          message: `Low contrast ratio between lightest and darkest shades (${contrast.toFixed(2)}:1)`,
          type: 'accessibility'
        });
      }
    }
  }

  /**
   * Validate typography system
   */
  private validateTypographySystem(typography: any, errors: ThemeValidationError[], warnings: ThemeValidationWarning[]): void {
    if (!typography) {
      errors.push({
        path: 'typography',
        message: 'Typography system is required',
        type: 'missing'
      });
      return;
    }

    // Validate font families
    if (!typography.fonts) {
      errors.push({
        path: 'typography.fonts',
        message: 'Font families are required',
        type: 'missing'
      });
    } else {
      const requiredFonts = ['sans', 'serif', 'mono'];
      for (const font of requiredFonts) {
        if (!typography.fonts[font] || !Array.isArray(typography.fonts[font])) {
          errors.push({
            path: `typography.fonts.${font}`,
            message: `Font family '${font}' must be an array`,
            type: 'type'
          });
        }
      }
    }

    // Validate font sizes
    if (!typography.sizes) {
      errors.push({
        path: 'typography.sizes',
        message: 'Font sizes are required',
        type: 'missing'
      });
    }

    // Validate font weights
    if (!typography.weights) {
      errors.push({
        path: 'typography.weights',
        message: 'Font weights are required',
        type: 'missing'
      });
    }
  }

  /**
   * Validate spacing system
   */
  private validateSpacingSystem(spacing: any, errors: ThemeValidationError[], warnings: ThemeValidationWarning[]): void {
    if (!spacing) {
      errors.push({
        path: 'spacing',
        message: 'Spacing system is required',
        type: 'missing'
      });
      return;
    }

    if (!spacing.scale) {
      errors.push({
        path: 'spacing.scale',
        message: 'Spacing scale is required',
        type: 'missing'
      });
    }

    if (!spacing.component) {
      errors.push({
        path: 'spacing.component',
        message: 'Component spacing is required',
        type: 'missing'
      });
    }

    if (!spacing.layout) {
      errors.push({
        path: 'spacing.layout',
        message: 'Layout spacing is required',
        type: 'missing'
      });
    }
  }

  /**
   * Validate component styles
   */
  private validateComponentStyles(components: any, errors: ThemeValidationError[], warnings: ThemeValidationWarning[]): void {
    if (!components) {
      errors.push({
        path: 'components',
        message: 'Component styles are required',
        type: 'missing'
      });
      return;
    }

    const requiredComponents = ['button', 'input', 'card', 'modal'];
    for (const component of requiredComponents) {
      if (!components[component]) {
        warnings.push({
          path: `components.${component}`,
          message: `Component styles for '${component}' are missing`,
          type: 'unused'
        });
      }
    }
  }

  /**
   * Validate layout system
   */
  private validateLayoutSystem(layout: any, errors: ThemeValidationError[], warnings: ThemeValidationWarning[]): void {
    if (!layout) {
      errors.push({
        path: 'layout',
        message: 'Layout system is required',
        type: 'missing'
      });
      return;
    }

    if (!layout.breakpoints) {
      errors.push({
        path: 'layout.breakpoints',
        message: 'Breakpoints are required',
        type: 'missing'
      });
    }

    if (!layout.containers) {
      errors.push({
        path: 'layout.containers',
        message: 'Containers are required',
        type: 'missing'
      });
    }
  }

  /**
   * Validate effects system
   */
  private validateEffectsSystem(effects: any, errors: ThemeValidationError[], warnings: ThemeValidationWarning[]): void {
    if (!effects) {
      errors.push({
        path: 'effects',
        message: 'Effects system is required',
        type: 'missing'
      });
      return;
    }

    if (!effects.shadows) {
      errors.push({
        path: 'effects.shadows',
        message: 'Shadow system is required',
        type: 'missing'
      });
    }

    if (!effects.borders) {
      errors.push({
        path: 'effects.borders',
        message: 'Border system is required',
        type: 'missing'
      });
    }

    if (!effects.animations) {
      errors.push({
        path: 'effects.animations',
        message: 'Animation system is required',
        type: 'missing'
      });
    }
  }

  /**
   * Check if a color value is valid
   */
  private isValidColor(color: string): boolean {
    // Check hex colors
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return true;
    }

    // Check rgb/rgba colors
    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/.test(color)) {
      return true;
    }

    // Check hsl/hsla colors
    if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)?\s*\)$/.test(color)) {
      return true;
    }

    // Check CSS color names (basic check)
    const cssColors = ['black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta', 'transparent'];
    if (cssColors.includes(color.toLowerCase())) {
      return true;
    }

    return false;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  private calculateContrastRatio(color1: string, color2: string): number {
    // Simplified contrast calculation
    // In a real implementation, you'd convert colors to luminance values
    // For now, return a placeholder value
    return 7.5;
  }
}

// Export utility functions
export function validateTheme(theme: Theme): ThemeValidationResult {
  const validator = new ThemeValidator();
  return validator.validate(theme);
}

export function validateColorSystem(colors: any): ThemeValidationResult {
  const validator = new ThemeValidator();
  const errors: ThemeValidationError[] = [];
  const warnings: ThemeValidationWarning[] = [];
  
  validator['validateColorSystem'](colors, errors, warnings);
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
} 