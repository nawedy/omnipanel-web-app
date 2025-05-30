// packages/core/src/chat/chat.service.ts
import type {
  DatabaseChatSession,
  DatabaseMessage,
  ChatMessage,
  CreateChatSessionRequest,
  UpdateChatSessionRequest,
  CreateMessageRequest,
  UpdateMessageRequest,
  ChatSessionListResponse,
  MessageListResponse,
  ChatAnalytics,
  SearchMessagesRequest,
  SearchMessagesResponse,
  PaginationOptions,
  DatabaseContentType
} from '@omnipanel/types';
import { DatabaseClient } from '@/database/client';
import { CoreError, ErrorCodes } from '@/utils/errors';
import { validateInput } from '@/utils/validation';
import { sanitizeContent } from '../utils/sanitization';

export class ChatService {
  private db: DatabaseClient;

  constructor(database: DatabaseClient) {
    this.db = database;
  }

  /**
   * Create a new chat session
   */
  async createChatSession(
    userId: string,
    data: CreateChatSessionRequest
  ): Promise<DatabaseChatSession> {
    try {
      // Validate input
      const validation = validateInput(data, {
        title: { required: true, minLength: 1, maxLength: 255 },
        project_id: { required: true }
      });

      if (!validation.isValid) {
        throw new CoreError(
          'Invalid chat session data',
          ErrorCodes.VALIDATION_ERROR,
          validation.errors
        );
      }

      // Check if user has access to the project
      const project = await this.db.projects.findById(data.project_id);
      if (!project) {
        throw new CoreError(
          'Project not found',
          ErrorCodes.PROJECT_NOT_FOUND
        );
      }

      // For now, only check if user is the project owner
      // TODO: Add proper project membership check
      if (project.user_id !== userId) {
        throw new CoreError(
          'Access denied to project',
          ErrorCodes.ACCESS_DENIED
        );
      }

      // Create session data for database
      const sessionData = {
        title: data.title.trim(),
        user_id: userId,
        project_id: data.project_id,
        model_provider: data.model_provider || 'openai',
        model_name: data.model_name || 'gpt-3.5-turbo',
        system_prompt: data.system_prompt || undefined
      };

      return await this.db.chatSessions.create(sessionData);
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to create chat session',
        ErrorCodes.CHAT_SESSION_CREATE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Get a chat session by ID
   */
  async getChatSession(sessionId: string, userId: string): Promise<DatabaseChatSession> {
    try {
      const session = await this.db.chatSessions.findById(sessionId);
      if (!session) {
        throw new CoreError(
          'Chat session not found',
          ErrorCodes.CHAT_SESSION_NOT_FOUND
        );
      }

      // Check if user has access to this session
      if (session.user_id !== userId) {
        // TODO: Check project membership once implemented
        throw new CoreError(
          'Access denied to chat session',
          ErrorCodes.ACCESS_DENIED
        );
      }

      return session;
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to get chat session',
        ErrorCodes.CHAT_SESSION_GET_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Update a chat session
   */
  async updateChatSession(
    sessionId: string,
    userId: string,
    data: UpdateChatSessionRequest
  ): Promise<DatabaseChatSession> {
    try {
      // Get and validate session access
      const session = await this.getChatSession(sessionId, userId);

      // Validate update data
      const validation = validateInput(data, {
        title: { minLength: 1, maxLength: 255 },
        system_prompt: { maxLength: 2000 }
      });

      if (!validation.isValid) {
        throw new CoreError(
          'Invalid update data',
          ErrorCodes.VALIDATION_ERROR,
          validation.errors
        );
      }

      // Prepare update data
      const updateData: Partial<DatabaseChatSession> = {};
      if (data.title !== undefined) updateData.title = data.title.trim();
      if (data.system_prompt !== undefined) updateData.system_prompt = data.system_prompt;

      return await this.db.chatSessions.update(sessionId, updateData);
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to update chat session',
        ErrorCodes.CHAT_SESSION_UPDATE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Delete a chat session
   */
  async deleteChatSession(sessionId: string, userId: string): Promise<void> {
    try {
      // Get and validate session access
      await this.getChatSession(sessionId, userId);

      // Delete all messages in the session first
      const messages = await this.db.messages.findBySessionId(sessionId);
      for (const message of messages) {
        await this.db.messages.delete(message.id);
      }

      // Delete the session
      await this.db.chatSessions.delete(sessionId);
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to delete chat session',
        ErrorCodes.CHAT_SESSION_DELETE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * List chat sessions for a user
   */
  async listChatSessions(
    userId: string,
    projectId?: string,
    options: PaginationOptions = {}
  ): Promise<ChatSessionListResponse> {
    try {
      const { offset = 0, limit = 20 } = options;

      // Get sessions by project or user
      let sessions: DatabaseChatSession[];
      let total: number;

      if (projectId) {
        // Verify user has access to project
        const project = await this.db.projects.findById(projectId);
        if (!project || project.user_id !== userId) {
          throw new CoreError(
            'Access denied to project',
            ErrorCodes.ACCESS_DENIED
          );
        }

        sessions = await this.db.chatSessions.findByProjectId(projectId);
        total = sessions.length;
        
        // Apply pagination
        sessions = sessions.slice(offset, offset + limit);
      } else {
        // Get all sessions for user
        sessions = await this.db.chatSessions.findByUserId(userId);
        total = sessions.length;
        
        // Apply pagination
        sessions = sessions.slice(offset, offset + limit);
      }

      return {
        sessions,
        total,
        offset,
        limit,
        hasMore: offset + limit < total
      };
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to list chat sessions',
        ErrorCodes.CHAT_SESSION_LIST_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Search chat sessions
   */
  async searchChatSessions(
    userId: string,
    query: string,
    projectId?: string,
    options: PaginationOptions = {}
  ): Promise<ChatSessionListResponse> {
    try {
      const { offset = 0, limit = 20 } = options;

      // Get all sessions first
      const allSessions = projectId 
        ? await this.db.chatSessions.findByProjectId(projectId)
        : await this.db.chatSessions.findByUserId(userId);

      // Filter by search query (simple text search)
      const filteredSessions = allSessions.filter(session =>
        session.title.toLowerCase().includes(query.toLowerCase()) ||
        (session.system_prompt && session.system_prompt.toLowerCase().includes(query.toLowerCase()))
      );

      const total = filteredSessions.length;
      const sessions = filteredSessions.slice(offset, offset + limit);

      return {
        sessions,
        total,
        offset,
        limit,
        hasMore: offset + limit < total
      };
    } catch (error) {
      throw new CoreError(
        'Failed to search chat sessions',
        ErrorCodes.CHAT_SESSION_SEARCH_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Add a message to a chat session
   */
  async addMessage(
    sessionId: string,
    userId: string,
    data: CreateMessageRequest
  ): Promise<DatabaseMessage> {
    try {
      // Validate session access
      const session = await this.getChatSession(sessionId, userId);

      // Validate message data
      const validation = validateInput(data, {
        content: { required: true, minLength: 1 },
        role: { required: true, enum: ['user', 'assistant', 'system'] }
      });

      if (!validation.isValid) {
        throw new CoreError(
          'Invalid message data',
          ErrorCodes.VALIDATION_ERROR,
          validation.errors
        );
      }

      // Sanitize content
      const sanitizedContent = sanitizeContent(data.content);

      // Create message data for database
      const messageData = {
        session_id: sessionId,
        content: typeof sanitizedContent === 'string' ? sanitizedContent : JSON.stringify(sanitizedContent),
        role: data.role,
        content_type: (data.content_type as DatabaseContentType) || 'text',
        metadata: data.metadata || {}
      };

      const createdMessage = await this.db.messages.create(messageData);

      // Update session stats if needed
      // TODO: Implement session stats tracking

      return createdMessage;
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to add message',
        ErrorCodes.MESSAGE_CREATE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Get messages for a chat session
   */
  async getMessages(
    sessionId: string,
    userId: string,
    options: PaginationOptions = {}
  ): Promise<MessageListResponse> {
    try {
      // Validate session access
      await this.getChatSession(sessionId, userId);

      const { offset = 0, limit = 50 } = options;

      // Get messages for session
      const allMessages = await this.db.messages.findBySessionId(sessionId);
      const total = allMessages.length;
      
      // Apply pagination (reverse order for chat - newest first)
      const messages = allMessages
        .reverse()
        .slice(offset, offset + limit);

      return {
        messages,
        total,
        offset,
        limit,
        hasMore: offset + limit < total
      };
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to get messages',
        ErrorCodes.MESSAGE_GET_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Update a message
   */
  async updateMessage(
    messageId: string,
    userId: string,
    data: UpdateMessageRequest
  ): Promise<DatabaseMessage> {
    try {
      // Get message and validate access
      const message = await this.db.messages.findById(messageId);
      if (!message) {
        throw new CoreError(
          'Message not found',
          ErrorCodes.MESSAGE_NOT_FOUND
        );
      }

      // Validate session access
      const session = await this.getChatSession(message.session_id, userId);

      // Validate update data
      const validation = validateInput(data, {
        content: { minLength: 1 }
      });

      if (!validation.isValid) {
        throw new CoreError(
          'Invalid update data',
          ErrorCodes.VALIDATION_ERROR,
          validation.errors
        );
      }

      // Sanitize content if provided
      const updateData: Partial<DatabaseMessage> = {};
      if (data.content !== undefined) {
        const sanitizedContent = sanitizeContent(data.content);
        updateData.content = typeof sanitizedContent === 'string' ? sanitizedContent : JSON.stringify(sanitizedContent);
      }
      if (data.metadata !== undefined) {
        updateData.metadata = data.metadata;
      }

      return await this.db.messages.update(messageId, updateData);
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to update message',
        ErrorCodes.MESSAGE_UPDATE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      // Get message and validate access
      const message = await this.db.messages.findById(messageId);
      if (!message) {
        throw new CoreError(
          'Message not found',
          ErrorCodes.MESSAGE_NOT_FOUND
        );
      }

      // Validate session access
      await this.getChatSession(message.session_id, userId);

      // Delete the message
      await this.db.messages.delete(messageId);

      // Update session stats if needed
      // TODO: Implement session stats tracking
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to delete message',
        ErrorCodes.MESSAGE_DELETE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Get chat analytics for a user
   */
  async getChatAnalytics(userId: string, projectId?: string): Promise<ChatAnalytics> {
    try {
      // Basic analytics implementation
      const sessions = projectId 
        ? await this.db.chatSessions.findByProjectId(projectId)
        : await this.db.chatSessions.findByUserId(userId);

      const totalSessions = sessions.length;
      
      // Get total messages across all sessions
      let totalMessages = 0;
      for (const session of sessions) {
        const messages = await this.db.messages.findBySessionId(session.id);
        totalMessages += messages.length;
      }

      // Get recent sessions (last 5)
      const recentSessions = sessions
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5);

      return {
        totalSessions,
        totalMessages,
        totalTokens: 0, // TODO: Implement token tracking
        recentSessions,
        modelUsage: {}, // TODO: Implement model usage tracking
        dailyUsage: [] // TODO: Implement daily usage tracking
      };
    } catch (error) {
      throw new CoreError(
        'Failed to get chat analytics',
        ErrorCodes.ANALYTICS_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Search messages across sessions
   */
  async searchMessages(
    userId: string,
    request: SearchMessagesRequest
  ): Promise<SearchMessagesResponse> {
    try {
      const { query, projectId, sessionId, offset = 0, limit = 20 } = request;

      let sessions: DatabaseChatSession[];
      
      if (sessionId) {
        // Search in specific session
        const session = await this.getChatSession(sessionId, userId);
        sessions = [session];
      } else if (projectId) {
        // Search in project sessions
        sessions = await this.db.chatSessions.findByProjectId(projectId);
      } else {
        // Search in all user sessions
        sessions = await this.db.chatSessions.findByUserId(userId);
      }

      // Search messages in sessions
      let allMessages: DatabaseMessage[] = [];
      for (const session of sessions) {
        const messages = await this.db.messages.findBySessionId(session.id);
        const filteredMessages = messages.filter(message =>
          message.content.toLowerCase().includes(query.toLowerCase())
        );
        allMessages = [...allMessages, ...filteredMessages];
      }

      // Sort by creation date (newest first)
      allMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const total = allMessages.length;
      const messages = allMessages.slice(offset, offset + limit);

      return {
        messages,
        total,
        offset,
        limit,
        hasMore: offset + limit < total
      };
    } catch (error) {
      throw new CoreError(
        'Failed to search messages',
        ErrorCodes.MESSAGE_SEARCH_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Archive a chat session
   */
  async archiveChatSession(sessionId: string, userId: string): Promise<DatabaseChatSession> {
    try {
      // Get and validate session access
      const session = await this.getChatSession(sessionId, userId);

      // Since there's no archived field in the database schema, we'll just return the session
      // TODO: Add archived field to database schema or implement archiving differently
      return session;
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to archive chat session',
        ErrorCodes.CHAT_SESSION_ARCHIVE_ERROR,
        { originalError: error }
      );
    }
  }
}