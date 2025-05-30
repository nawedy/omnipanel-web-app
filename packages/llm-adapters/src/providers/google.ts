// packages/llm-adapters/src/providers/google.ts
import axios from 'axios';
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
  TokenUsage
} from '@omnipanel/types';
import { 
  AIProvider,
  createUsageStats,
  createTokenUsage,
  normalizeFinishReason
} from '@omnipanel/types';
import { BaseLLMAdapter, type LLMAdapterConfig, type StreamingOptions } from '../base/adapter';

export interface GoogleAIConfig extends LLMAdapterConfig {
  projectId?: string;
  location?: string;
  model: string;
  apiKey: string;
}

export class GoogleAIAdapter extends BaseLLMAdapter {
  private config: GoogleAIConfig;
  private usageStats: LLMUsageStats = createUsageStats();

  // Google AI model pricing (per 1K tokens)
  private readonly modelPricing: Record<string, { input: number; output: number }> = {
    'gemini-2.0-flash-exp': { input: 0, output: 0 }, // Free during preview
    'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
    'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
    'gemini-1.5-flash-8b': { input: 0.0375, output: 0.15 },
    'gemini-1.0-pro': { input: 0.0005, output: 0.0015 }
  };

  private readonly availableModels: LLMModel[] = [
    {
      id: 'gemini-2.0-flash-exp',
      name: 'Gemini 2.0 Flash Experimental',
      provider: AIProvider.GOOGLE,
      contextLength: 1000000,
      context_length: 1000000,
      supports_streaming: true,
      supports_functions: true,
      description: 'Latest experimental Gemini model with multimodal capabilities and tool use',
      capabilities: ['chat', 'completion', 'vision', 'function_calling'],
      pricing: { input: 0, output: 0 }
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: AIProvider.GOOGLE,
      contextLength: 2000000,
      context_length: 2000000,
      supports_streaming: true,
      supports_functions: true,
      description: 'Most capable Gemini model with largest context window',
      capabilities: ['chat', 'completion', 'vision', 'function_calling'],
      pricing: { input: 0.00125, output: 0.005 }
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: AIProvider.GOOGLE,
      contextLength: 1000000,
      context_length: 1000000,
      supports_streaming: true,
      supports_functions: true,
      description: 'Fast and efficient model with excellent performance',
      capabilities: ['chat', 'completion', 'vision', 'function_calling'],
      pricing: { input: 0.000075, output: 0.0003 }
    },
    {
      id: 'gemini-1.5-flash-8b',
      name: 'Gemini 1.5 Flash-8B',
      provider: AIProvider.GOOGLE,
      contextLength: 1000000,
      context_length: 1000000,
      supports_streaming: true,
      supports_functions: true,
      description: 'Smaller, faster model optimized for speed and efficiency',
      capabilities: ['chat', 'completion', 'vision'],
      pricing: { input: 0.0375, output: 0.15 }
    },
    {
      id: 'gemini-1.0-pro',
      name: 'Gemini 1.0 Pro',
      provider: AIProvider.GOOGLE,
      contextLength: 32768,
      context_length: 32768,
      supports_streaming: true,
      supports_functions: false,
      description: 'Original Gemini Pro model for general tasks',
      capabilities: ['chat', 'completion'],
      pricing: { input: 0.0005, output: 0.0015 }
    }
  ];

  constructor(config: GoogleAIConfig) {
    super();
    this.config = config;
  }

  // Required abstract methods from BaseLLMAdapter
  async chat(messages: ChatMessage[], options?: StreamingOptions): Promise<ChatResponse> {
    const request: ChatCompletionRequest = {
      model: this.config.model,
      messages,
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
      role: response.message.role,
      usage: createTokenUsage(
        response.usage?.promptTokens || 0,
        response.usage?.completionTokens || 0,
        response.usage?.totalTokens || 0
      ),
      model: response.model,
      finishReason: response.finishReason,
      id: response.id,
      created: response.createdAt
    };
  }

  async *streamChat(messages: ChatMessage[], options?: StreamingOptions): AsyncGenerator<StreamingChatResponse> {
    const request: ChatCompletionRequest = {
      model: this.config.model,
      messages,
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
        role: delta.role || 'assistant',
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
    // Simple token estimation - Google AI doesn't provide a direct token counting API
    // This is a rough approximation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  async getModels(): Promise<ModelInfo[]> {
    return this.availableModels.map(model => ({
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
    return this.availableModels.find(model => model.id === modelName) || null;
  }

  async validateConfig(): Promise<boolean> {
    try {
      const response = await axios.get(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.config.timeout
        }
      );
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.chatCompletion({
        model: 'gemini-1.0-pro',
        messages: [{ role: 'user', content: 'test' }],
        maxTokens: 1
      });
      return !!response.id;
    } catch (error) {
      return false;
    }
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const messages = this.convertMessages(request.messages);
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/${request.model}:generateContent`,
      {
        contents: messages,
        generationConfig: {
          temperature: request.temperature,
          maxOutputTokens: request.maxTokens,
          topP: request.topP,
          stopSequences: request.stop
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ],
        tools: request.tools ? this.convertTools(request.tools) : undefined
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.config.timeout
      }
    );

    const candidate = response.data.candidates?.[0];
    if (!candidate) {
      throw new Error('No response generated');
    }

    const chatResponse: ChatCompletionResponse = {
      id: `google_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      model: request.model,
      provider: AIProvider.GOOGLE,
      content: this.extractContent(candidate.content),
      role: 'assistant',
      message: {
        role: 'assistant',
        content: this.extractContent(candidate.content),
        toolCalls: this.extractToolCalls(candidate.content)
      },
      usage: createTokenUsage(
        response.data.usageMetadata?.promptTokenCount || 0,
        response.data.usageMetadata?.candidatesTokenCount || 0,
        response.data.usageMetadata?.totalTokenCount || 0
      ),
      finishReason: normalizeFinishReason(this.convertFinishReason(candidate.finishReason)),
      createdAt: new Date()
    };

    // Update usage stats
    this.updateUsageStats({
      promptTokens: chatResponse.usage.promptTokens || 0,
      completionTokens: chatResponse.usage.completionTokens || 0,
      totalTokens: chatResponse.usage.totalTokens || 0
    }, request.model);

    return chatResponse;
  }

  async *streamChatCompletion(
    request: ChatCompletionRequest,
    options?: StreamingOptions
  ): AsyncGenerator<StreamingChatCompletionResponse> {
    const messages = this.convertMessages(request.messages);
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/${request.model}:streamGenerateContent`,
      {
        contents: messages,
        generationConfig: {
          temperature: request.temperature,
          maxOutputTokens: request.maxTokens,
          topP: request.topP,
          stopSequences: request.stop
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream',
        timeout: this.config.timeout
      }
    );

    let accumulatedContent = '';
    let totalTokens = 0;
    const streamId = `google_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      for await (const chunk of response.data) {
        const lines = chunk.toString().split('\n');
        
        for (const line of lines) {
          if (line.trim() && line.includes('data:')) {
            try {
              const data = JSON.parse(line.replace('data:', '').trim());
              const candidate = data.candidates?.[0];
              
              if (candidate?.content?.parts?.[0]?.text) {
                const content = candidate.content.parts[0].text;
                accumulatedContent += content;
                totalTokens++;

                yield {
                  id: streamId,
                  model: request.model,
                  provider: AIProvider.GOOGLE,
                  content: content,
                  role: 'assistant',
                  created: new Date(),
                  delta: {
                    role: 'assistant',
                    content: content,
                    toolCalls: undefined
                  },
                  finishReason: candidate.finishReason ? normalizeFinishReason(this.convertFinishReason(candidate.finishReason)) : undefined
                };
              }

              if (candidate?.finishReason) {
                const finalResponse: ChatCompletionResponse = {
                  id: streamId,
                  model: request.model,
                  provider: AIProvider.GOOGLE,
                  content: accumulatedContent,
                  role: 'assistant',
                  message: {
                    role: 'assistant',
                    content: accumulatedContent,
                    toolCalls: undefined
                  },
                  usage: createTokenUsage(
                    await this.countTokens(request.messages.map((m: ChatMessage) => m.content).join(' ')),
                    totalTokens,
                    await this.countTokens(request.messages.map((m: ChatMessage) => m.content).join(' ')) + totalTokens
                  ),
                  finishReason: normalizeFinishReason(this.convertFinishReason(candidate.finishReason)),
                  createdAt: new Date()
                };

                this.updateUsageStats({
                  promptTokens: finalResponse.usage.promptTokens || 0,
                  completionTokens: finalResponse.usage.completionTokens || 0,
                  totalTokens: finalResponse.usage.totalTokens || 0
                }, request.model);
                break;
              }
            } catch (parseError) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      throw new Error(`Streaming error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getUsageStats(): Promise<LLMUsageStats> {
    return { ...this.usageStats };
  }

  estimateCost(usage: TokenUsage): number {
    // Default model for cost estimation
    const model = 'gemini-1.0-pro';
    const pricing = this.modelPricing[model];
    
    if (!pricing) {
      return 0;
    }

    const inputCost = (usage.inputTokens / 1000) * pricing.input;
    const outputCost = (usage.outputTokens / 1000) * pricing.output;

    return inputCost + outputCost;
  }

  private convertMessages(messages: ChatMessage[]): any[] {
    return messages
      .filter(msg => msg.role !== 'system') // Google AI doesn't use system messages
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [
          {
            text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
          }
        ]
      }));
  }

  private convertTools(tools: any[]): any[] {
    return tools.map(tool => ({
      functionDeclarations: [
        {
          name: tool.function.name,
          description: tool.function.description,
          parameters: tool.function.parameters
        }
      ]
    }));
  }

  private extractContent(content: any): string {
    if (content?.parts?.[0]?.text) {
      return content.parts[0].text;
    }
    return '';
  }

  private extractToolCalls(content: any): any[] | undefined {
    const toolCalls = content?.parts?.filter((part: any) => part.functionCall);
    
    if (toolCalls && toolCalls.length > 0) {
      return toolCalls.map((call: any) => ({
        id: `call_${Math.random().toString(36).substr(2, 9)}`,
        type: 'function',
        function: {
          name: call.functionCall.name,
          arguments: JSON.stringify(call.functionCall.args)
        }
      }));
    }
    
    return undefined;
  }

  private convertFinishReason(reason: string): string {
    switch (reason) {
      case 'STOP':
        return 'stop';
      case 'MAX_TOKENS':
        return 'length';
      case 'SAFETY':
        return 'content_filter';
      case 'RECITATION':
        return 'content_filter';
      default:
        return 'stop';
    }
  }

  private updateUsageStats(usage: { promptTokens: number; completionTokens: number; totalTokens: number }, model: string): void {
    this.usageStats.totalRequests++;
    this.usageStats.totalTokens += usage.totalTokens;
    
    const cost = this.calculateCost(usage, model);
    this.usageStats.totalCost += cost;

    const today = new Date();
    if (!this.usageStats.lastReset || today.toDateString() !== this.usageStats.lastReset.toDateString()) {
      this.usageStats.requestsToday = 0;
      this.usageStats.tokensToday = 0;
      this.usageStats.costToday = 0;
      this.usageStats.lastReset = today;
    }

    this.usageStats.requestsToday = (this.usageStats.requestsToday || 0) + 1;
    this.usageStats.tokensToday = (this.usageStats.tokensToday || 0) + usage.totalTokens;
    this.usageStats.costToday = (this.usageStats.costToday || 0) + cost;

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