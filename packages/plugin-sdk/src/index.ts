// Core Plugin SDK exports
export * from './types';
export * from './plugin';
export * from './api';
export * from './registry';
export * from './sandbox';

// Core plugin creation function
export { createPlugin } from './plugin';

// API client for plugins
export { PluginAPI } from './api';

// Plugin registry
export { PluginRegistry } from './registry';

// Sandbox utilities
export { PluginSandbox } from './sandbox';

// Simple placeholder exports for web app compatibility
import React from 'react';

export const PluginProvider = ({ children }: { children: React.ReactNode }) => children;
export const usePlugins = () => ({
  plugins: [],
  loadedPlugins: new Map(),
  loadPlugin: async () => {},
  unloadPlugin: () => {},
  isPluginLoaded: () => false,
  getPlugin: () => undefined,
});

export class BasicPluginManager {
  async registerPlugin() {}
  async loadPlugin() {}
  async unloadPlugin() {}
  getPlugin() { return undefined; }
  isPluginLoaded() { return false; }
  getPluginStatus() { return 'registered' as const; }
  getLoadedPlugins() { return []; }
  getAllPlugins() { return []; }
  async loadPlugins() {}
  async unloadAllPlugins() {}
  getStats() { return { total: 0, loaded: 0, registered: 0, errors: 0 }; }
}

// Version information
export const SDK_VERSION = '1.0.0'; 