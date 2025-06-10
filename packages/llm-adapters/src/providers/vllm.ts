// packages/llm-adapters/src/providers/vllm.ts
import axios, { AxiosInstance } from 'axios';
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
  createTokenUsage
} from '@omnipanel/types';
import { BaseLLMAdapter, type LLMAdapterConfig, type StreamingOptions } from '../base/adapter';

export interface VLLMConfig extends LLMAdapterConfig {
  endpoint: string;
  model: string;
  timeout?: number;
  apiKey?: string;
}

export class VLLMAdapter extends BaseLLMAdapter {
  private config: VLLMConfig;
  private client: AxiosInstance;
  private usageStats: LLMUsageStats = createUsageStats();

  private readonly availableModels: LLMModel[] = [
    {
      id: 'llama-2-7b-chat',
      name: 'Llama 2 7B Chat',
      provider: AIProvider.VLLM,
      contextLength: 4096,
      context_length: 4096,
      supports_streaming: true,
      supports_functions: false,
      description: 'Llama 2 7B model optimized for chat',
      capabilities: ['chat', 'completion'],
      pricing: { input: 0.0001, output: 0.0002 }
    }
  ];

  constructor(config: VLLMConfig) {
    super();
    this.config = config;
    
    this.client = axios.create({
      baseURL: config.endpoint,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
      }
    });
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
    // Simple token estimation for VLLM models
    // This is a rough approximation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      const response = await this.client.get('/v1/models');
      const models = response.data.data || [];
      
      return models.map((model: any) => ({
        id: model.id,
        name: model.id,
        provider: AIProvider.VLLM,
        contextLength: model.max_model_len || 4096,
        context_length: model.max_model_len || 4096,
        supports_streaming: true,
        supports_functions: false,
        inputCost: 0,
        outputCost: 0,
        description: `VLLM hosted model: ${model.id}`,
        capabilities: ['chat', 'completion']
      }));
    } catch (error) {
      // Fallback to configured model
      return [{
        id: this.config.model,
        name: this.config.model,
        provider: AIProvider.VLLM,
        contextLength: 4096,
        context_length: 4096,
        supports_streaming: true,
        supports_functions: false,
        inputCost: 0,
        outputCost: 0,
        description: `VLLM hosted model: ${this.config.model}`,
        capabilities: ['chat', 'completion']
      }];
    }
  }

  async getModel(modelName: string): Promise<LLMModel | null> {
    const models = await this.getModels();
    const modelInfo = models.find((model: ModelInfo) => model.id === modelName);
    
    if (modelInfo) {
      const contextLength = modelInfo.contextLength || 4096;
      return {
        id: modelInfo.id,
        name: modelInfo.name,
        provider: modelInfo.provider,
        contextLength: contextLength,
        context_length: contextLength,
        supports_streaming: true,
        supports_functions: false,
        description: modelInfo.description,
        capabilities: modelInfo.capabilities,
        pricing: { 
          input: modelInfo.inputCost || 0, 
          output: modelInfo.outputCost || 0 
        }
      };
    }
    
    return null;
  }

  async validateConfig(): Promise<boolean> {
    try {
      // Test with a minimal request
      await this.client.post('/v1/chat/completions', {
        model: this.config.model,
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
      const response = await this.client.get('/v1/models');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const payload = {
            model: request.model,
      messages: request.messages.map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: request.maxTokens || 1024,
      temperature: request.temperature || 0.7,
            top_p: request.topP,
      stop: request.stop,
            stream: false
    };

    const response = await this.client.post('/v1/chat/completions', payload);
    const completion = response.data;

      const chatResponse: ChatCompletionResponse = {
      id: completion.id || `vllm-${Date.now()}`,
      model: completion.model || request.model,
        provider: AIProvider.VLLM,
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
      createdAt: new Date(completion.created ? completion.created * 1000 : Date.now())
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
    const payload = {
        model: request.model,
      messages: request.messages.map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: request.maxTokens || 1024,
      temperature: request.temperature || 0.7,
        top_p: request.topP,
      stop: request.stop,
        stream: true
    };

    const response = await this.client.post('/v1/chat/completions', payload, {
      responseType: 'stream'
    });

    let totalTokens = 0;
    let buffer = '';

    try {
      for await (const chunk of response.data) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const choice = parsed.choices[0];
              
              if (choice) {
                const delta = choice.delta;
                
                if (delta.content) {
                  totalTokens += await this.countTokens(delta.content);
                }

                yield {
                  id: parsed.id || `vllm-${Date.now()}`,
                  model: parsed.model || request.model,
                  provider: AIProvider.VLLM,
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
                    await this.countTokens(request.messages.map((m: ChatMessage) => m.content).join(' ')),
                    totalTokens,
                    await this.countTokens(request.messages.map((m: ChatMessage) => m.content).join(' ')) + totalTokens
                  ) : undefined
                };
              }
            } catch (parseError) {
              // Skip invalid JSON lines
              continue;
            }
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
    // VLLM is typically self-hosted, so no cost
    return 0;
  }

  private updateUsageStats(usage: { promptTokens: number; completionTokens: number; totalTokens: number }, model: string): void {
    this.usageStats.totalRequests++;
    this.usageStats.totalTokens += usage.totalTokens;
    
    // VLLM is typically self-hosted, so no cost
    const cost = 0;
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
}