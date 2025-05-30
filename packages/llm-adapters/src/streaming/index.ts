// packages/llm-adapters/src/streaming/index.ts
export { 
    StreamingResponseParser,
    createStreamingParser,
    parseStreamingChatResponse,
    streamToAsyncIterable,
    withStreamingErrorHandler,
    bufferStreamingTokens,
    
  } from './parser';
  
  export type { StreamingParserOptions } from './parser';