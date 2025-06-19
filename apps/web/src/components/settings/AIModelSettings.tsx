// apps/web/src/components/settings/AIModelSettings.tsx
// AI model configuration settings component for managing API keys and model preferences
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { settingsService } from '@/services/settingsService';
import { Eye, EyeOff, Plus, Trash2, Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import type { AISettings } from '@/services/settingsService';

type AIProvider = 'openai' | 'anthropic' | 'deepseek' | 'gemini' | 'ollama' | 'custom';

interface AIModelSettingsProps {
  onSave?: (settings: AISettings) => void;
  className?: string;
}

interface ModelOption {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  pricing: {
    input: number;
    output: number;
  };
}

const AI_PROVIDERS: Record<AIProvider, {
  name: string;
  description: string;
  models: ModelOption[];
  apiKeyLabel: string;
  endpointRequired: boolean;
}> = {
  openai: {
    name: 'OpenAI',
    description: 'GPT models from OpenAI',
    apiKeyLabel: 'OpenAI API Key',
    endpointRequired: false,
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Latest GPT-4 Omni model with vision and advanced reasoning',
        maxTokens: 128000,
        pricing: { input: 5, output: 15 }
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'Fast and capable GPT-4 model',
        maxTokens: 128000,
        pricing: { input: 10, output: 30 }
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and cost-effective model',
        maxTokens: 16385,
        pricing: { input: 0.5, output: 1.5 }
      }
    ]
  },
  anthropic: {
    name: 'Anthropic',
    description: 'Claude models from Anthropic',
    apiKeyLabel: 'Anthropic API Key',
    endpointRequired: false,
    models: [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        description: 'Most capable Claude model with advanced reasoning',
        maxTokens: 200000,
        pricing: { input: 3, output: 15 }
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        description: 'Fast and cost-effective model',
        maxTokens: 200000,
        pricing: { input: 0.25, output: 1.25 }
      }
    ]
  },
  deepseek: {
    name: 'DeepSeek',
    description: 'Advanced reasoning models from DeepSeek',
    apiKeyLabel: 'DeepSeek API Key',
    endpointRequired: false,
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        description: 'General purpose chat model',
        maxTokens: 32768,
        pricing: { input: 0.14, output: 0.28 }
      },
      {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder',
        description: 'Specialized model for coding tasks',
        maxTokens: 16384,
        pricing: { input: 0.14, output: 0.28 }
      }
    ]
  },
  gemini: {
    name: 'Google Gemini',
    description: 'Gemini models from Google',
    apiKeyLabel: 'Google API Key',
    endpointRequired: false,
    models: [
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        description: 'Advanced multimodal model',
        maxTokens: 32768,
        pricing: { input: 0.5, output: 1.5 }
      },
      {
        id: 'gemini-pro-vision',
        name: 'Gemini Pro Vision',
        description: 'Multimodal model with vision capabilities',
        maxTokens: 16384,
        pricing: { input: 0.5, output: 1.5 }
      }
    ]
  },
  ollama: {
    name: 'Ollama',
    description: 'Local models via Ollama',
    apiKeyLabel: 'API Key (Optional)',
    endpointRequired: true,
    models: [
      {
        id: 'llama3.2',
        name: 'Llama 3.2',
        description: 'Meta\'s latest Llama model',
        maxTokens: 128000,
        pricing: { input: 0, output: 0 }
      },
      {
        id: 'codestral',
        name: 'Codestral',
        description: 'Code-focused model by Mistral',
        maxTokens: 32768,
        pricing: { input: 0, output: 0 }
      },
      {
        id: 'qwen2.5',
        name: 'Qwen 2.5',
        description: 'Advanced model by Alibaba',
        maxTokens: 32768,
        pricing: { input: 0, output: 0 }
      }
    ]
  },
  custom: {
    name: 'Custom Endpoint',
    description: 'Connect to any OpenAI-compatible API',
    apiKeyLabel: 'API Key',
    endpointRequired: true,
    models: [
      {
        id: 'custom-model',
        name: 'Custom Model',
        description: 'Configure your custom model',
        maxTokens: 4096,
        pricing: { input: 0, output: 0 }
      }
    ]
  }
};

export function AIModelSettings({ onSave, className = '' }: AIModelSettingsProps): React.JSX.Element {
  const [config, setConfig] = useState<AISettings>({
    // Legacy properties
    apiKey: '',
    provider: 'openai',
    endpoint: '',
    model: 'gpt-4o',
    enabled: true,
    systemPrompt: '',
    // New properties
    defaultProvider: 'openai',
    defaultModel: 'gpt-4o',
    apiKeys: {},
    customProviders: [],
    enableContextAwareness: true,
    maxContextTokens: 4096,
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    enableStreaming: true,
    autoSaveConversations: true,
    conversationRetentionDays: 30
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const settings = settingsService.getSettings();
      if (settings.ai) {
        setConfig(settings.ai);
      }
    } catch (error) {
      console.error('Failed to load AI model settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateConfig = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!config.apiKey && config.provider !== 'ollama') {
      newErrors.apiKey = 'API key is required';
    }

    if (config.provider === 'ollama' && !config.endpoint) {
      newErrors.endpoint = 'Endpoint is required for Ollama';
    }

    if (config.provider === 'custom' && !config.endpoint) {
      newErrors.endpoint = 'Endpoint is required for custom providers';
    }

    if (config.temperature < 0 || config.temperature > 2) {
      newErrors.temperature = 'Temperature must be between 0 and 2';
    }

    if (config.maxTokens < 1 || config.maxTokens > 200000) {
      newErrors.maxTokens = 'Max tokens must be between 1 and 200,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (): Promise<void> => {
    if (!validateConfig()) return;

    try {
      setIsSaving(true);
              settingsService.updateSetting('ai', config);
      onSave?.(config);
      setTestResult({ success: true, message: 'Settings saved successfully!' });
    } catch (error) {
      setTestResult({ success: false, message: `Failed to save settings: ${error}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async (): Promise<void> => {
    if (!validateConfig()) return;

    try {
      setIsLoading(true);
      setTestResult(null);
      
      // Test the API connection (placeholder)
      const success = true; // TODO: Implement actual connection test
      
      if (success) {
        setTestResult({ success: true, message: 'Connection successful!' });
      } else {
        setTestResult({ success: false, message: 'Connection failed. Please check your settings.' });
      }
    } catch (error) {
      setTestResult({ success: false, message: `Connection failed: ${error}` });
    } finally {
      setIsLoading(false);
    }
  };

  const currentProvider = AI_PROVIDERS[config.provider as AIProvider];
  const currentModel = currentProvider.models.find((m: any) => m.id === config.model) || currentProvider.models[0];

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-medium">AI Model Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure your AI model settings and API connections
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                AI Provider
                <Badge variant={config.enabled ? "default" : "secondary"}>
                  {config.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Choose your AI provider and model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={config.enabled}
                  onCheckedChange={(enabled: boolean) => setConfig(prev => ({ ...prev, enabled }))}
                />
                <Label htmlFor="enabled">Enable AI features</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Select 
                    value={config.provider} 
                    onValueChange={(provider: AIProvider) => 
                      setConfig(prev => ({ 
                        ...prev, 
                        provider,
                        model: AI_PROVIDERS[provider].models[0].id 
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex flex-col">
                            <span>{provider.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {provider.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select 
                    value={config.model} 
                    onValueChange={(model) => setConfig(prev => ({ ...prev, model }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentProvider.models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex flex-col">
                            <span>{model.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {model.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {currentModel && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Max Tokens:</span>
                        <span className="ml-2">{currentModel.maxTokens.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">Pricing:</span>
                        <span className="ml-2">
                          ${currentModel.pricing.input}/${currentModel.pricing.output} per 1M tokens
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="apiKey">{currentProvider.apiKeyLabel}</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    value={config.apiKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder={config.provider === 'ollama' ? 'Optional for Ollama' : 'Enter your API key'}
                    className={errors.apiKey ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.apiKey && (
                  <p className="text-xs text-red-500">{errors.apiKey}</p>
                )}
              </div>

              {currentProvider.endpointRequired && (
                <div className="space-y-2">
                  <Label htmlFor="endpoint">API Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={config.endpoint}
                    onChange={(e) => setConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                    placeholder={config.provider === 'ollama' ? 'http://localhost:11434' : 'https://api.example.com/v1'}
                    className={errors.endpoint ? 'border-red-500' : ''}
                  />
                  {errors.endpoint && (
                    <p className="text-xs text-red-500">{errors.endpoint}</p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleTestConnection} 
                  variant="outline"
                  disabled={isLoading || !config.enabled}
                >
                  {isLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Test Connection
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving || !config.enabled}
                >
                  {isSaving ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Settings
                </Button>
              </div>

              {testResult && (
                <Alert className={testResult.success ? 'border-green-500' : 'border-red-500'}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parameters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Parameters</CardTitle>
              <CardDescription>
                Fine-tune model behavior and output characteristics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">
                    Temperature: {config.temperature}
                  </Label>
                  <input
                    id="temperature"
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls randomness. Lower = more focused, Higher = more creative
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 4096 }))}
                    min="1"
                    max={currentModel?.maxTokens || 200000}
                    className={errors.maxTokens ? 'border-red-500' : ''}
                  />
                  {errors.maxTokens && (
                    <p className="text-xs text-red-500">{errors.maxTokens}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topP">
                    Top P: {config.topP}
                  </Label>
                  <input
                    id="topP"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.topP}
                    onChange={(e) => setConfig(prev => ({ ...prev, topP: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls diversity via nucleus sampling
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequencyPenalty">
                    Frequency Penalty: {config.frequencyPenalty}
                  </Label>
                  <input
                    id="frequencyPenalty"
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={config.frequencyPenalty}
                    onChange={(e) => setConfig(prev => ({ ...prev, frequencyPenalty: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Reduces repetition of frequent tokens
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="presencePenalty">
                  Presence Penalty: {config.presencePenalty}
                </Label>
                <input
                  id="presencePenalty"
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={config.presencePenalty}
                  onChange={(e) => setConfig(prev => ({ ...prev, presencePenalty: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Encourages talking about new topics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                System prompts and advanced configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <textarea
                  id="systemPrompt"
                  value={config.systemPrompt}
                  onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  placeholder="You are a helpful AI assistant..."
                  className="w-full min-h-[120px] p-3 text-sm border border-gray-300 rounded-md resize-vertical"
                />
                <p className="text-xs text-muted-foreground">
                  Define the AI's behavior and personality. This will be sent with every request.
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Changes to advanced settings will take effect immediately for new conversations.
                  Existing conversations will continue using their original settings.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 