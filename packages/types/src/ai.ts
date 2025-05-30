// packages/types/src/ai.ts
// === AI PROVIDER TYPES ONLY ===

// AI Provider enum for use as values
export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  OLLAMA = 'ollama',
  VLLM = 'vllm',
  LLAMACPP = 'llamacpp',
  DEEPSEEK = 'deepseek',
  MISTRAL = 'mistral',
  QWEN = 'qwen',
  HUGGINGFACE = 'huggingface'
}

// Type alias for provider values that can be used as both type and in switch statements
export type AIProviderValue = 'openai' | 'anthropic' | 'google' | 'ollama' | 'vllm' | 'llamacpp' | 'deepseek' | 'mistral' | 'qwen' | 'huggingface';

// Export the enum values as constants for backward compatibility
export const AIProviderConstants = AIProvider;

// Message role type
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

// LLM Model (alias for AIModel)
export type LLMModel = AIModel;

// Chat completion types (aliases for AI types)
export type ChatCompletionRequest = AICompletionRequest;
export type ChatCompletionResponse = AICompletionResponse;

// Streaming chat completion response
export interface StreamingChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: StreamingChoice[];
  usage?: AIUsageStats;
}

export interface StreamingChoice {
  index: number;
  delta: StreamingDelta;
  finish_reason?: AIFinishReason;
}

export interface StreamingDelta {
  role?: MessageRole;
  content?: string;
  tool_calls?: AIResponseToolCall[];
}

// LLM Usage Stats (alias for AIUsageStats)
export type LLMUsageStats = AIUsageStats;

// AI Provider types
export type AIProviderConfigType = 'openai' | 'anthropic' | 'google' | 'ollama' | 'vllm' | 'llamacpp' | 'custom';
export type AIProviderStatus = 'active' | 'inactive' | 'error' | 'limited';

// Token usage and model info
export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost?: number;
  // Backward compatibility aliases - these should be the same values
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cacheTokensRead?: number;
  cacheTokensWrite?: number;
}

// Helper function to create TokenUsage objects
export function createTokenUsage(
  promptTokens: number,
  completionTokens: number,
  cost?: number,
  cacheTokensRead?: number,
  cacheTokensWrite?: number
): TokenUsage {
  const totalTokens = promptTokens + completionTokens;
  return {
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: totalTokens,
    cost,
    inputTokens: promptTokens,
    outputTokens: completionTokens,
    totalTokens,
    cacheTokensRead,
    cacheTokensWrite
  };
}

// Helper function to create TokenUsage from new property names
export function createTokenUsageFromNew(
  inputTokens: number,
  outputTokens: number,
  totalTokens?: number
): TokenUsage {
  const total = totalTokens ?? (inputTokens + outputTokens);
  return {
    prompt_tokens: inputTokens,
    completion_tokens: outputTokens,
    total_tokens: total,
    inputTokens,
    outputTokens,
    totalTokens: total
  };
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  context_length: number;
  supports_streaming: boolean;
  supports_functions: boolean;
  cost_per_token?: AICostStructure;
  capabilities: AIModelCapability[];
}

// LLM Provider (alias for AIProvider for backward compatibility)
export type LLMProvider = AIProviderValue;

// Provider errors
export enum ProviderErrorType {
  AUTHENTICATION_ERROR = 'authentication_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  API_ERROR = 'api_error',
  NETWORK_ERROR = 'network_error',
  TIMEOUT_ERROR = 'timeout_error',
  TIMEOUT = 'timeout',
  INVALID_REQUEST_ERROR = 'invalid_request_error',
  INVALID_REQUEST = 'invalid_request',
  INVALID_RESPONSE = 'invalid_response',
  MODEL_NOT_FOUND_ERROR = 'model_not_found_error',
  QUOTA_EXCEEDED_ERROR = 'quota_exceeded_error',
  UNKNOWN_ERROR = 'unknown_error'
}

export class ProviderError extends Error {
  public type: ProviderErrorType;
  public provider: string;
  public code?: string;
  public details?: Record<string, any>;

  constructor(
    message: string,
    type: ProviderErrorType,
    providerOrDetails?: string | Record<string, any>,
    code?: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ProviderError';
    this.type = type;
    
    // Handle both calling patterns
    if (typeof providerOrDetails === 'string') {
      // Standard pattern: (message, type, provider, code?, details?)
      this.provider = providerOrDetails;
      this.code = code;
      this.details = details;
    } else {
      // Legacy pattern: (message, type, details)
      this.provider = 'unknown';
      this.code = undefined;
      this.details = providerOrDetails;
    }
  }
}

// Provider errors (interface for backward compatibility)
export interface ProviderErrorInterface extends Error {
  type: ProviderErrorType;
  provider: string;
  code?: string;
  details?: Record<string, any>;
}

export type AIModelCapability = 
  | 'chat' 
  | 'completion' 
  | 'multilingual' 
  | 'vision' 
  | 'function_calling' 
  | 'tools' 
  | 'streaming' 
  | 'embeddings' 
  | 'fine_tuning';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  context_length: number;
  supports_streaming: boolean;
  supports_functions: boolean;
  cost_per_token?: AICostStructure;
  capabilities: AIModelCapability[];
}

export interface AICostStructure {
  input: number;
  output: number;
  currency: string;
}

// AI Provider configuration
export interface AIProviderInterface {
  id: string;
  name: string;
  type: AIProviderValue;
  models: AIModel[];
  config: AIProviderConfig;
  status: AIProviderStatus;
}

export interface AIProviderConfig {
  api_key?: string;
  base_url?: string;
  organization?: string;
  project?: string;
  rate_limit?: AIRateLimit;
  timeout?: number;
  custom_headers?: Record<string, string>;
}

export interface AIRateLimit {
  requests_per_minute: number;
  tokens_per_minute: number;
  concurrent_requests: number;
}

// AI request/response (separate from chat types)
export interface AICompletionRequest {
  model: string;
  messages: AIRequestMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  tools?: AIRequestTool[];
  tool_choice?: string;
}

export interface AIRequestMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  name?: string;
  tool_calls?: AIRequestToolCall[];
}

export interface AIRequestTool {
  type: 'function';
  function: AIRequestFunctionDefinition;
}

export interface AIRequestFunctionDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface AIRequestToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface AICompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: AIChoice[];
  usage: AIUsageStats;
}

export interface AIChoice {
  index: number;
  message: AIResponseMessage;
  finish_reason: AIFinishReason;
}

export interface AIResponseMessage {
  role: 'assistant';
  content: string;
  tool_calls?: AIResponseToolCall[];
}

export interface AIResponseToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export type AIFinishReason = 'stop' | 'length' | 'tool_calls' | 'content_filter';

export interface AIUsageStats {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  // Extended usage tracking properties
  totalRequests?: number;
  totalTokens?: number;
  totalCost?: number;
  requestsByModel?: Record<string, number>;
  tokensByModel?: Record<string, number>;
  costByModel?: Record<string, number>;
}

// AI analytics
export interface AIUsageMetrics {
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  average_latency: number;
  error_rate: number;
  provider_distribution: AIProviderUsage[];
  model_distribution: AIModelUsage[];
}

export interface AIProviderUsage {
  provider: string;
  requests: number;
  tokens: number;
  cost: number;
  success_rate: number;
}

export interface AIModelUsage {
  model: string;
  provider: string;
  requests: number;
  tokens: number;
  cost: number;
  average_latency: number;
}