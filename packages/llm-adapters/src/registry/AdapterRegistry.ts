import { LLMAdapter, AdapterRegistry as IAdapterRegistry, SupportedProvider } from '../types';
import { OpenAIAdapter } from '../adapters/OpenAIAdapter';
import { OllamaAdapter } from '../adapters/OllamaAdapter';

export class AdapterRegistry implements IAdapterRegistry {
  private adapters = new Map<string, LLMAdapter>();
  private defaultAdapters = new Map<SupportedProvider, () => LLMAdapter>();

  constructor() {
    this.setupDefaultAdapters();
  }

  private setupDefaultAdapters() {
    this.defaultAdapters.set('openai', () => new OpenAIAdapter());
    this.defaultAdapters.set('ollama', () => new OllamaAdapter());
    
    // TODO: Add more adapters as they're implemented
    // this.defaultAdapters.set('anthropic', () => new AnthropicAdapter());
    // this.defaultAdapters.set('google', () => new GoogleAdapter());
    // this.defaultAdapters.set('huggingface', () => new HuggingFaceAdapter());
    // this.defaultAdapters.set('llamacpp', () => new LlamaCppAdapter());
    // this.defaultAdapters.set('vllm', () => new VLLMAdapter());
  }

  register(adapter: LLMAdapter): void {
    this.adapters.set(adapter.provider, adapter);
  }

  unregister(provider: string): void {
    this.adapters.delete(provider);
  }

  get(provider: string): LLMAdapter | null {
    // First check registered adapters
    const registeredAdapter = this.adapters.get(provider);
    if (registeredAdapter) {
      return registeredAdapter;
    }

    // If not found, try to create from defaults
    const defaultFactory = this.defaultAdapters.get(provider as SupportedProvider);
    if (defaultFactory) {
      const adapter = defaultFactory();
      this.register(adapter);
      return adapter;
    }

    return null;
  }

  list(): LLMAdapter[] {
    return Array.from(this.adapters.values());
  }

  getConfigured(): LLMAdapter[] {
    return this.list().filter(adapter => adapter.isConfigured());
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
      adapters.map(async (adapter) => {
        try {
          results[adapter.provider] = await adapter.healthCheck();
        } catch (error) {
          results[adapter.provider] = {
            status: 'unhealthy',
            message: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    return results;
  }

  async getAvailableModels(providers?: string[]): Promise<Record<string, import('../types').ModelInfo[]>> {
    const results: Record<string, import('../types').ModelInfo[]> = {};
    const adaptersToCheck = providers 
      ? providers.map(p => this.get(p)).filter(Boolean) as LLMAdapter[]
      : this.getConfigured();

    await Promise.allSettled(
      adaptersToCheck.map(async (adapter) => {
        try {
          results[adapter.provider] = await adapter.listModels();
        } catch (error) {
          results[adapter.provider] = [];
        }
      })
    );

    return results;
  }

  clear(): void {
    this.adapters.clear();
  }

  // Convenience methods for common operations
  async createCompletion(
    provider: string,
    request: import('../types').LLMCompletionRequest
  ): Promise<import('../types').LLMCompletionResponse> {
    const adapter = this.get(provider);
    if (!adapter) {
      throw new Error(`Adapter for provider '${provider}' not found`);
    }

    if (!adapter.isConfigured()) {
      throw new Error(`Adapter for provider '${provider}' is not configured`);
    }

    return adapter.createCompletion(request);
  }

  async createCompletionStream(
    provider: string,
    request: import('../types').LLMCompletionRequest
  ): Promise<AsyncIterable<import('../types').LLMStreamChunk>> {
    const adapter = this.get(provider);
    if (!adapter) {
      throw new Error(`Adapter for provider '${provider}' not found`);
    }

    if (!adapter.isConfigured()) {
      throw new Error(`Adapter for provider '${provider}' is not configured`);
    }

    return adapter.createCompletionStream(request);
  }

  async createEmbedding(
    provider: string,
    request: import('../types').EmbeddingRequest
  ): Promise<import('../types').EmbeddingResponse> {
    const adapter = this.get(provider);
    if (!adapter) {
      throw new Error(`Adapter for provider '${provider}' not found`);
    }

    if (!adapter.isConfigured()) {
      throw new Error(`Adapter for provider '${provider}' is not configured`);
    }

    if (!adapter.createEmbedding) {
      throw new Error(`Adapter for provider '${provider}' does not support embeddings`);
    }

    return adapter.createEmbedding(request);
  }
}

// Global registry instance
export const globalAdapterRegistry = new AdapterRegistry(); 