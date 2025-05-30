import OpenAI from 'openai';
import { BaseAdapter } from '../base/BaseAdapter';
import {
  AdapterConfig,
  LLMCompletionRequest,
  LLMCompletionResponse,
  LLMStreamChunk,
  ModelInfo,
  EmbeddingRequest,
  EmbeddingResponse,
  LLMMessage
} from '../types';

export class OpenAIAdapter extends BaseAdapter {
  readonly name = 'OpenAI';
  readonly provider = 'openai';
  
  private client?: OpenAI;

  async initialize(config: AdapterConfig): Promise<void> {
    this._config = { ...config };
    
    if (!this._config.apiKey) {
      throw this.createError('OpenAI API key is required', 'MISSING_API_KEY');
    }

    this.client = new OpenAI({
      apiKey: this._config.apiKey,
      baseURL: this._config.baseURL,
      organization: this._config.organization,
      project: this._config.project,
      timeout: this._config.timeout || 60000,
      maxRetries: this._config.maxRetries || 3,
      defaultHeaders: this._config.customHeaders,
    });

    this._initialized = true;
  }

  protected validateConfig(): boolean {
    return Boolean(this._config.apiKey);
  }

  async listModels(): Promise<ModelInfo[]> {
    if (!this.client) {
      throw this.createError('Adapter not initialized', 'NOT_INITIALIZED');
    }

    try {
      const response = await this.retryOperation(async () => {
        return await this.client!.models.list();
      });

      return response.data
        .filter(model => this.isChatModel(model.id))
        .map(model => this.normalizeOpenAIModel(model));
    } catch (error) {
      throw this.createError(
        `Failed to list models: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'LIST_MODELS_ERROR',
        undefined,
        true
      );
    }
  }

  async getModel(modelId: string): Promise<ModelInfo | null> {
    if (!this.client) {
      throw this.createError('Adapter not initialized', 'NOT_INITIALIZED');
    }

    try {
      const response = await this.retryOperation(async () => {
        return await this.client!.models.retrieve(modelId);
      });

      return this.normalizeOpenAIModel(response);
    } catch (error) {
      if (error instanceof Error && 'status' in error && error.status === 404) {
        return null;
      }
      throw this.createError(
        `Failed to get model: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GET_MODEL_ERROR',
        undefined,
        true
      );
    }
  }

  async createCompletion(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    if (!this.client) {
      throw this.createError('Adapter not initialized', 'NOT_INITIALIZED');
    }

    const validation = await this.validateRequest(request);
    if (!validation.valid) {
      throw this.createError(
        `Invalid request: ${validation.errors.join(', ')}`,
        'INVALID_REQUEST'
      );
    }

    try {
      const response = await this.retryOperation(async () => {
        return await this.client!.chat.completions.create({
          model: request.model,
          messages: this.convertMessages(request.messages),
          temperature: request.temperature,
          max_tokens: request.max_tokens,
          top_p: request.top_p,
          frequency_penalty: request.frequency_penalty,
          presence_penalty: request.presence_penalty,
          stop: request.stop,
          functions: request.functions,
          tools: request.tools?.map(tool => ({
            type: 'function' as const,
            function: tool.function
          })),
          tool_choice: request.tool_choice,
          stream: false,
        });
      });

      return this.normalizeCompletionResponse(response);
    } catch (error) {
      throw this.createError(
        `Completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'COMPLETION_ERROR',
        error instanceof Error && 'status' in error ? error.status : undefined,
        this.isRetryableError(error)
      );
    }
  }

  async createCompletionStream(request: LLMCompletionRequest): Promise<AsyncIterable<LLMStreamChunk>> {
    if (!this.client) {
      throw this.createError('Adapter not initialized', 'NOT_INITIALIZED');
    }

    const validation = await this.validateRequest(request);
    if (!validation.valid) {
      throw this.createError(
        `Invalid request: ${validation.errors.join(', ')}`,
        'INVALID_REQUEST'
      );
    }

    try {
      const stream = await this.client.chat.completions.create({
        model: request.model,
        messages: this.convertMessages(request.messages),
        temperature: request.temperature,
        max_tokens: request.max_tokens,
        top_p: request.top_p,
        frequency_penalty: request.frequency_penalty,
        presence_penalty: request.presence_penalty,
        stop: request.stop,
        functions: request.functions,
        tools: request.tools?.map(tool => ({
          type: 'function' as const,
          function: tool.function
        })),
        tool_choice: request.tool_choice,
        stream: true,
      });

      return this.createStreamIterator(stream);
    } catch (error) {
      throw this.createError(
        `Streaming completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STREAMING_ERROR',
        error instanceof Error && 'status' in error ? error.status : undefined,
        this.isRetryableError(error)
      );
    }
  }

  async createEmbedding(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    if (!this.client) {
      throw this.createError('Adapter not initialized', 'NOT_INITIALIZED');
    }

    try {
      const response = await this.retryOperation(async () => {
        return await this.client!.embeddings.create({
          model: request.model,
          input: request.input,
          encoding_format: request.encoding_format,
          dimensions: request.dimensions,
          user: request.user,
        });
      });

      return response;
    } catch (error) {
      throw this.createError(
        `Embedding failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'EMBEDDING_ERROR',
        error instanceof Error && 'status' in error ? error.status : undefined,
        this.isRetryableError(error)
      );
    }
  }

  private convertMessages(messages: LLMMessage[]): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    return messages.map(msg => {
      const baseMsg = {
        role: msg.role as 'system' | 'user' | 'assistant' | 'function',
        content: msg.content,
      };

      if (msg.name) {
        (baseMsg as any).name = msg.name;
      }

      if (msg.function_call) {
        (baseMsg as any).function_call = msg.function_call;
      }

      if (msg.tool_calls) {
        (baseMsg as any).tool_calls = msg.tool_calls;
      }

      return baseMsg;
    });
  }

  private normalizeCompletionResponse(response: OpenAI.Chat.Completions.ChatCompletion): LLMCompletionResponse {
    return {
      id: response.id,
      object: response.object,
      created: response.created,
      model: response.model,
      choices: response.choices.map(choice => ({
        index: choice.index,
        message: {
          role: choice.message.role as 'assistant',
          content: choice.message.content || '',
          function_call: choice.message.function_call,
          tool_calls: choice.message.tool_calls,
        },
        finish_reason: choice.finish_reason as any,
      })),
      usage: response.usage,
    };
  }

  private async *createStreamIterator(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
  ): AsyncIterableIterator<LLMStreamChunk> {
    for await (const chunk of stream) {
      yield {
        id: chunk.id,
        object: chunk.object,
        created: chunk.created,
        model: chunk.model,
        choices: chunk.choices.map(choice => ({
          index: choice.index,
          delta: {
            role: choice.delta.role,
            content: choice.delta.content,
            function_call: choice.delta.function_call,
            tool_calls: choice.delta.tool_calls,
          },
          finish_reason: choice.finish_reason as any,
        })),
      };
    }
  }

  private normalizeOpenAIModel(model: OpenAI.Models.Model): ModelInfo {
    const modelInfo = this.getModelInfo(model.id);
    
    return {
      id: model.id,
      name: model.id,
      description: `OpenAI ${model.id} model`,
      provider: this.provider,
      type: this.inferModelType({ id: model.id }),
      context_length: modelInfo.context_length,
      max_output_tokens: modelInfo.max_output_tokens,
      input_cost_per_token: modelInfo.input_cost_per_token,
      output_cost_per_token: modelInfo.output_cost_per_token,
      supports_streaming: true,
      supports_functions: modelInfo.supports_functions,
      supports_tools: modelInfo.supports_tools,
      supports_vision: modelInfo.supports_vision,
      supports_json_mode: modelInfo.supports_json_mode,
      created: model.created,
      owned_by: model.owned_by,
    };
  }

  private getModelInfo(modelId: string) {
    const modelConfigs: Record<string, any> = {
      'gpt-4-turbo': {
        context_length: 128000,
        max_output_tokens: 4096,
        input_cost_per_token: 0.00001,
        output_cost_per_token: 0.00003,
        supports_functions: true,
        supports_tools: true,
        supports_vision: true,
        supports_json_mode: true,
      },
      'gpt-4': {
        context_length: 8192,
        max_output_tokens: 4096,
        input_cost_per_token: 0.00003,
        output_cost_per_token: 0.00006,
        supports_functions: true,
        supports_tools: true,
        supports_vision: false,
        supports_json_mode: false,
      },
      'gpt-3.5-turbo': {
        context_length: 16385,
        max_output_tokens: 4096,
        input_cost_per_token: 0.0000005,
        output_cost_per_token: 0.0000015,
        supports_functions: true,
        supports_tools: true,
        supports_vision: false,
        supports_json_mode: true,
      },
    };

    // Find the best match for the model ID
    for (const [pattern, config] of Object.entries(modelConfigs)) {
      if (modelId.includes(pattern)) {
        return config;
      }
    }

    // Default configuration
    return {
      context_length: 4096,
      max_output_tokens: 2048,
      input_cost_per_token: 0.000001,
      output_cost_per_token: 0.000002,
      supports_functions: false,
      supports_tools: false,
      supports_vision: false,
      supports_json_mode: false,
    };
  }

  private isChatModel(modelId: string): boolean {
    const chatPatterns = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'];
    return chatPatterns.some(pattern => modelId.includes(pattern));
  }

  private isRetryableError(error: any): boolean {
    if (error instanceof Error && 'status' in error) {
      const status = error.status as number;
      return status >= 500 || status === 429;
    }
    return false;
  }

  estimateTokens(text: string): number {
    // More accurate token estimation for OpenAI models
    // Approximately 1 token per 4 characters for English text
    return Math.ceil(text.length / 4);
  }
} 