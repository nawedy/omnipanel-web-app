// apps/web/src/stores/aiConfigStore.ts
// AI configuration state management for model settings, API keys, and performance monitoring

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// AI Model Types
export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'local' | 'ollama' | 'custom';
  type: 'chat' | 'completion' | 'embedding' | 'image' | 'audio';
  maxTokens: number;
  contextWindow: number;
  costPer1kTokens?: number;
  isLocal: boolean;
  isAvailable: boolean;
  capabilities: string[];
  description?: string;
  version?: string;
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
}

// Default models
const defaultModels: AIModel[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    type: 'chat',
    maxTokens: 4096,
    contextWindow: 8192,
    costPer1kTokens: 0.03,
    isLocal: false,
    isAvailable: false,
    capabilities: ['chat', 'code', 'analysis', 'reasoning'],
    description: 'Most capable GPT model for complex tasks'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    type: 'chat',
    maxTokens: 4096,
    contextWindow: 4096,
    costPer1kTokens: 0.002,
    isLocal: false,
    isAvailable: false,
    capabilities: ['chat', 'code', 'analysis'],
    description: 'Fast and efficient for most tasks'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    type: 'chat',
    maxTokens: 4096,
    contextWindow: 200000,
    costPer1kTokens: 0.015,
    isLocal: false,
    isAvailable: false,
    capabilities: ['chat', 'code', 'analysis', 'reasoning', 'long-context'],
    description: 'Most powerful Claude model with large context window'
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    type: 'chat',
    maxTokens: 4096,
    contextWindow: 200000,
    costPer1kTokens: 0.003,
    isLocal: false,
    isAvailable: false,
    capabilities: ['chat', 'code', 'analysis', 'long-context'],
    description: 'Balanced performance and cost'
  }
];

export const useAIConfigStore = create<AIConfigState>()(
  persist(
    (set, get) => ({
      // Initial state
      availableModels: defaultModels,
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
          // Implement local model loading logic
          const startTime = Date.now();
          
          // Placeholder for actual loading logic
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const loadTime = Date.now() - startTime;
          
          set((state) => ({
            localModels: state.localModels.map(m => 
              m.id === modelId 
                ? { ...m, isLoaded: true, loadTime }
                : m
            )
          }));
          
          return true;
        } catch (error) {
          console.error('Failed to load local model:', error);
          return false;
        }
      },
      
      unloadLocalModel: async (modelId) => {
        try {
          // Implement local model unloading logic
          set((state) => ({
            localModels: state.localModels.map(m => 
              m.id === modelId 
                ? { ...m, isLoaded: false, memoryUsage: 0 }
                : m
            )
          }));
          
          return true;
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
        availableModels: defaultModels,
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