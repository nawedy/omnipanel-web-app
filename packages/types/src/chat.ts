// packages/types/src/chat.ts
// === CHAT OPERATIONS ONLY ===

// Live chat message (not database entity)
export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: string;
  name?: string;
  tool_calls?: ChatToolCall[];
  tool_call_id?: string;
  tokens?: ChatTokenUsage;
  citations?: ChatCitation[];
  attachments?: ChatAttachment[];
}

export type ChatMessageRole = 'user' | 'assistant' | 'system';

export interface ChatTokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost?: number;
}

export interface ChatCitation {
  source: string;
  url?: string;
  excerpt: string;
  confidence: number;
}

export interface ChatAttachment {
  id: string;
  type: ChatAttachmentType;
  url: string;
  name: string;
  size?: number;
}

export type ChatAttachmentType = 'image' | 'file' | 'code' | 'link';

// Chat responses
export interface ChatResponse {
  id: string;
  content: string;
  role: ChatMessageRole;
  finish_reason: ChatFinishReason;
  finishReason?: ChatFinishReason;
  tokens?: ChatTokenUsage;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  tool_calls?: ChatToolCall[];
  model?: string;
  created_at: string;
  created?: Date | number;
}

export interface StreamingChatResponse {
  id: string;
  content: string;
  role: ChatMessageRole;
  model: string;
  created: Date | number;
  delta?: boolean;
  finish_reason?: ChatFinishReason;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

// Streaming
export interface ChatStreamingEvent {
  type: ChatStreamingEventType;
  data: ChatStreamingData;
}

export type ChatStreamingEventType = 'start' | 'chunk' | 'complete' | 'error';

export interface ChatStreamingData {
  content?: string;
  finished?: boolean;
  tokens?: ChatTokenUsage;
  error?: string;
}

// Function calling
export interface ChatFunctionCall {
  name: string;
  arguments: Record<string, any>;
  result?: any;
}

export interface ChatToolCall {
  id: string;
  type: 'function';
  function: ChatFunctionCall;
}

// Chat session management
export interface ChatSessionConfig {
  model_provider: string;
  model_name: string;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
  tools?: ChatTool[];
}

export interface ChatTool {
  type: 'function';
  function: ChatFunctionDefinition;
}

export interface ChatFunctionDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

// Chat search
export interface ChatSearchResult {
  message_id: string;
  content: string;
  highlights: ChatSearchHighlight[];
  relevance_score: number;
}

export interface ChatSearchHighlight {
  text: string;
  start: number;
  end: number;
}

export type ChatFinishReason = 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'function_call';

// === CHAT SERVICE REQUEST/RESPONSE TYPES ===

export interface CreateChatSessionRequest {
  title: string;
  project_id: string;
  model_provider?: string;
  model_name?: string;
  system_prompt?: string;
  settings?: Record<string, any>;
}

export interface UpdateChatSessionRequest {
  title?: string;
  system_prompt?: string;
  settings?: Record<string, any>;
}

export interface CreateMessageRequest {
  content: string | object;
  role: 'user' | 'assistant' | 'system';
  content_type?: string;
  metadata?: Record<string, any>;
}

export interface UpdateMessageRequest {
  content?: string | object;
  metadata?: Record<string, any>;
}

export interface ChatSessionListResponse {
  sessions: DatabaseChatSession[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface MessageListResponse {
  messages: DatabaseMessage[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface ChatAnalytics {
  totalSessions: number;
  totalMessages: number;
  totalTokens: number;
  recentSessions: DatabaseChatSession[];
  modelUsage: Record<string, number>;
  dailyUsage: Array<{
    date: string;
    sessions: number;
    messages: number;
    tokens: number;
  }>;
}

export interface SearchMessagesRequest {
  query: string;
  projectId?: string;
  sessionId?: string;
  offset?: number;
  limit?: number;
}

export interface SearchMessagesResponse {
  messages: DatabaseMessage[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface PaginationOptions {
  offset?: number;
  limit?: number;
}

// Import database types for reference
import type { DatabaseChatSession, DatabaseMessage } from './database';