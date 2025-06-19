'use client';

import React, { useState, useEffect } from 'react';
import { useAIConfigStore } from '@/stores/aiConfigStore';
import { Button } from '@/components/ui/button';

export default function DebugPage() {
  const { 
    syncLocalModels, 
    localModels, 
    availableModels, 
    selectedModel,
    apiConfigs 
  } = useAIConfigStore();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string>('');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncResult('');
    
    try {
      console.log('🔄 Manual sync triggered from debug page');
      await syncLocalModels();
      setSyncResult('✅ Sync completed successfully');
      setLastSync(new Date());
    } catch (error) {
      console.error('❌ Manual sync failed:', error);
      setSyncResult(`❌ Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const testOllamaDirectly = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      const data = await response.json();
      console.log('🔍 Direct Ollama test:', data);
      setSyncResult(`✅ Direct Ollama test: ${data.models.length} models found`);
    } catch (error) {
      console.error('❌ Direct Ollama test failed:', error);
      setSyncResult(`❌ Direct Ollama test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testSyncAPI = async () => {
    try {
      const response = await fetch('/api/models/sync');
      const data = await response.json();
      console.log('🔍 Sync API test:', data);
      setSyncResult(`✅ Sync API test: ${data.models?.length || 0} models found`);
    } catch (error) {
      console.error('❌ Sync API test failed:', error);
      setSyncResult(`❌ Sync API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">🔍 Local Model Debug Page</h1>
      
      {/* Store State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📊 Store State</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Selected Model:</strong> {selectedModel || 'None'}</div>
            <div><strong>Local Models:</strong> {localModels.length}</div>
            <div><strong>Available Models:</strong> {availableModels.length}</div>
            <div><strong>Ollama Models:</strong> {availableModels.filter(m => m.provider === 'ollama').length}</div>
            <div><strong>API Configs:</strong> {apiConfigs.length}</div>
            <div><strong>Active Configs:</strong> {apiConfigs.filter(c => c.isActive).length}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">⚡ Actions</h2>
          <div className="space-y-3">
            <Button 
              onClick={handleManualSync} 
              disabled={isSyncing}
              className="w-full"
            >
              {isSyncing ? '🔄 Syncing...' : '🔄 Manual Sync'}
            </Button>
            
            <Button 
              onClick={testOllamaDirectly} 
              variant="outline"
              className="w-full"
            >
              🧪 Test Ollama Direct
            </Button>
            
            <Button 
              onClick={testSyncAPI} 
              variant="outline"
              className="w-full"
            >
              🔗 Test Sync API
            </Button>
          </div>
          
          {syncResult && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm">
              <div>{syncResult}</div>
              {lastSync && (
                <div className="text-gray-500 text-xs mt-1">
                  Last sync: {lastSync.toLocaleTimeString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Local Models */}
      {localModels.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">🤖 Local Models ({localModels.length})</h2>
          <div className="space-y-2">
            {localModels.map((model) => (
              <div key={model.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <div className="font-medium">{model.name}</div>
                  <div className="text-sm text-gray-500">
                    {model.type} • {(model.size / 1024 / 1024 / 1024).toFixed(1)}GB • 
                    {model.isLoaded ? ' ✅ Loaded' : ' ⏸️ Not Loaded'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Models */}
      {availableModels.filter(m => m.provider === 'ollama').length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">📋 Available Ollama Models ({availableModels.filter(m => m.provider === 'ollama').length})</h2>
          <div className="space-y-2">
            {availableModels.filter(m => m.provider === 'ollama').map((model) => (
              <div key={model.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <div className="font-medium">{model.name}</div>
                  <div className="text-sm text-gray-500">
                    {model.provider} • {model.maxTokens} tokens • 
                    {model.isAvailable ? ' ✅ Available' : ' ❌ Unavailable'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Store Data */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">🔍 Raw Store Data</h2>
        <div className="text-xs bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto max-h-96">
          <div className="mb-4">
            <strong>Local Models:</strong>
            <pre>{JSON.stringify(localModels, null, 2)}</pre>
          </div>
          <div>
            <strong>Available Ollama Models:</strong>
            <pre>{JSON.stringify(availableModels.filter(m => m.provider === 'ollama'), null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
} 