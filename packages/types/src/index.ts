// packages/types/src/index.ts

// Core database types
export * from './database';

// Auth types (excluding conflicting User type)
export type {
  AuthUser,
  AuthUserRole,
  AuthPermission,
  AuthJWTPayload,
  AuthTokens,
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthRefreshTokenRequest,
  AuthPasswordResetRequest,
  AuthPasswordUpdateRequest,
  LoginCredentials,
  RegisterData,
  PasswordResetRequest,
  EmailVerificationRequest,
  RefreshTokenRequest,
  AuthServiceResponse,
  UserSession,
  SecurityLog,
  Resource,
  Action,
  UserRole
} from './auth';

// Chat types (excluding conflicting types with llm-adapters)
export type {
  // Live chat message (not database entity)
  ChatMessage as LiveChatMessage,
  ChatMessageRole,
  ChatTokenUsage,
  ChatCitation,
  ChatAttachment,
  ChatAttachmentType,
  
  // Chat responses (renamed to avoid conflicts)
  ChatResponse as LiveChatResponse,
  StreamingChatResponse as LiveStreamingChatResponse,
  
  // Streaming
  ChatStreamingEvent,
  ChatStreamingEventType,
  ChatStreamingData,
  
  // Function calling
  ChatFunctionCall,
  ChatToolCall,
  
  // Chat session management
  ChatSessionConfig,
  ChatTool,
  ChatFunctionDefinition,
  
  // Chat search
  ChatSearchResult,
  ChatSearchHighlight,
  
  // Finish reason (renamed to avoid conflicts)
  ChatFinishReason as LiveChatFinishReason,
  
  // Service request/response types
  CreateChatSessionRequest,
  UpdateChatSessionRequest,
  CreateMessageRequest,
  UpdateMessageRequest,
  ChatSessionListResponse,
  MessageListResponse,
  ChatAnalytics,
  SearchMessagesRequest,
  SearchMessagesResponse,
  PaginationOptions
} from './chat';

// File types  
export * from './files';

// API types
export * from './api';

// Project types
export * from './projects';

// Export comprehensive LLM adapter types (these are the primary AI types)
export * from './llm-adapters';

// Marketing and Sales types
export * from './marketing';
export * from './sales';
export * from './analytics';
