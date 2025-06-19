// apps/web/src/lib/dev-init.ts
// Development initialization script for demo data

import { useAIConfigStore } from '@/stores/aiConfigStore';

export function initializeDemoData() {
  if (typeof window === 'undefined') return;
  
  const store = useAIConfigStore.getState();
  
  // Only add demo data if no API configs exist
  if (store.apiConfigs.length === 0) {
    // Add demo OpenAI config
    store.addAPIConfig({
      id: 'demo-openai',
      provider: 'openai',
      name: 'OpenAI (Demo)',
      apiKey: 'demo-key',
      isActive: true,
      isValid: true,
      lastValidated: new Date()
    });

    // Add demo Anthropic config
    store.addAPIConfig({
      id: 'demo-anthropic',
      provider: 'anthropic',
      name: 'Anthropic (Demo)',
      apiKey: 'demo-key',
      isActive: true,
      isValid: true,
      lastValidated: new Date()
    });

    // Add demo local model
    store.addLocalModel({
      id: 'demo-llama',
      name: 'Llama 3.1 8B',
      path: '/models/llama-3.1-8b',
      type: 'ollama',
      size: 4500000000,
      isLoaded: true,
      loadTime: 2500,
      memoryUsage: 4500
    });

    // Set a default selected model
    store.setSelectedModel('gpt-4');
    
    console.log('Demo AI configurations initialized');
  }
} 