// LLM Adapters Types - Comprehensive type definitions for the llm-adapters package

// ============================================================================
// ENUMS
// ============================================================================

export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  MISTRAL = 'mistral',
  DEEPSEEK = 'deepseek',
  HUGGINGFACE = 'huggingface',
  OLLAMA = 'ollama',
  LLAMACPP = 'llamacpp',
  VLLM = 'vllm',
  QWEN = 'qwen'
}

export enum ProviderErrorType {
  AUTHENTICATION_ERROR = 'authentication_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  API_ERROR = 'api_error',
  NETWORK_ERROR = 'network_error',
  TIMEOUT = 'timeout',
  INVALID_REQUEST = 'invalid_request',
  INVALID_RESPONSE = 'invalid_response',
  UNKNOWN_ERROR = 'unknown_error',
  CONFIGURATION_ERROR = 'configuration_error',
  MODEL_NOT_FOUND = 'model_not_found',
  QUOTA_EXCEEDED = 'quota_exceeded',
  SERVICE_UNAVAILABLE = 'service_unavailable'
}

// ============================================================================
// BASIC TYPES
// ============================================================================

export type ChatFinishReason = 
  | 'stop' 
  | 'length' 
  | 'tool_calls' 
  | 'content_filter' 
  | 'function_call'
  | 'error'
  | null;

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export type AIModelCapability = 
  | 'chat' 
  | 'completion' 
  | 'vision' 
  | 'function_calling' 
  | 'tools' 
  | 'streaming' 
  | 'embeddings' 
  | 'fine_tuning'
  | 'multilingual'
  | 'reasoning'
  | 'code_execution';

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface ChatMessage {
  role: MessageRole;
  content: string;
  name?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  // Backward compatibility properties
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  // Cache tokens for providers that support it
  cacheTokensRead?: number;
  cacheTokensWrite?: number;
  cache_read_tokens?: number;
  cache_write_tokens?: number;
  // Legacy properties that some adapters use
  promptTokens?: number;
  completionTokens?: number;
}

export interface ChatResponse {
  content: string;
  role: 'assistant' | string; // Allow string for flexibility
  usage: TokenUsage;
  model: string;
  finish_reason?: ChatFinishReason;
  finishReason?: ChatFinishReason; // Backward compatibility
  id: string;
  created?: Date | number; // Make optional
  created_at?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  // Legacy properties
  message?: {
    content: string;
    role: string;
    toolCalls?: any[];
  };
  createdAt?: Date | number;
  // Additional properties some adapters use
  cost?: number;
  provider?: string;
}

export interface StreamingChatResponse {
  content: string;
  role: 'assistant' | string; // Allow string for flexibility
  delta: boolean | {
    role?: string;
    content?: string;
    toolCalls?: any[];
  };
  finish_reason?: ChatFinishReason;
  finishReason?: ChatFinishReason; // Backward compatibility
  usage?: TokenUsage;
  model: string;
  id: string;
  created: Date | number;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  // Additional properties some adapters use
  cost?: number;
  provider?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: AIProvider;
  context_length: number;
  contextLength?: number; // Backward compatibility
  supports_streaming: boolean;
  supports_functions: boolean;
  cost_per_token?: {
    input: number;
    output: number;
    currency: string;
  };
  inputCost?: number; // Backward compatibility
  outputCost?: number; // Backward compatibility
  capabilities: AIModelCapability[];
  description?: string;
  metadata?: Record<string, any>;
  // Additional properties for specific providers
  type?: string;
  quantization?: string;
  size?: string;
  // Legacy properties
  pricing?: {
    input: number;
    output: number;
  };
}

export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  organization?: string;
  model?: string;
  region?: string;
  // Provider-specific config
  projectId?: string;
  location?: string;
  version?: string;
  endpoint?: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stop?: string[];
  stream?: boolean;
  // Additional properties that adapters use
  maxTokens?: number; // Legacy property
  topP?: number; // Legacy property
  topK?: number;
  stopSequences?: string[];
  tools?: any[];
  toolChoice?: any;
}

// ============================================================================
// USAGE STATS
// ============================================================================

export interface LLMUsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageLatency: number;
  errorRate: number;
  // Additional properties that adapters use
  requestsByModel?: Record<string, number>;
  tokensByModel?: Record<string, number>;
  costByModel?: Record<string, number>;
  requestsToday?: number;
  tokensToday?: number;
  costToday?: number;
  lastReset?: Date;
}

// ============================================================================
// COST TRACKING
// ============================================================================

export interface CostBreakdown {
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class ProviderError extends Error {
  public readonly type: ProviderErrorType;
  public readonly metadata?: Record<string, any>;
  public readonly statusCode?: number;

  constructor(
    message: string,
    type: ProviderErrorType = ProviderErrorType.UNKNOWN_ERROR,
    metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'ProviderError';
    this.type = type;
    this.metadata = metadata;
    this.statusCode = metadata?.status || metadata?.statusCode;

    // Ensure proper prototype chain
    Object.setPrototypeOf(this, ProviderError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      metadata: this.metadata,
      statusCode: this.statusCode,
      stack: this.stack
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create TokenUsage object with both new and legacy property names
 */
export function createTokenUsage(
  inputTokens: number = 0,
  outputTokens: number = 0,
  totalTokens?: number
): TokenUsage {
  const total = totalTokens ?? (inputTokens + outputTokens);
  return {
    inputTokens,
    outputTokens,
    totalTokens: total,
    // Legacy properties for backward compatibility
    prompt_tokens: inputTokens,
    completion_tokens: outputTokens,
    total_tokens: total,
    promptTokens: inputTokens,
    completionTokens: outputTokens
  };
}

/**
 * Create TokenUsage object from new-style parameters
 */
export function createTokenUsageFromNew(
  inputTokens: number = 0,
  outputTokens: number = 0,
  totalTokens?: number
): TokenUsage {
  return createTokenUsage(inputTokens, outputTokens, totalTokens);
}

/**
 * Create TokenUsage object from legacy parameters
 */
export function createTokenUsageFromLegacy(
  prompt_tokens: number = 0,
  completion_tokens: number = 0,
  total_tokens?: number
): TokenUsage {
  return createTokenUsage(prompt_tokens, completion_tokens, total_tokens);
}

/**
 * Convert legacy TokenUsage to new format
 */
export function normalizeTokenUsage(usage: any): TokenUsage {
  if (!usage) {
    return createTokenUsage(0, 0, 0);
  }

  const inputTokens = usage.inputTokens ?? usage.prompt_tokens ?? usage.promptTokens ?? 0;
  const outputTokens = usage.outputTokens ?? usage.completion_tokens ?? usage.completionTokens ?? 0;
  const totalTokens = usage.totalTokens ?? usage.total_tokens ?? (inputTokens + outputTokens);

  return createTokenUsage(inputTokens, outputTokens, totalTokens);
}

/**
 * Convert string finish reason to ChatFinishReason
 */
export function normalizeFinishReason(reason: string | null | undefined): ChatFinishReason {
  if (!reason) return null;
  
  const normalized = reason.toLowerCase();
  switch (normalized) {
    case 'stop':
    case 'end_turn':
    case 'stop_sequence':
      return 'stop';
    case 'length':
    case 'max_tokens':
      return 'length';
    case 'tool_calls':
    case 'function_call':
      return 'tool_calls';
    case 'content_filter':
      return 'content_filter';
    case 'error':
      return 'error';
    default:
      return 'stop'; // Default fallback
  }
}

/**
 * Create a safe usage stats object with all required properties
 */
export function createUsageStats(): LLMUsageStats {
  return {
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    averageLatency: 0,
    errorRate: 0,
    requestsByModel: {},
    tokensByModel: {},
    costByModel: {},
    requestsToday: 0,
    tokensToday: 0,
    costToday: 0,
    lastReset: new Date()
  };
}

/**
 * Create a safe cost breakdown object
 */
export function createCostBreakdown(usage: TokenUsage, inputCostPer1K: number, outputCostPer1K: number): CostBreakdown {
  const inputTokens = usage.inputTokens || 0;
  const outputTokens = usage.outputTokens || 0;
  const inputCost = (inputTokens / 1000) * inputCostPer1K;
  const outputCost = (outputTokens / 1000) * outputCostPer1K;
  
  return {
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost
  };
}

// ============================================================================
// LEGACY TYPES FOR BACKWARD COMPATIBILITY
// ============================================================================

// Legacy interfaces that some adapters might still reference
export interface LLMModel extends ModelInfo {}
export interface ChatCompletionResponse extends ChatResponse {}
export interface StreamingChatCompletionResponse extends StreamingChatResponse {}

// Provider type alias
export type LLMProvider = AIProvider; 