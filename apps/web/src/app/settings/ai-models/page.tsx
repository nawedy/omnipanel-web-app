// apps/web/src/app/settings/ai-models/page.tsx
// AI models management page for configuring AI providers, local models, and performance monitoring

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  Download, 
  Trash2, 
  Play, 
  Pause, 
  Monitor, 
  Zap, 
  Cloud, 
  HardDrive,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  CheckSquare,
  Square,
  MoreHorizontal,
  GitCompare,
  TrendingUp,
  Activity,
  Cpu,
  MemoryStick,
  Timer,
  FolderOpen,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Key,
  Globe,
  Database,
  TestTube
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIConfigStore } from '@/stores/aiConfigStore';
import { localModelService } from '@/services/localModelService';
import { aiModelService } from '@/services/aiModelService';
import { aiService } from '@/services/aiService';
import { CustomProviderManager } from '@/components/settings/CustomProviderManager';
import { TooltipProvider, IconTooltip } from '@/components/ui/tooltip';

interface LocalModelSettings {
  ollamaPath: string;
  modelsDirectory: string;
  maxConcurrentModels: number;
  autoUnloadInactive: boolean;
  inactiveTimeout: number; // minutes
  enableGPU: boolean;
  gpuLayers: number;
  memoryLimit: number; // GB
}

export default function AIModelsPage(): React.JSX.Element {
  const {
    apiConfigs,
    localModels,
    modelPerformance,
    availableModels,
    selectedModel,
    setSelectedModel,
    addAPIConfig,
    updateAPIConfig,
    deleteAPIConfig,
    addLocalModel,
    updateLocalModel,
    deleteLocalModel,
    testAPIConnection,
    loadLocalModel,
    unloadLocalModel,
    syncLocalModels,
    refreshLocalModelStatus
  } = useAIConfigStore();

  const [activeTab, setActiveTab] = useState<'providers' | 'local' | 'performance' | 'settings'>('providers');
  const [isOllamaAvailable, setIsOllamaAvailable] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState<string | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState<string | null>(null);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [showAddLocalModel, setShowAddLocalModel] = useState(false);
  const [isSyncingModels, setIsSyncingModels] = useState(false);
  const [testingConnections, setTestingConnections] = useState<Set<string>>(new Set());
  const [loadingModels, setLoadingModels] = useState<Set<string>>(new Set());
  
  // Local model settings
  const [localSettings, setLocalSettings] = useState<LocalModelSettings>({
    ollamaPath: '/usr/local/bin/ollama',
    modelsDirectory: '~/.ollama/models',
    maxConcurrentModels: 3,
    autoUnloadInactive: true,
    inactiveTimeout: 30,
    enableGPU: true,
    gpuLayers: -1,
    memoryLimit: 8
  });
  
  // API provider form state
  const [providerForm, setProviderForm] = useState({
    provider: '',
    name: '',
    apiKey: '',
    baseUrl: '',
    isActive: true
  });
  
  // Local model form state
  const [localModelForm, setLocalModelForm] = useState({
    name: '',
    path: '',
    type: 'ollama' as 'ollama' | 'llamacpp' | 'ggml' | 'onnx'
  });
  
  // Batch operations state
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [batchOperation, setBatchOperation] = useState<'load' | 'unload' | 'delete' | null>(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  
  // Model comparison state
  const [comparisonModels, setComparisonModels] = useState<string[]>([]);
  const [benchmarkResults, setBenchmarkResults] = useState<Record<string, any>>({});
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('omnipanel-local-model-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setLocalSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load local model settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveLocalSettings = () => {
    localStorage.setItem('omnipanel-local-model-settings', JSON.stringify(localSettings));
  };

  // Check Ollama availability on mount
  useEffect(() => {
    const checkOllama = async (): Promise<void> => {
      const available = await localModelService.isOllamaRunning();
      setIsOllamaAvailable(available);
    };
    
    checkOllama();
  }, []);

  const handleTestConnection = async (configId: string): Promise<void> => {
    setTestingConnections(prev => new Set(prev).add(configId));
    try {
      const result = await testAPIConnection(configId);
      if (result) {
        alert('Connection test successful!');
      } else {
        alert('Connection test failed. Please check your API key and settings.');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      alert(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTestingConnections(prev => {
        const newSet = new Set(prev);
        newSet.delete(configId);
        return newSet;
      });
    }
  };

  const handleSyncLocalModels = async (): Promise<void> => {
    setIsSyncingModels(true);
    try {
      await syncLocalModels();
      console.log('Local models synced successfully');
    } catch (error) {
      console.error('Failed to sync local models:', error);
      alert('Failed to sync local models. Please check if Ollama is running.');
    } finally {
      setIsSyncingModels(false);
    }
  };

  const handleLoadLocalModel = async (modelId: string): Promise<void> => {
    setLoadingModels(prev => new Set(prev).add(modelId));
    try {
      const success = await loadLocalModel(modelId);
      if (success) {
        console.log(`Model ${modelId} loaded successfully`);
      } else {
        alert(`Failed to load model ${modelId}`);
      }
    } catch (error) {
      console.error('Failed to load model:', error);
      alert(`Failed to load model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelId);
        return newSet;
      });
    }
  };

  const handleUnloadLocalModel = async (modelId: string): Promise<void> => {
    setLoadingModels(prev => new Set(prev).add(modelId));
    try {
      const success = await unloadLocalModel(modelId);
      if (success) {
        console.log(`Model ${modelId} unloaded successfully`);
      } else {
        alert(`Failed to unload model ${modelId}`);
      }
    } catch (error) {
      console.error('Failed to unload model:', error);
      alert(`Failed to unload model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelId);
        return newSet;
      });
    }
  };

  const handleDeleteAPIConfig = async (configId: string): Promise<void> => {
    if (confirm('Are you sure you want to delete this API configuration?')) {
      deleteAPIConfig(configId);
    }
  };

  const handleLoadModel = async (modelId: string): Promise<void> => {
    setIsLoadingModel(modelId);
    try {
      await loadLocalModel(modelId);
    } finally {
      setIsLoadingModel(null);
    }
  };

  const handleAddProvider = async () => {
    if (!providerForm.provider || !providerForm.name || !providerForm.apiKey) {
      alert('Please fill in all required fields');
      return;
    }

    const newConfig = {
      id: `${providerForm.provider}-${Date.now()}`,
      provider: providerForm.provider,
      name: providerForm.name,
      apiKey: providerForm.apiKey,
      baseUrl: providerForm.baseUrl || undefined,
      isActive: providerForm.isActive
    };

    addAPIConfig(newConfig);
    setShowAddProvider(false);
    setProviderForm({
      provider: '',
      name: '',
      apiKey: '',
      baseUrl: '',
      isActive: true
    });
  };

  const handleAddLocalModel = async () => {
    if (!localModelForm.name || !localModelForm.path) {
      alert('Please fill in all required fields');
      return;
    }

    const newModel = {
      id: `local-${Date.now()}`,
      name: localModelForm.name,
      path: localModelForm.path,
      type: localModelForm.type,
      size: 0, // Will be determined when loaded
      isLoaded: false
    };

    addLocalModel(newModel);
    setShowAddLocalModel(false);
    setLocalModelForm({
      name: '',
      path: '',
      type: 'ollama'
    });
  };

  // Function to open file browser for path selection
  const selectDirectoryPath = async (settingKey: keyof LocalModelSettings) => {
    try {
      // Check if we're in a browser environment that supports file system access
      if ('showDirectoryPicker' in window) {
        // Use the modern File System Access API (Chrome/Edge)
        const dirHandle = await (window as any).showDirectoryPicker();
        const path = dirHandle.name;
        setLocalSettings(prev => ({ ...prev, [settingKey]: path }));
      } else if ('showOpenFilePicker' in window && settingKey === 'ollamaPath') {
        // For executable files, use file picker
        const [fileHandle] = await (window as any).showOpenFilePicker({
          types: [
            {
              description: 'Executable files',
              accept: {
                'application/octet-stream': ['.exe', '.app', ''],
              },
            },
          ],
        });
        const file = await fileHandle.getFile();
        setLocalSettings(prev => ({ ...prev, [settingKey]: file.name }));
      } else {
        // Fallback: create a hidden file input
        const input = document.createElement('input');
        input.type = 'file';
        
        if (settingKey === 'ollamaPath') {
          // For executable selection
          input.accept = '.exe,.app,*';
        } else {
          // For directory selection (limited support)
          input.setAttribute('webkitdirectory', '');
          input.setAttribute('directory', '');
        }
        
        input.onchange = (e) => {
          const target = e.target as HTMLInputElement;
          if (target.files && target.files.length > 0) {
            const file = target.files[0];
            let path = '';
            
            if (settingKey === 'ollamaPath') {
              // For executables, use the file path
              path = file.name;
            } else {
              // For directories, extract the directory path
              path = file.webkitRelativePath.split('/')[0];
            }
            
            setLocalSettings(prev => ({ ...prev, [settingKey]: path }));
          }
        };
        
        input.click();
      }
    } catch (error) {
      console.error('Error selecting path:', error);
      // Show a user-friendly message
      alert('File selection was cancelled or not supported in this browser. Please enter the path manually.');
    }
  };

  // Batch operations
  const toggleModelSelection = (modelId: string): void => {
    const newSelection = new Set(selectedModels);
    if (newSelection.has(modelId)) {
      newSelection.delete(modelId);
    } else {
      newSelection.add(modelId);
    }
    setSelectedModels(newSelection);
  };

  const selectAllModels = (): void => {
    setSelectedModels(new Set(localModels.map(m => m.id)));
  };

  const clearSelection = (): void => {
    setSelectedModels(new Set());
  };

  const handleBatchOperation = async (operation: 'load' | 'unload' | 'delete'): Promise<void> => {
    if (selectedModels.size === 0) return;
    
    setBatchOperation(operation);
    setIsBatchProcessing(true);
    
    try {
      const modelIds = Array.from(selectedModels);
      
      switch (operation) {
        case 'load':
          for (const modelId of modelIds) {
            await loadLocalModel(modelId);
          }
          break;
        case 'unload':
          for (const modelId of modelIds) {
            await unloadLocalModel(modelId);
          }
          break;
        case 'delete':
          for (const modelId of modelIds) {
            await deleteLocalModel(modelId);
          }
          break;
      }
      
      clearSelection();
    } catch (error) {
      console.error(`Batch ${operation} failed:`, error);
    } finally {
      setIsBatchProcessing(false);
      setBatchOperation(null);
    }
  };

  // Model comparison and benchmarking
  const addToComparison = (modelId: string): void => {
    if (!comparisonModels.includes(modelId) && comparisonModels.length < 4) {
      setComparisonModels([...comparisonModels, modelId]);
    }
  };

  const removeFromComparison = (modelId: string): void => {
    setComparisonModels(comparisonModels.filter(id => id !== modelId));
  };

  const runBenchmark = async (): Promise<void> => {
    if (comparisonModels.length === 0) return;
    
    setIsBenchmarking(true);
    
    try {
      const results: Record<string, any> = {};
      
      for (const modelId of comparisonModels) {
        const model = localModels.find(m => m.id === modelId);
        if (!model) continue;
        
        // Simulate benchmark tests
        const startTime = Date.now();
        
        // Mock performance metrics
        results[modelId] = {
          responseTime: Math.random() * 2000 + 500, // 500-2500ms
          tokensPerSecond: Math.random() * 50 + 10, // 10-60 tokens/s
          memoryUsage: Math.random() * 4000 + 1000, // 1-5GB
          cpuUsage: Math.random() * 80 + 20, // 20-100%
          accuracy: Math.random() * 20 + 80, // 80-100%
          modelSize: model.size || 'Unknown',
          parameters: model.parameters || 'Unknown'
        };
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setBenchmarkResults(results);
    } catch (error) {
      console.error('Benchmark failed:', error);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const renderCloudProviders = (): React.JSX.Element => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Cloud AI Providers</h3>
          <p className="text-sm text-muted-foreground">
            Configure API keys and settings for cloud-based AI models
          </p>
        </div>
        <Button onClick={() => setShowAddProvider(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Provider
        </Button>
      </div>

      {/* Add Provider Form */}
      {showAddProvider && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Provider</CardTitle>
            <CardDescription>Configure a new AI provider</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="provider">Provider</Label>
                <select
                  id="provider"
                  value={providerForm.provider}
                  onChange={(e) => setProviderForm(prev => ({ ...prev, provider: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="">Select Provider</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google AI</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="mistral">Mistral</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <Label htmlFor="name">Configuration Name</Label>
                <Input
                  id="name"
                  value={providerForm.name}
                  onChange={(e) => setProviderForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., OpenAI Production"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={providerForm.apiKey}
                onChange={(e) => setProviderForm(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter your API key"
              />
            </div>
            {providerForm.provider === 'custom' && (
              <div>
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input
                  id="baseUrl"
                  value={providerForm.baseUrl}
                  onChange={(e) => setProviderForm(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="https://api.example.com/v1"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={providerForm.isActive}
                onChange={(e) => setProviderForm(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <Label htmlFor="isActive">Enable this provider</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddProvider}>Add Provider</Button>
              <Button variant="outline" onClick={() => setShowAddProvider(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Provider Manager */}
      <CustomProviderManager onProviderChange={() => {
        // Refresh provider list if needed
      }} />

      {/* Existing Providers */}
      <div className="grid gap-4">
        {apiConfigs.map((config) => (
          <Card key={config.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Cloud className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{config.name}</CardTitle>
                    <CardDescription>{config.provider}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={config.isActive ? "default" : "secondary"}>
                    {config.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {config.isValid !== undefined && (
                    <Badge variant={config.isValid ? "default" : "destructive"}>
                      {config.isValid ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {config.isValid ? 'Valid' : 'Invalid'}
                    </Badge>
                  )}
                  <IconTooltip content="Test API connection">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(config.id)}
                      disabled={isTestingConnection === config.id}
                    >
                      <TestTube className="h-4 w-4" />
                    </Button>
                  </IconTooltip>
                  <IconTooltip content="Delete this API configuration">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAPIConfig(config.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </IconTooltip>
                </div>
              </div>
            </CardHeader>
            {config.errorMessage && (
              <CardContent>
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  {config.errorMessage}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  const renderLocalModels = (): React.JSX.Element => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Local AI Models</h3>
          <p className="text-sm text-muted-foreground">
            Manage locally installed AI models and Ollama integration
          </p>
        </div>
        <div className="flex gap-2">
          <IconTooltip content="Sync with Ollama to discover available models">
            <Button 
              onClick={handleSyncLocalModels}
              disabled={isSyncingModels}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncingModels ? 'animate-spin' : ''}`} />
              {isSyncingModels ? 'Syncing...' : 'Sync Models'}
            </Button>
          </IconTooltip>
          <IconTooltip content="Add a new local AI model">
            <Button onClick={() => setShowAddLocalModel(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Model
            </Button>
          </IconTooltip>
          {selectedModels.size > 0 && (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchOperation('load')}
                disabled={isBatchProcessing}
              >
                Load Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchOperation('unload')}
                disabled={isBatchProcessing}
              >
                Unload Selected
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBatchOperation('delete')}
                disabled={isBatchProcessing}
              >
                Delete Selected
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Ollama Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <HardDrive className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-base">Ollama Status</CardTitle>
                <CardDescription>Local model runtime</CardDescription>
              </div>
            </div>
            <Badge variant={isOllamaAvailable ? "default" : "destructive"}>
              {isOllamaAvailable ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              {isOllamaAvailable ? 'Running' : 'Not Available'}
            </Badge>
          </div>
        </CardHeader>
        {!isOllamaAvailable && (
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Ollama is not running. Please install and start Ollama to use local models.
              <br />
              <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Download Ollama →
              </a>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Add Local Model Form */}
      {showAddLocalModel && (
        <Card>
          <CardHeader>
            <CardTitle>Add Local Model</CardTitle>
            <CardDescription>Add a new local AI model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="modelName">Model Name</Label>
                <Input
                  id="modelName"
                  value={localModelForm.name}
                  onChange={(e) => setLocalModelForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., llama2:7b"
                />
              </div>
              <div>
                <Label htmlFor="modelType">Type</Label>
                <select
                  id="modelType"
                  value={localModelForm.type}
                  onChange={(e) => setLocalModelForm(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="ollama">Ollama</option>
                  <option value="llamacpp">LlamaCpp</option>
                  <option value="ggml">GGML</option>
                  <option value="onnx">ONNX</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="modelPath">Model Path</Label>
              <div className="flex gap-2">
                <Input
                  id="modelPath"
                  value={localModelForm.path}
                  onChange={(e) => setLocalModelForm(prev => ({ ...prev, path: e.target.value }))}
                  placeholder="/path/to/model or model:tag for Ollama"
                />
                <Button variant="outline" onClick={async () => {
                  try {
                    if ('showOpenFilePicker' in window) {
                      const [fileHandle] = await (window as any).showOpenFilePicker({
                        types: [
                          {
                            description: 'Model files',
                            accept: {
                              'application/octet-stream': ['.gguf', '.bin', '.onnx', '.pt', '.pth', '.safetensors'],
                            },
                          },
                        ],
                      });
                      const file = await fileHandle.getFile();
                      setLocalModelForm(prev => ({ ...prev, path: file.name }));
                    } else {
                      // Fallback: create a hidden file input
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.gguf,.bin,.onnx,.pt,.pth,.safetensors';
                      
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files && target.files.length > 0) {
                          const file = target.files[0];
                          setLocalModelForm(prev => ({ ...prev, path: file.name }));
                        }
                      };
                      
                      input.click();
                    }
                  } catch (error) {
                    console.error('Error selecting model file:', error);
                    // Fallback to prompt
                    const path = prompt('Enter model path:');
                    if (path) {
                      setLocalModelForm(prev => ({ ...prev, path }));
                    }
                  }
                }}>
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Select a model file (.gguf, .bin, .onnx, etc.) or enter Ollama model tag
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddLocalModel}>Add Model</Button>
              <Button variant="outline" onClick={() => setShowAddLocalModel(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch Selection Controls */}
      {localModels.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={selectAllModels}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Clear Selection
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {selectedModels.size} of {localModels.length} models selected
          </div>
        </div>
      )}

      {/* Local Models List */}
      <div className="grid gap-4">
        {localModels.map((model) => (
          <Card key={model.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedModels.has(model.id)}
                    onChange={() => toggleModelSelection(model.id)}
                    className="rounded"
                  />
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <HardDrive className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{model.name}</CardTitle>
                    <CardDescription>
                      {model.type} • {model.size ? `${(model.size / 1024 / 1024 / 1024).toFixed(1)} GB` : 'Unknown size'}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={model.isLoaded ? "default" : "secondary"}>
                    {model.isLoaded ? 'Loaded' : 'Unloaded'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => model.isLoaded ? unloadLocalModel(model.id) : handleLoadModel(model.id)}
                    disabled={isLoadingModel === model.id}
                  >
                    {isLoadingModel === model.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : model.isLoaded ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addToComparison(model.id)}
                    disabled={comparisonModels.includes(model.id)}
                  >
                    <GitCompare className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteLocalModel(model.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {model.loadTime && (
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Load time: {model.loadTime}ms • Memory: {model.memoryUsage ? `${model.memoryUsage} MB` : 'Unknown'}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPerformance = (): React.JSX.Element => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Performance Monitoring</h3>
        <p className="text-sm text-muted-foreground">
          Monitor AI model performance and usage statistics
        </p>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2s</div>
            <p className="text-xs text-muted-foreground">-5% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.8%</div>
            <p className="text-xs text-muted-foreground">+0.1% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Model Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance</CardTitle>
          <CardDescription>Detailed performance metrics for each model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Model</th>
                  <th className="text-left p-2">Requests</th>
                  <th className="text-left p-2">Avg Response</th>
                  <th className="text-left p-2">Success Rate</th>
                  <th className="text-left p-2">Last Used</th>
                  <th className="text-left p-2">Cost</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(modelPerformance).map(([modelId, perf]) => (
                  <tr key={modelId} className="border-b">
                    <td className="p-2 font-medium">{modelId}</td>
                    <td className="p-2">{perf.totalRequests}</td>
                    <td className="p-2">{perf.averageResponseTime}ms</td>
                    <td className="p-2">{(perf.successRate * 100).toFixed(1)}%</td>
                    <td className="p-2">{perf.lastUsed.toLocaleDateString()}</td>
                    <td className="p-2">${perf.costToDate?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = (): React.JSX.Element => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Local Model Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure local model storage paths and runtime settings
        </p>
      </div>

      {/* Storage Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Configuration</CardTitle>
          <CardDescription>Configure where local models are stored and accessed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ollamaPath">Ollama Executable Path</Label>
            <div className="flex gap-2">
              <Input
                id="ollamaPath"
                value={localSettings.ollamaPath}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, ollamaPath: e.target.value }))}
                placeholder="/usr/local/bin/ollama"
              />
              <Button variant="outline" onClick={() => selectDirectoryPath('ollamaPath')}>
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Path to the Ollama executable binary
            </p>
          </div>

          <div>
            <Label htmlFor="modelsDirectory">Models Directory</Label>
            <div className="flex gap-2">
              <Input
                id="modelsDirectory"
                value={localSettings.modelsDirectory}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, modelsDirectory: e.target.value }))}
                placeholder="~/.ollama/models"
              />
              <Button variant="outline" onClick={() => selectDirectoryPath('modelsDirectory')}>
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Directory where local models are stored. Default: ~/.ollama/models
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxConcurrentModels">Max Concurrent Models</Label>
              <Input
                id="maxConcurrentModels"
                type="number"
                min="1"
                max="10"
                value={localSettings.maxConcurrentModels}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, maxConcurrentModels: parseInt(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum number of models to keep loaded simultaneously
              </p>
            </div>

            <div>
              <Label htmlFor="memoryLimit">Memory Limit (GB)</Label>
              <Input
                id="memoryLimit"
                type="number"
                min="1"
                max="64"
                value={localSettings.memoryLimit}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, memoryLimit: parseInt(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum memory allocation for local models
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Runtime Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Runtime Configuration</CardTitle>
          <CardDescription>Configure how local models are loaded and managed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-unload Inactive Models</Label>
              <p className="text-xs text-muted-foreground">
                Automatically unload models that haven't been used recently
              </p>
            </div>
            <input
              type="checkbox"
              checked={localSettings.autoUnloadInactive}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, autoUnloadInactive: e.target.checked }))}
              className="rounded"
            />
          </div>

          {localSettings.autoUnloadInactive && (
            <div>
              <Label htmlFor="inactiveTimeout">Inactive Timeout (minutes)</Label>
              <Input
                id="inactiveTimeout"
                type="number"
                min="5"
                max="120"
                value={localSettings.inactiveTimeout}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, inactiveTimeout: parseInt(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Unload models after this many minutes of inactivity
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable GPU Acceleration</Label>
              <p className="text-xs text-muted-foreground">
                Use GPU for faster model inference when available
              </p>
            </div>
            <input
              type="checkbox"
              checked={localSettings.enableGPU}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, enableGPU: e.target.checked }))}
              className="rounded"
            />
          </div>

          {localSettings.enableGPU && (
            <div>
              <Label htmlFor="gpuLayers">GPU Layers</Label>
              <Input
                id="gpuLayers"
                type="number"
                min="-1"
                max="100"
                value={localSettings.gpuLayers}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, gpuLayers: parseInt(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Number of layers to offload to GPU (-1 for auto)
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={saveLocalSettings} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
            <Button variant="outline" onClick={() => {
              setLocalSettings({
                ollamaPath: '/usr/local/bin/ollama',
                modelsDirectory: '~/.ollama/models',
                maxConcurrentModels: 3,
                autoUnloadInactive: true,
                inactiveTimeout: 30,
                enableGPU: true,
                gpuLayers: -1,
                memoryLimit: 8
              });
            }}>
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Current system resources and capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">CPU Cores</div>
                <div className="text-xs text-muted-foreground">8 cores</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">RAM</div>
                <div className="text-xs text-muted-foreground">16 GB</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Storage</div>
                <div className="text-xs text-muted-foreground">512 GB SSD</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">GPU</div>
                <div className="text-xs text-muted-foreground">Available</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col max-w-6xl mx-auto">
        <div className="flex-shrink-0 p-6 pb-4">
          <h1 className="text-3xl font-bold">AI & Models</h1>
          <p className="text-muted-foreground mt-2">
            Configure AI providers, manage local models, and monitor performance
          </p>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'providers' | 'local' | 'performance' | 'settings')} className="h-full flex flex-col">
            <div className="flex-shrink-0 px-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="providers" className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Providers
                </TabsTrigger>
                <TabsTrigger value="local" className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Local Models
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <TabsContent value="providers" className="mt-6 space-y-6">
                {renderCloudProviders()}
              </TabsContent>

              <TabsContent value="local" className="mt-6 space-y-6">
                {renderLocalModels()}
              </TabsContent>

              <TabsContent value="performance" className="mt-6 space-y-6">
                {renderPerformance()}
              </TabsContent>

              <TabsContent value="settings" className="mt-6 space-y-6">
                {renderSettings()}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}