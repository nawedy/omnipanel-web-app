import { Theme, CompiledTheme, ColorSystem, TypographySystem, SpacingSystem, ComponentStyles, EffectsSystem } from './types';
import { ColorUtils } from './utils/colors';

export class ThemeCompiler {
  private cssVariablePrefix = '--op'; // OmniPanel prefix

  /**
   * Compile a theme into CSS and variables
   */
  compile(theme: Theme): CompiledTheme {
    const variables = this.generateCSSVariables(theme);
    const css = this.generateCSS(theme, variables);
    
    return {
      id: theme.id,
      css,
      variables,
      components: this.compileComponents(theme.components),
      metadata: theme.metadata,
    };
  }

  /**
   * Generate CSS variables from theme
   */
  private generateCSSVariables(theme: Theme): Record<string, string> {
    const variables: Record<string, string> = {};

    // Color variables
    this.addColorVariables(variables, theme.colors);
    
    // Typography variables
    this.addTypographyVariables(variables, theme.typography);
    
    // Spacing variables
    this.addSpacingVariables(variables, theme.spacing);
    
    // Layout variables
    this.addLayoutVariables(variables, theme.layout);
    
    // Effects variables
    this.addEffectsVariables(variables, theme.effects);
    
    // Custom variables
    if (theme.custom) {
      this.addCustomVariables(variables, theme.custom);
    }

    return variables;
  }

  /**
   * Generate complete CSS from theme
   */
  private generateCSS(theme: Theme, variables: Record<string, string>): string {
    const cssBlocks: string[] = [];

    // CSS variables block
    cssBlocks.push(this.generateRootVariables(variables));
    
    // Reset and base styles
    cssBlocks.push(this.generateBaseStyles());
    
    // Component styles
    cssBlocks.push(this.generateComponentCSS(theme.components));
    
    // Utility classes
    cssBlocks.push(this.generateUtilityClasses(theme));
    
    // Theme-specific overrides
    cssBlocks.push(this.generateThemeOverrides(theme));

    return cssBlocks.join('\n\n');
  }

  /**
   * Add color system variables
   */
  private addColorVariables(variables: Record<string, string>, colors: ColorSystem): void {
    // Primary colors
    this.addColorPalette(variables, 'primary', colors.primary);
    this.addColorPalette(variables, 'secondary', colors.secondary);
    this.addColorPalette(variables, 'accent', colors.accent);
    this.addColorPalette(variables, 'neutral', colors.neutral);

    // Semantic colors
    this.addColorVariant(variables, 'success', colors.semantic.success);
    this.addColorVariant(variables, 'warning', colors.semantic.warning);
    this.addColorVariant(variables, 'error', colors.semantic.error);
    this.addColorVariant(variables, 'info', colors.semantic.info);

    // Text colors
    variables[`${this.cssVariablePrefix}-text-primary`] = colors.semantic.text.primary;
    variables[`${this.cssVariablePrefix}-text-secondary`] = colors.semantic.text.secondary;
    variables[`${this.cssVariablePrefix}-text-muted`] = colors.semantic.text.muted;
    variables[`${this.cssVariablePrefix}-text-disabled`] = colors.semantic.text.disabled;
    variables[`${this.cssVariablePrefix}-text-inverse`] = colors.semantic.text.inverse;

    // Border colors
    variables[`${this.cssVariablePrefix}-border-default`] = colors.semantic.border.default;
    variables[`${this.cssVariablePrefix}-border-muted`] = colors.semantic.border.muted;
    variables[`${this.cssVariablePrefix}-border-subtle`] = colors.semantic.border.subtle;
    variables[`${this.cssVariablePrefix}-border-strong`] = colors.semantic.border.strong;

    // Surface colors
    variables[`${this.cssVariablePrefix}-surface-background`] = colors.surface.background;
    variables[`${this.cssVariablePrefix}-surface-foreground`] = colors.surface.foreground;
    variables[`${this.cssVariablePrefix}-surface-card`] = colors.surface.card;
    variables[`${this.cssVariablePrefix}-surface-popover`] = colors.surface.popover;
    variables[`${this.cssVariablePrefix}-surface-modal`] = colors.surface.modal;
    variables[`${this.cssVariablePrefix}-surface-sidebar`] = colors.surface.sidebar;
    variables[`${this.cssVariablePrefix}-surface-header`] = colors.surface.header;
    variables[`${this.cssVariablePrefix}-surface-footer`] = colors.surface.footer;

    // State colors
    variables[`${this.cssVariablePrefix}-state-hover`] = colors.state.hover;
    variables[`${this.cssVariablePrefix}-state-active`] = colors.state.active;
    variables[`${this.cssVariablePrefix}-state-focus`] = colors.state.focus;
    variables[`${this.cssVariablePrefix}-state-disabled`] = colors.state.disabled;
    variables[`${this.cssVariablePrefix}-state-selected`] = colors.state.selected;
    variables[`${this.cssVariablePrefix}-state-pressed`] = colors.state.pressed;

    // Syntax colors
    const syntax = colors.syntax;
    variables[`${this.cssVariablePrefix}-syntax-keyword`] = syntax.keyword;
    variables[`${this.cssVariablePrefix}-syntax-string`] = syntax.string;
    variables[`${this.cssVariablePrefix}-syntax-number`] = syntax.number;
    variables[`${this.cssVariablePrefix}-syntax-comment`] = syntax.comment;
    variables[`${this.cssVariablePrefix}-syntax-operator`] = syntax.operator;
    variables[`${this.cssVariablePrefix}-syntax-function`] = syntax.function;
    variables[`${this.cssVariablePrefix}-syntax-variable`] = syntax.variable;
    variables[`${this.cssVariablePrefix}-syntax-type`] = syntax.type;
    variables[`${this.cssVariablePrefix}-syntax-constant`] = syntax.constant;
    variables[`${this.cssVariablePrefix}-syntax-tag`] = syntax.tag;
    variables[`${this.cssVariablePrefix}-syntax-attribute`] = syntax.attribute;
    variables[`${this.cssVariablePrefix}-syntax-punctuation`] = syntax.punctuation;

    // Custom color palettes
    if (colors.custom) {
      for (const [name, palette] of Object.entries(colors.custom)) {
        this.addColorPalette(variables, name, palette);
      }
    }
  }

  /**
   * Add color palette variables
   */
  private addColorPalette(variables: Record<string, string>, name: string, palette: any): void {
    for (const [shade, color] of Object.entries(palette)) {
      variables[`${this.cssVariablePrefix}-${name}-${shade}`] = color as string;
    }
  }

  /**
   * Add color variant variables
   */
  private addColorVariant(variables: Record<string, string>, name: string, variant: any): void {
    variables[`${this.cssVariablePrefix}-${name}-light`] = variant.light;
    variables[`${this.cssVariablePrefix}-${name}-default`] = variant.default;
    variables[`${this.cssVariablePrefix}-${name}-dark`] = variant.dark;
    variables[`${this.cssVariablePrefix}-${name}-contrast`] = variant.contrast;
  }

  /**
   * Add typography variables
   */
  private addTypographyVariables(variables: Record<string, string>, typography: TypographySystem): void {
    // Font families
    variables[`${this.cssVariablePrefix}-font-sans`] = typography.fonts.sans.join(', ');
    variables[`${this.cssVariablePrefix}-font-serif`] = typography.fonts.serif.join(', ');
    variables[`${this.cssVariablePrefix}-font-mono`] = typography.fonts.mono.join(', ');
    
    if (typography.fonts.display) {
      variables[`${this.cssVariablePrefix}-font-display`] = typography.fonts.display.join(', ');
    }

    // Font sizes
    for (const [size, value] of Object.entries(typography.sizes)) {
      variables[`${this.cssVariablePrefix}-text-${size}`] = value;
    }

    // Font weights
    for (const [weight, value] of Object.entries(typography.weights)) {
      variables[`${this.cssVariablePrefix}-font-${weight}`] = value.toString();
    }

    // Line heights
    for (const [name, value] of Object.entries(typography.lineHeights)) {
      variables[`${this.cssVariablePrefix}-leading-${name}`] = value.toString();
    }

    // Letter spacing
    for (const [name, value] of Object.entries(typography.letterSpacing)) {
      variables[`${this.cssVariablePrefix}-tracking-${name}`] = value;
    }
  }

  /**
   * Add spacing variables
   */
  private addSpacingVariables(variables: Record<string, string>, spacing: SpacingSystem): void {
    // Spacing scale
    for (const [name, value] of Object.entries(spacing.scale)) {
      variables[`${this.cssVariablePrefix}-space-${name}`] = value;
    }

    // Layout spacing
    variables[`${this.cssVariablePrefix}-layout-container`] = spacing.layout.container;
    variables[`${this.cssVariablePrefix}-layout-section`] = spacing.layout.section;
    variables[`${this.cssVariablePrefix}-layout-grid`] = spacing.layout.grid;
    variables[`${this.cssVariablePrefix}-layout-sidebar`] = spacing.layout.sidebar;
    variables[`${this.cssVariablePrefix}-layout-header`] = spacing.layout.header;
    variables[`${this.cssVariablePrefix}-layout-footer`] = spacing.layout.footer;
  }

  /**
   * Add layout variables
   */
  private addLayoutVariables(variables: Record<string, string>, layout: any): void {
    // Breakpoints
    for (const [name, value] of Object.entries(layout.breakpoints)) {
      variables[`${this.cssVariablePrefix}-screen-${name}`] = value as string;
    }

    // Containers
    for (const [name, value] of Object.entries(layout.containers)) {
      variables[`${this.cssVariablePrefix}-container-${name}`] = value as string;
    }

    // Grid
    variables[`${this.cssVariablePrefix}-grid-columns`] = layout.grid.columns.toString();
    variables[`${this.cssVariablePrefix}-grid-gap`] = layout.grid.gap;
    variables[`${this.cssVariablePrefix}-grid-column-gap`] = layout.grid.columnGap;
    variables[`${this.cssVariablePrefix}-grid-row-gap`] = layout.grid.rowGap;
  }

  /**
   * Add effects variables
   */
  private addEffectsVariables(variables: Record<string, string>, effects: EffectsSystem): void {
    // Shadows
    for (const [name, value] of Object.entries(effects.shadows)) {
      variables[`${this.cssVariablePrefix}-shadow-${name}`] = value;
    }

    // Border radius
    for (const [name, value] of Object.entries(effects.borders.radius)) {
      variables[`${this.cssVariablePrefix}-radius-${name}`] = value;
    }

    // Border width
    for (const [name, value] of Object.entries(effects.borders.width)) {
      variables[`${this.cssVariablePrefix}-border-${name}`] = value;
    }

    // Animation durations
    for (const [name, value] of Object.entries(effects.animations.duration)) {
      variables[`${this.cssVariablePrefix}-duration-${name}`] = value;
    }

    // Animation easing
    for (const [name, value] of Object.entries(effects.animations.easing)) {
      variables[`${this.cssVariablePrefix}-ease-${name}`] = value;
    }

    // Transition properties
    for (const [name, value] of Object.entries(effects.transitions.property)) {
      variables[`${this.cssVariablePrefix}-transition-${name}`] = value;
    }
  }

  /**
   * Add custom variables
   */
  private addCustomVariables(variables: Record<string, string>, custom: Record<string, any>): void {
    for (const [key, value] of Object.entries(custom)) {
      if (typeof value === 'string' || typeof value === 'number') {
        variables[`${this.cssVariablePrefix}-custom-${key}`] = value.toString();
      }
    }
  }

  /**
   * Generate root CSS variables block
   */
  private generateRootVariables(variables: Record<string, string>): string {
    const entries = Object.entries(variables)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');
    
    return `:root {\n${entries}\n}`;
  }

  /**
   * Generate base styles
   */
  private generateBaseStyles(): string {
    return `
/* Base Styles */
* {
  box-sizing: border-box;
}

body {
  font-family: var(${this.cssVariablePrefix}-font-sans);
  background-color: var(${this.cssVariablePrefix}-surface-background);
  color: var(${this.cssVariablePrefix}-text-primary);
  line-height: var(${this.cssVariablePrefix}-leading-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html {
  font-size: var(${this.cssVariablePrefix}-text-base);
}

/* Focus styles */
*:focus-visible {
  outline: 2px solid var(${this.cssVariablePrefix}-state-focus);
  outline-offset: 2px;
}`;
  }

  /**
   * Generate component CSS
   */
  private generateComponentCSS(components: ComponentStyles): string {
    const cssBlocks: string[] = [];

    // Button styles
    cssBlocks.push(this.generateButtonCSS(components.button));
    
    // Input styles
    cssBlocks.push(this.generateInputCSS(components.input));
    
    // Card styles
    cssBlocks.push(this.generateCardCSS(components.card));
    
    // Modal styles
    cssBlocks.push(this.generateModalCSS(components.modal));

    return cssBlocks.join('\n\n');
  }

  /**
   * Generate button CSS
   */
  private generateButtonCSS(button: any): string {
    return `
/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(${this.cssVariablePrefix}-radius-md);
  font-weight: var(${this.cssVariablePrefix}-font-medium);
  transition: var(${this.cssVariablePrefix}-transition-all);
  cursor: pointer;
  border: none;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Button variants */
.btn-primary {
  background-color: var(${this.cssVariablePrefix}-primary-500);
  color: var(${this.cssVariablePrefix}-primary-50);
}

.btn-primary:hover {
  background-color: var(${this.cssVariablePrefix}-primary-600);
}

.btn-secondary {
  background-color: var(${this.cssVariablePrefix}-secondary-500);
  color: var(${this.cssVariablePrefix}-secondary-50);
}

.btn-secondary:hover {
  background-color: var(${this.cssVariablePrefix}-secondary-600);
}

/* Button sizes */
.btn-sm {
  padding: var(${this.cssVariablePrefix}-space-1) var(${this.cssVariablePrefix}-space-3);
  font-size: var(${this.cssVariablePrefix}-text-sm);
}

.btn-md {
  padding: var(${this.cssVariablePrefix}-space-2) var(${this.cssVariablePrefix}-space-4);
  font-size: var(${this.cssVariablePrefix}-text-base);
}

.btn-lg {
  padding: var(${this.cssVariablePrefix}-space-3) var(${this.cssVariablePrefix}-space-6);
  font-size: var(${this.cssVariablePrefix}-text-lg);
}`;
  }

  /**
   * Generate input CSS
   */
  private generateInputCSS(input: any): string {
    return `
/* Input Styles */
.input {
  display: block;
  width: 100%;
  border: 1px solid var(${this.cssVariablePrefix}-border-default);
  border-radius: var(${this.cssVariablePrefix}-radius-md);
  background-color: var(${this.cssVariablePrefix}-surface-foreground);
  color: var(${this.cssVariablePrefix}-text-primary);
  transition: var(${this.cssVariablePrefix}-transition-colors);
}

.input:focus {
  outline: none;
  border-color: var(${this.cssVariablePrefix}-primary-500);
  box-shadow: 0 0 0 1px var(${this.cssVariablePrefix}-primary-500);
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Input sizes */
.input-sm {
  padding: var(${this.cssVariablePrefix}-space-1) var(${this.cssVariablePrefix}-space-2);
  font-size: var(${this.cssVariablePrefix}-text-sm);
}

.input-md {
  padding: var(${this.cssVariablePrefix}-space-2) var(${this.cssVariablePrefix}-space-3);
  font-size: var(${this.cssVariablePrefix}-text-base);
}

.input-lg {
  padding: var(${this.cssVariablePrefix}-space-3) var(${this.cssVariablePrefix}-space-4);
  font-size: var(${this.cssVariablePrefix}-text-lg);
}`;
  }

  /**
   * Generate card CSS
   */
  private generateCardCSS(card: any): string {
    return `
/* Card Styles */
.card {
  background-color: var(${this.cssVariablePrefix}-surface-card);
  border: 1px solid var(${this.cssVariablePrefix}-border-default);
  border-radius: var(${this.cssVariablePrefix}-radius-lg);
  box-shadow: var(${this.cssVariablePrefix}-shadow-sm);
  overflow: hidden;
}

.card-header {
  padding: var(${this.cssVariablePrefix}-space-4);
  border-bottom: 1px solid var(${this.cssVariablePrefix}-border-muted);
}

.card-body {
  padding: var(${this.cssVariablePrefix}-space-4);
}

.card-footer {
  padding: var(${this.cssVariablePrefix}-space-4);
  border-top: 1px solid var(${this.cssVariablePrefix}-border-muted);
}`;
  }

  /**
   * Generate modal CSS
   */
  private generateModalCSS(modal: any): string {
    return `
/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(${this.cssVariablePrefix}-surface-modal);
  border-radius: var(${this.cssVariablePrefix}-radius-lg);
  box-shadow: var(${this.cssVariablePrefix}-shadow-xl);
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  padding: var(${this.cssVariablePrefix}-space-6);
  border-bottom: 1px solid var(${this.cssVariablePrefix}-border-muted);
}

.modal-body {
  padding: var(${this.cssVariablePrefix}-space-6);
}

.modal-footer {
  padding: var(${this.cssVariablePrefix}-space-6);
  border-top: 1px solid var(${this.cssVariablePrefix}-border-muted);
}`;
  }

  /**
   * Generate utility classes
   */
  private generateUtilityClasses(theme: Theme): string {
    return `
/* Utility Classes */
.text-primary { color: var(${this.cssVariablePrefix}-text-primary); }
.text-secondary { color: var(${this.cssVariablePrefix}-text-secondary); }
.text-muted { color: var(${this.cssVariablePrefix}-text-muted); }

.bg-primary { background-color: var(${this.cssVariablePrefix}-primary-500); }
.bg-secondary { background-color: var(${this.cssVariablePrefix}-secondary-500); }
.bg-surface { background-color: var(${this.cssVariablePrefix}-surface-background); }

.border-default { border-color: var(${this.cssVariablePrefix}-border-default); }
.border-muted { border-color: var(${this.cssVariablePrefix}-border-muted); }

.rounded-sm { border-radius: var(${this.cssVariablePrefix}-radius-sm); }
.rounded-md { border-radius: var(${this.cssVariablePrefix}-radius-md); }
.rounded-lg { border-radius: var(${this.cssVariablePrefix}-radius-lg); }

.shadow-sm { box-shadow: var(${this.cssVariablePrefix}-shadow-sm); }
.shadow-md { box-shadow: var(${this.cssVariablePrefix}-shadow-md); }
.shadow-lg { box-shadow: var(${this.cssVariablePrefix}-shadow-lg); }`;
  }

  /**
   * Generate theme-specific overrides
   */
  private generateThemeOverrides(theme: Theme): string {
    const overrides: string[] = [];

    // Dark theme specific styles
    if (theme.category === 'dark') {
      overrides.push(`
/* Dark Theme Overrides */
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
  }
}`);
    }

    // High contrast theme styles
    if (theme.category === 'high-contrast') {
      overrides.push(`
/* High Contrast Overrides */
.btn {
  border: 2px solid currentColor;
}

.input {
  border-width: 2px;
}

.card {
  border-width: 2px;
}`);
    }

    return overrides.join('\n\n');
  }

  /**
   * Compile components into JavaScript objects
   */
  private compileComponents(components: ComponentStyles): Record<string, any> {
    return {
      button: this.compileComponentStyles(components.button),
      input: this.compileComponentStyles(components.input),
      card: this.compileComponentStyles(components.card),
      modal: this.compileComponentStyles(components.modal),
    };
  }

  /**
   * Compile individual component styles
   */
  private compileComponentStyles(component: any): any {
    if (!component) return {};
    
    // Convert CSS-like properties to JavaScript objects
    const compiled: any = {};
    
    if (component.base) {
      compiled.base = this.convertStyleProperties(component.base);
    }
    
    if (component.variants) {
      compiled.variants = {};
      for (const [name, variant] of Object.entries(component.variants)) {
        compiled.variants[name] = this.convertStyleProperties(variant as any);
      }
    }
    
    if (component.sizes) {
      compiled.sizes = {};
      for (const [name, size] of Object.entries(component.sizes)) {
        compiled.sizes[name] = this.convertStyleProperties(size as any);
      }
    }
    
    return compiled;
  }

  /**
   * Convert CSS properties to JavaScript style objects
   */
  private convertStyleProperties(styles: any): any {
    if (!styles) return {};
    
    const converted: any = {};
    
    for (const [key, value] of Object.entries(styles)) {
      // Convert kebab-case to camelCase
      const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      converted[camelKey] = value;
    }
    
    return converted;
  }

  /**
   * Generate SCSS from theme
   */
  generateSCSS(theme: Theme): string {
    const variables = this.generateCSSVariables(theme);
    const scss: string[] = [];

    // SCSS variables
    scss.push('// Theme Variables');
    for (const [key, value] of Object.entries(variables)) {
      const scssVar = key.replace('--op-', '$');
      scss.push(`${scssVar}: ${value};`);
    }

    scss.push('\n// Mixins');
    scss.push(this.generateSCSSMixins());

    scss.push('\n// Component Styles');
    scss.push(this.generateSCSSComponents(theme.components));

    return scss.join('\n');
  }

  /**
   * Generate SCSS mixins
   */
  private generateSCSSMixins(): string {
    return `
@mixin button-variant($bg, $color: white) {
  background-color: $bg;
  color: $color;
  
  &:hover {
    background-color: darken($bg, 10%);
  }
  
  &:active {
    background-color: darken($bg, 15%);
  }
}

@mixin text-style($size, $weight: normal, $height: normal) {
  font-size: $size;
  font-weight: $weight;
  line-height: $height;
}

@mixin card-style($bg: $surface-card, $border: $border-default) {
  background-color: $bg;
  border: 1px solid $border;
  border-radius: $radius-lg;
}`;
  }

  /**
   * Generate SCSS component styles
   */
  private generateSCSSComponents(components: ComponentStyles): string {
    return `
// Button Components
.btn {
  @include text-style($text-base, $font-medium);
  
  &.btn-primary {
    @include button-variant($primary-500);
  }
  
  &.btn-secondary {
    @include button-variant($secondary-500);
  }
}

// Card Components
.card {
  @include card-style();
}`;
  }
}

// Export utility functions
export function compileTheme(theme: Theme): CompiledTheme {
  const compiler = new ThemeCompiler();
  return compiler.compile(theme);
}

export function generateCSS(theme: Theme): string {
  const compiler = new ThemeCompiler();
  return compiler.compile(theme).css;
} 