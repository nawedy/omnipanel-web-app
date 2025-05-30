// packages/llm-adapters/src/base/adapter.ts

import {
  ChatMessage,
  ChatResponse,
  StreamingChatResponse,
  ModelInfo,
  AIProviderConfig,
  TokenUsage
} from '@omnipanel/types';

export interface LLMAdapterConfig extends AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  organization?: string;
  model?: string;
  region?: string;
}

export interface StreamingOptions {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
  stop?: string[];
  frequency_penalty?: number;
  presence_penalty?: number;
  seed?: number;
  tools?: any[];
  tool_choice?: any;
  stream?: boolean;
}

export abstract class BaseAdapter {
  /**
   * Send a chat message and get a complete response
   */
  abstract chat(messages: ChatMessage[], options?: StreamingOptions): Promise<ChatResponse>;

  /**
   * Send a chat message and get a streaming response
   */
  abstract streamChat(messages: ChatMessage[], options?: StreamingOptions): AsyncGenerator<StreamingChatResponse>;

  /**
   * Get available models for this provider
   */
  abstract getModels(): Promise<ModelInfo[]>;

  /**
   * Validate the provider configuration
   */
  abstract validateConfig(): Promise<boolean>;

  /**
   * Count tokens in a text string
   */
  abstract countTokens(text: string): Promise<number>;

  /**
   * Get usage statistics (if supported by provider)
   */
  getUsageStats?(): any;

  /**
   * Reset usage statistics (if supported by provider)
   */
  resetUsageStats?(): void;

  /**
   * Get provider-specific capabilities
   */
  getCapabilities(): string[] {
    return ['chat', 'completion'];
  }

  /**
   * Calculate estimated cost for a request (if supported)
   */
  estimateCost?(usage: TokenUsage): number;

  /**
   * Get provider health status
   */
  async getHealthStatus(): Promise<{ status: 'healthy' | 'unhealthy'; details?: string }> {
    try {
      const isValid = await this.validateConfig();
      return {
        status: isValid ? 'healthy' : 'unhealthy',
        details: isValid ? 'Provider is accessible' : 'Provider validation failed'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Helper method to format messages for different providers
   */
  protected formatMessages(messages: ChatMessage[]): ChatMessage[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      name: msg.name,
      tool_calls: msg.tool_calls,
      tool_call_id: msg.tool_call_id
    }));
  }

  /**
   * Helper method to merge streaming options with defaults
   */
  protected mergeOptions(options: StreamingOptions = {}, defaults: StreamingOptions = {}): StreamingOptions {
    return {
      temperature: 0.7,
      top_p: 1.0,
      max_tokens: 4096,
      ...defaults,
      ...options
    };
  }

  /**
   * Helper method to create a standard error response
   */
  protected createErrorResponse(error: string, model?: string): ChatResponse {
    return {
      content: `Error: ${error}`,
      role: 'assistant',
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      model: model || 'unknown',
      finishReason: 'error',
      id: `error-${Date.now()}`,
      created: new Date()
    };
  }

  /**
   * Helper method to validate message format
   */
  protected validateMessages(messages: ChatMessage[]): boolean {
    if (!Array.isArray(messages) || messages.length === 0) {
      return false;
    }

    return messages.every(msg => 
      msg && 
      typeof msg === 'object' && 
      typeof msg.role === 'string' && 
      typeof msg.content === 'string' &&
      ['system', 'user', 'assistant', 'tool'].includes(msg.role)
    );
  }

  /**
   * Helper method to clean up response content
   */
  protected cleanContent(content: string): string {
    if (typeof content !== 'string') {
      return '';
    }
    
    return content.trim();
  }

  /**
   * Helper method to create token usage object
   */
  protected createTokenUsage(input: number, output: number, total?: number): TokenUsage {
    return {
      inputTokens: input,
      outputTokens: output,
      totalTokens: total || (input + output)
    };
  }

  /**
   * Test connection to the provider (optional)
   */
  async testConnection?(): Promise<boolean>;
}

// Export alias for backward compatibility - keep abstract to avoid implementation requirements
export abstract class BaseLLMAdapter extends BaseAdapter {}

// Export types
export type { ChatMessage, ChatResponse, StreamingChatResponse, ModelInfo, TokenUsage };