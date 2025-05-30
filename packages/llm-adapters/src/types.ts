export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export interface LLMCompletionRequest {
  messages: LLMMessage[];
  model: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  stream?: boolean;
  functions?: Array<{
    name: string;
    description?: string;
    parameters: Record<string, any>;
  }>;
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description?: string;
      parameters: Record<string, any>;
    };
  }>;
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}

export interface LLMCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: LLMMessage;
    finish_reason: 'stop' | 'length' | 'function_call' | 'tool_calls' | 'content_filter' | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface LLMStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
      function_call?: {
        name?: string;
        arguments?: string;
      };
      tool_calls?: Array<{
        index: number;
        id?: string;
        type?: 'function';
        function?: {
          name?: string;
          arguments?: string;
        };
      }>;
    };
    finish_reason: 'stop' | 'length' | 'function_call' | 'tool_calls' | 'content_filter' | null;
  }>;
}

export interface EmbeddingRequest {
  input: string | string[];
  model: string;
  encoding_format?: 'float' | 'base64';
  dimensions?: number;
  user?: string;
}

export interface EmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    index: number;
    embedding: number[];
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  provider: string;
  type: 'chat' | 'completion' | 'embedding' | 'multimodal';
  context_length: number;
  max_output_tokens?: number;
  input_cost_per_token?: number;
  output_cost_per_token?: number;
  supports_streaming: boolean;
  supports_functions: boolean;
  supports_tools: boolean;
  supports_vision: boolean;
  supports_json_mode: boolean;
  created?: number;
  owned_by?: string;
}

export interface AdapterConfig {
  apiKey?: string;
  baseURL?: string;
  organization?: string;
  project?: string;
  timeout?: number;
  maxRetries?: number;
  defaultModel?: string;
  customHeaders?: Record<string, string>;
  proxy?: {
    host: string;
    port: number;
    auth?: {
      username: string;
      password: string;
    };
  };
}

export interface LLMAdapter {
  readonly name: string;
  readonly provider: string;
  readonly config: AdapterConfig;
  
  // Core methods
  initialize(config: AdapterConfig): Promise<void>;
  isConfigured(): boolean;
  
  // Model management
  listModels(): Promise<ModelInfo[]>;
  getModel(modelId: string): Promise<ModelInfo | null>;
  
  // Chat completion
  createCompletion(request: LLMCompletionRequest): Promise<LLMCompletionResponse>;
  createCompletionStream(request: LLMCompletionRequest): Promise<AsyncIterable<LLMStreamChunk>>;
  
  // Embeddings (optional)
  createEmbedding?(request: EmbeddingRequest): Promise<EmbeddingResponse>;
  
  // Utility methods
  validateRequest(request: LLMCompletionRequest): Promise<{ valid: boolean; errors: string[] }>;
  estimateTokens(text: string): number;
  estimateCost(request: LLMCompletionRequest): Promise<{ input_cost: number; estimated_output_cost: number }>;
  
  // Health check
  healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message?: string; latency?: number }>;
}

export interface LocalLLMAdapter extends LLMAdapter {
  // Local model management
  downloadModel(modelId: string, onProgress?: (progress: number) => void): Promise<void>;
  deleteModel(modelId: string): Promise<void>;
  getLocalModels(): Promise<ModelInfo[]>;
  isModelDownloaded(modelId: string): Promise<boolean>;
  
  // Resource monitoring
  getResourceUsage(): Promise<{
    gpu_usage?: number;
    gpu_memory_used?: number;
    gpu_memory_total?: number;
    cpu_usage?: number;
    ram_usage?: number;
    ram_total?: number;
  }>;
  
  // Process management
  startModelServer(): Promise<void>;
  stopModelServer(): Promise<void>;
  isServerRunning(): Promise<boolean>;
}

export interface AdapterError extends Error {
  code: string;
  status?: number;
  provider: string;
  retryable: boolean;
  details?: Record<string, any>;
}

export interface AdapterRegistry {
  register(adapter: LLMAdapter): void;
  unregister(provider: string): void;
  get(provider: string): LLMAdapter | null;
  list(): LLMAdapter[];
  getConfigured(): LLMAdapter[];
}

export type SupportedProvider = 
  | 'openai'
  | 'anthropic' 
  | 'google'
  | 'huggingface'
  | 'ollama'
  | 'llamacpp'
  | 'vllm'
  | 'deepseek'
  | 'qwen'
  | 'mistral'
  | 'cohere'
  | 'perplexity';

export interface ProviderCapabilities {
  streaming: boolean;
  functions: boolean;
  tools: boolean;
  vision: boolean;
  json_mode: boolean;
  embeddings: boolean;
  local_models: boolean;
  custom_endpoints: boolean;
} 