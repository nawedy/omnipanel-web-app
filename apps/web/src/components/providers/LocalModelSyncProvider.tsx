'use client';

import React, { useEffect, useRef } from 'react';
import { useAIConfigStore } from '@/stores/aiConfigStore';

interface LocalModelSyncProviderProps {
  children: React.ReactNode;
}

export function LocalModelSyncProvider({ children }: LocalModelSyncProviderProps) {
  const { syncLocalModels, refreshLocalModelStatus } = useAIConfigStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Initial sync on app startup
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      
      const performInitialSync = async () => {
        try {
          console.log('🔄 Syncing local models on startup...');
          await syncLocalModels();
          console.log('✅ Local models synced successfully');
        } catch (error) {
          console.warn('⚠️ Failed to sync local models on startup:', error);
        }
      };

      // Delay initial sync to avoid blocking app startup
      setTimeout(performInitialSync, 2000);
    }
  }, [syncLocalModels]);

  useEffect(() => {
    // Set up periodic sync every 30 seconds
    const syncInterval = setInterval(async () => {
      try {
        await syncLocalModels();
      } catch (error) {
        console.warn('Failed to sync local models:', error);
      }
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [syncLocalModels]);

  useEffect(() => {
    // Set up periodic status refresh every 10 seconds
    const statusInterval = setInterval(async () => {
      const { localModels } = useAIConfigStore.getState();
      
      try {
        // Refresh status for all local models
        await Promise.all(
          localModels.map(model => refreshLocalModelStatus(model.id))
        );
      } catch (error) {
        console.warn('Failed to refresh local model status:', error);
      }
    }, 10000);

    return () => clearInterval(statusInterval);
  }, [refreshLocalModelStatus]);

  // Listen for Ollama service status changes
  useEffect(() => {
    const checkOllamaHealth = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
          // Ollama is available, sync models
          await syncLocalModels();
        }
      } catch (error) {
        // Ollama is not available
        console.log('Ollama service not available');
      }
    };

    // Check Ollama health on mount and periodically
    checkOllamaHealth();
    const healthInterval = setInterval(checkOllamaHealth, 60000); // Every minute

    return () => clearInterval(healthInterval);
  }, [syncLocalModels]);

  return <>{children}</>;
} 