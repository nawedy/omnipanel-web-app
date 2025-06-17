// apps/web/src/components/settings/CustomProviderManager.tsx
// Custom provider management component for AI settings

"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Edit, 
  Trash2, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Globe,
  Cpu
} from 'lucide-react';
import { aiService } from '@/services/aiService';
import type { CustomProviderConfig, CustomModelConfig } from '@/services/aiService';

interface CustomProviderManagerProps {
  onProviderChange?: () => void;
}

export function CustomProviderManager({ onProviderChange }: CustomProviderManagerProps) {
  const [providers, setProviders] = useState<CustomProviderConfig[]>([]);
  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  // Form state for new/editing provider
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    displayName: '',
    apiKey: '',
    baseUrl: '',
    defaultModel: '',
    timeout: 30000,
    maxRetries: 3,
    headers: '{}',
    models: [] as CustomModelConfig[]
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = () => {
    const customProviders = aiService.getCustomProviders();
    setProviders(customProviders);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      displayName: '',
      apiKey: '',
      baseUrl: '',
      defaultModel: '',
      timeout: 30000,
      maxRetries: 3,
      headers: '{}',
      models: []
    });
  };

  const handleAddProvider = () => {
    setIsAddingProvider(true);
    resetForm();
  };

  const handleSaveProvider = async () => {
    try {
      const headers = JSON.parse(formData.headers);
      const config = {
        id: formData.id,
        name: formData.name,
        displayName: formData.displayName,
        apiKey: formData.apiKey,
        baseUrl: formData.baseUrl,
        defaultModel: formData.defaultModel,
        timeout: formData.timeout,
        maxRetries: formData.maxRetries,
        headers,
        models: formData.models
      };

      if (editingProvider) {
        aiService.updateCustomProvider(`custom_${editingProvider}`, config);
      } else {
        aiService.addCustomProvider(config);
      }

      loadProviders();
      setIsAddingProvider(false);
      setEditingProvider(null);
      resetForm();
      onProviderChange?.();
    } catch (error) {
      console.error('Failed to save provider:', error);
      alert('Failed to save provider. Please check your configuration.');
    }
  };

  const handleDeleteProvider = (providerId: string) => {
    if (confirm('Are you sure you want to delete this provider?')) {
      aiService.removeCustomProvider(`custom_${providerId}`);
      loadProviders();
      onProviderChange?.();
    }
  };

  const handleTestProvider = async (providerId: string) => {
    setTestingProvider(providerId);
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      try {
        const result = await aiService.testCustomProvider(provider);
        setTestResults(prev => ({ ...prev, [providerId]: result }));
      } catch (error) {
        setTestResults(prev => ({ ...prev, [providerId]: false }));
      }
    }
    setTestingProvider(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-app-primary">Custom AI Providers</h3>
          <p className="text-sm text-app-secondary">
            Add and manage custom AI providers and models
          </p>
        </div>
        <Button onClick={handleAddProvider} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Provider
        </Button>
      </div>

      {/* Provider List */}
      <div className="grid gap-4">
        {providers.map((provider) => (
          <Card key={provider.id} className="bg-app-card border-slate-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <Globe className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-app-primary">{provider.displayName}</CardTitle>
                    <CardDescription className="text-app-secondary">
                      {provider.baseUrl} • {provider.models.length} models
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {testResults[provider.id] !== undefined && (
                    <Badge variant={testResults[provider.id] ? "default" : "destructive"}>
                      {testResults[provider.id] ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {testResults[provider.id] ? 'Connected' : 'Failed'}
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestProvider(provider.id)}
                    disabled={testingProvider === provider.id}
                  >
                    <TestTube className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProvider(provider.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {provider.models.map((model) => (
                  <Badge key={model.id} variant="secondary" className="text-xs">
                    <Cpu className="h-3 w-3 mr-1" />
                    {model.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Provider Form */}
      {isAddingProvider && (
        <Card className="bg-app-card border-slate-800">
          <CardHeader>
            <CardTitle className="text-app-primary">Add Custom Provider</CardTitle>
            <CardDescription className="text-app-secondary">
              Configure your custom AI provider settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider-id">Provider ID</Label>
                <Input
                  id="provider-id"
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                  placeholder="my-custom-provider"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="My Custom Provider"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="base-url">Base URL</Label>
              <Input
                id="base-url"
                value={formData.baseUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://api.example.com/v1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="sk-..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-model">Default Model</Label>
              <Input
                id="default-model"
                value={formData.defaultModel}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultModel: e.target.value }))}
                placeholder="gpt-3.5-turbo"
              />
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={handleSaveProvider}>Add Provider</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingProvider(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 