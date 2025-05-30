import { 
  Plugin, 
  PluginManifest, 
  PluginRegistryEntry, 
  PluginContext,
  PluginInstallOptions,
  PluginInstallResult,
  PluginDisposable
} from './types';
import { PluginValidator, PluginEventEmitter } from './plugin';
import { PluginAPI } from './api';
import { PluginSandbox } from './sandbox';

export class PluginRegistry {
  private plugins = new Map<string, PluginRegistryEntry>();
  private activePlugins = new Map<string, Plugin>();
  private eventEmitter = new PluginEventEmitter();
  private api: PluginAPI;
  private sandbox: PluginSandbox;

  constructor(api: PluginAPI) {
    this.api = api;
    this.sandbox = new PluginSandbox();
  }

  /**
   * Register a plugin in the registry
   */
  async register(
    manifest: PluginManifest, 
    path: string, 
    enabled = true
  ): Promise<PluginRegistryEntry> {
    // Validate manifest
    const validation = PluginValidator.validateManifest(manifest);
    if (!validation.valid) {
      throw new Error(`Invalid plugin manifest: ${validation.errors.join(', ')}`);
    }

    // Check if plugin already exists
    if (this.plugins.has(manifest.id)) {
      throw new Error(`Plugin with ID '${manifest.id}' is already registered`);
    }

    const entry: PluginRegistryEntry = {
      manifest,
      path,
      enabled,
    };

    this.plugins.set(manifest.id, entry);
    this.eventEmitter.emit('plugin:registered', { plugin: entry });

    // Auto-activate if enabled
    if (enabled) {
      await this.activate(manifest.id);
    }

    return entry;
  }

  /**
   * Unregister a plugin from the registry
   */
  async unregister(pluginId: string): Promise<void> {
    const entry = this.plugins.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin '${pluginId}' not found`);
    }

    // Deactivate if active
    if (this.activePlugins.has(pluginId)) {
      await this.deactivate(pluginId);
    }

    this.plugins.delete(pluginId);
    this.eventEmitter.emit('plugin:unregistered', { plugin: entry });
  }

  /**
   * Activate a plugin
   */
  async activate(pluginId: string): Promise<void> {
    const entry = this.plugins.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin '${pluginId}' not found`);
    }

    if (this.activePlugins.has(pluginId)) {
      console.warn(`Plugin '${pluginId}' is already active`);
      return;
    }

    try {
      // Load plugin module
      const pluginModule = await this.loadPlugin(entry);
      const plugin = pluginModule.default || pluginModule;

      if (!plugin || typeof plugin.activate !== 'function') {
        throw new Error('Plugin must export an object with an activate function');
      }

      // Create plugin context
      const context = this.createPluginContext(entry);

      // Activate plugin in sandbox
      await this.sandbox.execute(async () => {
        await plugin.activate(context);
      }, entry.manifest.permissions);

      // Store active plugin
      this.activePlugins.set(pluginId, plugin);
      entry.instance = plugin;
      entry.enabled = true;

      this.eventEmitter.emit('plugin:activated', { plugin: entry });
    } catch (error) {
      entry.error = error as Error;
      this.eventEmitter.emit('plugin:error', { plugin: entry, error });
      throw error;
    }
  }

  /**
   * Deactivate a plugin
   */
  async deactivate(pluginId: string): Promise<void> {
    const entry = this.plugins.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin '${pluginId}' not found`);
    }

    const plugin = this.activePlugins.get(pluginId);
    if (!plugin) {
      console.warn(`Plugin '${pluginId}' is not active`);
      return;
    }

    try {
      // Deactivate plugin
      if (plugin.deactivate) {
        await this.sandbox.execute(async () => {
          await plugin.deactivate!();
        }, entry.manifest.permissions);
      }

      // Remove from active plugins
      this.activePlugins.delete(pluginId);
      entry.instance = undefined;
      entry.enabled = false;

      this.eventEmitter.emit('plugin:deactivated', { plugin: entry });
    } catch (error) {
      entry.error = error as Error;
      this.eventEmitter.emit('plugin:error', { plugin: entry, error });
      throw error;
    }
  }

  /**
   * Enable a plugin
   */
  async enable(pluginId: string): Promise<void> {
    const entry = this.plugins.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin '${pluginId}' not found`);
    }

    if (!this.activePlugins.has(pluginId)) {
      await this.activate(pluginId);
    }
  }

  /**
   * Disable a plugin
   */
  async disable(pluginId: string): Promise<void> {
    const entry = this.plugins.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin '${pluginId}' not found`);
    }

    if (this.activePlugins.has(pluginId)) {
      await this.deactivate(pluginId);
    }
  }

  /**
   * Install a plugin from a package
   */
  async install(
    packagePath: string, 
    options: PluginInstallOptions = {}
  ): Promise<PluginInstallResult> {
    try {
      // Extract and validate package
      const { manifest, path } = await this.extractPlugin(packagePath);
      
      // Check version requirements
      if (options.version && manifest.version !== options.version) {
        throw new Error(`Version mismatch: expected ${options.version}, got ${manifest.version}`);
      }

      // Check if already installed
      if (this.plugins.has(manifest.id) && !options.force) {
        throw new Error(`Plugin '${manifest.id}' is already installed`);
      }

      // Unregister existing if force installing
      if (this.plugins.has(manifest.id) && options.force) {
        await this.unregister(manifest.id);
      }

      // Register the plugin
      const entry = await this.register(manifest, path);

      return {
        success: true,
        plugin: entry,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Uninstall a plugin
   */
  async uninstall(pluginId: string): Promise<boolean> {
    try {
      const entry = this.plugins.get(pluginId);
      if (!entry) {
        throw new Error(`Plugin '${pluginId}' not found`);
      }

      // Unregister from registry
      await this.unregister(pluginId);

      // Clean up files
      await this.cleanupPlugin(entry);

      return true;
    } catch (error) {
      console.error(`Failed to uninstall plugin '${pluginId}':`, error);
      return false;
    }
  }

  /**
   * Get all registered plugins
   */
  getAll(): PluginRegistryEntry[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin by ID
   */
  get(pluginId: string): PluginRegistryEntry | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all active plugins
   */
  getActive(): PluginRegistryEntry[] {
    return this.getAll().filter(entry => this.activePlugins.has(entry.manifest.id));
  }

  /**
   * Check if plugin is active
   */
  isActive(pluginId: string): boolean {
    return this.activePlugins.has(pluginId);
  }

  /**
   * Check if plugin is installed
   */
  isInstalled(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * Get plugins by category
   */
  getByCategory(category: string): PluginRegistryEntry[] {
    return this.getAll().filter(entry => entry.manifest.category === category);
  }

  /**
   * Search plugins
   */
  search(query: string): PluginRegistryEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(entry => 
      entry.manifest.name.toLowerCase().includes(lowerQuery) ||
      entry.manifest.description.toLowerCase().includes(lowerQuery) ||
      entry.manifest.keywords?.some(keyword => 
        keyword.toLowerCase().includes(lowerQuery)
      )
    );
  }

  /**
   * Listen to plugin events
   */
  onEvent(event: string, listener: (...args: any[]) => void): PluginDisposable {
    return this.eventEmitter.on(event, listener);
  }

  /**
   * Reload all plugins
   */
  async reloadAll(): Promise<void> {
    const activePluginIds = Array.from(this.activePlugins.keys());
    
    // Deactivate all
    for (const pluginId of activePluginIds) {
      await this.deactivate(pluginId);
    }

    // Reactivate all
    for (const pluginId of activePluginIds) {
      await this.activate(pluginId);
    }
  }

  /**
   * Get plugin statistics
   */
  getStats(): {
    total: number;
    active: number;
    inactive: number;
    errors: number;
  } {
    const total = this.plugins.size;
    const active = this.activePlugins.size;
    const errors = this.getAll().filter(entry => entry.error).length;

    return {
      total,
      active,
      inactive: total - active,
      errors,
    };
  }

  private async loadPlugin(entry: PluginRegistryEntry): Promise<any> {
    // In a real implementation, this would load the plugin module
    // For now, we'll use dynamic import
    const modulePath = `${entry.path}/${entry.manifest.main}`;
    return import(modulePath);
  }

  private createPluginContext(entry: PluginRegistryEntry): PluginContext {
    return {
      extensionPath: entry.path,
      extensionUri: `file://${entry.path}`,
      globalState: new PluginStateManager(`global:${entry.manifest.id}`),
      workspaceState: new PluginStateManager(`workspace:${entry.manifest.id}`),
      subscriptions: [],
      api: this.api,
      logger: new PluginLogger(entry.manifest.id),
      events: this.eventEmitter,
    };
  }

  private async extractPlugin(packagePath: string): Promise<{
    manifest: PluginManifest;
    path: string;
  }> {
    // Simplified implementation - in reality would extract from zip/tar
    const manifestPath = `${packagePath}/manifest.json`;
    const manifestContent = await this.api.fs.readFile(manifestPath);
    const manifest = JSON.parse(manifestContent.toString());
    
    return {
      manifest,
      path: packagePath,
    };
  }

  private async cleanupPlugin(entry: PluginRegistryEntry): Promise<void> {
    // Clean up plugin files
    await this.api.fs.delete(entry.path, { recursive: true });
  }
}

class PluginStateManager {
  constructor(private namespace: string) {}

  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  get<T>(key: string, defaultValue?: T): T | undefined {
    const fullKey = `${this.namespace}:${key}`;
    const stored = localStorage.getItem(fullKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  }

  async update(key: string, value: any): Promise<void> {
    const fullKey = `${this.namespace}:${key}`;
    localStorage.setItem(fullKey, JSON.stringify(value));
  }

  keys(): readonly string[] {
    const prefix = `${this.namespace}:`;
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        keys.push(key.substring(prefix.length));
      }
    }
    return keys;
  }
}

class PluginLogger {
  constructor(private pluginId: string) {}

  private log(level: string, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] [${this.pluginId}] ${message}`, ...args);
  }

  trace(message: string, ...args: any[]): void {
    this.log('trace', message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log('error', message, ...args);
  }
} 