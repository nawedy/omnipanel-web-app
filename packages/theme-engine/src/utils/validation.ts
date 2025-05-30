import { Theme, ThemeValidationResult, ThemeValidationError, ThemeValidationWarning, ColorSystem } from '../types';
import { ColorUtils } from './colors';

/**
 * Enhanced validation utility functions
 */
export class ValidationUtils {
  /**
   * Validate theme accessibility standards
   */
  static validateAccessibility(theme: Theme): {
    errors: ThemeValidationError[];
    warnings: ThemeValidationWarning[];
  } {
    const errors: ThemeValidationError[] = [];
    const warnings: ThemeValidationWarning[] = [];

    // Check color contrast ratios
    if (theme.colors.semantic?.text && theme.colors.surface) {
      const textPrimary = theme.colors.semantic.text.primary;
      const background = theme.colors.surface.background;
      
      const contrast = ColorUtils.getContrastRatio(textPrimary, background);
      
      if (contrast < 4.5) {
        errors.push({
          path: 'colors.semantic.text.primary',
          message: `Text contrast ratio ${contrast.toFixed(2)}:1 is below WCAG AA standard (4.5:1)`,
          type: 'invalid'
        });
      } else if (contrast < 7) {
        warnings.push({
          path: 'colors.semantic.text.primary',
          message: `Text contrast ratio ${contrast.toFixed(2)}:1 is below WCAG AAA standard (7:1)`,
          type: 'accessibility'
        });
      }
    }

    // Check focus indicators
    if (!theme.effects?.borders?.width || !theme.effects.borders.width.default) {
      warnings.push({
        path: 'effects.borders.width',
        message: 'No border width defined for focus indicators',
        type: 'accessibility'
      });
    }

    // Check minimum touch target sizes (for mobile)
    if (theme.spacing?.component?.button) {
      const buttonPadding = theme.spacing.component.button.padding;
      const minTouchTarget = '44px'; // WCAG minimum
      
      // This is a simplified check - in real implementation you'd calculate actual sizes
      warnings.push({
        path: 'spacing.component.button',
        message: 'Verify button touch targets meet 44px minimum',
        type: 'accessibility'
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate theme performance implications
   */
  static validatePerformance(theme: Theme): {
    warnings: ThemeValidationWarning[];
  } {
    const warnings: ThemeValidationWarning[] = [];

    // Check for complex shadows that might impact performance
    if (theme.effects?.shadows) {
      for (const [name, shadow] of Object.entries(theme.effects.shadows)) {
        if (shadow.includes('inset') && shadow.split(',').length > 2) {
          warnings.push({
            path: `effects.shadows.${name}`,
            message: 'Complex shadows with multiple inset effects may impact performance',
            type: 'performance'
          });
        }
      }
    }

    // Check for excessive animation durations
    if (theme.effects?.animations?.duration) {
      for (const [name, duration] of Object.entries(theme.effects.animations.duration)) {
        const ms = parseInt(duration);
        if (ms > 1000) {
          warnings.push({
            path: `effects.animations.duration.${name}`,
            message: `Animation duration ${duration} may feel slow to users`,
            type: 'performance'
          });
        }
      }
    }

    // Check for backdrop filters (can be expensive)
    if (theme.components) {
      for (const [componentName, component] of Object.entries(theme.components)) {
        if (component && typeof component === 'object' && 'base' in component) {
          const base = component.base as any;
          if (base?.backdropFilter) {
            warnings.push({
              path: `components.${componentName}.base.backdropFilter`,
              message: 'Backdrop filters can impact performance, especially on mobile',
              type: 'performance'
            });
          }
        }
      }
    }

    return { warnings };
  }

  /**
   * Validate CSS property values
   */
  static validateCSSProperties(properties: Record<string, any>): {
    errors: ThemeValidationError[];
  } {
    const errors: ThemeValidationError[] = [];

    for (const [property, value] of Object.entries(properties)) {
      if (typeof value === 'string') {
        // Validate color values
        if (this.isColorProperty(property)) {
          if (!this.isValidColorValue(value)) {
            errors.push({
              path: property,
              message: `Invalid color value: ${value}`,
              type: 'format'
            });
          }
        }

        // Validate length values
        if (this.isLengthProperty(property)) {
          if (!this.isValidLengthValue(value)) {
            errors.push({
              path: property,
              message: `Invalid length value: ${value}`,
              type: 'format'
            });
          }
        }

        // Validate URL values
        if (this.isUrlProperty(property)) {
          if (!this.isValidUrlValue(value)) {
            errors.push({
              path: property,
              message: `Invalid URL value: ${value}`,
              type: 'format'
            });
          }
        }
      }
    }

    return { errors };
  }

  /**
   * Check if property name suggests it should contain a color value
   */
  private static isColorProperty(property: string): boolean {
    const colorProperties = [
      'color', 'backgroundColor', 'borderColor', 'outlineColor',
      'textDecorationColor', 'caretColor', 'columnRuleColor'
    ];
    return colorProperties.some(prop => property.toLowerCase().includes(prop.toLowerCase()));
  }

  /**
   * Check if property name suggests it should contain a length value
   */
  private static isLengthProperty(property: string): boolean {
    const lengthProperties = [
      'width', 'height', 'margin', 'padding', 'border', 'fontSize',
      'lineHeight', 'letterSpacing', 'textIndent', 'borderRadius'
    ];
    return lengthProperties.some(prop => property.toLowerCase().includes(prop.toLowerCase()));
  }

  /**
   * Check if property name suggests it should contain a URL value
   */
  private static isUrlProperty(property: string): boolean {
    const urlProperties = ['backgroundImage', 'listStyleImage', 'borderImageSource'];
    return urlProperties.some(prop => property.toLowerCase().includes(prop.toLowerCase()));
  }

  /**
   * Validate color value format
   */
  private static isValidColorValue(value: string): boolean {
    // Basic validation - in real implementation, use more comprehensive color validation
    const colorPatterns = [
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, // Hex
      /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/, // RGB/RGBA
      /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)?\s*\)$/, // HSL/HSLA
      /^(transparent|currentColor)$/, // Special values
      /^[a-zA-Z]+$/ // Named colors (simplified check)
    ];

    return colorPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Validate length value format
   */
  private static isValidLengthValue(value: string): boolean {
    const lengthPatterns = [
      /^-?\d*\.?\d+(px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/, // Length units
      /^0$/, // Zero without unit
      /^(auto|inherit|initial|unset)$/ // Keyword values
    ];

    return lengthPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Validate URL value format
   */
  private static isValidUrlValue(value: string): boolean {
    return /^url\(['"]?[^'"]*['"]?\)$/.test(value) || value === 'none';
  }

  /**
   * Validate theme completeness
   */
  static validateCompleteness(theme: Theme): {
    errors: ThemeValidationError[];
    warnings: ThemeValidationWarning[];
  } {
    const errors: ThemeValidationError[] = [];
    const warnings: ThemeValidationWarning[] = [];

    // Check required color palettes
    const requiredPalettes = ['primary', 'secondary', 'accent', 'neutral'];
    for (const palette of requiredPalettes) {
      if (!theme.colors[palette as keyof ColorSystem]) {
        errors.push({
          path: `colors.${palette}`,
          message: `Required color palette '${palette}' is missing`,
          type: 'missing'
        });
      }
    }

    // Check semantic colors
    if (!theme.colors.semantic) {
      errors.push({
        path: 'colors.semantic',
        message: 'Semantic colors are required for proper theming',
        type: 'missing'
      });
    }

    // Check surface colors
    if (!theme.colors.surface) {
      errors.push({
        path: 'colors.surface',
        message: 'Surface colors are required for proper theming',
        type: 'missing'
      });
    }

    // Check typography system
    if (!theme.typography?.fonts?.sans) {
      warnings.push({
        path: 'typography.fonts.sans',
        message: 'Sans serif font stack is recommended',
        type: 'unused'
      });
    }

    // Check spacing system
    if (!theme.spacing?.scale) {
      errors.push({
        path: 'spacing.scale',
        message: 'Spacing scale is required for consistent spacing',
        type: 'missing'
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate theme consistency
   */
  static validateConsistency(theme: Theme): {
    warnings: ThemeValidationWarning[];
  } {
    const warnings: ThemeValidationWarning[] = [];

    // Check color palette consistency (all palettes should have same shades)
    if (theme.colors.primary && theme.colors.secondary) {
      const primaryShades = Object.keys(theme.colors.primary);
      const secondaryShades = Object.keys(theme.colors.secondary);
      
      if (primaryShades.length !== secondaryShades.length) {
        warnings.push({
          path: 'colors',
          message: 'Color palettes should have consistent shade structures',
          type: 'unused'
        });
      }
    }

    // Check spacing scale consistency
    if (theme.spacing?.scale) {
      const spacingValues = Object.values(theme.spacing.scale);
      const units = spacingValues.map(value => value.replace(/[\d.-]/g, ''));
      const uniqueUnits = [...new Set(units)];
      
      if (uniqueUnits.length > 2) {
        warnings.push({
          path: 'spacing.scale',
          message: 'Consider using consistent units in spacing scale (e.g., rem or px)',
          type: 'unused'
        });
      }
    }

    return { warnings };
  }

  /**
   * Generate comprehensive validation report
   */
  static generateValidationReport(theme: Theme): ThemeValidationResult {
    const allErrors: ThemeValidationError[] = [];
    const allWarnings: ThemeValidationWarning[] = [];

    // Run all validation checks
    const accessibility = this.validateAccessibility(theme);
    const performance = this.validatePerformance(theme);
    const completeness = this.validateCompleteness(theme);
    const consistency = this.validateConsistency(theme);

    // Collect all errors and warnings
    allErrors.push(...accessibility.errors);
    allErrors.push(...completeness.errors);

    allWarnings.push(...accessibility.warnings);
    allWarnings.push(...performance.warnings);
    allWarnings.push(...completeness.warnings);
    allWarnings.push(...consistency.warnings);

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }
}

// Export utility functions
export function validateThemeAccessibility(theme: Theme): ReturnType<typeof ValidationUtils.validateAccessibility> {
  return ValidationUtils.validateAccessibility(theme);
}

export function validateThemePerformance(theme: Theme): ReturnType<typeof ValidationUtils.validatePerformance> {
  return ValidationUtils.validatePerformance(theme);
}

export function validateCSSProperties(properties: Record<string, any>): ReturnType<typeof ValidationUtils.validateCSSProperties> {
  return ValidationUtils.validateCSSProperties(properties);
}

export function validateThemeCompleteness(theme: Theme): ReturnType<typeof ValidationUtils.validateCompleteness> {
  return ValidationUtils.validateCompleteness(theme);
}

export function validateThemeConsistency(theme: Theme): ReturnType<typeof ValidationUtils.validateConsistency> {
  return ValidationUtils.validateConsistency(theme);
}

export function generateValidationReport(theme: Theme): ThemeValidationResult {
  return ValidationUtils.generateValidationReport(theme);
} 