import { Theme, CompiledTheme } from '../types';
import { ComponentUtils } from '../utils/components';
import { LayoutUtils } from '../utils/layout';
import { AnimationUtils } from '../utils/animations';

/**
 * CSS utility functions for theme CSS generation
 */
export class CSSUtils {
  /**
   * Generate complete theme CSS
   */
  static generateThemeCSS(theme: Theme, options: {
    prefix?: string;
    includeComponents?: boolean;
    includeUtilities?: boolean;
    includeAnimations?: boolean;
    minify?: boolean;
  } = {}): string {
    const {
      prefix = 'op',
      includeComponents = true,
      includeUtilities = true,
      includeAnimations = true,
      minify = false
    } = options;

    let css = '';

    // Generate CSS custom properties
    css += this.generateCSSVariables(theme, prefix);
    css += '\n\n';

    // Generate base styles
    css += this.generateBaseStyles(theme, prefix);
    css += '\n\n';

    // Generate utility classes
    if (includeUtilities) {
      css += this.generateUtilityClasses(theme, prefix);
      css += '\n\n';
    }

    // Generate component styles
    if (includeComponents && theme.components) {
      css += ComponentUtils.generateAllComponentsCSS(theme.components, prefix);
      css += '\n\n';
    }

    // Generate layout styles
    if (theme.layout) {
      css += LayoutUtils.generateLayoutCSS(theme.layout, prefix);
      css += '\n\n';
    }

    // Generate animations
    if (includeAnimations && theme.effects?.animations) {
      css += AnimationUtils.generateAnimationCSS(theme.effects.animations, prefix);
      css += '\n\n';
    }

    return minify ? this.minifyCSS(css) : css;
  }

  /**
   * Generate CSS custom properties
   */
  static generateCSSVariables(theme: Theme, prefix: string = 'op'): string {
    let css = `:root {\n`;
    css += `  /* ${theme.name} v${theme.version} */\n`;
    css += `  /* Generated: ${new Date().toISOString()} */\n\n`;

    // Color variables
    if (theme.colors.primary) {
      css += `  /* Primary Colors */\n`;
      Object.entries(theme.colors.primary).forEach(([shade, color]) => {
        css += `  --${prefix}-primary-${shade}: ${color};\n`;
      });
      css += '\n';
    }

    if (theme.colors.secondary) {
      css += `  /* Secondary Colors */\n`;
      Object.entries(theme.colors.secondary).forEach(([shade, color]) => {
        css += `  --${prefix}-secondary-${shade}: ${color};\n`;
      });
      css += '\n';
    }

    if (theme.colors.accent) {
      css += `  /* Accent Colors */\n`;
      Object.entries(theme.colors.accent).forEach(([shade, color]) => {
        css += `  --${prefix}-accent-${shade}: ${color};\n`;
      });
      css += '\n';
    }

    if (theme.colors.neutral) {
      css += `  /* Neutral Colors */\n`;
      Object.entries(theme.colors.neutral).forEach(([shade, color]) => {
        css += `  --${prefix}-neutral-${shade}: ${color};\n`;
      });
      css += '\n';
    }

    // Semantic colors
    if (theme.colors.semantic) {
      css += `  /* Semantic Colors */\n`;
      if (theme.colors.semantic.text) {
        Object.entries(theme.colors.semantic.text).forEach(([key, color]) => {
          css += `  --${prefix}-text-${key}: ${color};\n`;
        });
      }
      if (theme.colors.semantic.border) {
        Object.entries(theme.colors.semantic.border).forEach(([key, color]) => {
          css += `  --${prefix}-border-${key}: ${color};\n`;
        });
      }
      css += '\n';
    }

    // Surface colors
    if (theme.colors.surface) {
      css += `  /* Surface Colors */\n`;
      Object.entries(theme.colors.surface).forEach(([key, color]) => {
        css += `  --${prefix}-surface-${key}: ${color};\n`;
      });
      css += '\n';
    }

    // Typography variables
    if (theme.typography) {
      css += `  /* Typography */\n`;
      if (theme.typography.fonts) {
        Object.entries(theme.typography.fonts).forEach(([family, stack]) => {
          css += `  --${prefix}-font-${family}: ${stack};\n`;
        });
      }
      if (theme.typography.sizes) {
        Object.entries(theme.typography.sizes).forEach(([size, value]) => {
          css += `  --${prefix}-text-${size}: ${value};\n`;
        });
      }
      if (theme.typography.weights) {
        Object.entries(theme.typography.weights).forEach(([weight, value]) => {
          css += `  --${prefix}-font-${weight}: ${value};\n`;
        });
      }
      css += '\n';
    }

    // Spacing variables
    if (theme.spacing?.scale) {
      css += `  /* Spacing */\n`;
      Object.entries(theme.spacing.scale).forEach(([size, value]) => {
        css += `  --${prefix}-space-${size}: ${value};\n`;
      });
      css += '\n';
    }

    // Effect variables
    if (theme.effects) {
      if (theme.effects.shadows) {
        css += `  /* Shadows */\n`;
        Object.entries(theme.effects.shadows).forEach(([name, shadow]) => {
          css += `  --${prefix}-shadow-${name}: ${shadow};\n`;
        });
        css += '\n';
      }
      
      if (theme.effects.borders?.radius) {
        css += `  /* Border Radius */\n`;
        Object.entries(theme.effects.borders.radius).forEach(([size, value]) => {
          css += `  --${prefix}-radius-${size}: ${value};\n`;
        });
        css += '\n';
      }
    }

    css += `}\n`;
    return css;
  }

  /**
   * Generate base styles
   */
  static generateBaseStyles(theme: Theme, prefix: string = 'op'): string {
    let css = `/* Base Styles */\n`;
    
    css += `*,\n`;
    css += `*::before,\n`;
    css += `*::after {\n`;
    css += `  box-sizing: border-box;\n`;
    css += `}\n\n`;

    css += `html {\n`;
    css += `  line-height: 1.15;\n`;
    css += `  -webkit-text-size-adjust: 100%;\n`;
    css += `}\n\n`;

    css += `body {\n`;
    css += `  margin: 0;\n`;
    css += `  font-family: var(--${prefix}-font-sans, system-ui, sans-serif);\n`;
    css += `  font-size: var(--${prefix}-text-base, 1rem);\n`;
    css += `  line-height: var(--${prefix}-leading-normal, 1.5);\n`;
    css += `  color: var(--${prefix}-text-primary, #000000);\n`;
    css += `  background-color: var(--${prefix}-surface-background, #ffffff);\n`;
    css += `  -webkit-font-smoothing: antialiased;\n`;
    css += `  -moz-osx-font-smoothing: grayscale;\n`;
    css += `}\n\n`;

    css += `h1, h2, h3, h4, h5, h6 {\n`;
    css += `  margin: 0;\n`;
    css += `  font-weight: var(--${prefix}-font-semibold, 600);\n`;
    css += `  line-height: var(--${prefix}-leading-tight, 1.25);\n`;
    css += `}\n\n`;

    css += `p {\n`;
    css += `  margin: 0;\n`;
    css += `}\n\n`;

    css += `button {\n`;
    css += `  background: transparent;\n`;
    css += `  border: none;\n`;
    css += `  cursor: pointer;\n`;
    css += `  font-family: inherit;\n`;
    css += `}\n\n`;

    css += `input, textarea, select {\n`;
    css += `  font-family: inherit;\n`;
    css += `  font-size: inherit;\n`;
    css += `}\n`;

    return css;
  }

  /**
   * Generate utility classes
   */
  static generateUtilityClasses(theme: Theme, prefix: string = 'op'): string {
    let css = `/* Utility Classes */\n\n`;

    // Color utilities
    css += this.generateColorUtilities(theme, prefix);
    css += '\n';

    // Typography utilities
    css += this.generateTypographyUtilities(theme, prefix);
    css += '\n';

    // Spacing utilities
    css += this.generateSpacingUtilities(theme, prefix);
    css += '\n';

    // Display utilities
    css += this.generateDisplayUtilities(prefix);
    css += '\n';

    // Flexbox utilities
    css += this.generateFlexUtilities(prefix);
    css += '\n';

    return css;
  }

  /**
   * Generate color utility classes
   */
  static generateColorUtilities(theme: Theme, prefix: string = 'op'): string {
    let css = `/* Color Utilities */\n`;

    // Text colors
    if (theme.colors.primary) {
      Object.keys(theme.colors.primary).forEach(shade => {
        css += `.${prefix}-text-primary-${shade} { color: var(--${prefix}-primary-${shade}); }\n`;
      });
    }

    if (theme.colors.secondary) {
      Object.keys(theme.colors.secondary).forEach(shade => {
        css += `.${prefix}-text-secondary-${shade} { color: var(--${prefix}-secondary-${shade}); }\n`;
      });
    }

    // Background colors
    if (theme.colors.primary) {
      Object.keys(theme.colors.primary).forEach(shade => {
        css += `.${prefix}-bg-primary-${shade} { background-color: var(--${prefix}-primary-${shade}); }\n`;
      });
    }

    if (theme.colors.secondary) {
      Object.keys(theme.colors.secondary).forEach(shade => {
        css += `.${prefix}-bg-secondary-${shade} { background-color: var(--${prefix}-secondary-${shade}); }\n`;
      });
    }

    // Border colors
    if (theme.colors.primary) {
      Object.keys(theme.colors.primary).forEach(shade => {
        css += `.${prefix}-border-primary-${shade} { border-color: var(--${prefix}-primary-${shade}); }\n`;
      });
    }

    return css;
  }

  /**
   * Generate typography utility classes
   */
  static generateTypographyUtilities(theme: Theme, prefix: string = 'op'): string {
    let css = `/* Typography Utilities */\n`;

    // Font sizes
    if (theme.typography?.sizes) {
      Object.keys(theme.typography.sizes).forEach(size => {
        css += `.${prefix}-text-${size} { font-size: var(--${prefix}-text-${size}); }\n`;
      });
    }

    // Font weights
    if (theme.typography?.weights) {
      Object.entries(theme.typography.weights).forEach(([weight, value]) => {
        css += `.${prefix}-font-${weight} { font-weight: ${value}; }\n`;
      });
    }

    // Font families
    if (theme.typography?.fonts) {
      Object.keys(theme.typography.fonts).forEach(family => {
        css += `.${prefix}-font-${family} { font-family: var(--${prefix}-font-${family}); }\n`;
      });
    }

    // Text alignment
    css += `.${prefix}-text-left { text-align: left; }\n`;
    css += `.${prefix}-text-center { text-align: center; }\n`;
    css += `.${prefix}-text-right { text-align: right; }\n`;
    css += `.${prefix}-text-justify { text-align: justify; }\n`;

    return css;
  }

  /**
   * Generate spacing utility classes
   */
  static generateSpacingUtilities(theme: Theme, prefix: string = 'op'): string {
    let css = `/* Spacing Utilities */\n`;

    if (theme.spacing?.scale) {
      Object.keys(theme.spacing.scale).forEach(size => {
        // Padding
        css += `.${prefix}-p-${size} { padding: var(--${prefix}-space-${size}); }\n`;
        css += `.${prefix}-px-${size} { padding-left: var(--${prefix}-space-${size}); padding-right: var(--${prefix}-space-${size}); }\n`;
        css += `.${prefix}-py-${size} { padding-top: var(--${prefix}-space-${size}); padding-bottom: var(--${prefix}-space-${size}); }\n`;
        css += `.${prefix}-pt-${size} { padding-top: var(--${prefix}-space-${size}); }\n`;
        css += `.${prefix}-pr-${size} { padding-right: var(--${prefix}-space-${size}); }\n`;
        css += `.${prefix}-pb-${size} { padding-bottom: var(--${prefix}-space-${size}); }\n`;
        css += `.${prefix}-pl-${size} { padding-left: var(--${prefix}-space-${size}); }\n`;

        // Margin
        css += `.${prefix}-m-${size} { margin: var(--${prefix}-space-${size}); }\n`;
        css += `.${prefix}-mx-${size} { margin-left: var(--${prefix}-space-${size}); margin-right: var(--${prefix}-space-${size}); }\n`;
        css += `.${prefix}-my-${size} { margin-top: var(--${prefix}-space-${size}); margin-bottom: var(--${prefix}-space-${size}); }\n`;
        css += `.${prefix}-mt-${size} { margin-top: var(--${prefix}-space-${size}); }\n`;
        css += `.${prefix}-mr-${size} { margin-right: var(--${prefix}-space-${size}); }\n`;
        css += `.${prefix}-mb-${size} { margin-bottom: var(--${prefix}-space-${size}); }\n`;
        css += `.${prefix}-ml-${size} { margin-left: var(--${prefix}-space-${size}); }\n`;
      });
    }

    return css;
  }

  /**
   * Generate display utility classes
   */
  static generateDisplayUtilities(prefix: string = 'op'): string {
    let css = `/* Display Utilities */\n`;

    const displays = ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid', 'hidden'];
    displays.forEach(display => {
      if (display === 'hidden') {
        css += `.${prefix}-${display} { display: none; }\n`;
      } else {
        css += `.${prefix}-${display} { display: ${display}; }\n`;
      }
    });

    return css;
  }

  /**
   * Generate flexbox utility classes
   */
  static generateFlexUtilities(prefix: string = 'op'): string {
    let css = `/* Flexbox Utilities */\n`;

    // Flex direction
    css += `.${prefix}-flex-row { flex-direction: row; }\n`;
    css += `.${prefix}-flex-col { flex-direction: column; }\n`;

    // Justify content
    css += `.${prefix}-justify-start { justify-content: flex-start; }\n`;
    css += `.${prefix}-justify-center { justify-content: center; }\n`;
    css += `.${prefix}-justify-end { justify-content: flex-end; }\n`;
    css += `.${prefix}-justify-between { justify-content: space-between; }\n`;

    // Align items
    css += `.${prefix}-items-start { align-items: flex-start; }\n`;
    css += `.${prefix}-items-center { align-items: center; }\n`;
    css += `.${prefix}-items-end { align-items: flex-end; }\n`;
    css += `.${prefix}-items-stretch { align-items: stretch; }\n`;

    // Flex grow/shrink
    css += `.${prefix}-flex-1 { flex: 1; }\n`;
    css += `.${prefix}-flex-auto { flex: auto; }\n`;
    css += `.${prefix}-flex-none { flex: none; }\n`;

    return css;
  }

  /**
   * Minify CSS
   */
  static minifyCSS(css: string): string {
    return css
      .replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/;\s*/g, ';') // Remove space after semicolons
      .replace(/\{\s*/g, '{') // Remove space after opening braces
      .replace(/\s*\}/g, '}') // Remove space before closing braces
      .replace(/,\s*/g, ',') // Remove space after commas
      .trim();
  }

  /**
   * Generate responsive utilities
   */
  static generateResponsiveUtilities(theme: Theme, prefix: string = 'op'): string {
    let css = `/* Responsive Utilities */\n`;

    const breakpoints = theme.layout?.breakpoints;
    if (!breakpoints) return css;

    Object.entries(breakpoints).forEach(([name, value]) => {
      if (name !== 'xs') { // xs is mobile-first, no media query needed
        css += `@media (min-width: ${value}) {\n`;
        
        // Add responsive variants for common utilities
        css += `  .${prefix}-${name}\\:block { display: block; }\n`;
        css += `  .${prefix}-${name}\\:hidden { display: none; }\n`;
        css += `  .${prefix}-${name}\\:flex { display: flex; }\n`;
        
        css += `}\n\n`;
      }
    });

    return css;
  }
}

// Export utility functions
export function generateThemeCSS(theme: Theme, options?: Parameters<typeof CSSUtils.generateThemeCSS>[1]): string {
  return CSSUtils.generateThemeCSS(theme, options);
}

export function generateCSSVariables(theme: Theme, prefix?: string): string {
  return CSSUtils.generateCSSVariables(theme, prefix);
}

export function generateUtilityClasses(theme: Theme, prefix?: string): string {
  return CSSUtils.generateUtilityClasses(theme, prefix);
}

export function minifyCSS(css: string): string {
  return CSSUtils.minifyCSS(css);
} 