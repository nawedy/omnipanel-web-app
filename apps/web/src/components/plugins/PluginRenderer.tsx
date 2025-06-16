'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePlugins } from '@/components/providers/PluginProvider';
import { AlertCircle, Loader2 } from 'lucide-react';

// Local type definitions to avoid plugin SDK dependency issues
type Plugin = {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  entryPoint?: string;
  type?: string;
};

type PluginRegistryEntry = {
  manifest: {
    id: string;
    name: string;
    version: string;
    description?: string;
    author?: string;
    category?: string;
  };
  enabled: boolean;
};

interface PluginRendererProps {
  pluginId: string;
  height?: number | string;
  width?: number | string;
  className?: string;
}

export function PluginRenderer({ 
  pluginId, 
  height = '100%', 
  width = '100%',
  className = ''
}: PluginRendererProps) {
  const { enabledPlugins } = usePlugins();
  const [plugin, setPlugin] = useState<PluginRegistryEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const foundPlugin = enabledPlugins.find(p => p.manifest.id === pluginId);
    if (foundPlugin) {
      setPlugin(foundPlugin);
      setError(null);
    } else {
      setPlugin(null);
      setError(`Plugin ${pluginId} not found or not enabled`);
    }
  }, [pluginId, enabledPlugins]);

  useEffect(() => {
    if (!plugin || !iframeRef.current) return;

    // Set up communication with the plugin iframe
    const handleMessage = (event: MessageEvent) => {
      // Verify the origin matches the expected plugin origin
      if (event.origin !== window.location.origin) return;
      
      try {
        const { source, type, payload } = event.data;
        
        // Only process messages from this plugin
        if (source !== `plugin:${plugin.manifest.id}`) return;
        
        // Handle plugin messages
        switch (type) {
          case 'plugin:ready':
            // Plugin is ready, send initialization data
            iframeRef.current?.contentWindow?.postMessage({
              source: 'omnipanel:host',
              type: 'host:init',
              payload: {
                pluginId: plugin.manifest.id,
                theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
              }
            }, '*');
            break;
            
          case 'plugin:error':
            console.error(`Plugin ${plugin.manifest.id} error:`, payload);
            setError(`Plugin error: ${payload.message || 'Unknown error'}`);
            break;
            
          default:
            // Handle other plugin messages
            console.log(`Plugin message from ${plugin.manifest.id}:`, type, payload);
        }
      } catch (err) {
        console.error('Error handling plugin message:', err);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [plugin]);

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (!plugin) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg animate-pulse">
        <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  // Construct the plugin URL
  const pluginUrl = `/plugins/${plugin.manifest.id}/index.html`;

  return (
    <iframe
      ref={iframeRef}
      src={pluginUrl}
      title={`Plugin: ${plugin.manifest.name}`}
      className={`border-0 rounded-lg bg-transparent ${className}`}
      style={{ height, width }}
      sandbox="allow-scripts allow-same-origin allow-forms"
      allow="clipboard-read; clipboard-write"
    />
  );
}
