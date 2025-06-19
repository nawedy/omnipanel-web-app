// apps/web/src/components/workspace/ModelSelector.tsx
// Dynamic model selector dropdown for the workspace header with API-based model discovery

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Bot, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIConfigStore, AIModel } from '@/stores/aiConfigStore';
import { modelDiscoveryService, DiscoveredModel } from '@/services/modelDiscovery';
import { AIProvider } from '@/types/settings';

interface ModelSelectorProps {
  className?: string;
}

export function ModelSelector({ className = '' }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTestingModel, setIsTestingModel] = useState<string | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredModels, setDiscoveredModels] = useState<DiscoveredModel[]>([]);
  const [lastDiscovery, setLastDiscovery] = useState<Date | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { 
    availableModels, 
    selectedModel, 
    setSelectedModel, 
    apiConfigs,
    localModels 
  } = useAIConfigStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Auto-discover models when API configs change
  useEffect(() => {
    const activeConfigs = apiConfigs.filter(config => config.isActive && config.apiKey);
    if (activeConfigs.length > 0) {
      discoverModels();
    }
  }, [apiConfigs]);

  // Discover models from API endpoints
  const discoverModels = async () => {
    setIsDiscovering(true);
    try {
      const configs: Partial<Record<AIProvider, any>> = {};
      
      // Build discovery configs from active API configurations
      apiConfigs.forEach(config => {
        if (config.isActive && config.apiKey) {
          configs[config.provider] = {
            apiKey: config.apiKey,
            baseUrl: config.baseUrl,
          };
        }
      });

      // Add special handling for Ollama (doesn't need API key)
      const ollamaConfig = apiConfigs.find(c => c.provider === 'ollama');
      if (ollamaConfig?.isActive) {
        configs.ollama = {
          baseUrl: ollamaConfig.baseUrl || 'http://localhost:11434',
        };
      }

      // Add HuggingFace (works without API key for public models)
      const hfConfig = apiConfigs.find(c => c.provider === 'huggingface');
      if (hfConfig?.isActive) {
        configs.huggingface = {
          apiKey: hfConfig.apiKey, // Optional for public models
        };
      }

      const models = await modelDiscoveryService.discoverModels(configs);
      setDiscoveredModels(models);
      setLastDiscovery(new Date());
    } catch (error) {
      console.error('Failed to discover models:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  // Get available models (combination of static, local, and discovered)
  const getAvailableModels = () => {
    const staticModels = availableModels.filter(model => {
      // For cloud models, check if there's an active API config for the provider
      if (model.provider !== 'local' && model.provider !== 'ollama') {
        return apiConfigs.some(config => 
          config.provider === model.provider && 
          config.isActive && 
          config.isValid !== false
        );
      }
      return true;
    });

    // Add local models from the store
    const localModelsList = localModels.map(localModel => ({
      id: localModel.id,
      name: localModel.name,
      provider: 'ollama' as AIProvider,
      category: 'local',
      description: `Local Ollama model - ${localModel.details?.parameter_size || 'Unknown size'}`,
      maxTokens: 4096,
      contextWindow: 4096,
      isAvailable: localModel.status === 'available',
      type: 'chat',
      isLocal: true,
    }));

    // Combine static models, local models, with discovered models, avoiding duplicates
    const allModels = [...staticModels, ...localModelsList];
    
    discoveredModels.forEach(discoveredModel => {
      const exists = allModels.find(m => m.id === discoveredModel.id && m.provider === discoveredModel.provider);
      if (!exists) {
        // Convert DiscoveredModel to the expected format
        allModels.push({
          id: discoveredModel.id,
          name: discoveredModel.name,
          provider: discoveredModel.provider,
          category: discoveredModel.category,
          description: `${discoveredModel.capabilities?.join(', ') || 'AI Model'} ${discoveredModel.contextLength ? `(${discoveredModel.contextLength.toLocaleString()} tokens)` : ''}`,
          maxTokens: discoveredModel.contextLength || 4096,
          contextWindow: discoveredModel.contextLength,
          isAvailable: discoveredModel.availability === 'available',
          capabilities: discoveredModel.capabilities,
          pricing: discoveredModel.pricing,
          type: 'chat',
          isLocal: false,
        });
      }
    });

    return allModels;
  };

  const availableModelsList = getAvailableModels();
  const currentModel = selectedModel || availableModelsList[0];

  const handleModelSelect = async (model: any) => {
    setSelectedModel(model);
    setIsOpen(false);
  };

  const getModelStatusIcon = (model: any) => {
    if (isTestingModel === model.id) {
      return <Loader2 className="w-3 h-3 animate-spin text-blue-500" />;
    }
    
    // Check if this is a discovered model
    const discoveredModel = discoveredModels.find(m => m.id === model.id && m.provider === model.provider);
    if (discoveredModel) {
      if (discoveredModel.availability === 'available') {
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      } else if (discoveredModel.availability === 'limited') {
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      } else {
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      }
    }
    
    if (model.provider === 'local' || model.provider === 'ollama') {
      return model.isAvailable ? 
        <CheckCircle className="w-3 h-3 text-green-500" /> : 
        <AlertCircle className="w-3 h-3 text-yellow-500" />;
    }
    
    // For cloud models, check if API config is valid
    const config = apiConfigs.find(c => c.provider === model.provider);
    return config?.isValid ? 
      <CheckCircle className="w-3 h-3 text-green-500" /> : 
      <AlertCircle className="w-3 h-3 text-yellow-500" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      flagship: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20',
      efficient: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
      reasoning: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
      coding: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
      balanced: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20'
    };
    return colors[category as keyof typeof colors] || colors.balanced;
  };

  const getProviderBadgeColor = (provider: AIProvider) => {
    const colors = {
      openai: 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30',
      anthropic: 'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/30',
      google: 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30',
      qwen: 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30',
      huggingface: 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30',
      openrouter: 'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/30',
      ollama: 'text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/30',
      local: 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30',
    };
    return colors[provider] || colors.local;
  };

  if (availableModelsList.length === 0) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 ${className}`}>
        <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
        <span className="text-sm text-yellow-700 dark:text-yellow-300">
          No models available - Add API keys in settings
        </span>
        <button
          onClick={discoverModels}
          disabled={isDiscovering}
          className="ml-2 p-1 rounded hover:bg-yellow-100 dark:hover:bg-yellow-800/30 transition-colors"
          title="Discover models"
        >
          <RefreshCw className={`w-3 h-3 text-yellow-600 dark:text-yellow-400 ${isDiscovering ? 'animate-spin' : ''}`} />
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-[200px]"
      >
        <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {currentModel?.name || 'Select Model'}
          </div>
          {currentModel && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {currentModel.provider}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {currentModel && getModelStatusIcon(currentModel)}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto min-w-[320px]"
          >
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1 mb-1">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Available Models ({availableModelsList.length})
                  {discoveredModels.length > 0 && (
                    <span className="ml-1 text-green-600 dark:text-green-400">
                      • {discoveredModels.length} discovered
                    </span>
                  )}
                </div>
                <button
                  onClick={discoverModels}
                  disabled={isDiscovering}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Refresh models"
                >
                  <RefreshCw className={`w-3 h-3 text-gray-500 dark:text-gray-400 ${isDiscovering ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {lastDiscovery && (
                <div className="text-xs text-gray-400 dark:text-gray-500 px-2 pb-2">
                  Last updated: {lastDiscovery.toLocaleTimeString()}
                </div>
              )}
              
              {availableModelsList.map((model, index) => {
                const discoveredModel = discoveredModels.find(m => m.id === model.id && m.provider === model.provider);
                const isDiscovered = !!discoveredModel;
                
                // Create a unique key by combining provider, id, and index to avoid duplicates
                const uniqueKey = `${model.provider}-${model.id}-${index}`;
                
                return (
                  <button
                    key={uniqueKey}
                    onClick={() => handleModelSelect(model)}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <div className="flex-shrink-0">
                      {getModelStatusIcon(model)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {model.name}
                          {isDiscovered && (
                            <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">●</span>
                          )}
                        </span>
                        {model.category && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${getCategoryColor(model.category)}`}>
                            {model.category}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {model.description}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${getProviderBadgeColor(model.provider)}`}>
                          {model.provider}
                        </span>
                        {model.maxTokens && (
                          <>
                            <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {model.maxTokens.toLocaleString()} tokens
                            </span>
                          </>
                        )}
                        {discoveredModel?.pricing && (
                          <>
                            <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              ${discoveredModel.pricing.input?.toFixed(6) || '0'}/1K in
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {selectedModel?.id === model.id && (
                      <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 