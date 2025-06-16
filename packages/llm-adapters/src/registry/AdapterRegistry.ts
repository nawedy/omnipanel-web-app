import { AdapterRegistry as IAdapterRegistry, SupportedProvider } from '../types';
import { BaseLLMAdapter } from '../base/adapter';
import { OpenAIAdapter } from '../providers/openai';
import { OllamaAdapter } from '../providers/ollama';

export class AdapterRegistry {
  private adapters = new Map<string, BaseLLMAdapter>();
  private defaultAdapters = new Map<SupportedProvider, () => BaseLLMAdapter>();

  constructor() {
    this.setupDefaultAdapters();
  }

  private setupDefaultAdapters() {
    // Create adapters with default/empty configurations
    this.defaultAdapters.set('openai', () => new OpenAIAdapter({
      apiKey: process.env.OPENAI_API_KEY || '',
      baseUrl: 'https://api.openai.com/v1',
      organization: process.env.OPENAI_ORG_ID,
      project: process.env.OPENAI_PROJECT_ID,
    }));
    
    this.defaultAdapters.set('ollama', () => new OllamaAdapter({
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      timeout: 30000,
    }));
    
    // TODO: Add more adapters as they're implemented
    // this.defaultAdapters.set('anthropic', () => new AnthropicAdapter());
    // this.defaultAdapters.set('google', () => new GoogleAdapter());
    // this.defaultAdapters.set('huggingface', () => new HuggingFaceAdapter());
    // this.defaultAdapters.set('llamacpp', () => new LlamaCppAdapter());
    // this.defaultAdapters.set('vllm', () => new VLLMAdapter());
  }

  register(adapter: BaseLLMAdapter, provider: string): void {
    this.adapters.set(provider, adapter);
  }

  unregister(provider: string): void {
    this.adapters.delete(provider);
  }

  get(provider: string): BaseLLMAdapter | null {
    // First check registered adapters
    const registeredAdapter = this.adapters.get(provider);
    if (registeredAdapter) {
      return registeredAdapter;
    }

    // If not found, try to create from defaults
    const defaultFactory = this.defaultAdapters.get(provider as SupportedProvider);
    if (defaultFactory) {
      const adapter = defaultFactory();
      this.register(adapter, provider);
      return adapter;
    }

    return null;
  }

  list(): BaseLLMAdapter[] {
    return Array.from(this.adapters.values());
  }

  getConfigured(): BaseLLMAdapter[] {
    // For now, return all adapters since we can't easily check async validation
    return this.list();
  }

  getSupportedProviders(): SupportedProvider[] {
    return Array.from(this.defaultAdapters.keys());
  }

  getProviderCapabilities(provider: SupportedProvider) {
    const capabilities = {
      openai: {
        streaming: true,
        functions: true,
        tools: true,
        vision: true,
        json_mode: true,
        embeddings: true,
        local_models: false,
        custom_endpoints: true,
      },
      anthropic: {
        streaming: true,
        functions: false,
        tools: true,
        vision: true,
        json_mode: false,
        embeddings: false,
        local_models: false,
        custom_endpoints: false,
      },
      google: {
        streaming: true,
        functions: true,
        tools: true,
        vision: true,
        json_mode: false,
        embeddings: true,
        local_models: false,
        custom_endpoints: false,
      },
      huggingface: {
        streaming: true,
        functions: false,
        tools: false,
        vision: false,
        json_mode: false,
        embeddings: true,
        local_models: false,
        custom_endpoints: true,
      },
      ollama: {
        streaming: true,
        functions: false,
        tools: false,
        vision: true,
        json_mode: false,
        embeddings: true,
        local_models: true,
        custom_endpoints: true,
      },
      llamacpp: {
        streaming: true,
        functions: false,
        tools: false,
        vision: false,
        json_mode: false,
        embeddings: false,
        local_models: true,
        custom_endpoints: true,
      },
      vllm: {
        streaming: true,
        functions: false,
        tools: false,
        vision: false,
        json_mode: false,
        embeddings: false,
        local_models: true,
        custom_endpoints: true,
      },
      deepseek: {
        streaming: true,
        functions: true,
        tools: true,
        vision: false,
        json_mode: true,
        embeddings: false,
        local_models: false,
        custom_endpoints: false,
      },
      qwen: {
        streaming: true,
        functions: true,
        tools: true,
        vision: true,
        json_mode: false,
        embeddings: false,
        local_models: false,
        custom_endpoints: false,
      },
      mistral: {
        streaming: true,
        functions: true,
        tools: true,
        vision: false,
        json_mode: false,
        embeddings: true,
        local_models: false,
        custom_endpoints: false,
      },
      cohere: {
        streaming: true,
        functions: false,
        tools: true,
        vision: false,
        json_mode: false,
        embeddings: true,
        local_models: false,
        custom_endpoints: false,
      },
      perplexity: {
        streaming: true,
        functions: false,
        tools: false,
        vision: false,
        json_mode: false,
        embeddings: false,
        local_models: false,
        custom_endpoints: false,
      },
    };

    return capabilities[provider] || {
      streaming: false,
      functions: false,
      tools: false,
      vision: false,
      json_mode: false,
      embeddings: false,
      local_models: false,
      custom_endpoints: false,
    };
  }

  async healthCheckAll(): Promise<Record<string, { status: 'healthy' | 'unhealthy'; message?: string; latency?: number }>> {
    const results: Record<string, any> = {};
    const adapters = this.getConfigured();

    await Promise.allSettled(
      adapters.map(async (adapter, index) => {
        try {
          // Use testConnection if available, otherwise use getHealthStatus
          const providerName = `provider-${index}`; // Fallback since we don't have provider property
          if ('testConnection' in adapter && typeof adapter.testConnection === 'function') {
            const isHealthy = await adapter.testConnection();
            results[providerName] = {
              status: isHealthy ? 'healthy' : 'unhealthy',
              message: isHealthy ? 'Connection successful' : 'Connection failed'
            };
          } else if ('getHealthStatus' in adapter && typeof adapter.getHealthStatus === 'function') {
            results[providerName] = await adapter.getHealthStatus();
          } else {
            results[providerName] = {
              status: 'unknown',
              message: 'Health check not available'
            };
          }
        } catch (error) {
          results[`provider-${index}`] = {
            status: 'unhealthy',
            message: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    return results;
  }

  async getAvailableModels(providers?: string[]): Promise<Record<string, any[]>> {
    const results: Record<string, any[]> = {};
    const adaptersToCheck = providers 
      ? providers.map(p => this.get(p)).filter(Boolean) as BaseLLMAdapter[]
      : this.getConfigured();

    await Promise.allSettled(
      adaptersToCheck.map(async (adapter, index) => {
        try {
          const providerName = `provider-${index}`;
          if ('getModels' in adapter && typeof adapter.getModels === 'function') {
            results[providerName] = await adapter.getModels();
          } else {
            results[providerName] = [];
          }
        } catch (error) {
          results[`provider-${index}`] = [];
        }
      })
    );

    return results;
  }

  clear(): void {
    this.adapters.clear();
  }

  // Note: Convenience methods removed due to interface incompatibilities
  // Use get(provider) to access adapters directly
}

// Global registry instance
export const globalAdapterRegistry = new AdapterRegistry(); 