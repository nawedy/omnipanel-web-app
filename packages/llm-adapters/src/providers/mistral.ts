// packages/llm-adapters/src/providers/mistral.ts

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
  createTokenUsageFromNew,
  ChatFinishReason
} from '@omnipanel/types';
import { BaseAdapter } from '../base/adapter';
import { createRetryWrapper } from '../utils/retry';
import { RateLimiter } from '../utils/rateLimiter';
import { CostTracker } from '../utils/costTracker';

export interface MistralConfig extends AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

interface MistralTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

interface MistralChatRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    tool_calls?: Array<{
      id: string;
      type: 'function';
      function: {
        name: string;
        arguments: string;
      };
    }>;
    tool_call_id?: string;
  }>;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stop?: string[];
  stream?: boolean;
  tools?: MistralTool[];
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  safe_prompt?: boolean;
  random_seed?: number;
}

interface MistralChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message?: {
      role: string;
      content: string;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    delta?: {
      role?: string;
      content?: string;
      tool_calls?: Array<{
        index: number;
        id?: string;
        type?: 'function';
        function?: {
          name?: string;
          arguments?: string;
        };
      }>;
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface MistralError {
  message: string;
  type: string;
  param?: string;
  code?: string;
}

export class MistralAdapter extends BaseAdapter {
  private rateLimiter: RateLimiter;
  private costTracker: CostTracker;
  private config: MistralConfig;

  private static readonly MODELS = {
    'mistral-tiny': {
      id: 'mistral-tiny',
      name: 'Mistral Tiny',
      contextLength: 8192,
      inputCost: 0.25, // per 1M tokens
      outputCost: 0.25,
      description: 'Fast and efficient model for simple tasks'
    },
    'mistral-small': {
      id: 'mistral-small',
      name: 'Mistral Small',
      contextLength: 8192,
      inputCost: 2.0,
      outputCost: 6.0,
      description: 'Balanced model for most use cases'
    },
    'mistral-medium': {
      id: 'mistral-medium',
      name: 'Mistral Medium',
      contextLength: 8192,
      inputCost: 2.7,
      outputCost: 8.1,
      description: 'Advanced model for complex tasks'
    },
    'mistral-large-latest': {
      id: 'mistral-large-latest',
      name: 'Mistral Large',
      contextLength: 32768,
      inputCost: 8.0,
      outputCost: 24.0,
      description: 'Most capable model with function calling'
    },
    'mixtral-8x7b-instruct': {
      id: 'mixtral-8x7b-instruct',
      name: 'Mixtral 8x7B Instruct',
      contextLength: 32768,
      inputCost: 0.7,
      outputCost: 0.7,
      description: 'Mixture of experts model for diverse tasks'
    },
    'mixtral-8x22b-instruct': {
      id: 'mixtral-8x22b-instruct',
      name: 'Mixtral 8x22B Instruct',
      contextLength: 65536,
      inputCost: 2.0,
      outputCost: 6.0,
      description: 'Large mixture of experts model with extended context'
    }
  };

  constructor(config: MistralConfig) {
    super();
    this.config = {
      baseUrl: 'https://api.mistral.ai',
      timeout: 60000,
      maxRetries: 3,
      ...config
    };

    // Mistral rate limits: varies by tier, conservative default
    this.rateLimiter = new RateLimiter({
      requestsPerMinute: 100,
      requestsPerHour: 1000
    });

    this.costTracker = new CostTracker({
      provider: AIProvider.MISTRAL
    });
  }

  async chat(messages: ChatMessage[], options: any = {}): Promise<ChatResponse> {
    await this.rateLimiter.waitForAvailability();

    const model = options.model || 'mistral-small';
    const modelInfo = MistralAdapter.MODELS[model as keyof typeof MistralAdapter.MODELS];

    if (!modelInfo) {
      throw new ProviderError(
        `Unsupported Mistral model: ${model}`,
        ProviderErrorType.INVALID_REQUEST,
        { availableModels: Object.keys(MistralAdapter.MODELS) }
      );
    }

    const request: MistralChatRequest = {
      model,
      messages: messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      })),
      temperature: options.temperature ?? 0.7,
      top_p: options.top_p ?? 1.0,
      max_tokens: Math.min(options.max_tokens ?? 4096, modelInfo.contextLength),
      stop: options.stop,
      stream: false,
      tools: options.tools,
      tool_choice: options.tool_choice,
      safe_prompt: options.safe_prompt ?? true,
      random_seed: options.random_seed
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
          let errorMessage = `Mistral API error: ${response.status} ${response.statusText}`;
          let errorType = response.status >= 500 ? ProviderErrorType.API_ERROR : ProviderErrorType.INVALID_REQUEST;

          try {
            const errorData: { error: MistralError } = await response.json();
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

        const data: MistralChatResponse = await response.json();

        if (!data.choices?.[0]?.message) {
          throw new ProviderError(
            'Invalid response format from Mistral',
            ProviderErrorType.INVALID_RESPONSE,
            { response: data }
          );
        }

        const choice = data.choices[0];
        const usage: TokenUsage = createTokenUsageFromNew(
          data.usage?.prompt_tokens ?? 0,
          data.usage?.completion_tokens ?? 0,
          data.usage?.total_tokens
        );

        const cost = this.calculateCost(usage, modelInfo);
        await this.costTracker.trackUsage(usage, cost);

        return {
          content: choice.message!.content || '',
          role: 'assistant',
          usage,
          model: data.model,
          finish_reason: (choice.finish_reason || 'stop') as ChatFinishReason,
          id: data.id,
          created: new Date(data.created * 1000),
          created_at: new Date(data.created * 1000).toISOString()
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
              'Network error connecting to Mistral',
              ProviderErrorType.NETWORK_ERROR
            );
          }
        }

        throw new ProviderError(
          'Unexpected error in Mistral chat',
          ProviderErrorType.UNKNOWN_ERROR,
          { error: error instanceof Error ? error.message : String(error) }
        );
      }
    };

    return createRetryWrapper(chatFunction, this.config.maxRetries!);
  }

  async *streamChat(messages: ChatMessage[], options: any = {}): AsyncGenerator<StreamingChatResponse> {
    await this.rateLimiter.waitForAvailability();

    const model = options.model || 'mistral-small';
    const modelInfo = MistralAdapter.MODELS[model as keyof typeof MistralAdapter.MODELS];

    if (!modelInfo) {
      throw new ProviderError(
        `Unsupported Mistral model: ${model}`,
        ProviderErrorType.INVALID_REQUEST,
        { availableModels: Object.keys(MistralAdapter.MODELS) }
      );
    }

    const request: MistralChatRequest = {
      model,
      messages: messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      })),
      temperature: options.temperature ?? 0.7,
      top_p: options.top_p ?? 1.0,
      max_tokens: Math.min(options.max_tokens ?? 4096, modelInfo.contextLength),
      stop: options.stop,
      stream: true,
      tools: options.tools,
      tool_choice: options.tool_choice,
      safe_prompt: options.safe_prompt ?? true,
      random_seed: options.random_seed
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
        let errorMessage = `Mistral streaming error: ${response.status} ${response.statusText}`;
        
        try {
          const errorData: { error: MistralError } = await response.json();
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
      let totalUsage: TokenUsage = createTokenUsageFromNew(0, 0, 0);

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
              const parsed: MistralChatResponse = JSON.parse(data);
              const choice = parsed.choices?.[0];

              if (choice?.delta?.content) {
                yield {
                  content: choice.delta.content || '',
                  role: 'assistant',
                  delta: true,
                  model: parsed.model,
                  id: parsed.id,
                  created: new Date(parsed.created * 1000)
                };
              }

              if (choice?.delta?.tool_calls) {
                yield {
                  content: '',
                  role: 'assistant',
                  delta: true,
                  model: parsed.model,
                  id: parsed.id,
                  created: new Date(parsed.created * 1000)
                };
              }

              if (parsed.usage) {
                totalUsage = createTokenUsageFromNew(
                  parsed.usage.prompt_tokens,
                  parsed.usage.completion_tokens,
                  parsed.usage.total_tokens
                );
              }

              if (choice?.finish_reason) {
                const cost = this.calculateCost(totalUsage, modelInfo);
                await this.costTracker.trackUsage(totalUsage, cost);
                
                yield {
                  content: '',
                  role: 'assistant',
                  delta: false,
                  finish_reason: choice.finish_reason as ChatFinishReason,
                  usage: totalUsage,
                  model: parsed.model,
                  id: parsed.id,
                  created: new Date(parsed.created * 1000)
                };
              }
            } catch (parseError) {
              console.warn('Failed to parse Mistral streaming response:', parseError);
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
        'Unexpected error in Mistral streaming',
        ProviderErrorType.UNKNOWN_ERROR,
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    return Object.values(MistralAdapter.MODELS).map(model => ({
      id: model.id,
      name: model.name,
      provider: AIProvider.MISTRAL,
      context_length: model.contextLength,
      supports_streaming: true,
      supports_functions: true,
      cost_per_token: {
        input: model.inputCost,
        output: model.outputCost,
        currency: 'USD'
      },
      capabilities: ['chat', 'completion', 'tools']
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
          'Invalid Mistral API key',
          ProviderErrorType.AUTHENTICATION_ERROR
        );
      }

      return response.ok;
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }

      throw new ProviderError(
        'Failed to validate Mistral configuration',
        ProviderErrorType.NETWORK_ERROR,
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  async countTokens(text: string): Promise<number> {
    // Mistral uses similar tokenization to OpenAI
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