// packages/llm-adapters/src/providers/openai.ts
import OpenAI from 'openai';
import type {
  LLMModel,
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamingChatCompletionResponse,
  LLMUsageStats,
  MessageRole,
  ChatResponse,
  StreamingChatResponse,
  ModelInfo,
  TokenUsage,
  ChatFinishReason
} from '@omnipanel/types';
import { BaseLLMAdapter, type LLMAdapterConfig, type StreamingOptions } from '../base/adapter';
import { 
  AIProvider,
  createTokenUsage,
  createUsageStats
} from '@omnipanel/types';

export interface OpenAIConfig extends LLMAdapterConfig {
  organization?: string;
  project?: string;
}

export class OpenAIAdapter extends BaseLLMAdapter {
  private config: OpenAIConfig;
  private client: OpenAI;
  private usageStats: LLMUsageStats = createUsageStats();

  private readonly modelPricing: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 0.0025, output: 0.01 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'o1-preview': { input: 0.015, output: 0.06 },
    'o1-mini': { input: 0.003, output: 0.012 },
    'gpt-4o-realtime-preview': { input: 0.005, output: 0.02 }
  };

  private readonly availableModels: LLMModel[] = [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: AIProvider.OPENAI,
      contextLength: 128000,
      context_length: 128000,
      supports_streaming: true,
      supports_functions: true,
      description: 'Latest GPT-4o model with vision, faster and cheaper than GPT-4 Turbo',
      capabilities: ['chat', 'completion', 'vision', 'function_calling'],
      pricing: { input: 0.0025, output: 0.01 }
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: AIProvider.OPENAI,
      contextLength: 128000,
      context_length: 128000,
      supports_streaming: true,
      supports_functions: true,
      description: 'Affordable and intelligent small model, faster than GPT-3.5 Turbo',
      capabilities: ['chat', 'completion', 'vision', 'function_calling'],
      pricing: { input: 0.00015, output: 0.0006 }
    },
    {
      id: 'o1-preview',
      name: 'o1-preview',
      provider: AIProvider.OPENAI,
      contextLength: 128000,
      context_length: 128000,
      supports_streaming: false,
      supports_functions: false,
      description: 'Reasoning model designed for complex, multi-step problems',
      capabilities: ['chat', 'completion', 'reasoning'],
      pricing: { input: 0.015, output: 0.06 }
    },
    {
      id: 'o1-mini',
      name: 'o1-mini',
      provider: AIProvider.OPENAI,
      contextLength: 128000,
      context_length: 128000,
      supports_streaming: false,
      supports_functions: false,
      description: 'Faster and cheaper reasoning model for coding, math, and science',
      capabilities: ['chat', 'completion', 'reasoning'],
      pricing: { input: 0.003, output: 0.012 }
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: AIProvider.OPENAI,
      contextLength: 128000,
      context_length: 128000,
      supports_streaming: true,
      supports_functions: true,
      description: 'Previous generation GPT-4 with vision capabilities',
      capabilities: ['chat', 'completion', 'vision', 'function_calling'],
      pricing: { input: 0.01, output: 0.03 }
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: AIProvider.OPENAI,
      contextLength: 8192,
      context_length: 8192,
      supports_streaming: true,
      supports_functions: true,
      description: 'Original GPT-4 model with high accuracy',
      capabilities: ['chat', 'completion', 'function_calling'],
      pricing: { input: 0.03, output: 0.06 }
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: AIProvider.OPENAI,
      contextLength: 16385,
      context_length: 16385,
      supports_streaming: true,
      supports_functions: true,
      description: 'Fast and affordable model for simple tasks',
      capabilities: ['chat', 'completion', 'function_calling'],
      pricing: { input: 0.0005, output: 0.0015 }
    }
  ];

  constructor(config: OpenAIConfig) {
    super();
    this.config = config;
    
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      timeout: config.timeout,
      maxRetries: config.maxRetries,
      organization: config.organization,
      project: config.project
    });
  }

  // Required abstract methods from BaseLLMAdapter
  async chat(messages: ChatMessage[], options?: StreamingOptions): Promise<ChatResponse> {
    const request: ChatCompletionRequest = {
      model: 'gpt-3.5-turbo',
      messages: messages as any, // Type assertion to handle interface differences
      temperature: options?.temperature,
      maxTokens: options?.max_tokens,
      topP: options?.top_p,
      stop: options?.stop,
      tools: options?.tools
    };

    const response = await this.chatCompletion(request);
    
    if (!response.message) {
      throw new Error('No message in response');
    }
    
    return {
      content: response.message.content,
      role: response.message.role as MessageRole,
      usage: createTokenUsage(
        response.usage?.promptTokens || 0,
        response.usage?.completionTokens || 0,
        response.usage?.totalTokens || 0
      ),
      model: response.model,
      finishReason: response.finishReason as ChatFinishReason,
      id: response.id,
      created: response.createdAt
    };
  }

  async *streamChat(messages: ChatMessage[], options?: StreamingOptions): AsyncGenerator<StreamingChatResponse> {
    const request: ChatCompletionRequest = {
      model: 'gpt-3.5-turbo',
      messages: messages as any, // Type assertion to handle interface differences
      temperature: options?.temperature,
      maxTokens: options?.max_tokens,
      topP: options?.top_p,
      stop: options?.stop,
      tools: options?.tools
    };

    for await (const chunk of this.streamChatCompletion(request)) {
      const delta = typeof chunk.delta === 'object' ? chunk.delta : { content: '', role: 'assistant' };
      
      yield {
        content: delta.content || '',
        role: (delta.role || 'assistant') as MessageRole,
        finishReason: chunk.finishReason,
        model: chunk.model,
        id: chunk.id,
        usage: chunk.usage ? createTokenUsage(
          chunk.usage.promptTokens || 0,
          chunk.usage.completionTokens || 0,
          chunk.usage.totalTokens || 0
        ) : undefined,
        delta: true,
        created: new Date()
      };
    }
  }

  async countTokens(text: string): Promise<number> {
    // Simple token estimation for OpenAI models
    // This is a rough approximation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  async getModels(): Promise<ModelInfo[]> {
    return this.availableModels.map((model: LLMModel) => ({
      id: model.id,
      name: model.name,
      provider: model.provider,
      contextLength: model.contextLength,
      context_length: model.context_length,
      supports_streaming: model.supports_streaming,
      supports_functions: model.supports_functions,
      inputCost: model.pricing?.input || 0,
      outputCost: model.pricing?.output || 0,
      description: model.description,
      capabilities: model.capabilities
    }));
  }

  async getModel(modelName: string): Promise<LLMModel | null> {
    return this.availableModels.find((model: LLMModel) => model.id === modelName) || null;
  }

  async validateConfig(): Promise<boolean> {
    try {
      // Test with a minimal request
      await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }]
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }]
      });
      return !!response.id;
    } catch (error) {
      return false;
    }
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const completion = await this.client.chat.completions.create({
          model: request.model,
      messages: request.messages.map((msg: any) => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      })),
      max_tokens: request.maxTokens,
          temperature: request.temperature,
          top_p: request.topP,
      stop: request.stop,
      tools: request.tools,
          tool_choice: request.toolChoice,
          stream: false
    });

      const response: ChatCompletionResponse = {
        id: completion.id,
        model: completion.model,
        provider: AIProvider.OPENAI,
        content: completion.choices[0]?.message?.content || '',
        role: 'assistant',
        message: {
        role: 'assistant',
        content: completion.choices[0]?.message?.content || '',
        toolCalls: completion.choices[0]?.message?.tool_calls
        },
        usage: createTokenUsage(
          completion.usage?.prompt_tokens || 0,
          completion.usage?.completion_tokens || 0,
          completion.usage?.total_tokens || 0
        ),
      finishReason: completion.choices[0]?.finish_reason || 'stop',
        createdAt: new Date(completion.created * 1000)
      };

      // Update usage stats
      this.updateUsageStats({
        promptTokens: response.usage.promptTokens || 0,
        completionTokens: response.usage.completionTokens || 0,
        totalTokens: response.usage.totalTokens || 0
      }, request.model);

      return response;
  }

  async *streamChatCompletion(
    request: ChatCompletionRequest,
    options?: StreamingOptions
  ): AsyncGenerator<StreamingChatCompletionResponse> {
    const stream = await this.client.chat.completions.create({
      model: request.model,
      messages: request.messages.map((msg: any) => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      })),
      max_tokens: request.maxTokens,
      temperature: request.temperature,
      top_p: request.topP,
      stop: request.stop,
      tools: request.tools,
      tool_choice: request.toolChoice,
      stream: true
    });

    let totalTokens = 0;

    try {
      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        if (choice) {
        const delta = choice.delta;
          
          if (delta.content) {
            totalTokens += await this.countTokens(delta.content);
          }

          yield {
            id: chunk.id,
            model: chunk.model,
            provider: AIProvider.OPENAI,
            content: delta.content || '',
            role: 'assistant',
            created: new Date(),
            delta: {
              role: delta.role || 'assistant',
              content: delta.content || '',
              toolCalls: delta.tool_calls
            },
            finishReason: choice.finish_reason,
            usage: choice.finish_reason ? createTokenUsage(
              await this.countTokens(request.messages.map((m: any) => m.content).join(' ')),
              totalTokens,
              await this.countTokens(request.messages.map((m: any) => m.content).join(' ')) + totalTokens
            ) : undefined
          };
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async getUsageStats(): Promise<LLMUsageStats> {
    return { ...this.usageStats };
  }

  estimateCost(usage: TokenUsage): number {
    const model = 'gpt-3.5-turbo'; // Default model for estimation
    const pricing = this.modelPricing[model];
    if (!pricing) return 0;

    const inputCost = (usage.inputTokens / 1000) * pricing.input;
    const outputCost = (usage.outputTokens / 1000) * pricing.output;
    return inputCost + outputCost;
  }

  private updateUsageStats(usage: { promptTokens: number; completionTokens: number; totalTokens: number }, model: string): void {
    this.usageStats.totalRequests++;
    this.usageStats.totalTokens += usage.totalTokens;
    
    const cost = this.calculateCost(usage, model);
    this.usageStats.totalCost += cost;
    
    // Update model-specific stats with null checks
    if (this.usageStats.requestsByModel && this.usageStats.tokensByModel && this.usageStats.costByModel) {
      if (!this.usageStats.requestsByModel[model]) {
        this.usageStats.requestsByModel[model] = 0;
        this.usageStats.tokensByModel[model] = 0;
        this.usageStats.costByModel[model] = 0;
      }
      
      this.usageStats.requestsByModel[model]++;
      this.usageStats.tokensByModel[model] += usage.totalTokens;
      this.usageStats.costByModel[model] += cost;
    }
  }

  private calculateCost(usage: { promptTokens: number; completionTokens: number }, model: string): number {
    const pricing = this.modelPricing[model];
    if (!pricing) return 0;

    const inputCost = (usage.promptTokens / 1000) * pricing.input;
    const outputCost = (usage.completionTokens / 1000) * pricing.output;
    return inputCost + outputCost;
  }
}