import { Plugin, PluginManifest, PluginContext } from './types';

/**
 * Creates a plugin with the given manifest and activation function
 */
export function createPlugin(
  manifest: PluginManifest,
  activate: (context: PluginContext) => Promise<void> | void,
  deactivate?: () => Promise<void> | void
): Plugin {
  return {
    manifest,
    activate,
    deactivate,
  };
}

/**
 * Plugin decorator for class-based plugins
 */
export function plugin(manifest: PluginManifest) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    return class extends constructor implements Plugin {
      manifest = manifest;
      
      async activate(context: PluginContext): Promise<void> {
        if (this.onActivate) {
          return this.onActivate(context);
        }
      }
      
      async deactivate(): Promise<void> {
        if (this.onDeactivate) {
          return this.onDeactivate();
        }
      }
    };
  };
}

/**
 * Base plugin class for inheritance
 */
export abstract class BasePlugin implements Plugin {
  abstract manifest: PluginManifest;
  
  abstract activate(context: PluginContext): Promise<void> | void;
  
  deactivate?(): Promise<void> | void;
}

/**
 * Plugin lifecycle hooks
 */
export interface PluginLifecycle {
  onActivate?(context: PluginContext): Promise<void> | void;
  onDeactivate?(): Promise<void> | void;
  onUpdate?(oldVersion: string, newVersion: string): Promise<void> | void;
  onError?(error: Error): Promise<void> | void;
}

/**
 * Plugin validation utilities
 */
export class PluginValidator {
  static validateManifest(manifest: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Required fields
    if (!manifest.id) errors.push('Missing required field: id');
    if (!manifest.name) errors.push('Missing required field: name');
    if (!manifest.version) errors.push('Missing required field: version');
    if (!manifest.description) errors.push('Missing required field: description');
    if (!manifest.author) errors.push('Missing required field: author');
    if (!manifest.main) errors.push('Missing required field: main');
    if (!manifest.category) errors.push('Missing required field: category');
    if (!manifest.engines?.omnipanel) errors.push('Missing required field: engines.omnipanel');
    
    // Version format
    if (manifest.version && !this.isValidVersion(manifest.version)) {
      errors.push('Invalid version format');
    }
    
    // ID format
    if (manifest.id && !this.isValidId(manifest.id)) {
      errors.push('Invalid ID format (use lowercase letters, numbers, hyphens)');
    }
    
    // Category validation
    const validCategories = [
      'ai-models', 'code-tools', 'data-science', 'productivity',
      'themes', 'integrations', 'utilities', 'extensions'
    ];
    if (manifest.category && !validCategories.includes(manifest.category)) {
      errors.push(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }
    
    // Permissions validation
    if (manifest.permissions && !Array.isArray(manifest.permissions)) {
      errors.push('Permissions must be an array');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
  
  private static isValidVersion(version: string): boolean {
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    return semverRegex.test(version);
  }
  
  private static isValidId(id: string): boolean {
    const idRegex = /^[a-z0-9-]+$/;
    return idRegex.test(id) && id.length >= 3 && id.length <= 50;
  }
}

/**
 * Plugin utilities
 */
export class PluginUtils {
  /**
   * Get plugin directory from manifest
   */
  static getPluginDir(manifest: PluginManifest): string {
    return `plugins/${manifest.id}`;
  }
  
  /**
   * Get plugin asset URL
   */
  static getAssetUrl(manifest: PluginManifest, asset: string): string {
    return `/plugins/${manifest.id}/${asset}`;
  }
  
  /**
   * Check if plugin version is compatible
   */
  static isCompatible(
    pluginVersion: string,
    omnipanelVersion: string,
    requirement: string
  ): boolean {
    // Simple version range checking
    // In production, use a proper semver library
    return true; // Simplified for now
  }
  
  /**
   * Generate plugin ID from name
   */
  static generateId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

/**
 * Plugin event emitter
 */
export class PluginEventEmitter {
  private listeners = new Map<string, Set<Function>>();
  
  on(event: string, listener: Function): { dispose(): void } {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    
    return {
      dispose: () => this.removeListener(event, listener),
    };
  }
  
  emit(event: string, ...args: any[]): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in plugin event listener for ${event}:`, error);
        }
      }
    }
  }
  
  removeListener(event: string, listener: Function): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }
  
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
  
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0;
  }
} 