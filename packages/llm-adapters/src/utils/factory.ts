// packages/llm-adapters/src/utils/factory.ts
import type { LLMProvider } from '@omnipanel/types';
import { AIProvider } from '@omnipanel/types';
import { BaseLLMAdapter, type LLMAdapterConfig } from '../base/adapter';
import { OpenAIAdapter, type OpenAIConfig } from '../providers/openai';
import { AnthropicAdapter, type AnthropicConfig } from '../providers/anthropic';


/**
 * Factory for creating LLM adapters
 */
export class LLMAdapterFactory {
  /**
   * Create an adapter for the specified provider
   */
  static createAdapter(
    provider: LLMProvider,
    config: LLMAdapterConfig
  ): BaseLLMAdapter {
    switch (provider) {
      case 'openai':
        return new OpenAIAdapter(config as OpenAIConfig);
      
      case 'anthropic':
        return new AnthropicAdapter(config as AnthropicConfig);
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Get available providers
   */
  static getAvailableProviders(): LLMProvider[] {
    return [
      AIProvider.OPENAI, 
      AIProvider.ANTHROPIC,
      AIProvider.GOOGLE,
      AIProvider.OLLAMA,
      AIProvider.HUGGINGFACE,
      AIProvider.VLLM,
      AIProvider.LLAMACPP,
      AIProvider.DEEPSEEK,
      AIProvider.MISTRAL,
      AIProvider.QWEN
    ];
  }

  /**
   * Validate provider configuration
   */
  static async validateConfig(
    provider: LLMProvider,
    config: LLMAdapterConfig
  ): Promise<boolean> {
    try {
      const adapter = this.createAdapter(provider, config);
      return await adapter.validateConfig();
    } catch (error) {
      return false;
    }
  }

  /**
   * Test connection for a provider
   */
  static async testConnection(
    provider: LLMProvider,
    config: LLMAdapterConfig
  ): Promise<boolean> {
    try {
      const adapter = this.createAdapter(provider, config);
      return adapter.testConnection ? await adapter.testConnection() : false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get models for a provider
   */
  static async getModels(
    provider: LLMProvider,
    config: LLMAdapterConfig
  ) {
    const adapter = this.createAdapter(provider, config);
    return await adapter.getModels();
  }
}

/**
 * Utility functions for LLM operations
 */
export class LLMUtils {
  /**
   * Estimate tokens in text (rough approximation)
   */
  static estimateTokens(text: string): number {
    // Simple approximation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Truncate text to fit within token limit
   */
  static truncateToTokenLimit(text: string, maxTokens: number): string {
    const estimatedTokens = this.estimateTokens(text);
    
    if (estimatedTokens <= maxTokens) {
      return text;
    }

    // Rough calculation to determine character limit
    const charLimit = maxTokens * 4;
    return text.substring(0, charLimit) + '...';
  }

  /**
   * Split text into chunks that fit within token limits
   */
  static splitIntoChunks(text: string, maxTokensPerChunk: number): string[] {
    const chunks: string[] = [];
    const maxCharsPerChunk = maxTokensPerChunk * 4; // Rough approximation
    
    for (let i = 0; i < text.length; i += maxCharsPerChunk) {
      chunks.push(text.substring(i, i + maxCharsPerChunk));
    }
    
    return chunks;
  }

  /**
   * Format cost in a human-readable way
   */
  static formatCost(cost: number): string {
    if (cost < 0.01) {
      return `$${(cost * 100).toFixed(3)}¢`;
    }
    return `$${cost.toFixed(4)}`;
  }

  /**
   * Format token count in a human-readable way
   */
  static formatTokenCount(tokens: number): string {
    if (tokens < 1000) {
      return `${tokens} tokens`;
    } else if (tokens < 1000000) {
      return `${(tokens / 1000).toFixed(1)}K tokens`;
    } else {
      return `${(tokens / 1000000).toFixed(1)}M tokens`;
    }
  }

  /**
   * Calculate reading time based on token count
   */
  static estimateReadingTime(tokens: number): string {
    // Average reading speed: ~200 words per minute
    // Average tokens per word: ~1.3
    const wordsPerMinute = 200;
    const tokensPerWord = 1.3;
    
    const words = tokens / tokensPerWord;
    const minutes = words / wordsPerMinute;
    
    if (minutes < 1) {
      return '< 1 minute';
    } else if (minutes < 60) {
      return `${Math.round(minutes)} minute${minutes > 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  /**
   * Validate message format
   */
  static validateMessages(messages: any[]): boolean {
    if (!Array.isArray(messages) || messages.length === 0) {
      return false;
    }

    return messages.every(message => 
      message &&
      typeof message === 'object' &&
      typeof message.role === 'string' &&
      (typeof message.content === 'string' || Array.isArray(message.content))
    );
  }

  /**
   * Clean and prepare messages for API
   */
  static prepareMessages(messages: any[]): any[] {
    return messages
      .filter(msg => msg && msg.content && msg.content.trim())
      .map(msg => ({
        role: msg.role,
        content: typeof msg.content === 'string' 
          ? msg.content.trim() 
          : msg.content,
        name: msg.name,
        toolCalls: msg.toolCalls,
        toolCallId: msg.toolCallId
      }));
  }

  /**
   * Generate unique request ID
   */
  static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Rate limit helper
   */
  static async rateLimitDelay(retryAfter: number): Promise<void> {
    const delayMs = retryAfter * 1000;
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error: any): boolean {
    // Network errors
    if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
      return true;
    }

    // HTTP status codes that are retryable
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }

  /**
   * Parse error response
   */
  static parseErrorResponse(error: any): {
    message: string;
    code: string;
    type: string;
    retryable: boolean;
  } {
    return {
      message: error.message || 'Unknown error',
      code: error.code || 'UNKNOWN',
      type: error.type || 'api_error',
      retryable: this.isRetryableError(error)
    };
  }
}