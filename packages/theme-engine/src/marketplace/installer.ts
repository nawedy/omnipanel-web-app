import { Theme } from '../types';
import { ThemeEngine } from '../engine';
import { ThemeValidator } from '../validator';
import { MarketplaceClient } from './client';
import { ThemeInstallation, MarketplaceTheme } from './types';
import { EventEmitter } from 'events';

/**
 * Theme Installer - Manages theme installation, updates, and dependencies
 */
export class ThemeInstaller extends EventEmitter {
  private engine: ThemeEngine;
  private client: MarketplaceClient;
  private validator: ThemeValidator;
  private installations = new Map<string, ThemeInstallation>();
  private installationPath: string;

  constructor(
    engine: ThemeEngine,
    client: MarketplaceClient,
    installationPath: string = './themes'
  ) {
    super();
    this.engine = engine;
    this.client = client;
    this.validator = new ThemeValidator();
    this.installationPath = installationPath;
    
    this.loadInstallations();
  }

  /**
   * Install a theme from the marketplace
   */
  async installTheme(
    themeId: string,
    options: {
      version?: string;
      autoUpdate?: boolean;
      force?: boolean;
    } = {}
  ): Promise<ThemeInstallation> {
    try {
      this.emit('install:start', { themeId, options });

      // Check if already installed
      const existing = this.installations.get(themeId);
      if (existing && !options.force) {
        throw new Error(`Theme ${themeId} is already installed. Use force option to reinstall.`);
      }

      // Get theme from marketplace
      const marketplaceTheme = await this.client.getTheme(themeId);
      const theme = await this.client.downloadTheme(themeId, options.version);

      // Validate theme
      const validation = this.validator.validate(theme);
      if (!validation.valid) {
        throw new Error(`Theme validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Check compatibility
      this.checkCompatibility(theme);

      // Install dependencies if any
      await this.installDependencies(theme);

      // Create installation record
      const installation: ThemeInstallation = {
        themeId,
        version: options.version || marketplaceTheme.version,
        installedAt: new Date().toISOString(),
        installedBy: 'user', // TODO: Get from auth context
        source: 'marketplace',
        autoUpdate: options.autoUpdate ?? true,
        customizations: {}
      };

      // Save theme to engine
      this.engine.addTheme(theme);

      // Save installation record
      this.installations.set(themeId, installation);
      await this.saveInstallations();

      // Register with marketplace
      await this.client.installTheme(themeId, installation.version);

      this.emit('install:complete', { themeId, installation });
      return installation;

    } catch (error) {
      this.emit('install:error', { themeId, error });
      throw error;
    }
  }

  /**
   * Uninstall a theme
   */
  async uninstallTheme(themeId: string): Promise<void> {
    try {
      this.emit('uninstall:start', { themeId });

      const installation = this.installations.get(themeId);
      if (!installation) {
        throw new Error(`Theme ${themeId} is not installed`);
      }

      // Remove from engine
      this.engine.removeTheme(themeId);

      // Remove installation record
      this.installations.delete(themeId);
      await this.saveInstallations();

      // Clean up files
      await this.cleanupThemeFiles(themeId);

      this.emit('uninstall:complete', { themeId });

    } catch (error) {
      this.emit('uninstall:error', { themeId, error });
      throw error;
    }
  }

  /**
   * Update a theme to the latest version
   */
  async updateTheme(themeId: string, targetVersion?: string): Promise<ThemeInstallation> {
    try {
      this.emit('update:start', { themeId, targetVersion });

      const installation = this.installations.get(themeId);
      if (!installation) {
        throw new Error(`Theme ${themeId} is not installed`);
      }

      // Get latest version info
      const marketplaceTheme = await this.client.getTheme(themeId);
      const latestVersion = targetVersion || marketplaceTheme.version;

      if (installation.version === latestVersion) {
        this.emit('update:skip', { themeId, reason: 'Already up to date' });
        return installation;
      }

      // Backup current installation
      const backup = { ...installation };

      try {
        // Download new version
        const updatedTheme = await this.client.downloadTheme(themeId, latestVersion);

        // Validate new version
        const validation = this.validator.validate(updatedTheme);
        if (!validation.valid) {
          throw new Error(`Theme validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        }

        // Update theme in engine
        this.engine.removeTheme(themeId);
        this.engine.addTheme(updatedTheme);

        // Update installation record
        installation.version = latestVersion;
        installation.installedAt = new Date().toISOString();
        this.installations.set(themeId, installation);
        await this.saveInstallations();

        this.emit('update:complete', { themeId, oldVersion: backup.version, newVersion: latestVersion });
        return installation;

      } catch (error) {
        // Restore backup on failure
        this.installations.set(themeId, backup);
        await this.saveInstallations();
        throw error;
      }

    } catch (error) {
      this.emit('update:error', { themeId, error });
      throw error;
    }
  }

  /**
   * Update all themes with auto-update enabled
   */
  async updateAllThemes(): Promise<{
    updated: string[];
    failed: { themeId: string; error: string }[];
    skipped: string[];
  }> {
    const results = {
      updated: [] as string[],
      failed: [] as { themeId: string; error: string }[],
      skipped: [] as string[]
    };

    const autoUpdateThemes = Array.from(this.installations.entries())
      .filter(([, installation]) => installation.autoUpdate)
      .map(([themeId]) => themeId);

    for (const themeId of autoUpdateThemes) {
      try {
        const installation = await this.updateTheme(themeId);
        results.updated.push(themeId);
      } catch (error) {
        results.failed.push({
          themeId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Get all installed themes
   */
  getInstalledThemes(): ThemeInstallation[] {
    return Array.from(this.installations.values());
  }

  /**
   * Get installation info for a specific theme
   */
  getInstallation(themeId: string): ThemeInstallation | undefined {
    return this.installations.get(themeId);
  }

  /**
   * Check if a theme is installed
   */
  isInstalled(themeId: string): boolean {
    return this.installations.has(themeId);
  }

  /**
   * Enable auto-update for a theme
   */
  async enableAutoUpdate(themeId: string): Promise<void> {
    const installation = this.installations.get(themeId);
    if (!installation) {
      throw new Error(`Theme ${themeId} is not installed`);
    }

    installation.autoUpdate = true;
    await this.saveInstallations();
  }

  /**
   * Disable auto-update for a theme
   */
  async disableAutoUpdate(themeId: string): Promise<void> {
    const installation = this.installations.get(themeId);
    if (!installation) {
      throw new Error(`Theme ${themeId} is not installed`);
    }

    installation.autoUpdate = false;
    await this.saveInstallations();
  }

  /**
   * Apply customizations to an installed theme
   */
  async customizeTheme(themeId: string, customizations: Record<string, any>): Promise<void> {
    const installation = this.installations.get(themeId);
    if (!installation) {
      throw new Error(`Theme ${themeId} is not installed`);
    }

    installation.customizations = {
      ...installation.customizations,
      ...customizations
    };

    await this.saveInstallations();
    this.emit('theme:customized', { themeId, customizations });
  }

  /**
   * Install theme from local file
   */
  async installFromFile(filePath: string, themeId?: string): Promise<ThemeInstallation> {
    try {
      // Read and parse theme file
      const theme = await this.loadThemeFromFile(filePath);
      const finalThemeId = themeId || theme.id;

      // Validate theme
      const validation = this.validator.validate(theme);
      if (!validation.valid) {
        throw new Error(`Theme validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Create installation record
      const installation: ThemeInstallation = {
        themeId: finalThemeId,
        version: theme.version,
        installedAt: new Date().toISOString(),
        installedBy: 'user',
        source: 'local',
        autoUpdate: false,
        customizations: {}
      };

      // Add to engine
      this.engine.addTheme(theme);

      // Save installation
      this.installations.set(finalThemeId, installation);
      await this.saveInstallations();

      return installation;

    } catch (error) {
      throw new Error(`Failed to install theme from file: ${error}`);
    }
  }

  /**
   * Install theme from URL
   */
  async installFromUrl(url: string, themeId?: string): Promise<ThemeInstallation> {
    try {
      // Download theme from URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download theme: ${response.statusText}`);
      }

      const theme = await response.json() as Theme;
      const finalThemeId = themeId || theme.id;

      // Validate theme
      const validation = this.validator.validate(theme);
      if (!validation.valid) {
        throw new Error(`Theme validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Create installation record
      const installation: ThemeInstallation = {
        themeId: finalThemeId,
        version: theme.version,
        installedAt: new Date().toISOString(),
        installedBy: 'user',
        source: 'url',
        autoUpdate: false,
        customizations: {}
      };

      // Add to engine
      this.engine.addTheme(theme);

      // Save installation
      this.installations.set(finalThemeId, installation);
      await this.saveInstallations();

      return installation;

    } catch (error) {
      throw new Error(`Failed to install theme from URL: ${error}`);
    }
  }

  /**
   * Check theme compatibility
   */
  private checkCompatibility(theme: Theme): void {
    // Check platform compatibility
    const currentPlatform = this.getCurrentPlatform();
    if (theme.metadata.compatibility.requiredFeatures && 
        !theme.metadata.compatibility.requiredFeatures.includes(currentPlatform)) {
      throw new Error(`Theme is not compatible with platform: ${currentPlatform}`);
    }
  }

  /**
   * Install theme dependencies
   */
  private async installDependencies(theme: Theme): Promise<void> {
    // Check if theme has dependencies
    const dependencies = theme.custom?.dependencies;
    if (!dependencies || !Array.isArray(dependencies)) {
      return;
    }

    for (const dependency of dependencies) {
      if (!this.isInstalled(dependency)) {
        await this.installTheme(dependency);
      }
    }
  }

  /**
   * Load theme from file
   */
  private async loadThemeFromFile(filePath: string): Promise<Theme> {
    // This would be implemented based on the runtime environment
    // For now, return a placeholder
    throw new Error('File loading not implemented in this environment');
  }

  /**
   * Get current platform
   */
  private getCurrentPlatform(): string {
    if (typeof window !== 'undefined') {
      return 'web';
    }
    if (typeof process !== 'undefined' && process.versions?.electron) {
      return 'desktop';
    }
    return 'unknown';
  }

  /**
   * Load installations from storage
   */
  private async loadInstallations(): Promise<void> {
    try {
      // This would load from persistent storage
      // For now, start with empty map
      this.installations = new Map();
    } catch (error) {
      console.warn('Failed to load theme installations:', error);
      this.installations = new Map();
    }
  }

  /**
   * Save installations to storage
   */
  private async saveInstallations(): Promise<void> {
    try {
      // This would save to persistent storage
      // For now, just emit an event
      this.emit('installations:saved', Array.from(this.installations.entries()));
    } catch (error) {
      console.warn('Failed to save theme installations:', error);
    }
  }

  /**
   * Clean up theme files
   */
  private async cleanupThemeFiles(themeId: string): Promise<void> {
    // This would clean up any cached files or assets
    // For now, just emit an event
    this.emit('files:cleaned', { themeId });
  }
}

/**
 * Create a theme installer instance
 */
export function createThemeInstaller(
  engine: ThemeEngine,
  client: MarketplaceClient,
  installationPath?: string
): ThemeInstaller {
  return new ThemeInstaller(engine, client, installationPath);
} 