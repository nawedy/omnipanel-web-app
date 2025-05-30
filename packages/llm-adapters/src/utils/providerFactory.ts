// packages/llm-adapters/src/utils/providerFactory.ts

import { AIProvider, AIProviderConfig, ProviderError, ProviderErrorType } from '@omnipanel/types';
import { BaseAdapter } from '../base/adapter';
import { OpenAIAdapter } from '../providers/openai';
import { AnthropicAdapter } from '../providers/anthropic';
import { GoogleAIAdapter } from '../providers/google';
import { OllamaAdapter } from '../providers/ollama';
import { VLLMAdapter } from '../providers/vllm';
import { LlamaCppAdapter } from '../providers/llamacpp';
import { DeepSeekAdapter } from '../providers/deepseek';
import { MistralAdapter } from '../providers/mistral';
import { QwenAdapter } from '../providers/qwen';
import { HuggingFaceAdapter } from '../providers/huggingface';

export interface ProviderConfig {
  provider: AIProvider;
  config: AIProviderConfig & Record<string, any>;
}

export class ProviderFactory {
  private static validateConfig(provider: AIProvider, config: AIProviderConfig): void {
    const requiredFields: Record<AIProvider, string[]> = {
      [AIProvider.OPENAI]: ['apiKey'],
      [AIProvider.ANTHROPIC]: ['apiKey'],
      [AIProvider.GOOGLE]: ['apiKey'],
      [AIProvider.OLLAMA]: ['baseUrl'],
      [AIProvider.VLLM]: ['baseUrl'],
      [AIProvider.LLAMACPP]: ['baseUrl'],
      [AIProvider.DEEPSEEK]: ['apiKey'],
      [AIProvider.MISTRAL]: ['apiKey'],
      [AIProvider.QWEN]: ['apiKey'],
      [AIProvider.HUGGINGFACE]: ['apiKey']
    };

    const required = requiredFields[provider];
    if (!required) {
      throw new ProviderError(
        `Unsupported provider: ${provider}`,
        ProviderErrorType.INVALID_REQUEST,
        { provider, supportedProviders: Object.values(AIProvider) }
      );
    }

    for (const field of required) {
      if (!config[field as keyof AIProviderConfig]) {
        throw new ProviderError(
          `Missing required configuration field: ${field}`,
          ProviderErrorType.INVALID_REQUEST,
          { provider, field, required }
        );
      }
    }
  }

  static createProvider(providerConfig: ProviderConfig): BaseAdapter {
    const { provider, config } = providerConfig;

    // Validate configuration
    this.validateConfig(provider, config);

    // Create and return the appropriate adapter
    switch (provider) {
      case AIProvider.OPENAI:
        return new OpenAIAdapter({
          apiKey: config.apiKey!,
          baseUrl: config.baseUrl,
          organization: config.organization,
          timeout: config.timeout,
          maxRetries: config.maxRetries
        });

      case AIProvider.ANTHROPIC:
        return new AnthropicAdapter({
          apiKey: config.apiKey!,
          baseUrl: config.baseUrl,
          timeout: config.timeout,
          maxRetries: config.maxRetries
        });

      case AIProvider.GOOGLE:
        return new GoogleAIAdapter({
          apiKey: config.apiKey!,
          model: config.model || 'gemini-1.5-flash',
          baseUrl: config.baseUrl,
          timeout: config.timeout,
          maxRetries: config.maxRetries
        });

      case AIProvider.OLLAMA:
        return new OllamaAdapter({
          baseUrl: config.baseUrl!,
          timeout: config.timeout,
          maxRetries: config.maxRetries
        });

      case AIProvider.VLLM:
        return new VLLMAdapter({
          endpoint: config.baseUrl!,
          model: config.model || 'default',
          apiKey: config.apiKey,
          timeout: config.timeout,
          maxRetries: config.maxRetries
        });

      case AIProvider.LLAMACPP:
        return new LlamaCppAdapter({
          baseUrl: config.baseUrl!,
          apiKey: config.apiKey,
          model: config.model,
          timeout: config.timeout,
          maxRetries: config.maxRetries
        });

      case AIProvider.DEEPSEEK:
        return new DeepSeekAdapter({
          apiKey: config.apiKey!,
          baseUrl: config.baseUrl,
          timeout: config.timeout,
          maxRetries: config.maxRetries
        });

      case AIProvider.MISTRAL:
        return new MistralAdapter({
          apiKey: config.apiKey!,
          baseUrl: config.baseUrl,
          timeout: config.timeout,
          maxRetries: config.maxRetries
        });

      case AIProvider.QWEN:
        return new QwenAdapter({
          apiKey: config.apiKey!,
          baseUrl: config.baseUrl,
          region: config.region as 'cn-beijing' | 'ap-southeast-1' | 'us-east-1',
          timeout: config.timeout,
          maxRetries: config.maxRetries
        });

      case AIProvider.HUGGINGFACE:
        return new HuggingFaceAdapter({
          apiKey: config.apiKey!,
          baseUrl: config.baseUrl,
          model: config.model,
          timeout: config.timeout,
          maxRetries: config.maxRetries
        });

      default:
        throw new ProviderError(
          `Unsupported provider: ${provider}`,
          ProviderErrorType.INVALID_REQUEST,
          { provider, supportedProviders: Object.values(AIProvider) }
        );
    }
  }

  static getSupportedProviders(): AIProvider[] {
    return Object.values(AIProvider);
  }

  static getProviderRequirements(provider: AIProvider): string[] {
    const requirements: Record<AIProvider, string[]> = {
      [AIProvider.OPENAI]: ['apiKey'],
      [AIProvider.ANTHROPIC]: ['apiKey'],
      [AIProvider.GOOGLE]: ['apiKey'],
      [AIProvider.OLLAMA]: ['baseUrl'],
      [AIProvider.VLLM]: ['baseUrl'],
      [AIProvider.LLAMACPP]: ['baseUrl'],
      [AIProvider.DEEPSEEK]: ['apiKey'],
      [AIProvider.MISTRAL]: ['apiKey'],
      [AIProvider.QWEN]: ['apiKey'],
      [AIProvider.HUGGINGFACE]: ['apiKey']
    };

    return requirements[provider] || [];
  }

  static async validateProviderConfig(providerConfig: ProviderConfig): Promise<boolean> {
    try {
      const adapter = this.createProvider(providerConfig);
      return await adapter.validateConfig();
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }
      throw new ProviderError(
        'Failed to validate provider configuration',
        ProviderErrorType.UNKNOWN_ERROR,
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  static getProviderCapabilities(provider: AIProvider): string[] {
    const capabilities: Record<AIProvider, string[]> = {
      [AIProvider.OPENAI]: ['chat', 'completion', 'tools', 'vision', 'audio'],
      [AIProvider.ANTHROPIC]: ['chat', 'completion', 'tools', 'vision'],
      [AIProvider.GOOGLE]: ['chat', 'completion', 'tools', 'vision', 'safety'],
      [AIProvider.OLLAMA]: ['chat', 'completion', 'local'],
      [AIProvider.VLLM]: ['chat', 'completion', 'self-hosted'],
      [AIProvider.LLAMACPP]: ['chat', 'completion', 'local', 'tokenization'],
      [AIProvider.DEEPSEEK]: ['chat', 'completion', 'reasoning', 'coding'],
      [AIProvider.MISTRAL]: ['chat', 'completion', 'tools', 'safety'],
      [AIProvider.QWEN]: ['chat', 'completion', 'multilingual', 'search'],
      [AIProvider.HUGGINGFACE]: ['chat', 'completion', 'open-source', 'free']
    };

    return capabilities[provider] || ['chat'];
  }
}