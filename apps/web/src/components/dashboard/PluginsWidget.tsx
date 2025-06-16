'use client';

import React, { useState, useEffect } from 'react';
import { usePlugins } from '@/components/providers/PluginProvider';
import { getAllPlugins, getEnabledPlugins } from '@/services/pluginService';
import { Package, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useMonitoring } from '@/components/providers/MonitoringProvider';

export function PluginsWidget() {
  const [plugins, setPlugins] = useState([]);
  const [enabledPlugins, setEnabledPlugins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { captureError } = useMonitoring();
  
  // Load plugins on mount
  useEffect(() => {
    const loadPlugins = () => {
      try {
        setIsLoading(true);
        const allPlugins = getAllPlugins();
        const activePlugins = getEnabledPlugins();
        
        setPlugins(allPlugins);
        setEnabledPlugins(activePlugins);
        setError(null);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        captureError(errorObj, {
          component: 'PluginsWidget',
          operation: 'loadPlugins',
          source: 'plugin-system'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlugins();
  }, [captureError]);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="bg-muted/50 p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <Package className="w-4 h-4" />
          Plugins
        </h3>
        <Link 
          href="/plugins"
          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          View All
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 p-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{error.message}</p>
          </div>
        ) : enabledPlugins.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No plugins enabled</p>
            <Link 
              href="/settings/plugins"
              className="text-xs text-primary hover:underline mt-2 inline-block"
            >
              Install plugins
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {enabledPlugins.slice(0, 3).map((plugin) => (
              <div 
                key={plugin.manifest.id}
                className="flex items-center gap-3 p-2 bg-background rounded-md hover:bg-muted transition-colors"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-md">
                  <Package className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{plugin.manifest.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{plugin.manifest.description}</div>
                </div>
              </div>
            ))}
            
            {enabledPlugins.length > 3 && (
              <div className="text-center pt-2">
                <Link 
                  href="/plugins"
                  className="text-xs text-primary hover:underline"
                >
                  +{enabledPlugins.length - 3} more plugins
                </Link>
              </div>
            )}
            
            <div className="pt-2 text-xs text-muted-foreground flex items-center justify-between">
              <span>{plugins.length} installed</span>
              <span>{enabledPlugins.length} enabled</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
