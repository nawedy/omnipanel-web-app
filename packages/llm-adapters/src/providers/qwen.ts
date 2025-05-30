// packages/llm-adapters/src/providers/qwen.ts

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
  createTokenUsage,
  ChatFinishReason
} from '@omnipanel/types';
import { BaseAdapter } from '../base/adapter';
import { createRetryWrapper } from '../utils/retry';
import { RateLimiter } from '../utils/rateLimiter';
import { CostTracker } from '../utils/costTracker';

export interface QwenConfig extends AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
  region?: 'cn-beijing' | 'ap-southeast-1' | 'us-east-1';
  timeout?: number;
  maxRetries?: number;
}

interface QwenChatRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
  stop?: string[];
  stream?: boolean;
  seed?: number;
  repetition_penalty?: number;
  enable_search?: boolean;
  incremental_output?: boolean;
}

interface QwenChatResponse {
  id?: string;
  object?: string;
  created?: number;
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
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  output?: {
    text: string;
    finish_reason: string;
  };
}

interface QwenError {
  error: {
    code: string;
    message: string;
    type?: string;
  };
  request_id?: string;
}

export class QwenAdapter extends BaseAdapter {
  private rateLimiter: RateLimiter;
  private costTracker: CostTracker;
  private config: QwenConfig;

  private static readonly MODELS = {
    'qwen-turbo': {
      id: 'qwen-turbo',
      name: 'Qwen Turbo',
      contextLength: 8192,
      inputCost: 0.3, // per 1M tokens (estimated)
      outputCost: 0.6,
      description: 'Fast and efficient Qwen model for general tasks'
    },
    'qwen-plus': {
      id: 'qwen-plus',
      name: 'Qwen Plus',
      contextLength: 32768,
      inputCost: 0.8,
      outputCost: 2.0,
      description: 'Enhanced Qwen model with better reasoning capabilities'
    },
    'qwen-max': {
      id: 'qwen-max',
      name: 'Qwen Max',
      contextLength: 8192,
      inputCost: 2.0,
      outputCost: 6.0,
      description: 'Most capable Qwen model for complex tasks'
    },
    'qwen-max-longcontext': {
      id: 'qwen-max-longcontext',
      name: 'Qwen Max Long Context',
      contextLength: 30000,
      inputCost: 2.0,
      outputCost: 6.0,
      description: 'Qwen Max with extended context window'
    },
    'qwen2-72b-instruct': {
      id: 'qwen2-72b-instruct',
      name: 'Qwen2 72B Instruct',
      contextLength: 131072,
      inputCost: 0.35,
      outputCost: 0.7,
      description: 'Large open-source Qwen2 model with instruction tuning'
    },
    'qwen2-7b-instruct': {
      id: 'qwen2-7b-instruct',
      name: 'Qwen2 7B Instruct',
      contextLength: 131072,
      inputCost: 0.07,
      outputCost: 0.14,
      description: 'Efficient Qwen2 model with instruction tuning'
    }
  };

  private static readonly REGION_ENDPOINTS = {
    'cn-beijing': 'https://dashscope.aliyuncs.com',
    'ap-southeast-1': 'https://dashscope-intl.aliyuncs.com',
    'us-east-1': 'https://dashscope-us.aliyuncs.com'
  };

  constructor(config: QwenConfig) {
    super();
    this.config = {
      region: 'ap-southeast-1',
      timeout: 60000,
      maxRetries: 3,
      ...config
    };

    // Set base URL based on region
    if (!this.config.baseUrl) {
      this.config.baseUrl = QwenAdapter.REGION_ENDPOINTS[this.config.region!];
    }

    // Qwen/DashScope rate limits vary by region and tier
    this.rateLimiter = new RateLimiter({
      requestsPerMinute: 100,
      requestsPerHour: 1000
    });

    this.costTracker = new CostTracker({
      provider: AIProvider.QWEN
    });
  }

  async chat(messages: ChatMessage[], options: any = {}): Promise<ChatResponse> {
    await this.rateLimiter.waitForAvailability();

    const model = options.model || 'qwen-turbo';
    const modelInfo = QwenAdapter.MODELS[model as keyof typeof QwenAdapter.MODELS];

    if (!modelInfo) {
      throw new ProviderError(
        `Unsupported Qwen model: ${model}`,
        ProviderErrorType.INVALID_REQUEST,
        { availableModels: Object.keys(QwenAdapter.MODELS) }
      );
    }

    const request: QwenChatRequest = {
      model,
      messages: messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      })),
      temperature: options.temperature ?? 0.8,
      top_p: options.top_p ?? 0.8,
      top_k: options.top_k,
      max_tokens: Math.min(options.max_tokens ?? 2048, modelInfo.contextLength),
      stop: options.stop,
      stream: false,
      seed: options.seed,
      repetition_penalty: options.repetition_penalty ?? 1.05,
      enable_search: options.enable_search ?? false,
      incremental_output: options.incremental_output ?? false
    };

    const chatFunction = async (): Promise<ChatResponse> => {
      try {
        const response = await fetch(`${this.config.baseUrl}/api/v1/services/aigc/text-generation/generation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
            'X-DashScope-SSE': 'disable',
            'User-Agent': 'Omnipanel/1.0'
          },
          body: JSON.stringify({
            model: request.model,
            input: {
              messages: request.messages
            },
            parameters: {
              temperature: request.temperature,
              top_p: request.top_p,
              top_k: request.top_k,
              max_tokens: request.max_tokens,
              stop: request.stop,
              seed: request.seed,
              repetition_penalty: request.repetition_penalty,
              enable_search: request.enable_search,
              incremental_output: request.incremental_output
            }
          }),
          signal: AbortSignal.timeout(this.config.timeout!)
        });

        if (!response.ok) {
          let errorMessage = `Qwen API error: ${response.status} ${response.statusText}`;
          let errorType = response.status >= 500 ? ProviderErrorType.API_ERROR : ProviderErrorType.INVALID_REQUEST;

          try {
            const errorData: QwenError = await response.json();
            errorMessage = errorData.error?.message || errorMessage;
            
            if (response.status === 401 || response.status === 403) {
              errorType = ProviderErrorType.AUTHENTICATION_ERROR;
            } else if (response.status === 429) {
              errorType = ProviderErrorType.RATE_LIMIT_ERROR;
            } else if (response.status === 400) {
              errorType = ProviderErrorType.INVALID_REQUEST;
            }
          } catch {
            // Use default error message if JSON parsing fails
          }

          throw new ProviderError(errorMessage, errorType, { 
            status: response.status,
            region: this.config.region 
          });
        }

        const data: QwenChatResponse = await response.json();

        // Qwen API has different response formats
        let content = '';
        if (data.output?.text) {
          content = data.output.text;
        } else if (data.choices?.[0]?.message?.content) {
          content = data.choices[0].message.content;
        }

        if (!content) {
          throw new ProviderError(
            'Invalid response format from Qwen',
            ProviderErrorType.INVALID_RESPONSE,
            { response: data }
          );
        }

        const usage: TokenUsage = createTokenUsage(
          data.usage?.input_tokens ?? 0,
          data.usage?.output_tokens ?? 0
        );

        const cost = this.calculateCost(usage, modelInfo);
        await this.costTracker.trackUsage(usage, cost);

        return {
          content,
          role: 'assistant',
          usage,
          model: data.model || model,
          finish_reason: (data.output?.finish_reason || data.choices?.[0]?.finish_reason || 'stop') as ChatFinishReason,
          id: data.id || `qwen-${Date.now()}`,
          created: data.created ? new Date(data.created * 1000) : new Date(),
          created_at: data.created ? new Date(data.created * 1000).toISOString() : new Date().toISOString()
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
              'Network error connecting to Qwen',
              ProviderErrorType.NETWORK_ERROR,
              { region: this.config.region }
            );
          }
        }

        throw new ProviderError(
          'Unexpected error in Qwen chat',
          ProviderErrorType.UNKNOWN_ERROR,
          { error: error instanceof Error ? error.message : String(error) }
        );
      }
    };

    return createRetryWrapper(chatFunction, this.config.maxRetries!);
  }

  async *streamChat(messages: ChatMessage[], options: any = {}): AsyncGenerator<StreamingChatResponse> {
    await this.rateLimiter.waitForAvailability();

    const model = options.model || 'qwen-turbo';
    const modelInfo = QwenAdapter.MODELS[model as keyof typeof QwenAdapter.MODELS];

    if (!modelInfo) {
      throw new ProviderError(
        `Unsupported Qwen model: ${model}`,
        ProviderErrorType.INVALID_REQUEST,
        { availableModels: Object.keys(QwenAdapter.MODELS) }
      );
    }

    const request: QwenChatRequest = {
      model,
      messages: messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      })),
      temperature: options.temperature ?? 0.8,
      top_p: options.top_p ?? 0.8,
      top_k: options.top_k,
      max_tokens: Math.min(options.max_tokens ?? 2048, modelInfo.contextLength),
      stop: options.stop,
      stream: true,
      seed: options.seed,
      repetition_penalty: options.repetition_penalty ?? 1.05,
      enable_search: options.enable_search ?? false,
      incremental_output: true
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/services/aigc/text-generation/generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-DashScope-SSE': 'enable',
          'Accept': 'text/event-stream',
          'User-Agent': 'Omnipanel/1.0'
        },
        body: JSON.stringify({
          model: request.model,
          input: {
            messages: request.messages
          },
          parameters: {
            temperature: request.temperature,
            top_p: request.top_p,
            top_k: request.top_k,
            max_tokens: request.max_tokens,
            stop: request.stop,
            seed: request.seed,
            repetition_penalty: request.repetition_penalty,
            enable_search: request.enable_search,
            incremental_output: request.incremental_output
          }
        }),
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        let errorMessage = `Qwen streaming error: ${response.status} ${response.statusText}`;
        
        try {
          const errorData: QwenError = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch {
          // Use default error message
        }

        throw new ProviderError(
          errorMessage,
          response.status >= 500 ? ProviderErrorType.API_ERROR : ProviderErrorType.INVALID_REQUEST,
          { status: response.status, region: this.config.region }
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
      let totalUsage: TokenUsage = createTokenUsage(0, 0);
      let fullContent = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            // Handle different SSE formats
            let data = '';
            if (trimmedLine.startsWith('data:')) {
              data = trimmedLine.slice(5).trim();
            } else if (trimmedLine.startsWith('data: ')) {
              data = trimmedLine.slice(6);
            } else {
              continue;
            }

            if (data === '[DONE]' || data === 'data: [DONE]') continue;

            try {
              const parsed: QwenChatResponse = JSON.parse(data);
              
              // Handle incremental content
              if (parsed.output?.text) {
                const newContent = parsed.output.text;
                const deltaContent = newContent.slice(fullContent.length);
                fullContent = newContent;

                if (deltaContent) {
                  yield {
                    content: deltaContent,
                    role: 'assistant',
                    delta: true,
                    model: parsed.model || model,
                    id: parsed.id || `qwen-${Date.now()}`,
                    created: parsed.created ? parsed.created * 1000 : Date.now()
                  };
                }

                if (parsed.output.finish_reason && parsed.output.finish_reason !== 'null') {
                  if (parsed.usage) {
                    totalUsage = createTokenUsage(
                      parsed.usage.input_tokens,
                      parsed.usage.output_tokens
                    );
                  }

                  const cost = this.calculateCost(totalUsage, modelInfo);
                  await this.costTracker.trackUsage(totalUsage, cost);
                  
                  yield {
                    content: '',
                    role: 'assistant',
                    delta: false,
                    finish_reason: parsed.output.finish_reason as ChatFinishReason,
                    usage: totalUsage,
                    model: parsed.model || model,
                    id: parsed.id || `qwen-${Date.now()}`,
                    created: parsed.created ? parsed.created * 1000 : Date.now()
                  };
                  break;
                }
              }
              
              // Handle OpenAI-compatible format
              else if (parsed.choices?.[0]?.delta?.content) {
                yield {
                  content: parsed.choices[0].delta.content,
                  role: 'assistant',
                  delta: true,
                  model: parsed.model || model,
                  id: parsed.id || `qwen-${Date.now()}`,
                  created: parsed.created ? parsed.created * 1000 : Date.now()
                };
              }

              if (parsed.usage) {
                totalUsage = createTokenUsage(
                  parsed.usage.input_tokens,
                  parsed.usage.output_tokens
                );
              }

              const choice = parsed.choices?.[0];
              if (choice?.finish_reason) {
                const cost = this.calculateCost(totalUsage, modelInfo);
                await this.costTracker.trackUsage(totalUsage, cost);
                
                yield {
                  content: '',
                  role: 'assistant',
                  delta: false,
                  finish_reason: choice.finish_reason as ChatFinishReason,
                  usage: totalUsage,
                  model: parsed.model || model,
                  id: parsed.id || `qwen-${Date.now()}`,
                  created: parsed.created ? parsed.created * 1000 : Date.now()
                };
              }
            } catch (parseError) {
              console.warn('Failed to parse Qwen streaming response:', parseError);
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
            { region: this.config.region }
          );
        }
      }

      throw new ProviderError(
        'Unexpected error in Qwen streaming',
        ProviderErrorType.UNKNOWN_ERROR,
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    return Object.values(QwenAdapter.MODELS).map(model => ({
      id: model.id,
      name: model.name,
      provider: AIProvider.QWEN,
      context_length: model.contextLength,
      supports_streaming: true,
      supports_functions: false,
      cost_per_token: {
        input: model.inputCost,
        output: model.outputCost,
        currency: 'USD'
      },
      capabilities: ['chat', 'completion', 'multilingual']
    }));
  }

  async validateConfig(): Promise<boolean> {
    try {
      // Test with a minimal request
      const response = await fetch(`${this.config.baseUrl}/api/v1/services/aigc/text-generation/generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'User-Agent': 'Omnipanel/1.0'
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          input: {
            messages: [
              { role: 'user', content: 'Hi' }
            ]
          },
          parameters: {
            max_tokens: 1
          }
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (response.status === 401 || response.status === 403) {
        throw new ProviderError(
          'Invalid Qwen API key or insufficient permissions',
          ProviderErrorType.AUTHENTICATION_ERROR,
          { region: this.config.region }
        );
      }

      // Accept both success and some error responses as "valid config"
      // since we're just testing authentication
      return response.status < 500;
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }

      throw new ProviderError(
        'Failed to validate Qwen configuration',
        ProviderErrorType.NETWORK_ERROR,
        { 
          region: this.config.region,
          error: error instanceof Error ? error.message : String(error) 
        }
      );
    }
  }

  async countTokens(text: string): Promise<number> {
    // Qwen uses a similar tokenization approach to other models
    // Approximate: 1 token ≈ 3-4 characters for mixed language text
    return Math.ceil(text.length / 3.5);
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