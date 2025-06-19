'use client';

import React, { useEffect, useRef } from 'react';
import { useAIConfigStore } from '@/stores/aiConfigStore';

interface LocalModelSyncProviderProps {
  children: React.ReactNode;
}

export function LocalModelSyncProvider({ children }: LocalModelSyncProviderProps) {
  const { syncLocalModels, refreshLocalModelStatus, localModels, availableModels } = useAIConfigStore();
  const hasInitialized = useRef(false);

  // Debug store state changes
  useEffect(() => {
    console.log('🔍 LocalModelSyncProvider: Store state changed');
    console.log('  - Local models:', localModels.length);
    console.log('  - Available models:', availableModels.length);
    console.log('  - Ollama models:', availableModels.filter(m => m.provider === 'ollama').length);
    
    if (localModels.length > 0) {
      console.log('  - Local models list:', localModels.map(m => m.name));
    }
    if (availableModels.filter(m => m.provider === 'ollama').length > 0) {
      console.log('  - Ollama models list:', availableModels.filter(m => m.provider === 'ollama').map(m => m.name));
    }
  }, [localModels, availableModels]);

  useEffect(() => {
    // Initial sync on app startup
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      
      const performInitialSync = async () => {
        try {
          console.log('🔄 LocalModelSyncProvider: Starting initial sync...');
          console.log('🔄 LocalModelSyncProvider: Current store state before sync:');
          console.log('  - Local models before:', localModels.length);
          console.log('  - Available models before:', availableModels.length);
          
          await syncLocalModels();
          console.log('✅ LocalModelSyncProvider: Initial sync completed');
          
          // Small delay to let the store update
          setTimeout(() => {
            console.log('🔍 LocalModelSyncProvider: Store state after sync:');
            console.log('  - Local models after:', localModels.length);
            console.log('  - Available models after:', availableModels.length);
          }, 500);
          
        } catch (error) {
          console.error('❌ LocalModelSyncProvider: Initial sync failed:', error);
        }
      };

      // Delay initial sync slightly to ensure stores are ready
      const timeoutId = setTimeout(performInitialSync, 1000);

      // Set up periodic refresh every 30 seconds
      const intervalId = setInterval(async () => {
        try {
          console.log('🔄 LocalModelSyncProvider: Periodic sync...');
          await syncLocalModels();
        } catch (error) {
          console.error('❌ LocalModelSyncProvider: Periodic sync failed:', error);
        }
      }, 30000);

      return () => {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
      };
    }
  }, [syncLocalModels, refreshLocalModelStatus, localModels, availableModels]);

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