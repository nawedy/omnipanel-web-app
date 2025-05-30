// packages/llm-adapters/src/streaming/parser.ts

import type { 
  StreamingChatResponse, 
  ChatMessage, 
  TokenUsage,
  ChatFinishReason
} from '@omnipanel/types';

export interface StreamingChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta?: {
      role?: string;
      content?: string;
      tool_calls?: Array<{
        index: number;
        id?: string;
        type?: string;
        function?: {
          name?: string;
          arguments?: string;
        };
      }>;
    };
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface ParsedStreamChunk {
  content: string;
  role: 'assistant';
  delta: boolean;
  finish_reason?: string;
  toolCalls?: any[];
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: string;
  id: string;
  created: Date;
}

/**
 * Streaming parser configuration options
 */
export interface StreamingParserOptions {
  bufferSize?: number;
  timeout?: number;
  retryAttempts?: number;
  onError?: (error: Error) => void;
  onChunk?: (chunk: string) => void;
  delimiter?: string;
  encoding?: string;
}

export class StreamingResponseParser {
  private buffer = '';

  /**
   * Parse Server-Sent Events (SSE) streaming response
   */
  parseSSEChunk(chunk: string): ParsedStreamChunk[] {
    this.buffer += chunk;
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    const parsedChunks: ParsedStreamChunk[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

      const data = trimmedLine.slice(6);
      if (data === '[DONE]') continue;

      try {
        const parsed = this.parseStreamingResponse(JSON.parse(data));
        if (parsed) {
          parsedChunks.push(parsed);
        }
      } catch (error) {
        console.warn('Failed to parse streaming chunk:', error);
        continue;
      }
    }

    return parsedChunks;
  }

  /**
   * Parse a single streaming response chunk
   */
  parseStreamingResponse(response: StreamingChatCompletionResponse): ParsedStreamChunk | null {
    const choice = response.choices?.[0];
    if (!choice) return null;

    const delta = choice.delta;
    const hasContent = delta?.content;
    const hasToolCalls = delta?.tool_calls && delta.tool_calls.length > 0;
    const isFinished = choice.finish_reason;

    // Skip empty chunks with no useful data
    if (!hasContent && !hasToolCalls && !isFinished && !response.usage) {
      return null;
    }

    return {
      content: delta?.content || '',
      role: 'assistant',
      delta: !isFinished,
      finish_reason: isFinished ? String(isFinished) : undefined,
      toolCalls: delta?.tool_calls,
      usage: response.usage ? {
        inputTokens: response.usage.prompt_tokens || 0,
        outputTokens: response.usage.completion_tokens || 0,
        totalTokens: response.usage.total_tokens || 0
      } : undefined,
      model: response.model,
      id: response.id,
      created: new Date(response.created * 1000)
    };
  }

  /**
   * Convert parsed chunk to StreamingChatResponse
   */
  toStreamingChatResponse(chunk: ParsedStreamChunk): StreamingChatResponse {
    return {
      content: chunk.content,
      role: chunk.role,
      delta: chunk.delta,
      finish_reason: chunk.finish_reason as ChatFinishReason,
      usage: chunk.usage,
      model: chunk.model,
      id: chunk.id,
      created: chunk.created
    };
  }

  /**
   * Reset the internal buffer
   */
  reset(): void {
    this.buffer = '';
  }

  /**
   * Get the current buffer state (for debugging)
   */
  getBuffer(): string {
    return this.buffer;
  }
}

/**
 * Utility function to create a streaming parser
 */
export function createStreamingParser(): StreamingResponseParser {
  return new StreamingResponseParser();
}

/**
 * Parse a complete SSE stream into individual chunks
 */
export function parseSSEStream(stream: string): ParsedStreamChunk[] {
  const parser = new StreamingResponseParser();
  return parser.parseSSEChunk(stream);
}

/**
 * Parse a single streaming response
 */
export function parseStreamingChatResponse(
  response: StreamingChatCompletionResponse
): StreamingChatResponse | null {
  const parser = new StreamingResponseParser();
  const parsed = parser.parseStreamingResponse(response);
  
  if (!parsed) return null;
  
  return parser.toStreamingChatResponse(parsed);
}

/**
 * Validate streaming response format
 */
export function validateStreamingResponse(
  response: unknown
): response is StreamingChatCompletionResponse {
  if (!response || typeof response !== 'object') return false;
  
  const r = response as any;
  
  return (
    typeof r.id === 'string' &&
    typeof r.object === 'string' &&
    typeof r.created === 'number' &&
    typeof r.model === 'string' &&
    Array.isArray(r.choices)
  );
}

/**
 * Extract content from streaming response
 */
export function extractStreamingContent(
  response: StreamingChatCompletionResponse
): string {
  return response.choices?.[0]?.delta?.content || '';
}

/**
 * Check if streaming response is finished
 */
export function isStreamingFinished(
  response: StreamingChatCompletionResponse
): boolean {
  return !!response.choices?.[0]?.finish_reason;
}

/**
 * Extract usage information from streaming response
 */
export function extractStreamingUsage(
  response: StreamingChatCompletionResponse
): { inputTokens: number; outputTokens: number; totalTokens: number } | null {
  if (!response.usage) return null;
  
  return {
    inputTokens: response.usage.prompt_tokens || 0,
    outputTokens: response.usage.completion_tokens || 0,
    totalTokens: response.usage.total_tokens || 0
  };
}

/**
 * Buffer streaming tokens for better UX
 */
export function bufferStreamingTokens(
  tokens: string[],
  bufferSize: number = 5
): string[] {
  const buffered: string[] = [];
  
  for (let i = 0; i < tokens.length; i += bufferSize) {
    const chunk = tokens.slice(i, i + bufferSize).join('');
    if (chunk.trim()) {
      buffered.push(chunk);
    }
  }
  
  return buffered;
}

/**
 * Process streaming text with word boundaries
 */
export function processStreamingText(
  text: string,
  chunkSize: number = 50
): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const words = text.split(/(\s+)/); // Preserve whitespace
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const word of words) {
    if (currentChunk.length + word.length > chunkSize && currentChunk.trim()) {
      chunks.push(currentChunk);
      currentChunk = word;
    } else {
      currentChunk += word;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

/**
 * Clean streaming response content
 */
export function cleanStreamingContent(content: string): string {
  if (typeof content !== 'string') {
    return '';
  }
  
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}

/**
 * Merge streaming chunks with proper spacing
 */
export function mergeStreamingChunks(chunks: string[]): string {
  return chunks
    .filter(chunk => chunk && typeof chunk === 'string')
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Format streaming response for display
 */
export function formatStreamingResponse(
  response: StreamingChatCompletionResponse
): {
  content: string;
  isComplete: boolean;
  metadata: Record<string, any>;
} {
  const content = extractStreamingContent(response);
  const isComplete = isStreamingFinished(response);
  
  return {
    content: cleanStreamingContent(content),
    isComplete,
    metadata: {
      id: response.id,
      model: response.model,
      created: response.created,
      usage: response.usage
    }
  };
}

/**
 * Error handler wrapper for streaming operations
 */
export function withStreamingErrorHandler<T>(
  operation: () => Promise<T> | T,
  options: {
    onError?: (error: Error) => void;
    retryAttempts?: number;
    retryDelay?: number;
  } = {}
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const { onError, retryAttempts = 0, retryDelay = 1000 } = options;
    let attempts = 0;

    const executeOperation = async (): Promise<T> => {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        attempts++;
        const err = error instanceof Error ? error : new Error(String(error));
        
        if (onError) {
          onError(err);
        }

        if (attempts <= retryAttempts) {
          console.warn(`Streaming operation failed, retrying (${attempts}/${retryAttempts + 1})...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return executeOperation();
        }

        throw err;
      }
    };

    try {
      const result = await executeOperation();
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Convert a ReadableStream to an AsyncIterable
 */
export async function* streamToAsyncIterable(
  stream: ReadableStream<Uint8Array>,
  options: {
    decoder?: TextDecoder;
    delimiter?: string;
    bufferSize?: number;
  } = {}
): AsyncGenerator<string, void, unknown> {
  const {
    decoder = new TextDecoder(),
    delimiter = '\n',
    bufferSize = 8192
  } = options;

  const reader = stream.getReader();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // Yield any remaining buffer content
        if (buffer.trim()) {
          yield buffer;
        }
        break;
      }

      // Decode the chunk and add to buffer
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Split by delimiter and yield complete lines
      const lines = buffer.split(delimiter);
      buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

      for (const line of lines) {
        if (line.trim()) {
          yield line;
        }
      }

      // Prevent buffer from growing too large
      if (buffer.length > bufferSize) {
        console.warn('Stream buffer size exceeded, yielding partial content');
        yield buffer;
        buffer = '';
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Parse streaming text into structured chunks
 */
export async function* parseStreamingText(
  stream: ReadableStream<Uint8Array> | AsyncIterable<string>,
  options: StreamingParserOptions = {}
): AsyncGenerator<ParsedStreamChunk, void, unknown> {
  const {
    bufferSize = 1024,
    timeout = 30000,
    onError,
    onChunk,
    delimiter = '\n'
  } = options;

  try {
    // Convert ReadableStream to AsyncIterable if needed
    const iterable = stream instanceof ReadableStream 
      ? streamToAsyncIterable(stream, { delimiter, bufferSize })
      : stream;

    const parser = new StreamingResponseParser();

    for await (const chunk of iterable) {
      try {
        if (onChunk) {
          onChunk(chunk);
        }

        // Parse SSE chunks
        const parsedChunks = parser.parseSSEChunk(chunk);
        
        for (const parsedChunk of parsedChunks) {
          yield parsedChunk;
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        if (onError) {
          onError(err);
        } else {
          console.warn('Error parsing streaming chunk:', err.message);
        }
      }
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (onError) {
      onError(err);
    } else {
      throw err;
    }
  }
}

/**
 * Create a streaming response handler
 */
export function createStreamingHandler(
  options: StreamingParserOptions = {}
): {
  parseStream: (stream: ReadableStream<Uint8Array>) => AsyncGenerator<ParsedStreamChunk>;
  parseSSE: (chunk: string) => ParsedStreamChunk[];
  reset: () => void;
} {
  const parser = new StreamingResponseParser();

  return {
    parseStream: (stream: ReadableStream<Uint8Array>) => 
      parseStreamingText(stream, options),
    
    parseSSE: (chunk: string) => parser.parseSSEChunk(chunk),
    
    reset: () => parser.reset()
  };
}

/**
 * Utility to collect all streaming chunks into a single response
 */
export async function collectStreamingResponse(
  stream: AsyncGenerator<ParsedStreamChunk> | AsyncIterable<ParsedStreamChunk>
): Promise<{
  content: string;
  usage?: { inputTokens: number; outputTokens: number; totalTokens: number };
  finish_reason?: ChatFinishReason;
  chunks: ParsedStreamChunk[];
}> {
  const chunks: ParsedStreamChunk[] = [];
  let content = '';
  let usage: { inputTokens: number; outputTokens: number; totalTokens: number } | undefined;
  let finish_reason: ChatFinishReason | undefined;

  for await (const chunk of stream) {
    chunks.push(chunk);
    
    if (chunk.content) {
      content += chunk.content;
    }
    
    if (chunk.usage) {
      usage = chunk.usage;
    }
    
    if (chunk.finish_reason) {
      finish_reason = chunk.finish_reason as ChatFinishReason;
    }
  }

  return {
    content: content.trim(),
    usage,
    finish_reason,
    chunks
  };
}