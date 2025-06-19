import { AIProvider } from '../types/settings';
import { AIModel } from '../stores/aiConfigStore';

export interface DiscoveredModel extends AIModel {
  discovered: boolean;
  lastUpdated: Date;
  availability: 'available' | 'limited' | 'unavailable';
  capabilities?: string[];
  contextLength?: number;
  pricing?: {
    input?: number;
    output?: number;
    currency?: string;
  };
}

export interface ModelDiscoveryConfig {
  [key: string]: any;
}

export class ModelDiscoveryService {
  private cache = new Map<string, DiscoveredModel[]>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Discover models from OpenAI API
   */
  private async discoverOpenAIModels(apiKey: string): Promise<DiscoveredModel[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.data
        .filter((model: any) => model.id.includes('gpt') || model.id.includes('o1') || model.id.includes('o3'))
        .map((model: any) => ({
          id: model.id,
          name: model.id,
          provider: 'openai' as AIProvider,
          category: this.categorizeModel(model.id),
          discovered: true,
          lastUpdated: new Date(),
          availability: 'available' as const,
          capabilities: this.inferCapabilities(model.id),
          contextLength: this.inferContextLength(model.id),
        }));
    } catch (error) {
      console.error('Failed to discover OpenAI models:', error);
      return [];
    }
  }

  /**
   * Discover models from Google Gemini API
   */
  private async discoverGeminiModels(apiKey: string): Promise<DiscoveredModel[]> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.models
        .filter((model: any) => model.name.includes('gemini'))
        .map((model: any) => ({
          id: model.name.split('/').pop(),
          name: model.displayName || model.name.split('/').pop(),
          provider: 'google' as AIProvider,
          category: this.categorizeModel(model.name),
          discovered: true,
          lastUpdated: new Date(),
          availability: 'available' as const,
          capabilities: model.supportedGenerationMethods || [],
          contextLength: model.inputTokenLimit || undefined,
        }));
    } catch (error) {
      console.error('Failed to discover Gemini models:', error);
      return [];
    }
  }

  /**
   * Discover models from HuggingFace API
   */
  private async discoverHuggingFaceModels(apiKey?: string): Promise<DiscoveredModel[]> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      // Get popular text-generation models
      const response = await fetch('https://huggingface.co/api/models?filter=text-generation&sort=downloads&limit=50', {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status}`);
      }

      const models = await response.json();
      
      return models
        .filter((model: any) => !model.private && model.pipeline_tag === 'text-generation')
        .map((model: any) => ({
          id: model.id,
          name: model.id,
          provider: 'huggingface' as AIProvider,
          category: this.categorizeModel(model.id),
          discovered: true,
          lastUpdated: new Date(),
          availability: 'available' as const,
          capabilities: ['text-generation'],
          contextLength: undefined,
        }));
    } catch (error) {
      console.error('Failed to discover HuggingFace models:', error);
      return [];
    }
  }

  /**
   * Discover models from Ollama API
   */
  private async discoverOllamaModels(baseUrl: string = 'http://localhost:11434'): Promise<DiscoveredModel[]> {
    try {
      const response = await fetch(`${baseUrl}/api/tags`);

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.models?.map((model: any) => ({
        id: model.name,
        name: model.name,
        provider: 'ollama' as AIProvider,
        category: this.categorizeModel(model.name),
        discovered: true,
        lastUpdated: new Date(),
        availability: 'available' as const,
        capabilities: ['text-generation'],
        contextLength: undefined,
      })) || [];
    } catch (error) {
      console.error('Failed to discover Ollama models:', error);
      return [];
    }
  }

  /**
   * Discover models from OpenRouter API
   */
  private async discoverOpenRouterModels(apiKey?: string): Promise<DiscoveredModel[]> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers,
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.data?.map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        provider: 'openrouter' as AIProvider,
        category: this.categorizeModel(model.id),
        discovered: true,
        lastUpdated: new Date(),
        availability: 'available' as const,
        capabilities: model.architecture?.input_modalities || [],
        contextLength: model.context_length,
        pricing: model.pricing ? {
          input: parseFloat(model.pricing.prompt || '0'),
          output: parseFloat(model.pricing.completion || '0'),
          currency: 'USD',
        } : undefined,
      })) || [];
    } catch (error) {
      console.error('Failed to discover OpenRouter models:', error);
      return [];
    }
  }

  /**
   * Discover models from Qwen API (Alibaba Cloud)
   */
  private async discoverQwenModels(apiKey: string): Promise<DiscoveredModel[]> {
    try {
      // Qwen models are typically accessed through Alibaba Cloud DashScope
      // This is a placeholder implementation - actual API endpoint may vary
      const response = await fetch('https://dashscope.aliyuncs.com/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Qwen API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.models?.filter((model: any) => model.id.includes('qwen'))
        .map((model: any) => ({
          id: model.id,
          name: model.name || model.id,
          provider: 'qwen' as AIProvider,
          category: this.categorizeModel(model.id),
          discovered: true,
          lastUpdated: new Date(),
          availability: 'available' as const,
          capabilities: ['text-generation'],
          contextLength: model.context_length,
        })) || [];
    } catch (error) {
      console.error('Failed to discover Qwen models:', error);
      // Return known Qwen models as fallback
      return [
        {
          id: 'qwen2.5-72b-instruct',
          name: 'Qwen2.5 72B Instruct',
          provider: 'qwen' as AIProvider,
          category: 'flagship',
          discovered: true,
          lastUpdated: new Date(),
          availability: 'available' as const,
          capabilities: ['text-generation', 'instruction-following'],
          contextLength: 32768,
        },
        {
          id: 'qwen2.5-14b-instruct',
          name: 'Qwen2.5 14B Instruct',
          provider: 'qwen' as AIProvider,
          category: 'efficient',
          discovered: true,
          lastUpdated: new Date(),
          availability: 'available' as const,
          capabilities: ['text-generation', 'instruction-following'],
          contextLength: 32768,
        },
      ];
    }
  }

  /**
   * Main method to discover models from all configured providers
   */
  async discoverModels(configs: Partial<Record<AIProvider, ModelDiscoveryConfig>>): Promise<DiscoveredModel[]> {
    const allModels: DiscoveredModel[] = [];
    const discoveryPromises: Promise<DiscoveredModel[]>[] = [];

    // Check cache first
    const cacheKey = JSON.stringify(configs);
    const cached = this.cache.get(cacheKey);
    const cacheExpiry = this.cacheExpiry.get(cacheKey);
    
    if (cached && cacheExpiry && Date.now() < cacheExpiry) {
      return cached;
    }

    // Discover from each configured provider
    if (configs.openai?.apiKey) {
      discoveryPromises.push(this.discoverOpenAIModels(configs.openai.apiKey));
    }

    if (configs.google?.apiKey) {
      discoveryPromises.push(this.discoverGeminiModels(configs.google.apiKey));
    }

    if (configs.huggingface) {
      discoveryPromises.push(this.discoverHuggingFaceModels(configs.huggingface.apiKey));
    }

    if (configs.ollama) {
      discoveryPromises.push(this.discoverOllamaModels(configs.ollama.baseUrl));
    }

    if (configs.openrouter) {
      discoveryPromises.push(this.discoverOpenRouterModels(configs.openrouter.apiKey));
    }

    if (configs.qwen?.apiKey) {
      discoveryPromises.push(this.discoverQwenModels(configs.qwen.apiKey));
    }

    // Wait for all discoveries to complete
    const results = await Promise.allSettled(discoveryPromises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allModels.push(...result.value);
      }
    });

    // Cache the results
    this.cache.set(cacheKey, allModels);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

    return allModels;
  }

  /**
   * Get models for a specific provider
   */
  async getProviderModels(provider: AIProvider, config: ModelDiscoveryConfig): Promise<DiscoveredModel[]> {
    const configs = { [provider]: config };
    const allModels = await this.discoverModels(configs);
    return allModels.filter(model => model.provider === provider);
  }

  /**
   * Categorize model based on name/id
   */
  private categorizeModel(modelId: string): string {
    const id = modelId.toLowerCase();
    
    if (id.includes('gpt-4') || id.includes('claude-3') || id.includes('gemini-pro') || id.includes('qwen2.5-72b')) {
      return 'flagship';
    }
    if (id.includes('o1') || id.includes('o3') || id.includes('reasoning')) {
      return 'reasoning';
    }
    if (id.includes('code') || id.includes('codellama') || id.includes('deepseek-coder')) {
      return 'coding';
    }
    if (id.includes('mini') || id.includes('small') || id.includes('7b') || id.includes('3b')) {
      return 'efficient';
    }
    
    return 'balanced';
  }

  /**
   * Infer capabilities based on model name
   */
  private inferCapabilities(modelId: string): string[] {
    const capabilities = ['text-generation'];
    const id = modelId.toLowerCase();
    
    if (id.includes('vision') || id.includes('4o')) {
      capabilities.push('vision');
    }
    if (id.includes('code') || id.includes('codex')) {
      capabilities.push('code-generation');
    }
    if (id.includes('instruct') || id.includes('chat')) {
      capabilities.push('instruction-following');
    }
    if (id.includes('o1') || id.includes('o3')) {
      capabilities.push('reasoning');
    }
    
    return capabilities;
  }

  /**
   * Infer context length based on model name
   */
  private inferContextLength(modelId: string): number | undefined {
    const id = modelId.toLowerCase();
    
    if (id.includes('gpt-4o')) return 128000;
    if (id.includes('gpt-4')) return 8192;
    if (id.includes('gpt-3.5')) return 4096;
    if (id.includes('claude-3')) return 200000;
    if (id.includes('gemini-pro')) return 1000000;
    
    return undefined;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

export const modelDiscoveryService = new ModelDiscoveryService(); 