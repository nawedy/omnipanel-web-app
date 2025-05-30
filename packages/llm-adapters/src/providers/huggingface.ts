// packages/llm-adapters/src/providers/huggingface.ts

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

export interface HuggingFaceConfig extends AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  model?: string;
}

interface HuggingFaceChatRequest {
  model?: string;
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

interface HuggingFaceChatResponse {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
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
  };
}

interface HuggingFaceError {
  error: {
    message: string;
    type?: string;
    code?: string;
  };
}

export class HuggingFaceAdapter extends BaseAdapter {
  private rateLimiter: RateLimiter;
  private costTracker: CostTracker;
  private config: HuggingFaceConfig;

  private static readonly POPULAR_MODELS = {
    'microsoft/DialoGPT-large': {
      id: 'microsoft/DialoGPT-large',
      name: 'DialoGPT Large',
      contextLength: 1024,
      inputCost: 0,
      outputCost: 0,
      description: 'Large conversational response generation model'
    },
    'meta-llama/Llama-2-7b-chat-hf': {
      id: 'meta-llama/Llama-2-7b-chat-hf',
      name: 'Llama 2 7B Chat',
      contextLength: 4096,
      inputCost: 0,
      outputCost: 0,
      description: 'Llama 2 7B model fine-tuned for chat'
    },
    'meta-llama/Llama-2-13b-chat-hf': {
      id: 'meta-llama/Llama-2-13b-chat-hf',
      name: 'Llama 2 13B Chat',
      contextLength: 4096,
      inputCost: 0,
      outputCost: 0,
      description: 'Llama 2 13B model fine-tuned for chat'
    },
    'mistralai/Mistral-7B-Instruct-v0.1': {
      id: 'mistralai/Mistral-7B-Instruct-v0.1',
      name: 'Mistral 7B Instruct',
      contextLength: 8192,
      inputCost: 0,
      outputCost: 0,
      description: 'Mistral 7B model fine-tuned for instructions'
    },
    'codellama/CodeLlama-7b-Instruct-hf': {
      id: 'codellama/CodeLlama-7b-Instruct-hf',
      name: 'Code Llama 7B Instruct',
      contextLength: 16384,
      inputCost: 0,
      outputCost: 0,
      description: 'Code Llama 7B model for code generation'
    }
  };

  constructor(config: HuggingFaceConfig) {
    super();
    this.config = {
      baseUrl: 'https://api-inference.huggingface.co',
      timeout: 60000,
      maxRetries: 3,
      model: 'microsoft/DialoGPT-large',
      ...config
    };

    // HuggingFace Inference API has rate limits
    this.rateLimiter = new RateLimiter({
      requestsPerMinute: 30,
      requestsPerHour: 1000
    });

    this.costTracker = new CostTracker({
      provider: AIProvider.HUGGINGFACE,
      inputTokenCost: 0, // Most HF models are free
      outputTokenCost: 0,
      trackingEnabled: true
    });
  }

  async chat(messages: ChatMessage[], options: any = {}): Promise<ChatResponse> {
    await this.rateLimiter.waitForAvailability();

    const model = options.model || this.config.model!;
    const modelInfo = HuggingFaceAdapter.POPULAR_MODELS[model as keyof typeof HuggingFaceAdapter.POPULAR_MODELS];

    // For HuggingFace, we often need to format the input differently
    const prompt = this.formatMessagesForHuggingFace(messages);

    const chatFunction = async (): Promise<ChatResponse> => {
      try {
        const response = await fetch(`${this.config.baseUrl}/models/${model}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
            'User-Agent': 'Omnipanel/1.0'
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              temperature: options.temperature ?? 0.7,
              top_p: options.top_p ?? 0.9,
              max_new_tokens: options.max_tokens ?? 512,
              do_sample: true,
              return_full_text: false,
              stop: options.stop
            },
            options: {
              wait_for_model: true,
              use_cache: false
            }
          }),
          signal: AbortSignal.timeout(this.config.timeout!)
        });

        if (!response.ok) {
          let errorMessage = `HuggingFace API error: ${response.status} ${response.statusText}`;
          let errorType = response.status >= 500 ? ProviderErrorType.API_ERROR : ProviderErrorType.INVALID_REQUEST;

          try {
            const errorData: HuggingFaceError = await response.json();
            errorMessage = errorData.error?.message || errorMessage;
            
            if (response.status === 401) {
              errorType = ProviderErrorType.AUTHENTICATION_ERROR;
            } else if (response.status === 429) {
              errorType = ProviderErrorType.RATE_LIMIT_ERROR;
            } else if (response.status === 503) {
              errorMessage = 'Model is currently loading. Please wait and try again.';
              errorType = ProviderErrorType.API_ERROR;
            }
          } catch {
            // Use default error message if JSON parsing fails
          }

          throw new ProviderError(errorMessage, errorType, { status: response.status });
        }

        const data = await response.json();

        // HuggingFace API returns different formats depending on the model
        let content = '';
        if (Array.isArray(data) && data[0]?.generated_text) {
          content = data[0].generated_text.trim();
        } else if (data.generated_text) {
          content = data.generated_text.trim();
        } else if (typeof data === 'string') {
          content = data.trim();
        }

        if (!content) {
          throw new ProviderError(
            'Invalid response format from HuggingFace',
            ProviderErrorType.INVALID_RESPONSE,
            { response: data }
          );
        }

        // Estimate token usage since HF doesn't provide it
        const usage: TokenUsage = {
          inputTokens: Math.ceil(prompt.length / 4),
          outputTokens: Math.ceil(content.length / 4),
          totalTokens: Math.ceil((prompt.length + content.length) / 4)
        };

        await this.costTracker.trackUsage(usage, 0); // Free for most models

        return {
          content,
          role: 'assistant',
          usage,
          model: model,
          finishReason: 'stop',
          id: `hf-${Date.now()}`,
          created: new Date(),
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
              'Network error connecting to HuggingFace',
              ProviderErrorType.NETWORK_ERROR
            );
          }
        }

        throw new ProviderError(
          'Unexpected error in HuggingFace chat',
          ProviderErrorType.UNKNOWN_ERROR,
          { error: error instanceof Error ? error.message : String(error) }
        );
      }
    };

    return createRetryWrapper(chatFunction, this.config.maxRetries!);
  }

  async *streamChat(messages: ChatMessage[], options: any = {}): AsyncGenerator<StreamingChatResponse> {
    // HuggingFace Inference API doesn't support streaming for most models
    // We'll simulate streaming by chunking the response
    const response = await this.chat(messages, options);
    
    const words = response.content.split(' ');
    const chunkSize = 3; // 3 words per chunk
    
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      
      yield {
        content: chunk + (i + chunkSize < words.length ? ' ' : ''),
        role: 'assistant',
        delta: true,
        model: response.model,
        id: response.id,
        created: response.created || new Date()
      };
      
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Final chunk with completion info
    yield {
      content: '',
      role: 'assistant',
      delta: false,
      finishReason: response.finishReason,
      usage: response.usage,
      model: response.model,
      id: response.id,
      created: response.created || new Date(),
      cost: response.cost
    };
  }

  async getModels(): Promise<ModelInfo[]> {
    return Object.values(HuggingFaceAdapter.POPULAR_MODELS).map(model => ({
      id: model.id,
      name: model.name,
      provider: AIProvider.HUGGINGFACE,
      contextLength: model.contextLength,
      context_length: model.contextLength,
      supports_streaming: true,
      supports_functions: false,
      inputCost: model.inputCost,
      outputCost: model.outputCost,
      description: model.description,
      capabilities: ['chat', 'completion'],
      metadata: {
        type: 'chat',
        vendor: 'Hugging Face'
      }
    }));
  }

  async validateConfig(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/models/microsoft/DialoGPT-medium`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Omnipanel/1.0'
        },
        body: JSON.stringify({
          inputs: 'Hello',
          parameters: { max_new_tokens: 1 }
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (response.status === 401) {
        throw new ProviderError(
          'Invalid HuggingFace API key',
          ProviderErrorType.AUTHENTICATION_ERROR
        );
      }

      // Accept various response codes as valid (including 503 for loading models)
      return response.status < 500 || response.status === 503;
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }

      throw new ProviderError(
        'Failed to validate HuggingFace configuration',
        ProviderErrorType.NETWORK_ERROR,
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  async countTokens(text: string): Promise<number> {
    // HuggingFace doesn't provide a tokenization API for all models
    // Use a simple estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  private formatMessagesForHuggingFace(messages: ChatMessage[]): string {
    // Convert chat messages to a single prompt string
    // This is a simplified approach - different HF models may need different formatting
    return messages
      .map(msg => {
        if (msg.role === 'system') {
          return `System: ${msg.content}`;
        } else if (msg.role === 'user') {
          return `Human: ${msg.content}`;
        } else {
          return `Assistant: ${msg.content}`;
        }
      })
      .join('\n') + '\nAssistant:';
  }

  getUsageStats() {
    return this.costTracker.getStats();
  }

  resetUsageStats() {
    this.costTracker.reset();
  }
}