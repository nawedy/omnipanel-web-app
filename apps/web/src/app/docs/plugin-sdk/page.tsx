'use client';

import React from 'react';
import Link from 'next/link';
import { Package, Code, ShieldCheck, Settings, Layers, MessageSquare } from 'lucide-react';
import { useMonitoring } from '@/components/providers/MonitoringProvider';

export default function PluginSDKDocsPage() {
  const { captureError, captureMessage } = useMonitoring();
  
  // Log page visit for analytics
  React.useEffect(() => {
    try {
      captureMessage('Plugin SDK documentation page visited', 'info', {
        page: 'plugin-sdk-docs',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Failed to log page visit'), {
        component: 'PluginSDKDocsPage',
        operation: 'pageVisit'
      });
    }
  }, [captureMessage, captureError]);
  
  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Plugin SDK</h1>
        <p className="text-muted-foreground text-lg">
          Extend OmniPanel with custom plugins using the Plugin SDK
        </p>
      </div>
      
      <div className="bg-app-card-gradient border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">
          The <code>@omnipanel/plugin-sdk</code> package provides a powerful and secure plugin system 
          that allows developers to extend OmniPanel with custom functionality. Plugins are loaded 
          in sandboxed iframes and communicate with the host application via a message-based API.
        </p>
        
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <div className="bg-background border border-border rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Secure Sandboxing</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Plugins run in isolated environments with controlled permissions and secure message passing.
            </p>
          </div>
          
          <div className="bg-background border border-border rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Contribution Points</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Plugins can contribute to various parts of the UI and extend functionality.
            </p>
          </div>
          
          <div className="bg-background border border-border rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Message API</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Communication between plugins and host via structured message passing.
            </p>
          </div>
          
          <div className="bg-background border border-border rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Lifecycle Management</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Install, enable, disable, and uninstall plugins with proper cleanup.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="bg-muted/50 p-4 border-b border-border">
          <h2 className="font-semibold">Integration Guide</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-medium text-lg mb-3">1. Installation</h3>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
              <code>npm install @omnipanel/plugin-sdk</code>
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-3">2. Plugin Service Setup</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Create a service to manage plugin lifecycle and operations:
            </p>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
              <code>{`// pluginService.ts
import { PluginRegistry, PluginSandbox } from '@omnipanel/plugin-sdk';

// Singleton instances
let pluginRegistry: PluginRegistry | null = null;
let pluginSandbox: PluginSandbox | null = null;

export function initializePluginSystem() {
  if (!pluginRegistry) {
    pluginRegistry = new PluginRegistry();
  }
  
  if (!pluginSandbox) {
    pluginSandbox = new PluginSandbox({
      baseUrl: '/plugins',
      defaultPermissions: ['ui']
    });
  }
  
  return { pluginRegistry, pluginSandbox };
}

export function getAllPlugins() {
  const { pluginRegistry } = initializePluginSystem();
  return pluginRegistry.getAllPlugins();
}

export function getEnabledPlugins() {
  const { pluginRegistry } = initializePluginSystem();
  return pluginRegistry.getEnabledPlugins();
}

// Additional methods for plugin management...`}</code>
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-3">3. React Context Provider</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Create a React context provider to make plugin functionality available throughout your app:
            </p>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
              <code>{`// PluginProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as pluginService from '@/services/pluginService';

// Context definition
export const PluginContext = createContext<PluginContextType>({
  plugins: [],
  enabledPlugins: [],
  isLoading: true,
  error: null,
  enablePlugin: async () => false,
  disablePlugin: async () => false,
  installPlugin: async () => ({ success: false }),
  uninstallPlugin: async () => false,
  refreshPlugins: async () => {},
});

export function PluginProvider({ children }: { children: React.ReactNode }) {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [enabledPlugins, setEnabledPlugins] = useState<Plugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize plugin system
  useEffect(() => {
    initializePlugins();
  }, []);
  
  // Implementation of plugin management functions...
  
  return (
    <PluginContext.Provider value={{
      plugins,
      enabledPlugins,
      isLoading,
      error,
      enablePlugin,
      disablePlugin,
      installPlugin,
      uninstallPlugin,
      refreshPlugins,
    }}>
      {children}
    </PluginContext.Provider>
  );
}

// Custom hook for using the plugin context
export function usePlugins() {
  return useContext(PluginContext);
}`}</code>
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-3">4. Plugin Renderer Component</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Create a component to render plugins in sandboxed iframes:
            </p>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
              <code>{`// PluginRenderer.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePlugins } from './PluginProvider';

interface PluginRendererProps {
  pluginId: string;
  height?: string | number;
}

export function PluginRenderer({ pluginId, height = '500px' }: PluginRendererProps) {
  const { enabledPlugins } = usePlugins();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Find the plugin by ID
  const plugin = enabledPlugins.find(p => p.manifest.id === pluginId);
  
  // Set up message handling between host and plugin
  useEffect(() => {
    if (!plugin) return;
    
    const handleMessage = (event: MessageEvent) => {
      // Handle messages from the plugin
      // ...
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [plugin]);
  
  if (!plugin) {
    return <div className="text-red-500">Plugin not found or not enabled: {pluginId}</div>;
  }
  
  return (
    <div className="plugin-renderer">
      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 p-4 rounded">
          {error}
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          src={\`\${plugin.path}/index.html\`}
          style={{ height, width: '100%', border: 'none' }}
          sandbox="allow-scripts allow-same-origin"
          title={plugin.manifest.name}
        />
      )}
    </div>
  );
}`}</code>
            </pre>
          </div>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="bg-muted/50 p-4 border-b border-border">
          <h2 className="font-semibold">Creating Plugins</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <p className="mb-4">
            Plugins are structured as directories with specific files:
          </p>
          
          <div className="bg-muted p-4 rounded text-sm">
            <pre className="font-mono">
              {`plugin-name/
├── manifest.json    # Plugin metadata and configuration
├── icon.svg        # Plugin icon (optional)
├── index.html      # Main entry point
├── index.js        # Plugin code
└── styles.css      # Plugin styles (optional)`}
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-3">Manifest File</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Every plugin must have a <code>manifest.json</code> file:
            </p>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
              <code>{`{
  "id": "my-awesome-plugin",
  "name": "My Awesome Plugin",
  "version": "1.0.0",
  "description": "This plugin does amazing things",
  "author": "Your Name",
  "category": "utilities",
  "permissions": ["ui", "storage"],
  "main": "index.js",
  "engines": {
    "omnipanel": ">=1.0.0"
  },
  "contributions": {
    "views": [
      {
        "id": "main-view",
        "name": "Main View",
        "description": "The main view of the plugin"
      }
    ]
  }
}`}</code>
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-3">Plugin Lifecycle</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Plugins have a defined lifecycle:
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Installation - Plugin files are copied to the plugins directory</li>
              <li>Loading - Plugin manifest is parsed and validated</li>
              <li>Enabling - Plugin is initialized and registered</li>
              <li>Running - Plugin is active and rendering in the UI</li>
              <li>Disabling - Plugin is deactivated but remains installed</li>
              <li>Uninstallation - Plugin files are removed</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-3">Plugin Communication</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Plugins communicate with the host application via postMessage:
            </p>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
              <code>{`// Inside plugin code
window.parent.postMessage({
  type: 'PLUGIN_ACTION',
  payload: {
    action: 'getData',
    data: { key: 'value' }
  }
}, '*');

// Listen for messages from the host
window.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  if (type === 'HOST_ACTION') {
    // Handle host message
  }
});`}</code>
            </pre>
          </div>
        </div>
      </div>
      
      <div className="bg-muted/30 border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Example Plugin</h2>
        <p className="mb-4">
          Check out our demo plugin for a complete example:
        </p>
        
        <Link 
          href="/plugins"
          className="bg-primary/10 text-primary px-4 py-2 rounded-md inline-flex items-center gap-2 hover:bg-primary/20 transition-colors"
        >
          <Package className="w-4 h-4" />
          View Demo Plugin
        </Link>
        
        <div className="mt-6 text-sm text-muted-foreground">
          <p>
            The demo plugin demonstrates all the key features of the plugin system including
            lifecycle management, UI rendering, host communication, and storage access.
          </p>
        </div>
      </div>
    </main>
  );
}
