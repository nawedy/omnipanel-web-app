// packages/llm-adapters/src/providers/llamacpp.ts

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
  ChatFinishReason,
  normalizeFinishReason
} from '@omnipanel/types';
import { BaseLLMAdapter, type LLMAdapterConfig, type StreamingOptions } from '@/base/adapter';

export interface LlamaCppConfig extends LLMAdapterConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  maxRetries?: number;
  model?: string;
}

interface LlamaCppChatRequest {
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
  repeat_penalty?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
}

interface LlamaCppChatResponse {
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
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface LlamaCppModelInfo {
  model: string;
  context_length?: number;
  type?: string;
  quantization?: string;
  size?: string;
}

interface LlamaCppHealthResponse {
  status: string;
  slots_idle: number;
  slots_processing: number;
  default_generation_settings?: Record<string, any>;
}

interface LlamaCppTokenizeRequest {
  content: string;
}

interface LlamaCppTokenizeResponse {
  tokens: number[];
  token_count: number;
}

export class LlamaCppAdapter extends BaseLLMAdapter {
  private config: LlamaCppConfig;

  constructor(config: LlamaCppConfig) {
    super();
    this.config = {
      timeout: 30000,
      maxRetries: 3,
      model: 'default',
      ...config
    };
  }

  async chat(messages: ChatMessage[], options: any = {}): Promise<ChatResponse> {
    const request: LlamaCppChatRequest = {
      messages: messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      })),
      temperature: options.temperature ?? 0.7,
      top_p: options.top_p ?? 0.9,
      top_k: options.top_k ?? 40,
      max_tokens: options.max_tokens ?? 2048,
      stop: options.stop,
      stream: false,
      seed: options.seed,
      repeat_penalty: options.repeat_penalty ?? 1.1,
      presence_penalty: options.presence_penalty,
      frequency_penalty: options.frequency_penalty
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ProviderError(
          `LlamaCpp API error: ${response.status} ${response.statusText}`,
          response.status >= 500 ? ProviderErrorType.API_ERROR : ProviderErrorType.INVALID_REQUEST,
          { status: response.status, response: errorText }
        );
      }

      const data: LlamaCppChatResponse = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        throw new ProviderError(
          'Invalid response format from LlamaCpp',
          ProviderErrorType.INVALID_RESPONSE,
          { response: data }
        );
      }

      const usage: TokenUsage = createTokenUsage(
        data.usage?.prompt_tokens ?? 0,
        data.usage?.completion_tokens ?? 0,
        data.usage?.total_tokens ?? 0
      );

      return {
        content: data.choices[0].message.content,
        role: 'assistant',
        usage,
        model: data.model || this.config.model!,
        finishReason: normalizeFinishReason(data.choices[0].finish_reason || 'stop'),
        id: data.id || `llamacpp-${Date.now()}`,
        created: data.created ? new Date(data.created * 1000) : new Date()
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
            'Network error connecting to LlamaCpp server',
            ProviderErrorType.NETWORK_ERROR,
            { baseUrl: this.config.baseUrl }
          );
        }
      }

      throw new ProviderError(
        'Unexpected error in LlamaCpp chat',
        ProviderErrorType.UNKNOWN_ERROR,
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  async *streamChat(messages: ChatMessage[], options: any = {}): AsyncGenerator<StreamingChatResponse> {
    const request: LlamaCppChatRequest = {
      messages: messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      })),
      temperature: options.temperature ?? 0.7,
      top_p: options.top_p ?? 0.9,
      top_k: options.top_k ?? 40,
      max_tokens: options.max_tokens ?? 2048,
      stop: options.stop,
      stream: true,
      seed: options.seed,
      repeat_penalty: options.repeat_penalty ?? 1.1,
      presence_penalty: options.presence_penalty,
      frequency_penalty: options.frequency_penalty
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ProviderError(
          `LlamaCpp streaming error: ${response.status} ${response.statusText}`,
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
      let buffer = '';
      let totalUsage: TokenUsage = createTokenUsage(0, 0, 0);

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
              const parsed: LlamaCppChatResponse = JSON.parse(data);
              const choice = parsed.choices?.[0];

              if (choice?.delta?.content) {
                yield {
                  content: choice.delta.content,
                  role: 'assistant',
                  delta: true,
                  model: parsed.model || this.config.model!,
                  id: parsed.id || `llamacpp-${Date.now()}`,
                  created: parsed.created ? new Date(parsed.created * 1000) : new Date()
                };
              }

              if (parsed.usage) {
                totalUsage = createTokenUsage(
                  parsed.usage.prompt_tokens,
                  parsed.usage.completion_tokens,
                  parsed.usage.total_tokens
                );
              }

              if (choice?.finish_reason) {
                yield {
                  content: '',
                  role: 'assistant',
                  delta: false,
                  finishReason: normalizeFinishReason(choice.finish_reason),
                  usage: totalUsage,
                  model: parsed.model || this.config.model!,
                  id: parsed.id || `llamacpp-${Date.now()}`,
                  created: parsed.created ? new Date(parsed.created * 1000) : new Date()
                };
              }
            } catch (parseError) {
              console.warn('Failed to parse LlamaCpp streaming response:', parseError);
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
        'Unexpected error in LlamaCpp streaming',
        ProviderErrorType.UNKNOWN_ERROR,
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const models = data.data || [];
      
      return models.map((modelInfo: any) => ({
        id: modelInfo.id || 'unknown',
        name: modelInfo.id || 'Unknown Model',
        provider: AIProvider.LLAMACPP,
        contextLength: modelInfo.context_length || 4096,
        context_length: modelInfo.context_length || 4096,
        supports_streaming: true,
        supports_functions: false,
        inputCost: 0,
        outputCost: 0,
        description: `LlamaCpp model: ${modelInfo.id}`,
        capabilities: ['chat', 'completion']
      }));
    } catch (error) {
      // Fallback to default model info
      return [{
        id: 'llamacpp-model',
        name: 'LlamaCpp Model',
        provider: AIProvider.LLAMACPP,
        contextLength: 4096,
        context_length: 4096,
        supports_streaming: true,
        supports_functions: false,
        inputCost: 0,
        outputCost: 0,
        description: 'Default LlamaCpp model',
        capabilities: ['chat', 'completion']
      }];
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      // Test with a minimal request to check if the server is accessible
      const response = await fetch(`${this.config.baseUrl}/v1/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        signal: AbortSignal.timeout(10000)
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async countTokens(text: string): Promise<number> {
    // Simple token estimation for LlamaCpp models
    // This is a rough approximation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  async testConnection(): Promise<boolean> {
    return this.validateConfig();
  }
}