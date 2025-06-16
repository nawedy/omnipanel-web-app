/**
 * Plugin Service for the OmniPanel Web Application
 * Temporarily disabled due to plugin-sdk build issues
 */

// TODO: Re-enable when plugin-sdk is fixed
// import { 
//   BasicPluginManager,
//   type Plugin
// } from '@omnipanel/plugin-sdk';

// Temporary mock types until plugin-sdk is fixed
type Plugin = {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  entryPoint?: string;
  type?: string;
};

// Mock plugin manager until plugin-sdk is fixed
const pluginManager = {
  getPlugins: () => [],
  getPlugin: (id: string) => null,
  isPluginEnabled: (id: string) => false,
  enablePlugin: async (id: string) => false,
  disablePlugin: async (id: string) => false,
  installPlugin: async (plugin: Plugin) => false,
  uninstallPlugin: async (id: string) => false,
};

// Define types for compatibility with existing code
type PluginManifest = {
  id: string;
  name: string;
  version: string;
};

type PluginRegistryEntry = {
  manifest: PluginManifest;
  enabled: boolean;
};

type PluginInstallResult = {
  success: boolean;
  plugin?: { manifest: PluginManifest };
  error?: string;
};

/**
 * Initializes the plugin system
 * Temporarily disabled - returns immediately
 */
export async function initializePluginSystem(): Promise<void> {
  try {
    // TODO: Re-enable when plugin-sdk is fixed
    console.log('Plugin system temporarily disabled');
    return Promise.resolve();
  } catch (error) {
    console.error('Failed to initialize plugin system:', error);
    throw error;
  }
}

/**
 * Gets all registered plugins
 * Temporarily returns empty array
 */
export function getAllPlugins(): PluginRegistryEntry[] {
  // TODO: Re-enable when plugin-sdk is fixed
  return [];
}

/**
 * Gets all enabled plugins
 * Temporarily returns empty array
 */
export function getEnabledPlugins(): PluginRegistryEntry[] {
  // TODO: Re-enable when plugin-sdk is fixed
  return [];
}

/**
 * Loads a plugin by ID
 * Temporarily returns undefined
 */
export async function loadPlugin(pluginId: string): Promise<Plugin | undefined> {
  // TODO: Re-enable when plugin-sdk is fixed
  console.log(`Plugin loading temporarily disabled for: ${pluginId}`);
  return undefined;
}

/**
 * Enables a plugin by ID
 * Temporarily returns false
 */
export async function enablePlugin(pluginId: string): Promise<boolean> {
  // TODO: Re-enable when plugin-sdk is fixed
  console.log(`Plugin enabling temporarily disabled for: ${pluginId}`);
  return false;
}

/**
 * Disables a plugin by ID
 * Temporarily returns false
 */
export async function disablePlugin(pluginId: string): Promise<boolean> {
  // TODO: Re-enable when plugin-sdk is fixed
  console.log(`Plugin disabling temporarily disabled for: ${pluginId}`);
  return false;
}

/**
 * Installs a plugin from a URL or local file
 * Temporarily returns failure
 */
export async function installPlugin(source: string): Promise<PluginInstallResult> {
  // TODO: Re-enable when plugin-sdk is fixed
  console.log(`Plugin installation temporarily disabled for: ${source}`);
  return {
    success: false,
    error: 'Plugin system temporarily disabled'
  };
}

/**
 * Uninstalls a plugin by ID
 * Temporarily returns false
 */
export async function uninstallPlugin(pluginId: string): Promise<boolean> {
  // TODO: Re-enable when plugin-sdk is fixed
  console.log(`Plugin uninstallation temporarily disabled for: ${pluginId}`);
  return false;
}

export default {
  initializePluginSystem,
  getAllPlugins,
  getEnabledPlugins,
  loadPlugin,
  enablePlugin,
  disablePlugin,
  installPlugin,
  uninstallPlugin,
};
