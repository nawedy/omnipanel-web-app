// packages/llm-adapters/src/providers/ollama.ts

import {
  AIProvider,
  ChatMessage,
  ChatResponse,
  StreamingChatResponse,
  ModelInfo,
  AIProviderConfig,
  TokenUsage,
  ProviderError,
  ProviderErrorType
} from '@omnipanel/types';
import { BaseAdapter } from '../base/adapter';
import { createRetryWrapper } from '../utils/retry';
import { RateLimiter } from '../utils/rateLimiter';
import { CostTracker } from '../utils/costTracker';

export interface OllamaConfig extends AIProviderConfig {
  baseUrl: string;
  timeout?: number;
  maxRetries?: number;
  model?: string;
}

interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model?: string;
    format: string;
    family: string;
    families?: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

interface OllamaModelsResponse {
  models: OllamaModel[];
}

interface OllamaChatRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repeat_penalty?: number;
    seed?: number;
    num_ctx?: number;
    num_predict?: number;
    stop?: string[];
  };
}

interface OllamaChatResponse {
  model: string;
  created_at: string;
  message?: {
    role: string;
    content: string;
  };
  response?: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class OllamaAdapter extends BaseAdapter {
  private rateLimiter: RateLimiter;
  private costTracker: CostTracker;
  private config: OllamaConfig;

  constructor(config: OllamaConfig) {
    super();
    this.config = {
      timeout: 30000,
      maxRetries: 3,
      ...config
    };

    // Ollama is typically local, so we can be more aggressive with requests
    this.rateLimiter = new RateLimiter({
      requestsPerMinute: 60,
      requestsPerHour: 3600
    });

    this.costTracker = new CostTracker({
      provider: AIProvider.OLLAMA,
      inputTokenCost: 0, // Local inference is typically free
      outputTokenCost: 0,
      trackingEnabled: true
    });
  }

  async chat(messages: ChatMessage[], options: any = {}): Promise<ChatResponse> {
    await this.rateLimiter.waitForAvailability();

    const model = options.model || this.config.model || 'llama2';

    const request: OllamaChatRequest = {
      model,
      messages: messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      })),
      stream: false,
      options: {
        temperature: options.temperature ?? 0.8,
        top_p: options.top_p ?? 0.9,
        top_k: options.top_k ?? 40,
        repeat_penalty: options.repeat_penalty ?? 1.1,
        seed: options.seed,
        num_ctx: options.num_ctx ?? 2048,
        num_predict: options.num_predict ?? 128,
        stop: options.stop
      }
    };

    const chatFunction = async (): Promise<ChatResponse> => {
      try {
        const response = await fetch(`${this.config.baseUrl}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request),
          signal: AbortSignal.timeout(this.config.timeout!)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new ProviderError(
            `Ollama API error: ${response.status} ${response.statusText}`,
            response.status >= 500 ? ProviderErrorType.API_ERROR : ProviderErrorType.INVALID_REQUEST,
            { status: response.status, response: errorText }
          );
        }

        const data: OllamaChatResponse = await response.json();

        const content = data.message?.content || data.response || '';
        
        if (!content) {
          throw new ProviderError(
            'Invalid response format from Ollama',
            ProviderErrorType.INVALID_RESPONSE,
            { response: data }
          );
        }

        // Estimate token usage since Ollama doesn't provide exact counts
        const usage: TokenUsage = {
          inputTokens: data.prompt_eval_count || Math.ceil(messages.join(' ').length / 4),
          outputTokens: data.eval_count || Math.ceil(content.length / 4),
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        };

        await this.costTracker.trackUsage(usage, 0); // Free local inference

        return {
          content,
          role: 'assistant',
          usage,
          model: data.model,
          finishReason: data.done ? 'stop' : 'length',
          id: `ollama-${Date.now()}`,
          created: new Date(data.created_at),
          cost: 0
        };
      } catch (error) {
        if (error instanceof ProviderError) {
          throw error;
        }

        if (error instanceof Error) {
          if (error.name === 'AbortError' || error.message.includes('timeout')) {
            throw new ProviderError(
              'Request timeout',
              ProviderErrorType.TIMEOUT,
              { timeout: this.config.timeout }
            );
          }

          if (error.message.includes('fetch')) {
            throw new ProviderError(
              'Network error connecting to Ollama server',
              ProviderErrorType.NETWORK_ERROR,
              { baseUrl: this.config.baseUrl }
            );
          }
        }

        throw new ProviderError(
          'Unexpected error in Ollama chat',
          ProviderErrorType.UNKNOWN_ERROR,
          { error: error instanceof Error ? error.message : String(error) }
        );
      }
    };

    return createRetryWrapper(chatFunction, this.config.maxRetries!);
  }

  async *streamChat(messages: ChatMessage[], options: any = {}): AsyncGenerator<StreamingChatResponse> {
    await this.rateLimiter.waitForAvailability();

    const model = options.model || this.config.model || 'llama2';

    const request: OllamaChatRequest = {
      model,
      messages: messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      })),
      stream: true,
      options: {
        temperature: options.temperature ?? 0.8,
        top_p: options.top_p ?? 0.9,
        top_k: options.top_k ?? 40,
        repeat_penalty: options.repeat_penalty ?? 1.1,
        seed: options.seed,
        num_ctx: options.num_ctx ?? 2048,
        num_predict: options.num_predict ?? 128,
        stop: options.stop
      }
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ProviderError(
          `Ollama streaming error: ${response.status} ${response.statusText}`,
          response.status >= 500 ? ProviderErrorType.API_ERROR : ProviderErrorType.INVALID_REQUEST,
          { status: response.status, response: errorText }
        );
      }

      if (!response.body) {
        throw new ProviderError(
          'No response body received',
          ProviderErrorType.INVALID_RESPONSE
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let totalUsage: TokenUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data: OllamaChatResponse = JSON.parse(line);
              
              const content = data.message?.content || data.response || '';
              
              if (content) {
                yield {
                  content,
                  role: 'assistant',
                  delta: true,
                  model: data.model,
                  id: `ollama-${Date.now()}`,
                  created: new Date(data.created_at)
                };
              }

              if (data.done) {
                totalUsage = {
                  inputTokens: data.prompt_eval_count || 0,
                  outputTokens: data.eval_count || 0,
                  totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
                };

                await this.costTracker.trackUsage(totalUsage, 0);
                
                yield {
                  content: '',
                  role: 'assistant',
                  delta: false,
                  finishReason: 'stop',
                  usage: totalUsage,
                  model: data.model,
                  id: `ollama-${Date.now()}`,
                  created: new Date(data.created_at),
                  cost: 0
                };
                break;
              }
            } catch (parseError) {
              console.warn('Failed to parse Ollama streaming response:', parseError);
              continue;
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          throw new ProviderError(
            'Streaming request timeout',
            ProviderErrorType.TIMEOUT,
            { timeout: this.config.timeout }
          );
        }

        if (error.message.includes('fetch')) {
          throw new ProviderError(
            'Network error during streaming',
            ProviderErrorType.NETWORK_ERROR,
            { baseUrl: this.config.baseUrl }
          );
        }
      }

      throw new ProviderError(
        'Unexpected error in Ollama streaming',
        ProviderErrorType.UNKNOWN_ERROR,
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new ProviderError(
          'Failed to fetch Ollama models',
          ProviderErrorType.API_ERROR,
          { status: response.status }
        );
      }

      const data: OllamaModelsResponse = await response.json();

      return data.models.map(model => {
        const contextLength = typeof model.details?.parameter_size === 'number' 
          ? model.details.parameter_size 
          : 4096;
        
        return {
          id: model.name,
          name: model.name,
          provider: AIProvider.OLLAMA,
          contextLength,
          context_length: contextLength,
          supports_streaming: true,
          supports_functions: false,
          inputCost: 0,
          outputCost: 0,
          description: `Ollama hosted model: ${model.name}`,
          capabilities: ['chat', 'completion'],
          metadata: {
            type: 'local',
            vendor: 'Ollama',
            size: model.size,
            modified: model.modified_at
          }
        };
      });
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }

      throw new ProviderError(
        'Failed to fetch Ollama models',
        ProviderErrorType.NETWORK_ERROR,
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      return response.ok;
    } catch (error) {
      throw new ProviderError(
        'Ollama server is not accessible',
        ProviderErrorType.NETWORK_ERROR,
        { 
          baseUrl: this.config.baseUrl,
          error: error instanceof Error ? error.message : String(error)
        }
      );
    }
  }

  async countTokens(text: string): Promise<number> {
    // Ollama doesn't provide a tokenization endpoint
    // Use a simple estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  private inferContextLength(modelName: string): number {
    const name = modelName.toLowerCase();
    
    // Common context lengths for different model families
    if (name.includes('llama2') || name.includes('llama-2')) {
      return 4096;
    } else if (name.includes('codellama') || name.includes('code-llama')) {
      return 16384;
    } else if (name.includes('mistral')) {
      return 8192;
    } else if (name.includes('gemma')) {
      return 8192;
    } else if (name.includes('phi')) {
      return 2048;
    }
    
    // Default context length
    return 2048;
  }

  getUsageStats() {
    return this.costTracker.getStats();
  }

  resetUsageStats() {
    this.costTracker.reset();
  }
}