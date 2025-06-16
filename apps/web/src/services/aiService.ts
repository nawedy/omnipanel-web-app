// apps/web/src/services/aiService.ts
// AI service leveraging robust @omnipanel/llm-adapters

"use client";

import { 
  ProviderFactory,
  OpenAIAdapter,
  AnthropicAdapter,
  GoogleAIAdapter,
  OllamaAdapter,
  DeepSeekAdapter,
  MistralAdapter,
  QwenAdapter,
  HuggingFaceAdapter,
  LlamaCppAdapter,
  VLLMAdapter,
  globalAdapterRegistry
} from '@omnipanel/llm-adapters';

import { 
  AIProvider,
  type AIProviderConfig,
  type ChatMessage,
  type ChatResponse,
  type StreamingChatResponse,
  type ModelInfo,
  type TokenUsage,
  type LLMUsageStats
} from '@omnipanel/types';

// AI service class
export class AIService {
  private static instance: AIService;
  private currentProvider: AIProvider = AIProvider.OPENAI;
  private usageStats: LLMUsageStats = {
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    averageLatency: 0,
    errorRate: 0
  };

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Create adapter for specific provider
  createAdapter(provider: AIProvider, config: AIProviderConfig) {
    // Ensure required fields are present
    const safeConfig = {
      ...config,
      apiKey: config.apiKey || '',
      baseUrl: config.baseUrl || '',
      model: config.model || 'gpt-3.5-turbo'
    };

    switch (provider) {
      case AIProvider.OPENAI:
        return new OpenAIAdapter(safeConfig);
      case AIProvider.ANTHROPIC:
        return new AnthropicAdapter(safeConfig);
      case AIProvider.GOOGLE:
        return new GoogleAIAdapter({ ...safeConfig, model: safeConfig.model });
      case AIProvider.OLLAMA:
        return new OllamaAdapter({ ...safeConfig, baseUrl: safeConfig.baseUrl });
      case AIProvider.DEEPSEEK:
        return new DeepSeekAdapter({ ...safeConfig, apiKey: safeConfig.apiKey });
      case AIProvider.MISTRAL:
        return new MistralAdapter({ ...safeConfig, apiKey: safeConfig.apiKey });
      case AIProvider.QWEN:
        return new QwenAdapter({ ...safeConfig, apiKey: safeConfig.apiKey, region: safeConfig.region as "cn-beijing" | "ap-southeast-1" | "us-east-1" | undefined });
      case AIProvider.HUGGINGFACE:
        return new HuggingFaceAdapter({ ...safeConfig, apiKey: safeConfig.apiKey });
      case AIProvider.LLAMACPP:
        return new LlamaCppAdapter({ ...safeConfig, baseUrl: safeConfig.baseUrl });
      case AIProvider.VLLM:
        return new VLLMAdapter({ ...safeConfig, endpoint: safeConfig.baseUrl || safeConfig.endpoint || '', model: safeConfig.model });
      default:
        return new OpenAIAdapter(safeConfig);
    }
  }

  // Get available providers
  getAvailableProviders(): AIProvider[] {
    return Object.values(AIProvider);
  }

  // Get provider display names
  getProviderDisplayNames(): Record<AIProvider, string> {
    return {
      [AIProvider.OPENAI]: 'OpenAI',
      [AIProvider.ANTHROPIC]: 'Anthropic',
      [AIProvider.GOOGLE]: 'Google AI',
      [AIProvider.OLLAMA]: 'Ollama',
      [AIProvider.DEEPSEEK]: 'DeepSeek',
      [AIProvider.MISTRAL]: 'Mistral',
      [AIProvider.QWEN]: 'Qwen',
      [AIProvider.HUGGINGFACE]: 'Hugging Face',
      [AIProvider.LLAMACPP]: 'Llama.cpp',
      [AIProvider.VLLM]: 'vLLM'
    };
  }

  // Get required config fields for each provider
  getProviderConfigFields(): Record<AIProvider, string[]> {
    return {
      [AIProvider.OPENAI]: ['apiKey'],
      [AIProvider.ANTHROPIC]: ['apiKey'],
      [AIProvider.GOOGLE]: ['apiKey'],
      [AIProvider.OLLAMA]: ['baseUrl'],
      [AIProvider.DEEPSEEK]: ['apiKey'],
      [AIProvider.MISTRAL]: ['apiKey'],
      [AIProvider.QWEN]: ['apiKey'],
      [AIProvider.HUGGINGFACE]: ['apiKey'],
      [AIProvider.LLAMACPP]: ['baseUrl'],
      [AIProvider.VLLM]: ['endpoint', 'model']
    };
  }

  // Get available models for a provider
  async getAvailableModels(provider: AIProvider, config: AIProviderConfig): Promise<ModelInfo[]> {
    try {
      const adapter = this.createAdapter(provider, config);
      return await adapter.getModels();
    } catch (error) {
      console.error(`Failed to get models for ${provider}:`, error);
      return [];
    }
  }

  // Send chat completion
  async sendChatCompletion(
    provider: AIProvider,
    config: AIProviderConfig,
    messages: ChatMessage[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<ChatResponse | AsyncIterable<StreamingChatResponse>> {
    const startTime = Date.now();
    
    try {
      const adapter = this.createAdapter(provider, config);
      
      const streamingOptions = {
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        stream: options.stream || false
      };

      let response;
      if (options.stream) {
        response = adapter.streamChat(messages, streamingOptions);
      } else {
        response = await adapter.chat(messages, streamingOptions);
      }

      // Update usage stats
      this.updateUsageStats(startTime, true);
      
      return response;
    } catch (error) {
      this.updateUsageStats(startTime, false);
      throw error;
    }
  }

  // Build context-aware prompt
  buildContextAwarePrompt(
    basePrompt: string,
    context: {
      currentFile?: string;
      fileType?: string;
      selectedCode?: string;
      projectInfo?: string;
      recentFiles?: string[];
    }
  ): string {
    let contextualPrompt = basePrompt;

    if (context.currentFile) {
      contextualPrompt += `\n\nCurrent file: ${context.currentFile}`;
    }

    if (context.fileType) {
      contextualPrompt += `\nFile type: ${context.fileType}`;
    }

    if (context.selectedCode) {
      contextualPrompt += `\n\nSelected code:\n\`\`\`${context.fileType || ''}\n${context.selectedCode}\n\`\`\``;
    }

    if (context.projectInfo) {
      contextualPrompt += `\n\nProject context: ${context.projectInfo}`;
    }

    if (context.recentFiles && context.recentFiles.length > 0) {
      contextualPrompt += `\n\nRecent files: ${context.recentFiles.join(', ')}`;
    }

    return contextualPrompt;
  }

  // Get usage statistics
  getUsageStats(): LLMUsageStats {
    return { ...this.usageStats };
  }

  // Reset usage statistics
  resetUsageStats(): void {
    this.usageStats = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageLatency: 0,
      errorRate: 0
    };
  }

  // Estimate cost for a request
  estimateCost(
    provider: AIProvider,
    model: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    // Simplified cost estimation - in a real app, this would use actual pricing data
    const baseCostPer1K = {
      [AIProvider.OPENAI]: { input: 0.0015, output: 0.002 },
      [AIProvider.ANTHROPIC]: { input: 0.008, output: 0.024 },
      [AIProvider.GOOGLE]: { input: 0.00025, output: 0.0005 },
      [AIProvider.MISTRAL]: { input: 0.0007, output: 0.0007 },
      [AIProvider.DEEPSEEK]: { input: 0.00014, output: 0.00028 },
      [AIProvider.QWEN]: { input: 0.0005, output: 0.0015 },
      [AIProvider.HUGGINGFACE]: { input: 0.001, output: 0.002 },
      [AIProvider.OLLAMA]: { input: 0, output: 0 }, // Local model
      [AIProvider.LLAMACPP]: { input: 0, output: 0 }, // Local model
      [AIProvider.VLLM]: { input: 0, output: 0 } // Local model
    };

    const costs = baseCostPer1K[provider] || { input: 0.001, output: 0.002 };
    return (inputTokens / 1000) * costs.input + (outputTokens / 1000) * costs.output;
  }

  // Private methods
  private updateUsageStats(startTime: number, success: boolean): void {
    const latency = Date.now() - startTime;
    
    this.usageStats.totalRequests++;
    this.usageStats.averageLatency = 
      (this.usageStats.averageLatency * (this.usageStats.totalRequests - 1) + latency) / 
      this.usageStats.totalRequests;
    
    if (!success) {
      this.usageStats.errorRate = 
        (this.usageStats.errorRate * (this.usageStats.totalRequests - 1) + 1) / 
        this.usageStats.totalRequests;
    } else {
      this.usageStats.errorRate = 
        (this.usageStats.errorRate * (this.usageStats.totalRequests - 1)) / 
        this.usageStats.totalRequests;
    }
  }
}

// Export singleton instance
export const omnipanelAIService = AIService.getInstance(); 