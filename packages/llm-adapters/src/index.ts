// Types
export * from './types';

// Base classes
export { BaseAdapter } from './base/BaseAdapter';

// Adapters
export { OpenAIAdapter } from './adapters/OpenAIAdapter';
export { OllamaAdapter } from './adapters/OllamaAdapter';

// Registry
export { AdapterRegistry, globalAdapterRegistry } from './registry/AdapterRegistry';

// Re-export common interfaces for convenience
export type {
  LLMAdapter,
  LocalLLMAdapter,
  AdapterConfig,
  LLMMessage,
  LLMCompletionRequest,
  LLMCompletionResponse,
  LLMStreamChunk,
  ModelInfo,
  EmbeddingRequest,
  EmbeddingResponse,
  AdapterError,
  SupportedProvider,
  ProviderCapabilities
} from './types'; 