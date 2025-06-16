'use client';

import React, { useState } from 'react';
import { usePlugins } from '@/components/providers/PluginProvider';
import { PluginRenderer } from '@/components/plugins/PluginRenderer';
import { Package, Layers, Settings, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function PluginsPage() {
  const { enabledPlugins, isLoading } = usePlugins();
  const [selectedPluginId, setSelectedPluginId] = useState<string | null>(null);

  // Select the first plugin by default when plugins load
  React.useEffect(() => {
    if (enabledPlugins.length > 0 && !selectedPluginId) {
      setSelectedPluginId(enabledPlugins[0].manifest.id);
    }
  }, [enabledPlugins, selectedPluginId]);

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border bg-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          <h1 className="text-xl font-semibold">Plugins</h1>
        </div>
        <Link 
          href="/settings/plugins" 
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Manage Plugins</span>
        </Link>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Plugin Sidebar */}
        <div className="w-64 border-r border-border bg-background overflow-y-auto">
          <div className="p-3 border-b border-border">
            <h2 className="text-sm font-medium flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>Enabled Plugins</span>
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full ml-auto">
                {enabledPlugins.length}
              </span>
            </h2>
          </div>
          
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-5 bg-muted rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : enabledPlugins.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
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
            <div className="p-2">
              {enabledPlugins.map((plugin) => (
                <button
                  key={plugin.manifest.id}
                  onClick={() => setSelectedPluginId(plugin.manifest.id)}
                  className={`w-full text-left p-2 rounded-md transition-colors mb-1 ${
                    selectedPluginId === plugin.manifest.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="font-medium text-sm">{plugin.manifest.name}</div>
                  <div className="text-xs truncate opacity-80">
                    {plugin.manifest.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Plugin Content */}
        <div className="flex-1 overflow-auto bg-background">
          {selectedPluginId ? (
            <div className="h-full">
              <PluginRenderer pluginId={selectedPluginId} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-6">
              <div>
                <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <h2 className="text-xl font-medium mb-2">No Plugin Selected</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  Select a plugin from the sidebar or install new plugins to enhance your OmniPanel experience.
                </p>
                <Link
                  href="/settings/plugins"
                  className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Manage Plugins</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
