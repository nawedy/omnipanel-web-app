import { 
  LLMAdapter, 
  AdapterConfig, 
  LLMCompletionRequest, 
  LLMCompletionResponse,
  LLMStreamChunk,
  ModelInfo,
  EmbeddingRequest,
  EmbeddingResponse,
  AdapterError
} from '../types';

export abstract class BaseAdapter implements LLMAdapter {
  abstract readonly name: string;
  abstract readonly provider: string;
  
  protected _config: AdapterConfig = {};
  protected _initialized = false;

  constructor(config?: AdapterConfig) {
    if (config) {
      this._config = { ...config };
    }
  }

  get config(): AdapterConfig {
    return { ...this._config };
  }

  abstract initialize(config: AdapterConfig): Promise<void>;

  isConfigured(): boolean {
    return this._initialized && this.validateConfig();
  }

  protected validateConfig(): boolean {
    // Base validation - subclasses should override
    return Boolean(this._config.apiKey || this._config.baseURL);
  }

  abstract listModels(): Promise<ModelInfo[]>;
  abstract getModel(modelId: string): Promise<ModelInfo | null>;
  abstract createCompletion(request: LLMCompletionRequest): Promise<LLMCompletionResponse>;
  abstract createCompletionStream(request: LLMCompletionRequest): Promise<AsyncIterable<LLMStreamChunk>>;

  // Optional embeddings support
  async createEmbedding?(request: EmbeddingRequest): Promise<EmbeddingResponse>;

  async validateRequest(request: LLMCompletionRequest): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!request.messages || request.messages.length === 0) {
      errors.push('Messages array is required and cannot be empty');
    }

    if (!request.model) {
      errors.push('Model is required');
    }

    if (request.temperature !== undefined && (request.temperature < 0 || request.temperature > 2)) {
      errors.push('Temperature must be between 0 and 2');
    }

    if (request.max_tokens !== undefined && request.max_tokens <= 0) {
      errors.push('Max tokens must be greater than 0');
    }

    if (request.top_p !== undefined && (request.top_p < 0 || request.top_p > 1)) {
      errors.push('Top p must be between 0 and 1');
    }

    // Check for valid message roles
    for (const message of request.messages || []) {
      if (!['system', 'user', 'assistant', 'function'].includes(message.role)) {
        errors.push(`Invalid message role: ${message.role}`);
      }
      if (!message.content && !message.function_call && !message.tool_calls) {
        errors.push('Message must have content, function_call, or tool_calls');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  estimateTokens(text: string): number {
    // Simple token estimation (roughly 4 characters per token for English)
    // Subclasses should override with more accurate tokenization
    return Math.ceil(text.length / 4);
  }

  async estimateCost(request: LLMCompletionRequest): Promise<{ input_cost: number; estimated_output_cost: number }> {
    const model = await this.getModel(request.model);
    if (!model || !model.input_cost_per_token || !model.output_cost_per_token) {
      return { input_cost: 0, estimated_output_cost: 0 };
    }

    const inputTokens = request.messages.reduce((total, msg) => 
      total + this.estimateTokens(msg.content), 0
    );

    const estimatedOutputTokens = request.max_tokens || 150;

    return {
      input_cost: inputTokens * model.input_cost_per_token,
      estimated_output_cost: estimatedOutputTokens * model.output_cost_per_token
    };
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message?: string; latency?: number }> {
    const startTime = Date.now();
    
    try {
      if (!this.isConfigured()) {
        return {
          status: 'unhealthy',
          message: 'Adapter not properly configured',
          latency: Date.now() - startTime
        };
      }

      // Try to list models as a basic health check
      await this.listModels();
      
      return {
        status: 'healthy',
        latency: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        latency: Date.now() - startTime
      };
    }
  }

  protected createError(
    message: string, 
    code: string, 
    status?: number, 
    retryable = false,
    details?: Record<string, any>
  ): AdapterError {
    const error = new Error(message) as AdapterError;
    error.code = code;
    error.status = status;
    error.provider = this.provider;
    error.retryable = retryable;
    error.details = details;
    return error;
  }

  protected async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on non-retryable errors
        if (error instanceof Error && 'retryable' in error && !error.retryable) {
          throw error;
        }

        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  protected normalizeModel(modelData: any): ModelInfo {
    return {
      id: modelData.id || modelData.model || modelData.name,
      name: modelData.name || modelData.id || modelData.model,
      description: modelData.description,
      provider: this.provider,
      type: this.inferModelType(modelData),
      context_length: modelData.context_length || modelData.max_context_length || 4096,
      max_output_tokens: modelData.max_output_tokens || modelData.max_tokens,
      supports_streaming: modelData.supports_streaming ?? true,
      supports_functions: modelData.supports_functions ?? false,
      supports_tools: modelData.supports_tools ?? false,
      supports_vision: modelData.supports_vision ?? false,
      supports_json_mode: modelData.supports_json_mode ?? false,
      created: modelData.created,
      owned_by: modelData.owned_by || this.provider
    };
  }

  private inferModelType(modelData: any): 'chat' | 'completion' | 'embedding' | 'multimodal' {
    const id = (modelData.id || modelData.name || '').toLowerCase();
    
    if (id.includes('embedding')) {
      return 'embedding';
    }
    
    if (id.includes('vision') || id.includes('multimodal') || modelData.supports_vision) {
      return 'multimodal';
    }
    
    if (id.includes('chat') || id.includes('gpt') || id.includes('claude')) {
      return 'chat';
    }
    
    return 'completion';
  }

  protected async makeRequest<T>(
    url: string, 
    options: RequestInit,
    timeout?: number
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = timeout ? setTimeout(() => controller.abort(), timeout) : null;

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw this.createError(
          `HTTP ${response.status}: ${errorText}`,
          'HTTP_ERROR',
          response.status,
          response.status >= 500 || response.status === 429
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createError(
          'Request timed out',
          'TIMEOUT_ERROR',
          undefined,
          true
        );
      }
      throw error;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }
} 