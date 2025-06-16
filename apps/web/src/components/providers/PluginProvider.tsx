'use client';

import React, { useEffect } from 'react';
// TODO: Fix plugin-sdk build errors and re-enable
// import { PluginProvider as OmniPluginProvider, usePlugins as useOmniPlugins } from '@omnipanel/plugin-sdk';
// import { initializePluginSystem } from '@/services/pluginService';

// Temporary types until plugin-sdk is fixed
interface MockPluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  permissions: string[];
}

interface MockPluginRegistryEntry {
  manifest: MockPluginManifest;
  path: string;
  enabled: boolean;
  instance?: any;
  error?: Error;
}

/**
 * Plugin Provider component for the OmniPanel web application
 * Temporarily disabled due to plugin-sdk build issues
 */
export function PluginProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // TODO: Re-enable when plugin-sdk is fixed
    // initializePluginSystem();
  }, []);

  return (
    // TODO: Re-enable OmniPluginProvider when plugin-sdk is fixed
    // <OmniPluginProvider>
      <div>{children}</div>
    // </OmniPluginProvider>
  );
}

/**
 * Hook to use plugins
 * Temporarily returns mock plugin manager object until plugin-sdk is fixed
 */
export const usePlugins = () => {
  // TODO: Re-enable when plugin-sdk is fixed
  // return useOmniPlugins();
  return {
    plugins: [] as MockPluginRegistryEntry[],
    enabledPlugins: [] as MockPluginRegistryEntry[],
    enablePlugin: async (id: string) => false,
    disablePlugin: async (id: string) => false,
    installPlugin: async (url: string) => ({ success: false, error: 'Plugin system temporarily disabled' }),
    uninstallPlugin: async (id: string) => false,
    refreshPlugins: async () => {},
    isLoading: false,
    error: null as Error | null
  };
};
