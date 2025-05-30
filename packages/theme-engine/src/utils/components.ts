import { ComponentStyles, ComponentStyleBase, ComponentStyleVariant, ComponentStyleSize, ButtonStyles, InputStyles, CardStyles } from '../types';

/**
 * Component utility functions for theme management
 */
export class ComponentUtils {
  /**
   * Generate CSS string from component style base
   */
  static generateCSS(styles: ComponentStyleBase): string {
    const cssRules: string[] = [];
    
    for (const [property, value] of Object.entries(styles)) {
      if (value !== undefined && property !== 'custom') {
        const cssProperty = this.camelToKebab(property);
        cssRules.push(`${cssProperty}: ${value};`);
      }
    }
    
    // Add custom CSS properties
    if (styles.custom) {
      for (const [property, value] of Object.entries(styles.custom)) {
        const cssProperty = this.camelToKebab(property);
        cssRules.push(`${cssProperty}: ${value};`);
      }
    }
    
    return cssRules.join(' ');
  }

  /**
   * Generate component variant styles with state handling
   */
  static generateVariantCSS(
    baseClass: string,
    variant: ComponentStyleVariant,
    includeStates: boolean = true
  ): string {
    let css = `.${baseClass} { ${this.generateCSS(variant)} }`;
    
    if (includeStates) {
      if (variant.hover) {
        css += `\n.${baseClass}:hover { ${this.generateCSS(variant.hover)} }`;
      }
      if (variant.active) {
        css += `\n.${baseClass}:active { ${this.generateCSS(variant.active)} }`;
      }
      if (variant.focus) {
        css += `\n.${baseClass}:focus { ${this.generateCSS(variant.focus)} }`;
      }
      if (variant.disabled) {
        css += `\n.${baseClass}:disabled { ${this.generateCSS(variant.disabled)} }`;
      }
    }
    
    return css;
  }

  /**
   * Generate size variant styles
   */
  static generateSizeCSS(
    baseClass: string,
    sizeName: string,
    size: ComponentStyleSize
  ): string {
    const className = `${baseClass}--${sizeName}`;
    return `.${className} { ${this.generateCSS(size as any)} }`;
  }

  /**
   * Generate complete button component CSS
   */
  static generateButtonCSS(styles: ButtonStyles, themePrefix: string = 'op'): string {
    const baseClass = `${themePrefix}-button`;
    let css = `/* Button Component Styles */\n`;
    
    // Base styles
    css += `.${baseClass} { ${this.generateCSS(styles.base)} }\n\n`;
    
    // Variants
    css += `/* Button Variants */\n`;
    for (const [variantName, variant] of Object.entries(styles.variants)) {
      const variantClass = `${baseClass}--${variantName}`;
      css += this.generateVariantCSS(variantClass, variant) + '\n\n';
    }
    
    // Sizes
    css += `/* Button Sizes */\n`;
    for (const [sizeName, size] of Object.entries(styles.sizes)) {
      css += this.generateSizeCSS(baseClass, sizeName, size) + '\n';
    }
    
    return css;
  }

  /**
   * Generate complete input component CSS
   */
  static generateInputCSS(styles: InputStyles, themePrefix: string = 'op'): string {
    const baseClass = `${themePrefix}-input`;
    let css = `/* Input Component Styles */\n`;
    
    // Base styles
    css += `.${baseClass} { ${this.generateCSS(styles.base)} }\n\n`;
    
    // Variants
    css += `/* Input Variants */\n`;
    for (const [variantName, variant] of Object.entries(styles.variants)) {
      const variantClass = `${baseClass}--${variantName}`;
      css += this.generateVariantCSS(variantClass, variant) + '\n\n';
    }
    
    // Sizes
    css += `/* Input Sizes */\n`;
    for (const [sizeName, size] of Object.entries(styles.sizes)) {
      css += this.generateSizeCSS(baseClass, sizeName, size) + '\n';
    }
    
    // States
    css += `/* Input States */\n`;
    for (const [stateName, state] of Object.entries(styles.states)) {
      const stateClass = `${baseClass}--${stateName}`;
      css += `.${stateClass} { ${this.generateCSS(state)} }\n`;
    }
    
    return css;
  }

  /**
   * Generate complete card component CSS
   */
  static generateCardCSS(styles: CardStyles, themePrefix: string = 'op'): string {
    const baseClass = `${themePrefix}-card`;
    let css = `/* Card Component Styles */\n`;
    
    // Base styles
    css += `.${baseClass} { ${this.generateCSS(styles.base)} }\n\n`;
    
    // Variants
    css += `/* Card Variants */\n`;
    for (const [variantName, variant] of Object.entries(styles.variants)) {
      const variantClass = `${baseClass}--${variantName}`;
      css += this.generateVariantCSS(variantClass, variant) + '\n\n';
    }
    
    return css;
  }

  /**
   * Generate complete component styles CSS
   */
  static generateAllComponentsCSS(
    components: ComponentStyles,
    themePrefix: string = 'op'
  ): string {
    let css = `/* OmniPanel Theme Component Styles */\n\n`;
    
    // Generate CSS for each component
    css += this.generateButtonCSS(components.button, themePrefix) + '\n\n';
    css += this.generateInputCSS(components.input, themePrefix) + '\n\n';
    css += this.generateCardCSS(components.card, themePrefix) + '\n\n';
    
    // Generate modal CSS
    if (components.modal) {
      css += this.generateModalCSS(components.modal, themePrefix) + '\n\n';
    }
    
    return css;
  }

  /**
   * Generate modal component CSS
   */
  static generateModalCSS(styles: any, themePrefix: string = 'op'): string {
    const baseClass = `${themePrefix}-modal`;
    let css = `/* Modal Component Styles */\n`;
    
    css += `.${baseClass}-overlay { ${this.generateCSS(styles.overlay)} }\n`;
    css += `.${baseClass}-content { ${this.generateCSS(styles.content)} }\n`;
    css += `.${baseClass}-header { ${this.generateCSS(styles.header)} }\n`;
    css += `.${baseClass}-body { ${this.generateCSS(styles.body)} }\n`;
    css += `.${baseClass}-footer { ${this.generateCSS(styles.footer)} }\n`;
    
    return css;
  }

  /**
   * Convert camelCase to kebab-case
   */
  private static camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Create component variant
   */
  static createVariant(
    base: ComponentStyleBase,
    overrides: Partial<ComponentStyleVariant>
  ): ComponentStyleVariant {
    return {
      ...base,
      ...overrides
    } as ComponentStyleVariant;
  }

  /**
   * Merge component styles
   */
  static mergeStyles(
    ...styles: Partial<ComponentStyleBase>[]
  ): ComponentStyleBase {
    const merged: ComponentStyleBase = {};
    
    for (const style of styles) {
      Object.assign(merged, style);
    }
    
    return merged;
  }

  /**
   * Generate responsive component styles
   */
  static generateResponsiveCSS(
    baseClass: string,
    styles: ComponentStyleBase,
    breakpoints: Record<string, string>
  ): string {
    let css = `.${baseClass} { ${this.generateCSS(styles)} }\n`;
    
    // Generate responsive variants
    for (const [breakpoint, minWidth] of Object.entries(breakpoints)) {
      if (styles.custom?.[breakpoint]) {
        css += `@media (min-width: ${minWidth}) {\n`;
        css += `  .${baseClass} { ${this.generateCSS(styles.custom[breakpoint])} }\n`;
        css += `}\n`;
      }
    }
    
    return css;
  }

  /**
   * Generate utility classes for component spacing
   */
  static generateSpacingUtilities(
    spacing: Record<string, string>,
    prefix: string = 'op'
  ): string {
    let css = `/* Component Spacing Utilities */\n`;
    
    for (const [key, value] of Object.entries(spacing)) {
      css += `.${prefix}-p-${key} { padding: ${value}; }\n`;
      css += `.${prefix}-m-${key} { margin: ${value}; }\n`;
      css += `.${prefix}-px-${key} { padding-left: ${value}; padding-right: ${value}; }\n`;
      css += `.${prefix}-py-${key} { padding-top: ${value}; padding-bottom: ${value}; }\n`;
      css += `.${prefix}-mx-${key} { margin-left: ${value}; margin-right: ${value}; }\n`;
      css += `.${prefix}-my-${key} { margin-top: ${value}; margin-bottom: ${value}; }\n`;
    }
    
    return css;
  }
}

// Export utility functions
export function generateComponentCSS(
  component: string,
  styles: any,
  themePrefix?: string
): string {
  switch (component) {
    case 'button':
      return ComponentUtils.generateButtonCSS(styles, themePrefix);
    case 'input':
      return ComponentUtils.generateInputCSS(styles, themePrefix);
    case 'card':
      return ComponentUtils.generateCardCSS(styles, themePrefix);
    default:
      return ComponentUtils.generateCSS(styles);
  }
}

export function createComponentVariant(
  base: ComponentStyleBase,
  overrides: Partial<ComponentStyleVariant>
): ComponentStyleVariant {
  return ComponentUtils.createVariant(base, overrides);
}

export function mergeComponentStyles(
  ...styles: Partial<ComponentStyleBase>[]
): ComponentStyleBase {
  return ComponentUtils.mergeStyles(...styles);
}

export function generateAllComponentsCSS(
  components: ComponentStyles,
  themePrefix?: string
): string {
  return ComponentUtils.generateAllComponentsCSS(components, themePrefix);
} 