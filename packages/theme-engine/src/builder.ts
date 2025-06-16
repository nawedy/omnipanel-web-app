import { Theme, IThemeBuilder, ColorSystem, TypographySystem, SpacingSystem, ComponentStyles, LayoutSystem, EffectsSystem, ThemeValidationResult, ThemeCategory, ThemeType } from './types';
import { ThemeValidator } from './validator';
import { defaultTheme } from './themes/default';

export class ThemeBuilder implements IThemeBuilder {
  private theme: Partial<Theme> = {};
  private validator = new ThemeValidator();

  /**
   * Create a new theme builder with initial configuration
   */
  create(config: Partial<Theme> = {}): ThemeBuilder {
    this.theme = {
      id: this.generateId(),
      name: 'Custom Theme',
      description: 'A custom theme created with ThemeBuilder',
      version: '1.0.0',
      author: 'Unknown',
      category: 'custom' as ThemeCategory,
      type: 'static' as ThemeType,
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        tags: ['custom'],
        preview: '',
        screenshots: [],
        compatibility: {
          requiredFeatures: ['web', 'desktop', 'mobile']
        },
        license: 'MIT'
      },
      ...config
    };

    // Start with default theme as base
    if (!config.colors) {
      this.theme.colors = this.cloneDeep(defaultTheme.colors);
    }
    if (!config.typography) {
      this.theme.typography = this.cloneDeep(defaultTheme.typography);
    }
    if (!config.spacing) {
      this.theme.spacing = this.cloneDeep(defaultTheme.spacing);
    }
    if (!config.components) {
      this.theme.components = this.cloneDeep(defaultTheme.components);
    }
    if (!config.layout) {
      this.theme.layout = this.cloneDeep(defaultTheme.layout);
    }
    if (!config.effects) {
      this.theme.effects = this.cloneDeep(defaultTheme.effects);
    }

    return this;
  }

  /**
   * Set color system
   */
  setColors(colors: Partial<ColorSystem>): ThemeBuilder {
    this.theme.colors = {
      ...this.theme.colors,
      ...colors
    } as ColorSystem;
    
    this.updateTimestamp();
    return this;
  }

  /**
   * Set primary color palette
   */
  setPrimaryColor(baseColor: string): ThemeBuilder {
    const palette = this.generateColorPalette(baseColor);
    
    if (this.theme.colors) {
      this.theme.colors.primary = palette;
    }
    
    this.updateTimestamp();
    return this;
  }

  /**
   * Set secondary color palette
   */
  setSecondaryColor(baseColor: string): ThemeBuilder {
    const palette = this.generateColorPalette(baseColor);
    
    if (this.theme.colors) {
      this.theme.colors.secondary = palette;
    }
    
    this.updateTimestamp();
    return this;
  }

  /**
   * Set accent color palette
   */
  setAccentColor(baseColor: string): ThemeBuilder {
    const palette = this.generateColorPalette(baseColor);
    
    if (this.theme.colors) {
      this.theme.colors.accent = palette;
    }
    
    this.updateTimestamp();
    return this;
  }

  /**
   * Set typography system
   */
  setTypography(typography: Partial<TypographySystem>): ThemeBuilder {
    this.theme.typography = {
      ...this.theme.typography,
      ...typography
    } as TypographySystem;
    
    this.updateTimestamp();
    return this;
  }

  /**
   * Set font families
   */
  setFonts(fonts: Partial<{ sans: string[]; serif: string[]; mono: string[]; display?: string[] }>): ThemeBuilder {
    if (this.theme.typography) {
      this.theme.typography.fonts = {
        ...this.theme.typography.fonts,
        ...fonts
      };
    }
    
    this.updateTimestamp();
    return this;
  }

  /**
   * Set spacing system
   */
  setSpacing(spacing: Partial<SpacingSystem>): ThemeBuilder {
    this.theme.spacing = {
      ...this.theme.spacing,
      ...spacing
    } as SpacingSystem;
    
    this.updateTimestamp();
    return this;
  }

  /**
   * Set component styles
   */
  setComponents(components: Partial<ComponentStyles>): ThemeBuilder {
    this.theme.components = {
      ...this.theme.components,
      ...components
    } as ComponentStyles;
    
    this.updateTimestamp();
    return this;
  }

  /**
   * Set layout system
   */
  setLayout(layout: Partial<LayoutSystem>): ThemeBuilder {
    this.theme.layout = {
      ...this.theme.layout,
      ...layout
    } as LayoutSystem;
    
    this.updateTimestamp();
    return this;
  }

  /**
   * Set effects system
   */
  setEffects(effects: Partial<EffectsSystem>): ThemeBuilder {
    this.theme.effects = {
      ...this.theme.effects,
      ...effects
    } as EffectsSystem;
    
    this.updateTimestamp();
    return this;
  }

  /**
   * Set theme metadata
   */
  setMetadata(metadata: Partial<Theme['metadata']>): IThemeBuilder {
    this.theme.metadata = {
      created: metadata.created || new Date().toISOString(),
      updated: metadata.updated || new Date().toISOString(),
      tags: metadata.tags || [],
      preview: metadata.preview || '',
      screenshots: metadata.screenshots || [],
      compatibility: metadata.compatibility || {
        requiredFeatures: ['web', 'desktop', 'mobile']
      },
      license: metadata.license || 'MIT',
      homepage: metadata.homepage,
      repository: metadata.repository,
      rating: metadata.rating,
      downloads: metadata.downloads || 0
    };
    return this;
  }

  /**
   * Set theme category
   */
  setCategory(category: ThemeCategory): ThemeBuilder {
    this.theme.category = category;
    this.updateTimestamp();
    return this;
  }

  /**
   * Set theme type
   */
  setType(type: ThemeType): ThemeBuilder {
    this.theme.type = type;
    this.updateTimestamp();
    return this;
  }

  /**
   * Add custom properties
   */
  setCustom(custom: Record<string, any>): ThemeBuilder {
    this.theme.custom = {
      ...this.theme.custom,
      ...custom
    };
    
    this.updateTimestamp();
    return this;
  }

  /**
   * Enable/disable animations
   */
  setAnimations(enabled: boolean): ThemeBuilder {
    if (!this.theme.custom) {
      this.theme.custom = {};
    }
    
    this.theme.custom.animations = {
      ...this.theme.custom.animations,
      enabled
    };
    
    this.updateTimestamp();
    return this;
  }

  /**
   * Set theme for dark mode
   */
  setDarkMode(isDark: boolean = true): ThemeBuilder {
    if (isDark) {
      // Apply dark mode transformations
      this.convertToDarkMode();
    }
    
    this.updateTimestamp();
    return this;
  }

  /**
   * Set border radius style
   */
  setBorderRadius(style: 'sharp' | 'rounded' | 'pill'): ThemeBuilder {
    if (!this.theme.effects) return this;
    
    const radiusMap = {
      sharp: {
        none: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '0px'
      },
      rounded: {
        none: '0px',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px'
      },
      pill: {
        none: '0px',
        sm: '0.75rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '2.5rem',
        '3xl': '3rem',
        full: '9999px'
      }
    };
    
    this.theme.effects.borders.radius = radiusMap[style];
    this.updateTimestamp();
    return this;
  }

  /**
   * Validate the current theme
   */
  validate(): ThemeValidationResult {
    if (!this.isCompleteTheme(this.theme)) {
      return {
        valid: false,
        errors: [{
          path: 'theme',
          message: 'Incomplete theme configuration',
          type: 'missing'
        }],
        warnings: []
      };
    }
    
    return this.validator.validate(this.theme as Theme);
  }

  /**
   * Build the final theme
   */
  build(): Theme {
    if (!this.isCompleteTheme(this.theme)) {
      throw new Error('Theme is incomplete. Use validate() to check for missing properties.');
    }
    
    const validation = this.validate();
    if (!validation.valid) {
      throw new Error(`Theme validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }
    
    return this.theme as Theme;
  }

  /**
   * Clone a theme for modification
   */
  static fromTheme(theme: Theme): ThemeBuilder {
    const builder = new ThemeBuilder();
    builder.theme = builder.cloneDeep(theme);
    return builder;
  }

  /**
   * Create a theme variant
   */
  static createVariant(baseTheme: Theme, overrides: Partial<Theme>): ThemeBuilder {
    const builder = new ThemeBuilder();
    builder.theme = {
      ...builder.cloneDeep(baseTheme),
      ...overrides,
      id: overrides.id || `${baseTheme.id}-variant`,
      name: overrides.name || `${baseTheme.name} Variant`,
      metadata: {
        ...baseTheme.metadata,
        ...overrides.metadata,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      }
    };
    
    return builder;
  }

  /**
   * Generate a unique theme ID
   */
  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `theme-${timestamp}-${random}`;
  }

  /**
   * Update timestamp
   */
  private updateTimestamp(): void {
    if (this.theme.metadata) {
      this.theme.metadata.updated = new Date().toISOString();
    }
  }

  /**
   * Check if theme is complete
   */
  private isCompleteTheme(theme: Partial<Theme>): theme is Theme {
    return !!(
      theme.id &&
      theme.name &&
      theme.description &&
      theme.version &&
      theme.author &&
      theme.category &&
      theme.type &&
      theme.metadata &&
      theme.colors &&
      theme.typography &&
      theme.spacing &&
      theme.components &&
      theme.layout &&
      theme.effects
    );
  }

  /**
   * Generate color palette from base color
   */
  private generateColorPalette(baseColor: string): any {
    // Simplified palette generation
    // In a real implementation, you'd use color manipulation libraries
    return {
      50: this.lighten(baseColor, 0.9),
      100: this.lighten(baseColor, 0.8),
      200: this.lighten(baseColor, 0.6),
      300: this.lighten(baseColor, 0.4),
      400: this.lighten(baseColor, 0.2),
      500: baseColor,
      600: this.darken(baseColor, 0.1),
      700: this.darken(baseColor, 0.2),
      800: this.darken(baseColor, 0.3),
      900: this.darken(baseColor, 0.4),
      950: this.darken(baseColor, 0.5)
    };
  }

  /**
   * Lighten a color (simplified)
   */
  private lighten(color: string, amount: number): string {
    // Simplified implementation
    return color;
  }

  /**
   * Darken a color (simplified)
   */
  private darken(color: string, amount: number): string {
    // Simplified implementation
    return color;
  }

  /**
   * Convert theme to dark mode
   */
  private convertToDarkMode(): void {
    if (!this.theme.colors) return;
    
    // Swap light and dark colors
    const colors = this.theme.colors;
    
    // Swap surface colors
    if (colors.surface) {
      const temp = colors.surface.background;
      colors.surface.background = '#0f172a';
      colors.surface.foreground = '#1e293b';
      colors.surface.card = '#1e293b';
      colors.surface.sidebar = '#0f172a';
      colors.surface.header = '#1e293b';
      colors.surface.footer = '#0f172a';
    }
    
    // Swap text colors
    if (colors.semantic?.text) {
      colors.semantic.text.primary = '#f8fafc';
      colors.semantic.text.secondary = '#cbd5e1';
      colors.semantic.text.muted = '#94a3b8';
      colors.semantic.text.disabled = '#64748b';
    }
    
    // Update category
    this.theme.category = 'dark';
  }

  /**
   * Deep clone object
   */
  private cloneDeep<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as any;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cloneDeep(item)) as any;
    }
    
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.cloneDeep(obj[key]);
      }
    }
    
    return cloned;
  }
}

// Export utility functions
export function createTheme(config?: Partial<Theme>): ThemeBuilder {
  return new ThemeBuilder().create(config);
}

export function createThemeBuilder(): ThemeBuilder {
  return new ThemeBuilder();
}

export function themeFromBase(baseTheme: Theme): ThemeBuilder {
  return ThemeBuilder.fromTheme(baseTheme);
}

export function createVariant(baseTheme: Theme, overrides: Partial<Theme>): ThemeBuilder {
  return ThemeBuilder.createVariant(baseTheme, overrides);
} 