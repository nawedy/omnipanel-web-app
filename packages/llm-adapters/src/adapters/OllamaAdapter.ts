import { BaseAdapter } from '../base/BaseAdapter';
import {
  AdapterConfig,
  LLMCompletionRequest,
  LLMCompletionResponse,
  LLMStreamChunk,
  ModelInfo,
  LocalLLMAdapter,
  LLMMessage
} from '../types';

interface OllamaModel {
  name: string;
  model: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
  modified_at: string;
}

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class OllamaAdapter extends BaseAdapter implements LocalLLMAdapter {
  readonly name = 'Ollama';
  readonly provider = 'ollama';
  
  private baseUrl: string;

  constructor(config?: AdapterConfig) {
    super(config);
    this.baseUrl = config?.baseURL || 'http://localhost:11434';
  }

  async initialize(config: AdapterConfig): Promise<void> {
    this._config = { ...config };
    this.baseUrl = this._config.baseURL || 'http://localhost:11434';
    
    // Test connection to Ollama
    try {
      await this.healthCheck();
      this._initialized = true;
    } catch (error) {
      throw this.createError(
        'Failed to connect to Ollama server. Make sure Ollama is running.',
        'CONNECTION_ERROR'
      );
    }
  }

  protected validateConfig(): boolean {
    return true; // Ollama doesn't require API keys
  }

  async listModels(): Promise<ModelInfo[]> {
    try {
      const response = await this.makeRequest<{ models: OllamaModel[] }>(
        `${this.baseUrl}/api/tags`,
        { method: 'GET' }
      );

      return response.models.map(model => this.normalizeOllamaModel(model));
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
    try {
      const models = await this.listModels();
      return models.find(model => model.id === modelId) || null;
    } catch (error) {
      throw this.createError(
        `Failed to get model: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GET_MODEL_ERROR',
        undefined,
        true
      );
    }
  }

  async createCompletion(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    const validation = await this.validateRequest(request);
    if (!validation.valid) {
      throw this.createError(
        `Invalid request: ${validation.errors.join(', ')}`,
        'INVALID_REQUEST'
      );
    }

    try {
      const prompt = this.convertMessagesToPrompt(request.messages);
      
      const response = await this.makeRequest<OllamaResponse>(
        `${this.baseUrl}/api/generate`,
        {
          method: 'POST',
          body: JSON.stringify({
            model: request.model,
            prompt,
            stream: false,
            options: {
              temperature: request.temperature,
              top_p: request.top_p,
              num_predict: request.max_tokens,
              stop: Array.isArray(request.stop) ? request.stop : request.stop ? [request.stop] : undefined,
            },
          }),
        }
      );

      return this.normalizeOllamaResponse(response, request.model);
    } catch (error) {
      throw this.createError(
        `Completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'COMPLETION_ERROR',
        undefined,
        true
      );
    }
  }

  async createCompletionStream(request: LLMCompletionRequest): Promise<AsyncIterable<LLMStreamChunk>> {
    const validation = await this.validateRequest(request);
    if (!validation.valid) {
      throw this.createError(
        `Invalid request: ${validation.errors.join(', ')}`,
        'INVALID_REQUEST'
      );
    }

    const prompt = this.convertMessagesToPrompt(request.messages);
    
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          prompt,
          stream: true,
          options: {
            temperature: request.temperature,
            top_p: request.top_p,
            num_predict: request.max_tokens,
            stop: Array.isArray(request.stop) ? request.stop : request.stop ? [request.stop] : undefined,
          },
        }),
      });

      if (!response.ok) {
        throw this.createError(
          `HTTP ${response.status}: ${await response.text()}`,
          'HTTP_ERROR',
          response.status,
          response.status >= 500
        );
      }

      return this.createOllamaStreamIterator(response, request.model);
    } catch (error) {
      throw this.createError(
        `Streaming completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STREAMING_ERROR',
        undefined,
        true
      );
    }
  }

  // Local model management methods
  async downloadModel(modelId: string, onProgress?: (progress: number) => void): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelId, stream: true }),
      });

      if (!response.ok) {
        throw this.createError(
          `Failed to download model: HTTP ${response.status}`,
          'DOWNLOAD_ERROR',
          response.status
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw this.createError('No response body', 'DOWNLOAD_ERROR');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.total && data.completed && onProgress) {
                const progress = (data.completed / data.total) * 100;
                onProgress(progress);
              }
            } catch (error) {
              // Ignore JSON parse errors for individual lines
            }
          }
        }
      }

      if (onProgress) {
        onProgress(100);
      }
    } catch (error) {
      throw this.createError(
        `Model download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DOWNLOAD_ERROR',
        undefined,
        false
      );
    }
  }

  async deleteModel(modelId: string): Promise<void> {
    try {
      await this.makeRequest(
        `${this.baseUrl}/api/delete`,
        {
          method: 'DELETE',
          body: JSON.stringify({ name: modelId }),
        }
      );
    } catch (error) {
      throw this.createError(
        `Model deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DELETE_ERROR',
        undefined,
        false
      );
    }
  }

  async getLocalModels(): Promise<ModelInfo[]> {
    return this.listModels();
  }

  async isModelDownloaded(modelId: string): Promise<boolean> {
    try {
      const models = await this.listModels();
      return models.some(model => model.id === modelId);
    } catch (error) {
      return false;
    }
  }

  async getResourceUsage(): Promise<{
    gpu_usage?: number;
    gpu_memory_used?: number;
    gpu_memory_total?: number;
    cpu_usage?: number;
    ram_usage?: number;
    ram_total?: number;
  }> {
    // Ollama doesn't provide built-in resource monitoring
    // This would need to be implemented using system monitoring tools
    return {};
  }

  async startModelServer(): Promise<void> {
    // Ollama is typically managed as a system service
    throw this.createError(
      'Model server management not supported for Ollama',
      'NOT_SUPPORTED'
    );
  }

  async stopModelServer(): Promise<void> {
    // Ollama is typically managed as a system service
    throw this.createError(
      'Model server management not supported for Ollama',
      'NOT_SUPPORTED'
    );
  }

  async isServerRunning(): Promise<boolean> {
    try {
      const health = await this.healthCheck();
      return health.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  private convertMessagesToPrompt(messages: LLMMessage[]): string {
    return messages
      .map(msg => {
        if (msg.role === 'system') {
          return `System: ${msg.content}`;
        } else if (msg.role === 'user') {
          return `Human: ${msg.content}`;
        } else if (msg.role === 'assistant') {
          return `Assistant: ${msg.content}`;
        }
        return msg.content;
      })
      .join('\n\n') + '\n\nAssistant: ';
  }

  private normalizeOllamaModel(model: OllamaModel): ModelInfo {
    return {
      id: model.name,
      name: model.name,
      description: `Ollama ${model.name} model (${model.details?.parameter_size || 'unknown size'})`,
      provider: this.provider,
      type: 'chat',
      context_length: this.getContextLength(model.name),
      supports_streaming: true,
      supports_functions: false,
      supports_tools: false,
      supports_vision: this.supportsVision(model.name),
      supports_json_mode: false,
      owned_by: 'ollama',
    };
  }

  private normalizeOllamaResponse(response: OllamaResponse, model: string): LLMCompletionResponse {
    return {
      id: `ollama-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: response.message.content,
          },
          finish_reason: response.done ? 'stop' : null,
        },
      ],
      usage: {
        prompt_tokens: response.prompt_eval_count || 0,
        completion_tokens: response.eval_count || 0,
        total_tokens: (response.prompt_eval_count || 0) + (response.eval_count || 0),
      },
    };
  }

  private async *createOllamaStreamIterator(
    response: Response,
    model: string
  ): AsyncIterableIterator<LLMStreamChunk> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw this.createError('No response body', 'STREAMING_ERROR');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data: OllamaResponse = JSON.parse(line);
              
              yield {
                id: `ollama-${Date.now()}`,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model,
                choices: [
                  {
                    index: 0,
                    delta: {
                      role: 'assistant',
                      content: data.message.content,
                    },
                    finish_reason: data.done ? 'stop' : null,
                  },
                ],
              };

              if (data.done) {
                break;
              }
            } catch (error) {
              // Ignore JSON parse errors for individual lines
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private getContextLength(modelName: string): number {
    // Common context lengths for popular Ollama models
    const contextLengths: Record<string, number> = {
      'llama2': 4096,
      'codellama': 16384,
      'mistral': 8192,
      'neural-chat': 8192,
      'starling': 8192,
      'openchat': 8192,
      'dolphin': 4096,
      'phi': 2048,
      'orca-mini': 2048,
    };

    for (const [pattern, length] of Object.entries(contextLengths)) {
      if (modelName.toLowerCase().includes(pattern)) {
        return length;
      }
    }

    return 4096; // Default
  }

  private supportsVision(modelName: string): boolean {
    const visionModels = ['llava', 'bakllava'];
    return visionModels.some(pattern => modelName.toLowerCase().includes(pattern));
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message?: string; latency?: number }> {
    const startTime = Date.now();
    
    try {
      await this.makeRequest(`${this.baseUrl}/api/tags`, { method: 'GET' });
      
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
} 