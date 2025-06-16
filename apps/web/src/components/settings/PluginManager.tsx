'use client';

import React, { useState, useEffect } from 'react';
import { usePlugins } from '@/components/providers/PluginProvider';
import {
  getAllPlugins,
  getEnabledPlugins,
  enablePlugin,
  disablePlugin,
  installPlugin,
  uninstallPlugin,
  type PluginInstallResult
} from '@/services/pluginService';
import { Package, PlusCircle, Trash2, ToggleLeft, ToggleRight, RefreshCw, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

// Define local types to match the service
type PluginManifest = {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  category?: string;
  permissions?: string[];
};

type PluginRegistryEntry = {
  manifest: PluginManifest;
  enabled: boolean;
  error?: Error;
};

export function PluginManager() {
  const { 
    plugins, 
    enabledPlugins, 
    enablePlugin, 
    disablePlugin, 
    installPlugin, 
    uninstallPlugin, 
    refreshPlugins,
    isLoading,
    error
  } = usePlugins();
  
  const [installUrl, setInstallUrl] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);
  const [installSuccess, setInstallSuccess] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const handleInstall = async () => {
    if (!installUrl.trim()) return;
    
    try {
      setIsInstalling(true);
      setInstallError(null);
      setInstallSuccess(null);
      
      const result: PluginInstallResult = await installPlugin(installUrl);
      
      if (result.success) {
        const pluginName = result.plugin?.manifest?.name || 'Unknown';
        setInstallSuccess(`Successfully installed plugin: ${pluginName}`);
        setInstallUrl('');
      } else {
        setInstallError(`Failed to install plugin: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setInstallError(`Error installing plugin: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleTogglePlugin = async (pluginId: string, enabled: boolean) => {
    setActionInProgress(pluginId);
    try {
      if (enabled) {
        await disablePlugin(pluginId);
      } else {
        await enablePlugin(pluginId);
      }
    } finally {
      setActionInProgress(null);
    }
  };

  const handleUninstall = async (pluginId: string) => {
    if (!confirm('Are you sure you want to uninstall this plugin?')) return;
    
    setActionInProgress(pluginId);
    try {
      await uninstallPlugin(pluginId);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRefresh = async () => {
    await refreshPlugins();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Package className="w-6 h-6" />
          Plugin Manager
        </h2>
        <button 
          onClick={handleRefresh}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          aria-label="Refresh plugins"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>Error loading plugins: {error.message}</p>
        </div>
      )}

      <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
        <input
          type="text"
          value={installUrl}
          onChange={(e) => setInstallUrl(e.target.value)}
          placeholder="Plugin URL or file path"
          className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
          disabled={isInstalling}
        />
        <button
          onClick={handleInstall}
          disabled={isInstalling || !installUrl.trim()}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInstalling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <PlusCircle className="w-4 h-4" />
          )}
          Install
        </button>
      </div>

      {installError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{installError}</p>
        </div>
      )}

      {installSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 p-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{installSuccess}</p>
        </div>
      )}

      <div className="space-y-1">
        <h3 className="text-lg font-medium">Installed Plugins ({plugins.length})</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your installed plugins
        </p>
      </div>

      {plugins.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No plugins installed</p>
          <p className="text-sm mt-2">Install a plugin to enhance your OmniPanel experience</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plugins.map((plugin) => {
            const isEnabled = enabledPlugins.some(p => p.manifest.id === plugin.manifest.id);
            const isActionInProgress = actionInProgress === plugin.manifest.id;
            
            return (
              <div 
                key={plugin.manifest.id} 
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{plugin.manifest.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">v{plugin.manifest.version}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePlugin(plugin.manifest.id, isEnabled)}
                      disabled={isActionInProgress}
                      className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-50"
                      title={isEnabled ? 'Disable plugin' : 'Enable plugin'}
                    >
                      {isActionInProgress ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isEnabled ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleUninstall(plugin.manifest.id)}
                      disabled={isActionInProgress}
                      className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                      title="Uninstall plugin"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                  {plugin.manifest.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                    {plugin.manifest.category}
                  </span>
                  {plugin.manifest.permissions.map((permission) => (
                    <span 
                      key={permission} 
                      className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
                {plugin.error && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                    Error: {plugin.error.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
