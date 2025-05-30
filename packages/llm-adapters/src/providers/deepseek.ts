// packages/llm-adapters/src/providers/deepseek.ts

import {
  AIProvider,
  ChatMessage,
  ChatResponse,
  StreamingChatResponse,
  ModelInfo,
  AIProviderConfig,
  TokenUsage,
  ProviderError,
  ProviderErrorType,
  normalizeFinishReason
} from '@omnipanel/types';
import { BaseAdapter } from '../base/adapter';
import { createRetryWrapper } from '../utils/retry';
import { RateLimiter } from '../utils/rateLimiter';
import { CostTracker } from '../utils/costTracker';

export interface DeepSeekConfig extends AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

interface DeepSeekChatRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stop?: string[];
  stream?: boolean;
  frequency_penalty?: number;
  presence_penalty?: number;
}

interface DeepSeekChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message?: {
      role: string;
      content: string;
    };
    delta?: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_cache_hit_tokens?: number;
    prompt_cache_miss_tokens?: number;
  };
}

interface DeepSeekError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

export class DeepSeekAdapter extends BaseAdapter {
  private rateLimiter: RateLimiter;
  private costTracker: CostTracker;
  private config: DeepSeekConfig;

  private static readonly MODELS = {
    'deepseek-chat': {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat',
      contextLength: 32768,
      inputCost: 0.14, // per 1M tokens
      outputCost: 0.28,
      description: 'DeepSeek general purpose chat model'
    },
    'deepseek-coder': {
      id: 'deepseek-coder',
      name: 'DeepSeek Coder',
      contextLength: 16384,
      inputCost: 0.14,
      outputCost: 0.28,
      description: 'Specialized coding assistant model'
    },
    'deepseek-reasoner': {
      id: 'deepseek-reasoner',
      name: 'DeepSeek Reasoner',
      contextLength: 65536,
      inputCost: 0.55,
      outputCost: 2.19,
      description: 'Advanced reasoning and problem-solving model'
    }
  };

  constructor(config: DeepSeekConfig) {
    super();
    this.config = {
      baseUrl: 'https://api.deepseek.com',
      timeout: 60000,
      maxRetries: 3,
      ...config
    };

    // DeepSeek rate limits: 500 requests per minute
    this.rateLimiter = new RateLimiter({
      requestsPerMinute: 450, // Conservative buffer
      requestsPerHour: 10000
    });

    this.costTracker = new CostTracker({
      provider: AIProvider.DEEPSEEK
    });
  }

  async chat(messages: ChatMessage[], options: any = {}): Promise<ChatResponse> {
    await this.rateLimiter.waitForAvailability();

    const model = options.model || 'deepseek-chat';
    const modelInfo = DeepSeekAdapter.MODELS[model as keyof typeof DeepSeekAdapter.MODELS];

    if (!modelInfo) {
      throw new ProviderError(
        `Unsupported DeepSeek model: ${model}`,
        ProviderErrorType.INVALID_REQUEST,
        { availableModels: Object.keys(DeepSeekAdapter.MODELS) }
      );
    }

    const request: DeepSeekChatRequest = {
      model,
      messages: messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      })),
      temperature: options.temperature ?? 1.0,
      top_p: options.top_p ?? 1.0,
      max_tokens: Math.min(options.max_tokens ?? 8192, modelInfo.contextLength),
      stop: options.stop,
      stream: false,
      frequency_penalty: options.frequency_penalty ?? 0,
      presence_penalty: options.presence_penalty ?? 0
    };

    const chatFunction = async (): Promise<ChatResponse> => {
      try {
        const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
            'User-Agent': 'Omnipanel/1.0'
          },
          body: JSON.stringify(request),
          signal: AbortSignal.timeout(this.config.timeout!)
        });

        if (!response.ok) {
          let errorMessage = `DeepSeek API error: ${response.status} ${response.statusText}`;
          let errorType = response.status >= 500 ? ProviderErrorType.API_ERROR : ProviderErrorType.INVALID_REQUEST;

          try {
            const errorData: DeepSeekError = await response.json();
            errorMessage = errorData.error?.message || errorMessage;
            
            if (response.status === 401) {
              errorType = ProviderErrorType.AUTHENTICATION_ERROR;
            } else if (response.status === 429) {
              errorType = ProviderErrorType.RATE_LIMIT_ERROR;
            } else if (response.status === 400) {
              errorType = ProviderErrorType.INVALID_REQUEST;
            }
          } catch {
            // Use default error message if JSON parsing fails
          }

          throw new ProviderError(errorMessage, errorType, { status: response.status });
        }

        const data: DeepSeekChatResponse = await response.json();

        if (!data.choices?.[0]?.message?.content) {
          throw new ProviderError(
            'Invalid response format from DeepSeek',
            ProviderErrorType.INVALID_RESPONSE,
            { response: data }
          );
        }

        const usage: TokenUsage = {
          inputTokens: data.usage?.prompt_tokens ?? 0,
          outputTokens: data.usage?.completion_tokens ?? 0,
          totalTokens: data.usage?.total_tokens ?? 0,
          cacheTokensRead: data.usage?.prompt_cache_hit_tokens ?? 0,
          cacheTokensWrite: data.usage?.prompt_cache_miss_tokens ?? 0
        };

        const cost = this.calculateCost(usage, modelInfo);
        await this.costTracker.trackUsage(usage, cost);

        return {
          content: data.choices[0].message.content,
          role: 'assistant',
          usage,
          model: data.model,
          finishReason: normalizeFinishReason(data.choices[0].finish_reason || 'stop'),
          id: data.id,
          created: new Date(data.created * 1000),
          cost
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
              'Network error connecting to DeepSeek',
              ProviderErrorType.NETWORK_ERROR
            );
          }
        }

        throw new ProviderError(
          'Unexpected error in DeepSeek chat',
          ProviderErrorType.UNKNOWN_ERROR,
          { error: error instanceof Error ? error.message : String(error) }
        );
      }
    };

    return createRetryWrapper(chatFunction, this.config.maxRetries!);
  }

  async *streamChat(messages: ChatMessage[], options: any = {}): AsyncGenerator<StreamingChatResponse> {
    await this.rateLimiter.waitForAvailability();

    const model = options.model || 'deepseek-chat';
    const modelInfo = DeepSeekAdapter.MODELS[model as keyof typeof DeepSeekAdapter.MODELS];

    if (!modelInfo) {
      throw new ProviderError(
        `Unsupported DeepSeek model: ${model}`,
        ProviderErrorType.INVALID_REQUEST,
        { availableModels: Object.keys(DeepSeekAdapter.MODELS) }
      );
    }

    const request: DeepSeekChatRequest = {
      model,
      messages: messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      })),
      temperature: options.temperature ?? 1.0,
      top_p: options.top_p ?? 1.0,
      max_tokens: Math.min(options.max_tokens ?? 8192, modelInfo.contextLength),
      stop: options.stop,
      stream: true,
      frequency_penalty: options.frequency_penalty ?? 0,
      presence_penalty: options.presence_penalty ?? 0
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Accept': 'text/event-stream',
          'User-Agent': 'Omnipanel/1.0'
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        let errorMessage = `DeepSeek streaming error: ${response.status} ${response.statusText}`;
        
        try {
          const errorData: DeepSeekError = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch {
          // Use default error message
        }

        throw new ProviderError(
          errorMessage,
          response.status >= 500 ? ProviderErrorType.API_ERROR : ProviderErrorType.INVALID_REQUEST,
          { status: response.status }
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
      let buffer = '';
      let totalUsage: TokenUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

            const data = trimmedLine.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed: DeepSeekChatResponse = JSON.parse(data);
              const choice = parsed.choices?.[0];

              if (choice?.delta?.content) {
                yield {
                  content: choice.delta.content,
                  role: 'assistant',
                  delta: true,
                  model: parsed.model,
                  id: parsed.id,
                  created: new Date(parsed.created * 1000)
                };
              }

              if (parsed.usage) {
                totalUsage = {
                  inputTokens: parsed.usage.prompt_tokens,
                  outputTokens: parsed.usage.completion_tokens,
                  totalTokens: parsed.usage.total_tokens,
                  cacheTokensRead: parsed.usage.prompt_cache_hit_tokens ?? 0,
                  cacheTokensWrite: parsed.usage.prompt_cache_miss_tokens ?? 0
                };
              }

              if (choice?.finish_reason) {
                const cost = this.calculateCost(totalUsage, modelInfo);
                await this.costTracker.trackUsage(totalUsage, cost);
                
                yield {
                  content: '',
                  role: 'assistant',
                  delta: false,
                  finishReason: normalizeFinishReason(choice.finish_reason),
                  usage: totalUsage,
                  model: parsed.model,
                  id: parsed.id,
                  created: new Date(parsed.created * 1000),
                  cost
                };
              }
            } catch (parseError) {
              console.warn('Failed to parse DeepSeek streaming response:', parseError);
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
            ProviderErrorType.NETWORK_ERROR
          );
        }
      }

      throw new ProviderError(
        'Unexpected error in DeepSeek streaming',
        ProviderErrorType.UNKNOWN_ERROR,
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    return Object.values(DeepSeekAdapter.MODELS).map(model => ({
      id: model.id,
      name: model.name,
      provider: AIProvider.DEEPSEEK,
      contextLength: model.contextLength,
      context_length: model.contextLength,
      supports_streaming: true,
      supports_functions: false,
      inputCost: model.inputCost,
      outputCost: model.outputCost,
      description: model.description,
      capabilities: ['chat', 'completion', 'reasoning'],
      metadata: {
        type: model.id.includes('coder') ? 'code' : model.id.includes('reasoner') ? 'reasoning' : 'chat',
        vendor: 'DeepSeek'
      }
    }));
  }

  async validateConfig(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'User-Agent': 'Omnipanel/1.0'
        },
        signal: AbortSignal.timeout(10000)
      });

      if (response.status === 401) {
        throw new ProviderError(
          'Invalid DeepSeek API key',
          ProviderErrorType.AUTHENTICATION_ERROR
        );
      }

      return response.ok;
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }

      throw new ProviderError(
        'Failed to validate DeepSeek configuration',
        ProviderErrorType.NETWORK_ERROR,
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  async countTokens(text: string): Promise<number> {
    // DeepSeek uses OpenAI-compatible tokenization
    // Approximate: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  private calculateCost(usage: TokenUsage, modelInfo: any): number {
    const inputCost = (usage.inputTokens / 1000000) * modelInfo.inputCost;
    const outputCost = (usage.outputTokens / 1000000) * modelInfo.outputCost;
    return inputCost + outputCost;
  }

  getUsageStats() {
    return this.costTracker.getStats();
  }

  resetUsageStats() {
    this.costTracker.reset();
  }
}