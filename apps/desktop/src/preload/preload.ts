import { contextBridge, ipcRenderer } from 'electron';

// Define the API that will be exposed to the renderer process
export interface DesktopAPI {
  // File system operations
  fs: {
    selectFolder: () => Promise<string | undefined>;
    selectFile: (filters?: Electron.FileFilter[]) => Promise<string | undefined>;
    saveFile: (defaultPath?: string, filters?: Electron.FileFilter[]) => Promise<string | undefined>;
    readFile: (filePath: string) => Promise<string>;
    writeFile: (filePath: string, content: string) => Promise<void>;
    readDir: (dirPath: string) => Promise<any[]>;
    createDir: (dirPath: string) => Promise<void>;
    delete: (itemPath: string) => Promise<void>;
    watchProject: (projectPath: string) => Promise<string>;
  };

  // System information
  system: {
    getInfo: () => Promise<any>;
    getResourceUsage: () => Promise<any>;
  };

  // LLM model management
  llm: {
    startOllama: () => Promise<any>;
    stopOllama: () => Promise<any>;
    getLocalModels: () => Promise<any>;
    downloadModel: (modelName: string) => Promise<any>;
  };

  // App configuration
  config: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
  };

  // Window management
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
  };

  // Auto-updater
  updater: {
    checkForUpdates: () => Promise<any>;
    downloadUpdate: () => Promise<any>;
    installUpdate: () => Promise<any>;
  };

  // Event listeners
  events: {
    on: (channel: string, listener: (...args: any[]) => void) => void;
    off: (channel: string, listener: (...args: any[]) => void) => void;
    once: (channel: string, listener: (...args: any[]) => void) => void;
  };
}

// Whitelist of allowed IPC channels for security
const ALLOWED_CHANNELS = {
  // File system channels
  'fs:selectFolder': true,
  'fs:selectFile': true,
  'fs:saveFile': true,
  'fs:readFile': true,
  'fs:writeFile': true,
  'fs:readDir': true,
  'fs:createDir': true,
  'fs:delete': true,
  'fs:watchProject': true,
  
  // System channels
  'system:getInfo': true,
  'system:getResourceUsage': true,
  
  // LLM channels
  'llm:startOllama': true,
  'llm:stopOllama': true,
  'llm:getLocalModels': true,
  'llm:downloadModel': true,
  
  // Config channels
  'config:get': true,
  'config:set': true,
  
  // Window channels
  'window:minimize': true,
  'window:maximize': true,
  'window:close': true,
  
  // Updater channels
  'updater:checkForUpdates': true,
  'updater:downloadUpdate': true,
  'updater:installUpdate': true,
  
  // Event channels (from main to renderer)
  'project:new': true,
  'project:open': true,
  'project:save': true,
  'project:import': true,
  'project:export': true,
  'llm:openModelManager': true,
  'llm:openProviderConfig': true,
  'file:added': true,
  'file:changed': true,
  'file:deleted': true,
  'directory:added': true,
  'directory:deleted': true,
  'watch:error': true,
  'update:available': true,
  'update:downloaded': true,
  'system:alert': true,
};

/**
 * Validate that a channel is allowed for security
 */
function isChannelAllowed(channel: string): boolean {
  return ALLOWED_CHANNELS[channel as keyof typeof ALLOWED_CHANNELS] === true;
}

/**
 * Secure IPC invoke wrapper
 */
async function secureInvoke(channel: string, ...args: any[]): Promise<any> {
  if (!isChannelAllowed(channel)) {
    throw new Error(`Channel '${channel}' is not allowed`);
  }
  return ipcRenderer.invoke(channel, ...args);
}

/**
 * Secure IPC event listener wrapper
 */
function secureOn(channel: string, listener: (...args: any[]) => void): void {
  if (!isChannelAllowed(channel)) {
    throw new Error(`Channel '${channel}' is not allowed`);
  }
  ipcRenderer.on(channel, listener);
}

/**
 * Secure IPC event listener removal
 */
function secureOff(channel: string, listener: (...args: any[]) => void): void {
  if (!isChannelAllowed(channel)) {
    throw new Error(`Channel '${channel}' is not allowed`);
  }
  ipcRenderer.off(channel, listener);
}

/**
 * Secure IPC once listener wrapper
 */
function secureOnce(channel: string, listener: (...args: any[]) => void): void {
  if (!isChannelAllowed(channel)) {
    throw new Error(`Channel '${channel}' is not allowed`);
  }
  ipcRenderer.once(channel, listener);
}

// Create the desktop API object
const desktopAPI: DesktopAPI = {
  fs: {
    selectFolder: () => secureInvoke('fs:selectFolder'),
    selectFile: (filters) => secureInvoke('fs:selectFile', filters),
    saveFile: (defaultPath, filters) => secureInvoke('fs:saveFile', defaultPath, filters),
    readFile: (filePath) => secureInvoke('fs:readFile', filePath),
    writeFile: (filePath, content) => secureInvoke('fs:writeFile', filePath, content),
    readDir: (dirPath) => secureInvoke('fs:readDir', dirPath),
    createDir: (dirPath) => secureInvoke('fs:createDir', dirPath),
    delete: (itemPath) => secureInvoke('fs:delete', itemPath),
    watchProject: (projectPath) => secureInvoke('fs:watchProject', projectPath),
  },

  system: {
    getInfo: () => secureInvoke('system:getInfo'),
    getResourceUsage: () => secureInvoke('system:getResourceUsage'),
  },

  llm: {
    startOllama: () => secureInvoke('llm:startOllama'),
    stopOllama: () => secureInvoke('llm:stopOllama'),
    getLocalModels: () => secureInvoke('llm:getLocalModels'),
    downloadModel: (modelName) => secureInvoke('llm:downloadModel', modelName),
  },

  config: {
    get: (key) => secureInvoke('config:get', key),
    set: (key, value) => secureInvoke('config:set', key, value),
  },

  window: {
    minimize: () => secureInvoke('window:minimize'),
    maximize: () => secureInvoke('window:maximize'),
    close: () => secureInvoke('window:close'),
  },

  updater: {
    checkForUpdates: () => secureInvoke('updater:checkForUpdates'),
    downloadUpdate: () => secureInvoke('updater:downloadUpdate'),
    installUpdate: () => secureInvoke('updater:installUpdate'),
  },

  events: {
    on: secureOn,
    off: secureOff,
    once: secureOnce,
  },
};

// Expose the desktop API to the renderer process
contextBridge.exposeInMainWorld('desktopAPI', desktopAPI);

// Also expose some platform information
contextBridge.exposeInMainWorld('platform', {
  isDesktop: true,
  platform: process.platform,
  versions: process.versions,
});

// Type declaration for global window object (for TypeScript)
declare global {
  interface Window {
    desktopAPI: DesktopAPI;
    platform: {
      isDesktop: boolean;
      platform: string;
      versions: NodeJS.ProcessVersions;
    };
  }
}

// Export types for use in renderer
export type { DesktopAPI }; 