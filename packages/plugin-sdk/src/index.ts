// Core Plugin SDK exports
export * from './types';
export * from './plugin';
export * from './api';
export * from './hooks';
export * from './utils';
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

// Version information
export const SDK_VERSION = '1.0.0'; 