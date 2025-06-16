'use client';

import React, { useState } from 'react';
import { useDatabase } from '@/hooks/useDatabase';
import { DatabaseStatus } from '@/components/database/DatabaseStatus';
import { Database, Save, RefreshCw, AlertCircle } from 'lucide-react';

export default function DatabaseSettingsPage() {
  const { db, isConnected, isLoading, error, testConnection, resetConnection } = useDatabase();
  
  const [projectId, setProjectId] = useState<string>(process.env.NEXT_PUBLIC_NEON_PROJECT_ID || '');
  const [apiKey, setApiKey] = useState<string>('');
  const [connectionString, setConnectionString] = useState<string>(process.env.DATABASE_URL || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      // In a real implementation, this would update environment variables //TODO: Implement this
      // or store configuration securely
      console.log('Saving database configuration:', {
        projectId,
        apiKey: apiKey ? '********' : '',
        connectionString: connectionString ? '********' : '',
      });
      
      // Simulate saving configuration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test the connection with new configuration
      await resetConnection();
      const connected = await testConnection();
      
      if (connected) {
        setSaveSuccess(true);
      } else {
        setSaveError('Connection test failed with new configuration');
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="w-8 h-8" />
          Database Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure and manage your database connection
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Connection Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="projectId" className="block text-sm font-medium mb-1">
                  Neon Project ID
                </label>
                <input
                  id="projectId"
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background"
                  placeholder="Enter your Neon project ID"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The project ID for your Neon database
                </p>
              </div>
              
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
                  API Key
                </label>
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background"
                  placeholder="Enter your Neon API key"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your Neon API key for management operations
                </p>
              </div>
              
              <div>
                <label htmlFor="connectionString" className="block text-sm font-medium mb-1">
                  Connection String (Optional)
                </label>
                <input
                  id="connectionString"
                  type="password"
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background"
                  placeholder="Enter a custom connection string (optional)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Custom connection string (overrides project ID if provided)
                </p>
              </div>
              
              {saveError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-sm">{saveError}</p>
                </div>
              )}
              
              {saveSuccess && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 p-3 rounded-lg">
                  <p className="text-sm">Configuration saved successfully</p>
                </div>
              )}
              
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSaveConfig}
                  disabled={isSaving || isLoading}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Configuration
                </button>
                
                <button
                  onClick={() => resetConnection()}
                  disabled={isSaving || isLoading}
                  className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset Connection
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Database Information</h2>
            
            {isConnected ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Database Type</h3>
                    <p>PostgreSQL (Neon)</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Version</h3>
                    <p>PostgreSQL 15+</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Project ID</h3>
                    <p className="truncate">{projectId || 'Not configured'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Connection Status</h3>
                    <p className="text-emerald-500 dark:text-emerald-400">Connected</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Available Services</h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {db && Object.keys(db).filter(key => 
                      typeof (db as any)[key] === 'object' && 
                      key !== 'client' && 
                      !key.startsWith('_')
                    ).map(service => (
                      <li key={service} className="text-sm bg-background p-2 rounded-md">
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Not connected to database</p>
                <p className="text-sm mt-2">Configure your connection settings and save to connect</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <DatabaseStatus showControls={true} className="sticky top-6" />
          
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left p-3 bg-background hover:bg-muted rounded-md transition-colors">
                View Database Schema
              </button>
              <button className="w-full text-left p-3 bg-background hover:bg-muted rounded-md transition-colors">
                Run Database Migration
              </button>
              <button className="w-full text-left p-3 bg-background hover:bg-muted rounded-md transition-colors">
                Backup Database
              </button>
              <button className="w-full text-left p-3 bg-background hover:bg-muted rounded-md transition-colors text-red-500 dark:text-red-400">
                Reset Database
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
