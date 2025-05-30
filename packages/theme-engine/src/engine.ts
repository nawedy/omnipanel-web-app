import { Theme, IThemeEngine, CompiledTheme } from './types';
import { ThemeCompiler } from './compiler';
import { ThemeValidator } from './validator';
import { EventEmitter } from 'events';

export class ThemeEngine implements IThemeEngine {
  public themes = new Map<string, Theme>();
  public currentTheme: Theme | null = null;
  
  private compiler = new ThemeCompiler();
  private validator = new ThemeValidator();
  private eventEmitter = new EventEmitter();
  private compiledThemes = new Map<string, CompiledTheme>();
  private styleElement: HTMLStyleElement | null = null;

  constructor() {
    // Initialize style element for dynamic theme injection
    if (typeof document !== 'undefined') {
      this.initializeStyleElement();
    }
  }

  /**
   * Add a theme to the registry
   */
  addTheme(theme: Theme): void {
    // Validate theme before adding
    const validation = this.validator.validate(theme);
    if (!validation.valid) {
      throw new Error(`Invalid theme: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    this.themes.set(theme.id, theme);
    this.eventEmitter.emit('theme:added', theme);
  }

  /**
   * Remove a theme from the registry
   */
  removeTheme(themeId: string): void {
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new Error(`Theme '${themeId}' not found`);
    }

    // Don't allow removing current theme
    if (this.currentTheme?.id === themeId) {
      throw new Error('Cannot remove currently active theme');
    }

    this.themes.delete(themeId);
    this.compiledThemes.delete(themeId);
    this.eventEmitter.emit('theme:removed', theme);
  }

  /**
   * Get a theme by ID
   */
  getTheme(themeId: string): Theme | undefined {
    return this.themes.get(themeId);
  }

  /**
   * List all available themes
   */
  listThemes(): Theme[] {
    return Array.from(this.themes.values());
  }

  /**
   * Set the current theme
   */
  async setTheme(themeId: string): Promise<void> {
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new Error(`Theme '${themeId}' not found`);
    }

    try {
      // Compile theme if not already compiled
      let compiledTheme = this.compiledThemes.get(themeId);
      if (!compiledTheme) {
        compiledTheme = this.compileTheme(theme);
        this.compiledThemes.set(themeId, compiledTheme);
      }

      // Apply the theme
      await this.applyTheme(compiledTheme);
      
      const previousTheme = this.currentTheme;
      this.currentTheme = theme;

      // Emit theme change event
      this.eventEmitter.emit('theme:changed', {
        current: theme,
        previous: previousTheme
      });

    } catch (error) {
      throw new Error(`Failed to set theme '${themeId}': ${error}`);
    }
  }

  /**
   * Get the current theme
   */
  getCurrentTheme(): Theme | null {
    return this.currentTheme;
  }

  /**
   * Compile a theme into CSS and variables
   */
  compileTheme(theme: Theme): CompiledTheme {
    return this.compiler.compile(theme);
  }

  /**
   * Apply a compiled theme to the DOM
   */
  async applyTheme(compiledTheme: CompiledTheme): Promise<void> {
    if (typeof document === 'undefined') {
      return; // Skip in SSR environment
    }

    // Apply CSS variables to document root
    this.applyCSSVariables(compiledTheme.variables);
    
    // Inject compiled CSS
    this.injectCSS(compiledTheme.css);
    
    // Update data attributes for CSS selectors
    this.updateDataAttributes(compiledTheme);
    
    // Emit apply event
    this.eventEmitter.emit('theme:applied', compiledTheme);
  }

  /**
   * Listen for theme change events
   */
  onThemeChange(callback: (theme: Theme) => void): () => void {
    const listener = (event: any) => callback(event.current);
    this.eventEmitter.on('theme:changed', listener);
    
    return () => {
      this.eventEmitter.removeListener('theme:changed', listener);
    };
  }

  /**
   * Listen for any theme engine events
   */
  on(event: string, callback: (...args: any[]) => void): () => void {
    this.eventEmitter.on(event, callback);
    return () => {
      this.eventEmitter.removeListener(event, callback);
    };
  }

  /**
   * Get theme compilation stats
   */
  getStats(): {
    totalThemes: number;
    compiledThemes: number;
    currentTheme: string | null;
    memoryUsage: number;
  } {
    return {
      totalThemes: this.themes.size,
      compiledThemes: this.compiledThemes.size,
      currentTheme: this.currentTheme?.id || null,
      memoryUsage: this.calculateMemoryUsage(),
    };
  }

  /**
   * Clear compiled theme cache
   */
  clearCache(): void {
    this.compiledThemes.clear();
    this.eventEmitter.emit('cache:cleared');
  }

  /**
   * Precompile themes for faster switching
   */
  async precompileThemes(themeIds?: string[]): Promise<void> {
    const themes = themeIds 
      ? themeIds.map(id => this.themes.get(id)).filter(Boolean) as Theme[]
      : this.listThemes();

    const compilePromises = themes.map(async (theme) => {
      if (!this.compiledThemes.has(theme.id)) {
        const compiled = this.compileTheme(theme);
        this.compiledThemes.set(theme.id, compiled);
      }
    });

    await Promise.all(compilePromises);
    this.eventEmitter.emit('themes:precompiled', themes.map(t => t.id));
  }

  /**
   * Export theme as different formats
   */
  exportTheme(themeId: string, format: 'json' | 'css' | 'scss'): string {
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new Error(`Theme '${themeId}' not found`);
    }

    switch (format) {
      case 'json':
        return JSON.stringify(theme, null, 2);
      
      case 'css':
        const compiled = this.compileTheme(theme);
        return compiled.css;
      
      case 'scss':
        return this.compiler.generateSCSS(theme);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Import theme from JSON
   */
  importTheme(themeData: string | Theme): void {
    const theme = typeof themeData === 'string' 
      ? JSON.parse(themeData) as Theme
      : themeData;
    
    this.addTheme(theme);
  }

  /**
   * Create a theme variant
   */
  createVariant(baseThemeId: string, overrides: Partial<Theme>): Theme {
    const baseTheme = this.themes.get(baseThemeId);
    if (!baseTheme) {
      throw new Error(`Base theme '${baseThemeId}' not found`);
    }

    const variant: Theme = {
      ...baseTheme,
      ...overrides,
      id: overrides.id || `${baseTheme.id}-variant`,
      name: overrides.name || `${baseTheme.name} Variant`,
      metadata: {
        ...baseTheme.metadata,
        ...overrides.metadata,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      }
    };

    return variant;
  }

  /**
   * Get themes by category
   */
  getThemesByCategory(category: string): Theme[] {
    return this.listThemes().filter(theme => theme.category === category);
  }

  /**
   * Search themes
   */
  searchThemes(query: string): Theme[] {
    const lowerQuery = query.toLowerCase();
    return this.listThemes().filter(theme => 
      theme.name.toLowerCase().includes(lowerQuery) ||
      theme.description.toLowerCase().includes(lowerQuery) ||
      theme.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Validate all themes
   */
  validateAllThemes(): Map<string, any> {
    const results = new Map();
    for (const [id, theme] of this.themes) {
      results.set(id, this.validator.validate(theme));
    }
    return results;
  }

  private initializeStyleElement(): void {
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'omnipanel-theme-engine';
    this.styleElement.type = 'text/css';
    document.head.appendChild(this.styleElement);
  }

  private applyCSSVariables(variables: Record<string, string>): void {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(variables)) {
      root.style.setProperty(key, value);
    }
  }

  private injectCSS(css: string): void {
    if (this.styleElement) {
      this.styleElement.textContent = css;
    }
  }

  private updateDataAttributes(compiledTheme: CompiledTheme): void {
    const root = document.documentElement;
    root.setAttribute('data-theme', compiledTheme.id);
    root.setAttribute('data-theme-type', compiledTheme.metadata.created ? 'custom' : 'built-in');
  }

  private calculateMemoryUsage(): number {
    // Estimate memory usage in bytes
    let size = 0;
    
    for (const theme of this.themes.values()) {
      size += JSON.stringify(theme).length * 2; // Rough UTF-16 estimate
    }
    
    for (const compiled of this.compiledThemes.values()) {
      size += compiled.css.length * 2;
      size += JSON.stringify(compiled.variables).length * 2;
    }
    
    return size;
  }

  /**
   * Dispose of the theme engine
   */
  dispose(): void {
    // Remove style element
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
    }
    
    // Clear all data
    this.themes.clear();
    this.compiledThemes.clear();
    this.currentTheme = null;
    
    // Remove all listeners
    this.eventEmitter.removeAllListeners();
    
    this.eventEmitter.emit('engine:disposed');
  }
}

// Singleton instance
let engineInstance: ThemeEngine | null = null;

/**
 * Get the singleton theme engine instance
 */
export function getThemeEngine(): ThemeEngine {
  if (!engineInstance) {
    engineInstance = new ThemeEngine();
  }
  return engineInstance;
}

/**
 * Initialize theme engine with default themes
 */
export async function initializeThemeEngine(defaultThemes?: Theme[]): Promise<ThemeEngine> {
  const engine = getThemeEngine();
  
  if (defaultThemes) {
    for (const theme of defaultThemes) {
      engine.addTheme(theme);
    }
  }
  
  return engine;
} 