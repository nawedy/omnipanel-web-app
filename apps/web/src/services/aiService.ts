// apps/web/src/services/aiService.ts
// AI service for workspace integration

"use client";

import { 
  ProviderFactory,
  OpenAIAdapter,
  AnthropicAdapter,
  GoogleAIAdapter,
  OllamaAdapter,
  DeepSeekAdapter,
  MistralAdapter,
  QwenAdapter,
  HuggingFaceAdapter,
  LlamaCppAdapter,
  VLLMAdapter,
  globalAdapterRegistry
} from '@omnipanel/llm-adapters';

import { 
  type ChatMessage,
  type ChatResponse,
  type StreamingChatResponse,
  type ModelInfo,
  type TokenUsage,
  type LLMUsageStats
} from '@omnipanel/types';

import { configService } from './configService';
import { contextService, type WorkspaceContext, type ContextSummary } from './contextService';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AIStreamOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (response: string) => void;
  onError?: (error: Error) => void;
  context?: string;
}

export interface AIProvider {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  model: string;
}

export interface Conversation {
  id: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

class AIService {
  private currentProvider: AIProvider = {
    name: 'openai',
    model: 'gpt-4'
  };

  private conversations: Map<string, Conversation> = new Map();
  private activeStreams: Map<string, AbortController> = new Map();

  setProvider(provider: AIProvider): void {
    this.currentProvider = provider;
  }

  createConversation(): Conversation {
    const conversation: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  async streamChat(messages: AIMessage[], options: AIStreamOptions = {}): Promise<void> {
    try {
      const { onChunk, onComplete, onError, context } = options;
      
      // Add context if provided
      const contextualMessages = context 
        ? [{ role: 'system' as const, content: context, timestamp: new Date() }, ...messages]
        : messages;

      // Mock streaming for now - replace with actual AI provider integration
      const response = "This is a mock AI response. Please integrate with your preferred AI provider.";
      
      // Simulate streaming
      const words = response.split(' ');
      let currentResponse = '';
      
      for (const word of words) {
        currentResponse += word + ' ';
        onChunk?.(word + ' ');
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      onComplete?.(currentResponse.trim());
    } catch (error) {
      options.onError?.(error as Error);
    }
  }

  async streamCompletion(prompt: string, options: AIStreamOptions = {}): Promise<void> {
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: prompt,
        timestamp: new Date()
      }
    ];

    return this.streamChat(messages, options);
  }

  async streamMessage(conversationId: string, message: string, options: AIStreamOptions = {}): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const userMessage: AIMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    conversation.messages.push(userMessage);
    conversation.updatedAt = new Date();

    const streamId = `stream_${Date.now()}`;
    const abortController = new AbortController();
    this.activeStreams.set(streamId, abortController);

    try {
      let assistantResponse = '';
      
      await this.streamChat(conversation.messages, {
        ...options,
        onChunk: (chunk) => {
          assistantResponse += chunk;
          options.onChunk?.(chunk);
        },
        onComplete: (response) => {
          const assistantMessage: AIMessage = {
            role: 'assistant',
            content: response,
            timestamp: new Date()
          };
          
          conversation.messages.push(assistantMessage);
          conversation.updatedAt = new Date();
          
          this.activeStreams.delete(streamId);
          options.onComplete?.(response);
        },
        onError: (error) => {
          this.activeStreams.delete(streamId);
          options.onError?.(error);
        }
      });
    } catch (error) {
      this.activeStreams.delete(streamId);
      throw error;
    }
  }

  stopStream(streamId?: string): void {
    if (streamId) {
      const controller = this.activeStreams.get(streamId);
      if (controller) {
        controller.abort();
        this.activeStreams.delete(streamId);
      }
    } else {
      // Stop all active streams
      this.activeStreams.forEach(controller => controller.abort());
      this.activeStreams.clear();
    }
  }

  async generateResponse(messages: AIMessage[], context?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let response = '';
      
      this.streamChat(messages, {
        context,
        onChunk: (chunk) => {
          response += chunk;
        },
        onComplete: (finalResponse) => {
          resolve(finalResponse);
        },
        onError: (error) => {
          reject(error);
        }
      });
    });
  }

  async analyzeCode(code: string, language: string): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: `Analyze this ${language} code and provide insights:\n\n${code}`,
        timestamp: new Date()
      }
    ];

    return this.generateResponse(messages);
  }

  async suggestCommand(context: string, intent: string): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: `Given this context: ${context}\n\nSuggest a command for: ${intent}`,
        timestamp: new Date()
      }
    ];

    return this.generateResponse(messages);
  }

  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values());
  }

  deleteConversation(id: string): boolean {
    return this.conversations.delete(id);
  }
}

export const aiService = new AIService(); 