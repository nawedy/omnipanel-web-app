// apps/web/src/stores/aiConfigStore.ts
// AI configuration state management for model settings, API keys, and performance monitoring

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { localModelService, LocalModelStatus } from '@/services/localModelService';

// AI Model Types
export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'mistral' | 'cohere' | 'meta' | 'deepseek' | 'qwen' | 'huggingface' | 'openrouter' | 'local' | 'ollama' | 'custom';
  type?: 'chat' | 'completion' | 'embedding' | 'image' | 'audio';
  maxTokens: number;
  contextWindow?: number;
  costPer1kTokens?: number;
  isLocal?: boolean;
  isAvailable: boolean;
  capabilities?: string[];
  description?: string;
  version?: string;
  category?: string;
  supportsVision?: boolean;
  supportsAudio?: boolean;
  pricing?: {
    input: number;
    output: number;
  };
}

// API Configuration
export interface APIConfig {
  id: string;
  provider: string;
  name: string;
  apiKey: string;
  baseUrl?: string;
  isActive: boolean;
  lastValidated?: Date;
  isValid?: boolean;
  errorMessage?: string;
}

// Local Model Configuration
export interface LocalModelConfig {
  id: string;
  name: string;
  path: string;
  type: 'ollama' | 'llamacpp' | 'ggml' | 'onnx';
  size: number;
  isLoaded: boolean;
  loadTime?: number;
  memoryUsage?: number;
  parameters?: Record<string, any>;
}

// Performance Metrics
export interface ModelPerformance {
  modelId: string;
  averageResponseTime: number;
  totalRequests: number;
  successRate: number;
  lastUsed: Date;
  tokensGenerated: number;
  errorCount: number;
  costToDate?: number;
}

// AI Configuration State
interface AIConfigState {
  // Models
  availableModels: AIModel[];
  selectedModel: string | null;
  modelPerformance: Record<string, ModelPerformance>;
  
  // API Configurations
  apiConfigs: APIConfig[];
  
  // Local Models
  localModels: LocalModelConfig[];
  
  // Settings
  defaultTemperature: number;
  defaultMaxTokens: number;
  enableStreaming: boolean;
  enableContextAwareness: boolean;
  autoSaveConversations: boolean;
  
  // Performance Monitoring
  performanceMonitoring: boolean;
  maxHistorySize: number;
  
  // Actions
  addModel: (model: AIModel) => void;
  removeModel: (modelId: string) => void;
  updateModel: (modelId: string, updates: Partial<AIModel>) => void;
  setSelectedModel: (modelId: string) => void;
  
  addAPIConfig: (config: APIConfig) => void;
  updateAPIConfig: (configId: string, updates: Partial<APIConfig>) => void;
  removeAPIConfig: (configId: string) => void;
  validateAPIConfig: (configId: string) => Promise<boolean>;
  
  addLocalModel: (model: LocalModelConfig) => void;
  updateLocalModel: (modelId: string, updates: Partial<LocalModelConfig>) => void;
  removeLocalModel: (modelId: string) => void;
  loadLocalModel: (modelId: string) => Promise<boolean>;
  unloadLocalModel: (modelId: string) => Promise<boolean>;
  
  updatePerformance: (modelId: string, metrics: Partial<ModelPerformance>) => void;
  getModelPerformance: (modelId: string) => ModelPerformance | null;
  
  updateSettings: (settings: Partial<Pick<AIConfigState, 'defaultTemperature' | 'defaultMaxTokens' | 'enableStreaming' | 'enableContextAwareness' | 'autoSaveConversations' | 'performanceMonitoring' | 'maxHistorySize'>>) => void;
  
  // Utility functions
  getActiveAPIConfigs: () => APIConfig[];
  getAvailableModels: () => AIModel[];
  getModelsByProvider: (provider: string) => AIModel[];
  exportConfig: () => string;
  importConfig: (config: string) => void;
  resetToDefaults: () => void;
  
  // Additional methods needed by the UI
  deleteAPIConfig: (configId: string) => void;
  deleteLocalModel: (modelId: string) => void;
  testAPIConnection: (configId: string) => Promise<boolean>;
  
  // Local model sync
  syncLocalModels: () => Promise<void>;
  refreshLocalModelStatus: (modelId: string) => Promise<void>;
}

// Available AI models with their capabilities
const availableModels: AIModel[] = [
  // OpenAI Models (Latest as of June 2025)
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    type: 'chat',
    description: 'Most advanced multimodal model, 2x faster and 50% cheaper than GPT-4 Turbo',
    maxTokens: 128000,
    contextWindow: 128000,
    isLocal: false,
    supportsVision: true,
    supportsAudio: true,
    isAvailable: false,
    category: 'flagship',
    capabilities: ['text-generation', 'vision', 'audio'],
    pricing: { input: 2.5, output: 10.0 }
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    type: 'chat',
    description: 'Efficient and cost-effective version of GPT-4o',
    maxTokens: 128000,
    contextWindow: 128000,
    isLocal: false,
    supportsVision: true,
    supportsAudio: true,
    isAvailable: false,
    category: 'efficient',
    capabilities: ['text-generation', 'vision', 'audio'],
    pricing: { input: 0.15, output: 0.6 }
  },
  {
    id: 'o3',
    name: 'o3',
    provider: 'openai',
    description: 'Advanced reasoning model with enhanced problem-solving capabilities',
    maxTokens: 200000,
    supportsVision: false,
    supportsAudio: false,
    isAvailable: false,
    category: 'reasoning',
    pricing: { input: 2.0, output: 8.0 }
  },
  {
    id: 'o3-mini',
    name: 'o3 Mini',
    provider: 'openai',
    description: 'Efficient reasoning model for STEM domains',
    maxTokens: 200000,
    supportsVision: false,
    supportsAudio: false,
    isAvailable: false,
    category: 'reasoning',
    pricing: { input: 1.1, output: 4.4 }
  },
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    description: 'Latest flagship model with 1M context window',
    maxTokens: 1000000,
    supportsVision: true,
    supportsAudio: false,
    isAvailable: false,
    category: 'flagship',
    pricing: { input: 2.0, output: 8.0 }
  },
  {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'openai',
    description: 'Efficient version of GPT-4.1 with 1M context',
    maxTokens: 1000000,
    supportsVision: true,
    supportsAudio: false,
    isAvailable: false,
    category: 'efficient',
    pricing: { input: 0.4, output: 1.6 }
  },

  // Anthropic Models (Latest as of June 2025)
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'High-performance model with excellent reasoning and coding abilities',
    maxTokens: 200000,
    supportsVision: true,
    supportsAudio: false,
    isAvailable: false,
    category: 'flagship',
    pricing: { input: 3.0, output: 15.0 }
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'anthropic',
    description: 'Latest Claude model with enhanced capabilities',
    maxTokens: 200000,
    supportsVision: true,
    supportsAudio: false,
    isAvailable: false,
    category: 'flagship',
    pricing: { input: 3.0, output: 15.0 }
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    description: 'Fast and efficient model for quick tasks',
    maxTokens: 200000,
    supportsVision: true,
    supportsAudio: false,
    isAvailable: false,
    category: 'efficient',
    pricing: { input: 0.8, output: 4.0 }
  },

  // Google Models (Latest as of June 2025)
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    description: 'Latest multimodal model with 1M context window',
    maxTokens: 1000000,
    supportsVision: true,
    supportsAudio: true,
    isAvailable: false,
    category: 'efficient',
    pricing: { input: 0.15, output: 0.6 }
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    description: 'Advanced reasoning model with multimodal capabilities',
    maxTokens: 1000000,
    supportsVision: true,
    supportsAudio: true,
    isAvailable: false,
    category: 'flagship',
    pricing: { input: 2.5, output: 15.0 }
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    description: 'Fast and efficient multimodal model',
    maxTokens: 1000000,
    supportsVision: true,
    supportsAudio: true,
    isAvailable: false,
    category: 'efficient',
    pricing: { input: 0.1, output: 0.4 }
  },

  // Mistral Models (Latest as of June 2025)
  {
    id: 'mistral-medium-2505',
    name: 'Mistral Medium',
    provider: 'mistral',
    description: 'Frontier-class multimodal model with balanced performance',
    maxTokens: 128000,
    supportsVision: true,
    supportsAudio: false,
    isAvailable: false,
    category: 'flagship',
    pricing: { input: 0.4, output: 2.0 }
  },
  {
    id: 'magistral-medium-2506',
    name: 'Magistral Medium',
    provider: 'mistral',
    description: 'Frontier-class reasoning model for domain-specific tasks',
    maxTokens: 40000,
    supportsVision: false,
    supportsAudio: false,
    isAvailable: false,
    category: 'reasoning',
    pricing: { input: 2.0, output: 5.0 }
  },
  {
    id: 'codestral-2501',
    name: 'Codestral',
    provider: 'mistral',
    description: 'Specialized coding model with 256k context',
    maxTokens: 256000,
    supportsVision: false,
    supportsAudio: false,
    isAvailable: false,
    category: 'coding',
    pricing: { input: 0.3, output: 0.9 }
  },
  {
    id: 'mistral-small-2503',
    name: 'Mistral Small 3.1',
    provider: 'mistral',
    description: 'SOTA multimodal small model, Apache 2.0',
    maxTokens: 128000,
    supportsVision: true,
    supportsAudio: false,
    isAvailable: false,
    category: 'efficient',
    pricing: { input: 0.1, output: 0.3 }
  },

  // Cohere Models (Latest as of June 2025)
  {
    id: 'command-a-03-2025',
    name: 'Command A',
    provider: 'cohere',
    description: 'Most performant model for agentic AI and multilingual tasks',
    maxTokens: 256000,
    supportsVision: false,
    supportsAudio: false,
    isAvailable: false,
    category: 'flagship',
    pricing: { input: 2.5, output: 10.0 }
  },
  {
    id: 'command-r-plus-08-2024',
    name: 'Command R+',
    provider: 'cohere',
    description: 'Powerful model for complex RAG workflows and multi-step tool use',
    maxTokens: 128000,
    supportsVision: false,
    supportsAudio: false,
    isAvailable: false,
    category: 'flagship',
    pricing: { input: 2.5, output: 10.0 }
  },
  {
    id: 'command-r-08-2024',
    name: 'Command R',
    provider: 'cohere',
    description: 'Balanced model for RAG, tool use, and agents',
    maxTokens: 128000,
    supportsVision: false,
    supportsAudio: false,
    isAvailable: false,
    category: 'balanced',
    pricing: { input: 0.15, output: 0.6 }
  },
  {
    id: 'command-r7b-12-2024',
    name: 'Command R7B',
    provider: 'cohere',
    description: 'Small, fast model for efficient processing',
    maxTokens: 128000,
    supportsVision: false,
    supportsAudio: false,
    isAvailable: false,
    category: 'efficient',
    pricing: { input: 0.0375, output: 0.15 }
  },

  // Meta Llama Models (Latest as of June 2025)
  {
    id: 'llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'meta',
    description: 'Latest flagship Llama model with advanced capabilities',
    maxTokens: 128000,
    supportsVision: false,
    supportsAudio: false,
    isAvailable: false,
    category: 'flagship',
    pricing: { input: 1.0, output: 2.0 }
  },
  {
    id: 'llama-4-scout',
    name: 'Llama 4 Scout',
    provider: 'meta',
    description: 'Efficient Llama 4 model for production use',
    maxTokens: 128000,
    supportsVision: false,
    supportsAudio: false,
    isAvailable: false,
    category: 'efficient',
    pricing: { input: 0.5, output: 1.0 }
  },
  {
    id: 'llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    provider: 'meta',
    description: 'High-performance open-source model',
    maxTokens: 128000,
    supportsVision: false,
    supportsAudio: false,
    isAvailable: false,
    category: 'balanced',
    pricing: { input: 0.23, output: 0.4 }
  },

  // DeepSeek Models (Latest as of June 2025)
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    description: 'Advanced reasoning model with competitive performance',
    maxTokens: 128000,
    supportsVision: false,
    supportsAudio: false,
    isAvailable: false,
    category: 'reasoning',
    pricing: { input: 0.14, output: 0.28 }
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    description: 'Latest reasoning model with enhanced capabilities',
    maxTokens: 128000,
    supportsVision: false,
    supportsAudio: false,
    isAvailable: false,
    category: 'reasoning',
    pricing: { input: 0.55, output: 2.19 }
  }
];

export const useAIConfigStore = create<AIConfigState>()(
  persist(
    (set, get) => ({
      // Initial state
      availableModels: availableModels,
      selectedModel: null,
      modelPerformance: {},
      apiConfigs: [],
      localModels: [],
      
      // Settings
      defaultTemperature: 0.7,
      defaultMaxTokens: 2048,
      enableStreaming: true,
      enableContextAwareness: true,
      autoSaveConversations: true,
      performanceMonitoring: true,
      maxHistorySize: 1000,
      
      // Model management
      addModel: (model) => set((state) => ({
        availableModels: [...state.availableModels, model]
      })),
      
      removeModel: (modelId) => set((state) => ({
        availableModels: state.availableModels.filter(m => m.id !== modelId),
        selectedModel: state.selectedModel === modelId ? null : state.selectedModel
      })),
      
      updateModel: (modelId, updates) => set((state) => ({
        availableModels: state.availableModels.map(m => 
          m.id === modelId ? { ...m, ...updates } : m
        )
      })),
      
      setSelectedModel: (modelId) => set({ selectedModel: modelId }),
      
      // API configuration management
      addAPIConfig: (config) => set((state) => ({
        apiConfigs: [...state.apiConfigs, config]
      })),
      
      updateAPIConfig: (configId, updates) => set((state) => ({
        apiConfigs: state.apiConfigs.map(c => 
          c.id === configId ? { ...c, ...updates } : c
        )
      })),
      
      removeAPIConfig: (configId) => set((state) => ({
        apiConfigs: state.apiConfigs.filter(c => c.id !== configId)
      })),
      
      validateAPIConfig: async (configId) => {
        const config = get().apiConfigs.find(c => c.id === configId);
        if (!config) return false;
        
        try {
          // Implement API validation logic here
          // This would make a test request to validate the API key
          const isValid = true; // Placeholder
          
          set((state) => ({
            apiConfigs: state.apiConfigs.map(c => 
              c.id === configId 
                ? { ...c, isValid, lastValidated: new Date(), errorMessage: undefined }
                : c
            )
          }));
          
          return isValid;
        } catch (error) {
          set((state) => ({
            apiConfigs: state.apiConfigs.map(c => 
              c.id === configId 
                ? { 
                    ...c, 
                    isValid: false, 
                    lastValidated: new Date(), 
                    errorMessage: error instanceof Error ? error.message : 'Validation failed'
                  }
                : c
            )
          }));
          
          return false;
        }
      },
      
      // Local model management
      addLocalModel: (model) => set((state) => ({
        localModels: [...state.localModels, model]
      })),
      
      updateLocalModel: (modelId, updates) => set((state) => ({
        localModels: state.localModels.map(m => 
          m.id === modelId ? { ...m, ...updates } : m
        )
      })),
      
      removeLocalModel: (modelId) => set((state) => ({
        localModels: state.localModels.filter(m => m.id !== modelId)
      })),
      
      loadLocalModel: async (modelId) => {
        try {
          const model = get().localModels.find(m => m.id === modelId);
          if (!model) return false;

          // Use the local model service to load the model
          const success = await localModelService.loadOllamaModel(model.name);
          
          if (success) {
            const loadTime = Date.now();
            set((state) => ({
              localModels: state.localModels.map(m => 
                m.id === modelId 
                  ? { ...m, isLoaded: true, loadTime }
                  : m
              )
            }));
          }
          
          return success;
        } catch (error) {
          console.error('Failed to load local model:', error);
          return false;
        }
      },
      
      unloadLocalModel: async (modelId) => {
        try {
          const model = get().localModels.find(m => m.id === modelId);
          if (!model) return false;

          // Use the local model service to unload the model
          const success = await localModelService.unloadModel(model.name);
          
          if (success) {
            set((state) => ({
              localModels: state.localModels.map(m => 
                m.id === modelId 
                  ? { ...m, isLoaded: false, memoryUsage: 0 }
                  : m
              )
            }));
          }
          
          return success;
        } catch (error) {
          console.error('Failed to unload local model:', error);
          return false;
        }
      },
      
      // Performance tracking
      updatePerformance: (modelId, metrics) => set((state) => {
        const existing = state.modelPerformance[modelId] || {
          modelId,
          averageResponseTime: 0,
          totalRequests: 0,
          successRate: 100,
          lastUsed: new Date(),
          tokensGenerated: 0,
          errorCount: 0
        };
        
        return {
          modelPerformance: {
            ...state.modelPerformance,
            [modelId]: { ...existing, ...metrics }
          }
        };
      }),
      
      getModelPerformance: (modelId) => {
        return get().modelPerformance[modelId] || null;
      },
      
      // Settings management
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
      
      // Utility functions
      getActiveAPIConfigs: () => {
        return get().apiConfigs.filter(c => c.isActive);
      },
      
      getAvailableModels: () => {
        const { availableModels, apiConfigs } = get();
        return availableModels.filter(model => {
          if (model.isLocal) return true;
          return apiConfigs.some(config => 
            config.provider === model.provider && config.isActive && config.isValid
          );
        });
      },
      
      getModelsByProvider: (provider) => {
        return get().availableModels.filter(m => m.provider === provider);
      },
      
      exportConfig: () => {
        const state = get();
        const exportData = {
          apiConfigs: state.apiConfigs.map(c => ({ ...c, apiKey: '***' })), // Don't export API keys
          localModels: state.localModels,
          settings: {
            defaultTemperature: state.defaultTemperature,
            defaultMaxTokens: state.defaultMaxTokens,
            enableStreaming: state.enableStreaming,
            enableContextAwareness: state.enableContextAwareness,
            autoSaveConversations: state.autoSaveConversations,
            performanceMonitoring: state.performanceMonitoring,
            maxHistorySize: state.maxHistorySize
          }
        };
        
        return JSON.stringify(exportData, null, 2);
      },
      
      importConfig: (configString) => {
        try {
          const config = JSON.parse(configString);
          set((state) => ({
            ...state,
            ...config.settings,
            localModels: config.localModels || state.localModels
            // Don't import API configs for security
          }));
        } catch (error) {
          console.error('Failed to import config:', error);
        }
      },
      
      resetToDefaults: () => set({
        availableModels: availableModels,
        selectedModel: null,
        modelPerformance: {},
        apiConfigs: [],
        localModels: [],
        defaultTemperature: 0.7,
        defaultMaxTokens: 2048,
        enableStreaming: true,
        enableContextAwareness: true,
        autoSaveConversations: true,
        performanceMonitoring: true,
        maxHistorySize: 1000
      }),
      
      // Additional methods needed by the UI
      deleteAPIConfig: (configId) => set((state) => ({
        apiConfigs: state.apiConfigs.filter(c => c.id !== configId)
      })),
      
      deleteLocalModel: (modelId) => set((state) => ({
        localModels: state.localModels.filter(m => m.id !== modelId)
      })),
      
      testAPIConnection: async (configId) => {
        const config = get().apiConfigs.find(c => c.id === configId);
        if (!config) return false;
        
        try {
          // Implement API connection test logic here
          // This would make a test request to validate the API connection
          const isConnected = true; // Placeholder
          
          return isConnected;
        } catch (error) {
          console.error('Failed to test API connection:', error);
          return false;
        }
      },

      // Local model sync methods
      syncLocalModels: async () => {
        try {
          console.log('🔄 Starting syncLocalModels...');
          const ollamaModels = await localModelService.getOllamaModels();
          console.log('📊 Found Ollama models:', ollamaModels.length);
          
          const currentLocalModels = get().localModels;
          
          // Convert Ollama models to LocalModelConfig format
          const newLocalModels: LocalModelConfig[] = ollamaModels.map(model => {
            const existing = currentLocalModels.find(m => m.name === model.name);
            return {
              id: `ollama-${model.name}`,
              name: model.name,
              path: model.name,
              type: 'ollama' as const,
              size: model.size,
              isLoaded: true, // Ollama models that are returned are available and can be used
              loadTime: existing?.loadTime,
              memoryUsage: existing?.memoryUsage,
              parameters: {
                digest: model.digest,
                modified_at: model.modified_at,
                details: model.details
              }
            };
          });

          // Also add the models to availableModels if they're not already there
          const newAvailableModels = ollamaModels.map(model => ({
            id: `ollama-${model.name}`,
            name: model.name,
            provider: 'ollama' as const,
            maxTokens: 4096, // Default for Ollama models
            isLocal: true,
            isAvailable: true,
            description: `Local Ollama model: ${model.name}`,
            category: 'local',
            capabilities: ['text-generation']
          }));

          console.log('✅ Updating store with', newLocalModels.length, 'local models and', newAvailableModels.length, 'available models');

          set((state) => {
            const existingAvailableModels = state.availableModels.filter(m => m.provider !== 'ollama');
            return {
              localModels: newLocalModels,
              availableModels: [...existingAvailableModels, ...newAvailableModels]
            };
          });
          
          console.log('✅ syncLocalModels completed successfully');
        } catch (error) {
          console.error('❌ Failed to sync local models:', error);
        }
      },

      refreshLocalModelStatus: async (modelId) => {
        try {
          const model = get().localModels.find(m => m.id === modelId);
          if (!model) return;

          const isLoaded = await localModelService.isModelLoaded(model.name);
          
          set((state) => ({
            localModels: state.localModels.map(m => 
              m.id === modelId 
                ? { ...m, isLoaded }
                : m
            )
          }));
        } catch (error) {
          console.error('Failed to refresh local model status:', error);
        }
      }
    }),
    {
      name: 'ai-config-store',
      skipHydration: true,
      partialize: (state) => ({
        availableModels: state.availableModels,
        selectedModel: state.selectedModel,
        modelPerformance: state.modelPerformance,
        apiConfigs: state.apiConfigs,
        localModels: state.localModels,
        defaultTemperature: state.defaultTemperature,
        defaultMaxTokens: state.defaultMaxTokens,
        enableStreaming: state.enableStreaming,
        enableContextAwareness: state.enableContextAwareness,
        autoSaveConversations: state.autoSaveConversations,
        performanceMonitoring: state.performanceMonitoring,
        maxHistorySize: state.maxHistorySize
      }),
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null;
          try {
            const item = window.localStorage.getItem(name);
            return item ? JSON.parse(item) : null;
          } catch (error) {
            console.warn('Failed to get item from localStorage:', error);
            return null;
          }
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return;
          try {
            window.localStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.warn('Failed to set item in localStorage:', error);
          }
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return;
          try {
            window.localStorage.removeItem(name);
          } catch (error) {
            console.warn('Failed to remove item from localStorage:', error);
          }
        }
      }
    }
  )
); 