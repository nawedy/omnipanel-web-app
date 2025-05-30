// packages/llm-adapters/src/providers/anthropic.ts
import Anthropic from '@anthropic-ai/sdk';
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

export interface AnthropicConfig extends LLMAdapterConfig {
  version?: string;
}

export class AnthropicAdapter extends BaseLLMAdapter {
  private config: AnthropicConfig;
  private client: Anthropic;
  private usageStats: LLMUsageStats = createUsageStats();

  private readonly modelPricing: Record<string, { input: number; output: number }> = {
    'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
    'claude-3-5-haiku-20241022': { input: 0.0008, output: 0.004 },
    'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
    'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
    'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 }
  };

  private readonly availableModels: ModelInfo[] = [
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      provider: AIProvider.ANTHROPIC,
      contextLength: 200000,
      context_length: 200000,
      supports_streaming: true,
      supports_functions: true,
      description: 'Most intelligent model with enhanced reasoning and coding capabilities',
      capabilities: ['chat', 'completion', 'vision', 'function_calling'],
      pricing: { input: 0.003, output: 0.015 }
    },
    {
      id: 'claude-3-5-haiku-20241022',
      name: 'Claude 3.5 Haiku',
      provider: AIProvider.ANTHROPIC,
      contextLength: 200000,
      context_length: 200000,
      supports_streaming: true,
      supports_functions: true,
      description: 'Fast and affordable model with improved capabilities over Claude 3 Haiku',
      capabilities: ['chat', 'completion', 'vision', 'function_calling'],
      pricing: { input: 0.0008, output: 0.004 }
    },
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      provider: AIProvider.ANTHROPIC,
      contextLength: 200000,
      context_length: 200000,
      supports_streaming: true,
      supports_functions: true,
      description: 'Most powerful model for highly complex tasks',
      capabilities: ['chat', 'completion', 'vision', 'function_calling'],
      pricing: { input: 0.015, output: 0.075 }
    },
    {
      id: 'claude-3-sonnet-20240229',
      name: 'Claude 3 Sonnet',
      provider: AIProvider.ANTHROPIC,
      contextLength: 200000,
      context_length: 200000,
      supports_streaming: true,
      supports_functions: true,
      description: 'Balanced model for a wide range of tasks',
      capabilities: ['chat', 'completion', 'vision', 'function_calling'],
      pricing: { input: 0.003, output: 0.015 }
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      provider: AIProvider.ANTHROPIC,
      contextLength: 200000,
      context_length: 200000,
      supports_streaming: true,
      supports_functions: true,
      description: 'Fastest and most affordable model for simple tasks',
      capabilities: ['chat', 'completion', 'vision', 'function_calling'],
      pricing: { input: 0.00025, output: 0.00125 }
    }
  ];

  constructor(config: AnthropicConfig) {
    super();
    this.config = config;
    
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      timeout: config.timeout,
      maxRetries: config.maxRetries
    });
  }

  // Required abstract methods from BaseLLMAdapter
  async chat(messages: ChatMessage[], options?: StreamingOptions): Promise<ChatResponse> {
    const request: ChatCompletionRequest = {
      model: 'claude-3-haiku-20240307',
      messages,
      temperature: options?.temperature,
      maxTokens: options?.max_tokens,
      topP: options?.top_p,
      stopSequences: options?.stop,
      tools: options?.tools
    };

    const response = await this.chatCompletion(request);
    
    return {
      content: response.content,
      role: response.role,
      usage: response.usage,
      model: response.model,
      finishReason: response.finishReason,
      id: response.id,
      created: response.created
    };
  }

  async *streamChat(messages: ChatMessage[], options?: StreamingOptions): AsyncGenerator<StreamingChatResponse> {
    const request: ChatCompletionRequest = {
      model: 'claude-3-haiku-20240307',
      messages,
      temperature: options?.temperature,
      maxTokens: options?.max_tokens,
      topP: options?.top_p,
      stopSequences: options?.stop,
      tools: options?.tools
    };

    for await (const chunk of this.streamChatCompletion(request)) {
      const delta = chunk.delta && typeof chunk.delta === 'object' ? chunk.delta : { content: '', role: 'assistant' };
      
      yield {
        content: delta.content || '',
        role: delta.role || 'assistant',
        finishReason: chunk.finishReason,
        model: chunk.model,
        id: chunk.id,
        delta: chunk.delta,
        created: chunk.created || new Date()
      };
    }
  }

  async countTokens(text: string): Promise<number> {
    // Simple token estimation - Anthropic doesn't provide a direct token counting API
    // This is a rough approximation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  async getModels(): Promise<ModelInfo[]> {
    return this.availableModels.map(model => ({
      id: model.id,
      name: model.name,
      provider: model.provider,
      context_length: model.context_length,
      contextLength: model.contextLength,
      supports_streaming: model.supports_streaming,
      supports_functions: model.supports_functions,
      inputCost: model.pricing?.input || 0,
      outputCost: model.pricing?.output || 0,
      description: model.description,
      capabilities: model.capabilities
    }));
  }

  async getModel(modelName: string): Promise<ModelInfo | null> {
    return this.availableModels.find(model => model.id === modelName) || null;
  }

  async validateConfig(): Promise<boolean> {
    try {
      // Test with a minimal request
      await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
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
      const response = await this.chatCompletion({
        model: 'claude-3-haiku-20240307',
        maxTokens: 1,
        messages: [{ role: 'user', content: 'test' }]
      });
      return !!response.id;
    } catch (error) {
      return false;
    }
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const { system, messages } = this.convertMessages(request.messages);
    
    const completion = await this.client.messages.create({
      model: request.model,
      max_tokens: request.maxTokens || 1024,
      temperature: request.temperature,
      top_p: request.topP,
      stop_sequences: request.stopSequences,
      system: system || undefined,
      messages: messages,
      tools: request.tools ? this.convertTools(request.tools) : undefined,
      tool_choice: request.toolChoice ? this.convertToolChoice(request.toolChoice) : undefined,
      stream: false
    });

    const response: ChatCompletionResponse = {
      id: completion.id,
      model: completion.model,
      provider: AIProvider.ANTHROPIC,
      content: this.extractContent(completion.content),
      role: 'assistant',
      message: {
        role: 'assistant',
        content: this.extractContent(completion.content),
        toolCalls: this.extractToolCalls(completion.content)
      },
      usage: createTokenUsage(
        completion.usage.input_tokens || 0,
        completion.usage.output_tokens || 0,
        (completion.usage.input_tokens || 0) + (completion.usage.output_tokens || 0)
      ),
      finishReason: this.convertStopReason(completion.stop_reason),
      created: new Date()
    };

    // Update usage stats
    this.updateUsageStats({
      promptTokens: response.usage.inputTokens,
      completionTokens: response.usage.outputTokens,
      totalTokens: response.usage.totalTokens
    }, request.model);

    return response;
  }

  async *streamChatCompletion(
    request: ChatCompletionRequest,
    options?: StreamingOptions
  ): AsyncGenerator<StreamingChatCompletionResponse> {
    const { system, messages } = this.convertMessages(request.messages);
    
    const stream = await this.client.messages.create({
      model: request.model,
      max_tokens: request.maxTokens || 1024,
      temperature: request.temperature,
      top_p: request.topP,
      stop_sequences: request.stopSequences,
      system: system || undefined,
      messages: messages,
      tools: request.tools ? this.convertTools(request.tools) : undefined,
      tool_choice: request.toolChoice ? this.convertToolChoice(request.toolChoice) : undefined,
      stream: true
    });

    let accumulatedContent = '';
    let totalTokens = 0;
    let streamId = '';

    try {
      for await (const event of stream) {
        if (event.type === 'message_start') {
          streamId = event.message.id;
        } else if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            const content = event.delta.text;
            accumulatedContent += content;
            totalTokens++;

            const streamResponse: StreamingChatCompletionResponse = {
              id: streamId,
              model: request.model,
              provider: AIProvider.ANTHROPIC,
              content: content,
              role: 'assistant',
              delta: {
                role: 'assistant',
                content
              },
              finishReason: null,
              created: new Date()
            };

            yield streamResponse;
          }
        } else if (event.type === 'message_delta') {
          if (event.delta.stop_reason) {
            const finalUsage = event.usage ? createTokenUsage(
              event.usage.input_tokens || 0,
              event.usage.output_tokens || 0,
              (event.usage.input_tokens || 0) + (event.usage.output_tokens || 0)
            ) : createTokenUsage(
              await this.countTokens(request.messages.map((m: ChatMessage) => m.content).join(' ')),
              totalTokens,
              await this.countTokens(request.messages.map((m: ChatMessage) => m.content).join(' ')) + totalTokens
            );

            // Update usage stats
            this.updateUsageStats({
              promptTokens: finalUsage.inputTokens,
              completionTokens: finalUsage.outputTokens,
              totalTokens: finalUsage.totalTokens
            }, request.model);

            // Yield final response
            yield {
              id: streamId,
              model: request.model,
              provider: AIProvider.ANTHROPIC,
              content: '',
              role: 'assistant',
              delta: {
                role: 'assistant',
                content: ''
              },
              finishReason: this.convertStopReason(event.delta.stop_reason),
              usage: finalUsage,
              created: new Date()
            };
          }
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
    const model = 'claude-3-haiku-20240307'; // Default model for estimation
    const pricing = this.modelPricing[model];
    if (!pricing) return 0;

    const inputCost = (usage.inputTokens / 1000) * pricing.input;
    const outputCost = (usage.outputTokens / 1000) * pricing.output;
    return inputCost + outputCost;
  }

  private convertMessages(messages: ChatMessage[]): { 
    system: string | null; 
    messages: any[] 
  } {
    let system: string | null = null;
    const convertedMessages: any[] = [];

    for (const message of messages) {
      if (message.role === 'system') {
        system = message.content;
      } else {
        convertedMessages.push({
          role: message.role,
          content: Array.isArray(message.content) 
            ? this.convertContentArray(message.content)
            : message.content
        });
      }
    }

    return { system, messages: convertedMessages };
  }

  private convertContentArray(content: any[]): any {
    return content.map(item => {
      if (typeof item === 'string') {
        return { type: 'text', text: item };
      }
      return item;
    });
  }

  private convertTools(tools: any[]): any[] {
    return tools.map(tool => ({
      name: tool.function?.name || tool.name,
      description: tool.function?.description || tool.description,
      input_schema: tool.function?.parameters || tool.parameters
    }));
  }

  private convertToolChoice(toolChoice: any): any {
    if (typeof toolChoice === 'string') {
      if (toolChoice === 'auto') return { type: 'auto' };
      if (toolChoice === 'none') return { type: 'none' };
      return { type: 'tool', name: toolChoice };
    }
    
    if (toolChoice?.function?.name) {
      return { type: 'tool', name: toolChoice.function.name };
    }
    
    return { type: 'auto' };
  }

  private extractContent(content: any[]): string {
    if (Array.isArray(content)) {
      return content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('');
    }
    return String(content || '');
  }

  private extractToolCalls(content: any[]): any[] | undefined {
    if (!Array.isArray(content)) return undefined;
    
    const toolCalls = content
      .filter(block => block.type === 'tool_use')
      .map(block => ({
        id: block.id,
        type: 'function',
        function: {
          name: block.name,
          arguments: JSON.stringify(block.input)
        }
      }));

    return toolCalls.length > 0 ? toolCalls : undefined;
  }

  private convertStopReason(stopReason: string | null): ChatFinishReason {
    switch (stopReason) {
      case 'end_turn':
        return 'stop';
      case 'max_tokens':
        return 'length';
      case 'tool_use':
        return 'tool_calls';
      case 'stop_sequence':
        return 'stop';
      default:
        return 'stop';
    }
  }

  private updateUsageStats(usage: { promptTokens: number; completionTokens: number; totalTokens: number }, model: string): void {
    // Reset daily stats if needed
    const today = new Date();
    if (this.usageStats.lastReset && today.toDateString() !== this.usageStats.lastReset.toDateString()) {
      this.usageStats.requestsToday = 0;
      this.usageStats.tokensToday = 0;
      this.usageStats.costToday = 0;
      this.usageStats.lastReset = today;
    }

    this.usageStats.totalRequests++;
    this.usageStats.totalTokens += usage.totalTokens;
    
    const cost = this.calculateCost(usage, model);
    this.usageStats.totalCost += cost;
    
    // Update daily stats
    if (this.usageStats.requestsToday !== undefined) this.usageStats.requestsToday++;
    if (this.usageStats.tokensToday !== undefined) this.usageStats.tokensToday += usage.totalTokens;
    if (this.usageStats.costToday !== undefined) this.usageStats.costToday += cost;
    
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