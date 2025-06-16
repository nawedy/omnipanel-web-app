// apps/web/src/services/aiService.ts
// Enhanced AI service with context awareness and streaming capabilities

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
  AIProvider,
  type AIProviderConfig,
  type ChatMessage,
  type ChatResponse,
  type StreamingChatResponse,
  type ModelInfo,
  type TokenUsage,
  type LLMUsageStats
} from '@omnipanel/types';

import { configService } from './configService';
import { contextService, type WorkspaceContext, type ContextSummary } from './contextService';

export interface AIProvider {
  id: string;
  name: string;
  models: AIModel[];
  apiKeyRequired: boolean;
  baseUrl?: string;
  supportedFeatures: AIFeature[];
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  contextLength: number;
  inputCost?: number; // per 1K tokens
  outputCost?: number; // per 1K tokens
  capabilities: ModelCapability[];
}

export interface AIFeature {
  id: string;
  name: string;
  description: string;
}

export interface ModelCapability {
  type: 'text' | 'code' | 'image' | 'function_calling' | 'streaming' | 'vision';
  supported: boolean;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    provider?: string;
    tokens?: {
      input: number;
      output: number;
    };
    cost?: number;
    responseTime?: number;
    context?: {
      files: string[];
      commands: string[];
      selection?: string;
    };
  };
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
  provider: string;
  contextSnapshot?: WorkspaceContext;
  tags?: string[];
}

export interface StreamingResponse {
  id: string;
  content: string;
  isComplete: boolean;
  metadata?: {
    tokens?: number;
    model?: string;
    provider?: string;
  };
}

export interface AIRequest {
  message: string;
  conversationId?: string;
  model?: string;
  provider?: string;
  includeContext?: boolean;
  contextFilter?: {
    includeFiles?: boolean;
    includeTerminal?: boolean;
    includeSelection?: boolean;
    maxTokens?: number;
  };
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  id: string;
  content: string;
  conversationId: string;
  metadata: {
    model: string;
    provider: string;
    tokens: {
      input: number;
      output: number;
    };
    cost?: number;
    responseTime: number;
    contextUsed?: boolean;
  };
}

class AIService {
  private providers: Map<string, AIProvider> = new Map();
  private conversations: Map<string, AIConversation> = new Map();
  private activeStreams: Map<string, AbortController> = new Map();
  private defaultSystemPrompt = `You are an AI assistant integrated into OmniPanel, a comprehensive development workspace. You have access to the user's current workspace context including open files, terminal history, and selected code. Use this context to provide relevant, helpful responses.

When responding:
1. Reference specific files, code, or commands when relevant
2. Provide actionable suggestions based on the current workspace state
3. Explain your reasoning when making recommendations
4. Ask for clarification if the context is unclear`;

  constructor() {
    this.initializeProviders();
    this.loadConversations();
  }

  // Provider Management
  public getProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  public getProvider(id: string): AIProvider | undefined {
    return this.providers.get(id);
  }

  public getModels(providerId?: string): AIModel[] {
    if (providerId) {
      const provider = this.providers.get(providerId);
      return provider?.models || [];
    }
    
    return Array.from(this.providers.values()).flatMap(p => p.models);
  }

  public getDefaultModel(): AIModel | undefined {
    const config = configService.getConfig();
    const defaultProvider = config.ai?.defaultProvider || 'openai';
    const defaultModel = config.ai?.defaultModel || 'gpt-4';
    
    return this.getModels(defaultProvider).find(m => m.id === defaultModel) ||
           this.getModels().find(m => m.id.includes('gpt-4')) ||
           this.getModels()[0];
  }

  // Conversation Management
  public createConversation(title?: string, model?: string, provider?: string): AIConversation {
    const defaultModel = this.getDefaultModel();
    const conversation: AIConversation = {
      id: this.generateId(),
      title: title || 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model: model || defaultModel?.id || 'gpt-4',
      provider: provider || defaultModel?.provider || 'openai',
      contextSnapshot: contextService.getContext()
    };

    this.conversations.set(conversation.id, conversation);
    this.saveConversations();
    return conversation;
  }

  public getConversation(id: string): AIConversation | undefined {
    return this.conversations.get(id);
  }

  public getConversations(): AIConversation[] {
    return Array.from(this.conversations.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  public deleteConversation(id: string): boolean {
    const deleted = this.conversations.delete(id);
    if (deleted) {
      this.saveConversations();
    }
    return deleted;
  }

  public updateConversationTitle(id: string, title: string): boolean {
    const conversation = this.conversations.get(id);
    if (conversation) {
      conversation.title = title;
      conversation.updatedAt = new Date();
      this.saveConversations();
      return true;
    }
    return false;
  }

  // AI Interaction
  public async sendMessage(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    // Get or create conversation
    let conversation = request.conversationId 
      ? this.getConversation(request.conversationId)
      : this.createConversation();
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Build context-aware prompt
    const contextPrompt = request.includeContext 
      ? this.buildContextPrompt(request.message, request.contextFilter)
      : request.message;

    // Create user message
    const userMessage: AIMessage = {
      id: this.generateId(),
      role: 'user',
      content: request.message,
      timestamp: new Date(),
      metadata: {
        model: request.model || conversation.model,
        provider: request.provider || conversation.provider,
        context: request.includeContext ? this.extractContextMetadata() : undefined
      }
    };

    // Add to conversation
    conversation.messages.push(userMessage);

    try {
      // Make AI request
      const response = await this.makeAIRequest({
        messages: this.buildMessageHistory(conversation, contextPrompt),
        model: request.model || conversation.model,
        provider: request.provider || conversation.provider,
        systemPrompt: request.systemPrompt || this.defaultSystemPrompt,
        temperature: request.temperature,
        maxTokens: request.maxTokens,
        stream: request.stream || false
      });

      const responseTime = Date.now() - startTime;

      // Create assistant message
      const assistantMessage: AIMessage = {
        id: this.generateId(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        metadata: {
          model: response.model,
          provider: response.provider,
          tokens: response.tokens,
          cost: response.cost,
          responseTime,
          context: request.includeContext ? this.extractContextMetadata() : undefined
        }
      };

      // Add to conversation
      conversation.messages.push(assistantMessage);
      conversation.updatedAt = new Date();
      
      // Update conversation title if it's the first exchange
      if (conversation.messages.length === 2 && conversation.title === 'New Conversation') {
        conversation.title = this.generateConversationTitle(request.message);
      }

      this.saveConversations();

      return {
        id: assistantMessage.id,
        content: response.content,
        conversationId: conversation.id,
        metadata: {
          model: response.model,
          provider: response.provider,
          tokens: response.tokens,
          cost: response.cost,
          responseTime,
          contextUsed: request.includeContext
        }
      };

    } catch (error) {
      // Remove the user message if the request failed
      conversation.messages.pop();
      throw error;
    }
  }

  public async *streamMessage(request: AIRequest): AsyncGenerator<StreamingResponse> {
    const conversation = request.conversationId 
      ? this.getConversation(request.conversationId)
      : this.createConversation();
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const contextPrompt = request.includeContext 
      ? this.buildContextPrompt(request.message, request.contextFilter)
      : request.message;

    const userMessage: AIMessage = {
      id: this.generateId(),
      role: 'user',
      content: request.message,
      timestamp: new Date(),
      metadata: {
        model: request.model || conversation.model,
        provider: request.provider || conversation.provider,
        context: request.includeContext ? this.extractContextMetadata() : undefined
      }
    };

    conversation.messages.push(userMessage);

    const streamId = this.generateId();
    const abortController = new AbortController();
    this.activeStreams.set(streamId, abortController);

    try {
      let fullContent = '';
      
      for await (const chunk of this.streamAIRequest({
        messages: this.buildMessageHistory(conversation, contextPrompt),
        model: request.model || conversation.model,
        provider: request.provider || conversation.provider,
        systemPrompt: request.systemPrompt || this.defaultSystemPrompt,
        temperature: request.temperature,
        maxTokens: request.maxTokens,
        signal: abortController.signal
      })) {
        fullContent += chunk.content;
        
        yield {
          id: streamId,
          content: fullContent,
          isComplete: chunk.isComplete,
          metadata: chunk.metadata
        };

        if (chunk.isComplete) {
          // Add assistant message to conversation
          const assistantMessage: AIMessage = {
            id: this.generateId(),
            role: 'assistant',
            content: fullContent,
            timestamp: new Date(),
            metadata: {
              model: chunk.metadata?.model || conversation.model,
              provider: chunk.metadata?.provider || conversation.provider,
              tokens: { input: 0, output: chunk.metadata?.tokens || 0 },
              context: request.includeContext ? this.extractContextMetadata() : undefined
            }
          };

          conversation.messages.push(assistantMessage);
          conversation.updatedAt = new Date();
          
          if (conversation.messages.length === 2 && conversation.title === 'New Conversation') {
            conversation.title = this.generateConversationTitle(request.message);
          }

          this.saveConversations();
          break;
        }
      }
    } finally {
      this.activeStreams.delete(streamId);
    }
  }

  public stopStream(streamId: string): void {
    const controller = this.activeStreams.get(streamId);
    if (controller) {
      controller.abort();
      this.activeStreams.delete(streamId);
    }
  }

  public stopAllStreams(): void {
    for (const [id, controller] of this.activeStreams) {
      controller.abort();
    }
    this.activeStreams.clear();
  }

  // Context Integration
  private buildContextPrompt(message: string, filter?: AIRequest['contextFilter']): string {
    if (!filter) return message;

    const maxTokens = filter.maxTokens || 2000;
    const relevantContext = contextService.getRelevantContext(message, maxTokens);
    
    if (!relevantContext) return message;

    return `Context from current workspace:
${relevantContext}

User message: ${message}`;
  }

  private extractContextMetadata(): { files: string[]; commands: string[]; selection?: string } {
    const context = contextService.getContext();
    
    return {
      files: context.activeFiles.map(f => f.name),
      commands: context.terminalHistory.slice(0, 5).map(h => h.command),
      selection: context.currentSelection?.text.substring(0, 100)
    };
  }

  private buildMessageHistory(conversation: AIConversation, currentMessage: string): Array<{role: string; content: string}> {
    const messages = conversation.messages.slice(-10); // Last 10 messages for context
    const history = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Add current message
    history.push({
      role: 'user',
      content: currentMessage
    });

    return history;
  }

  // AI Provider Integration (Mock implementation)
  private async makeAIRequest(params: {
    messages: Array<{role: string; content: string}>;
    model: string;
    provider: string;
    systemPrompt: string;
    temperature?: number;
    maxTokens?: number;
    stream: boolean;
  }): Promise<{
    content: string;
    model: string;
    provider: string;
    tokens: { input: number; output: number };
    cost?: number;
  }> {
    // Mock implementation - replace with actual AI provider integration
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const mockResponse = `I understand you're asking about: "${params.messages[params.messages.length - 1].content}". 

Based on your current workspace context, I can see you're working on a development project. Here's my response tailored to your specific situation.

This is a mock response from the ${params.model} model via ${params.provider}. In a real implementation, this would connect to the actual AI provider APIs.`;

    return {
      content: mockResponse,
      model: params.model,
      provider: params.provider,
      tokens: {
        input: params.messages.reduce((acc, m) => acc + Math.ceil(m.content.length / 4), 0),
        output: Math.ceil(mockResponse.length / 4)
      },
      cost: 0.01
    };
  }

  private async *streamAIRequest(params: {
    messages: Array<{role: string; content: string}>;
    model: string;
    provider: string;
    systemPrompt: string;
    temperature?: number;
    maxTokens?: number;
    signal: AbortSignal;
  }): AsyncGenerator<{
    content: string;
    isComplete: boolean;
    metadata?: { model?: string; provider?: string; tokens?: number };
  }> {
    // Mock streaming implementation
    const fullResponse = `I understand you're asking about: "${params.messages[params.messages.length - 1].content}". 

Based on your current workspace context, I can see you're working on a development project. Here's my response tailored to your specific situation.

This is a mock streaming response from the ${params.model} model via ${params.provider}. In a real implementation, this would connect to the actual AI provider APIs and stream the response in real-time.`;

    const words = fullResponse.split(' ');
    let currentContent = '';

    for (let i = 0; i < words.length; i++) {
      if (params.signal.aborted) {
        throw new Error('Stream aborted');
      }

      currentContent += (i > 0 ? ' ' : '') + words[i];
      const isComplete = i === words.length - 1;

      yield {
        content: words[i] + (i < words.length - 1 ? ' ' : ''),
        isComplete,
        metadata: {
          model: params.model,
          provider: params.provider,
          tokens: isComplete ? Math.ceil(fullResponse.length / 4) : undefined
        }
      };

      // Simulate streaming delay
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    }
  }

  // Utility Methods
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConversationTitle(message: string): string {
    // Extract a meaningful title from the first message
    const words = message.split(' ').slice(0, 6);
    return words.join(' ') + (message.split(' ').length > 6 ? '...' : '');
  }

  private initializeProviders(): void {
    // OpenAI
    this.providers.set('openai', {
      id: 'openai',
      name: 'OpenAI',
      apiKeyRequired: true,
      models: [
        {
          id: 'gpt-4',
          name: 'GPT-4',
          provider: 'openai',
          contextLength: 8192,
          inputCost: 0.03,
          outputCost: 0.06,
          capabilities: [
            { type: 'text', supported: true },
            { type: 'code', supported: true },
            { type: 'function_calling', supported: true },
            { type: 'streaming', supported: true }
          ]
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          provider: 'openai',
          contextLength: 4096,
          inputCost: 0.001,
          outputCost: 0.002,
          capabilities: [
            { type: 'text', supported: true },
            { type: 'code', supported: true },
            { type: 'function_calling', supported: true },
            { type: 'streaming', supported: true }
          ]
        }
      ],
      supportedFeatures: [
        { id: 'streaming', name: 'Streaming', description: 'Real-time response streaming' },
        { id: 'function_calling', name: 'Function Calling', description: 'Tool and function integration' }
      ]
    });

    // Anthropic
    this.providers.set('anthropic', {
      id: 'anthropic',
      name: 'Anthropic',
      apiKeyRequired: true,
      models: [
        {
          id: 'claude-3-opus',
          name: 'Claude 3 Opus',
          provider: 'anthropic',
          contextLength: 200000,
          inputCost: 0.015,
          outputCost: 0.075,
          capabilities: [
            { type: 'text', supported: true },
            { type: 'code', supported: true },
            { type: 'vision', supported: true },
            { type: 'streaming', supported: true }
          ]
        },
        {
          id: 'claude-3-sonnet',
          name: 'Claude 3 Sonnet',
          provider: 'anthropic',
          contextLength: 200000,
          inputCost: 0.003,
          outputCost: 0.015,
          capabilities: [
            { type: 'text', supported: true },
            { type: 'code', supported: true },
            { type: 'vision', supported: true },
            { type: 'streaming', supported: true }
          ]
        }
      ],
      supportedFeatures: [
        { id: 'streaming', name: 'Streaming', description: 'Real-time response streaming' },
        { id: 'vision', name: 'Vision', description: 'Image analysis capabilities' }
      ]
    });

    // Local/Ollama
    this.providers.set('ollama', {
      id: 'ollama',
      name: 'Ollama (Local)',
      apiKeyRequired: false,
      baseUrl: 'http://localhost:11434',
      models: [
        {
          id: 'llama2',
          name: 'Llama 2',
          provider: 'ollama',
          contextLength: 4096,
          capabilities: [
            { type: 'text', supported: true },
            { type: 'code', supported: true },
            { type: 'streaming', supported: true }
          ]
        },
        {
          id: 'codellama',
          name: 'Code Llama',
          provider: 'ollama',
          contextLength: 4096,
          capabilities: [
            { type: 'text', supported: true },
            { type: 'code', supported: true },
            { type: 'streaming', supported: true }
          ]
        }
      ],
      supportedFeatures: [
        { id: 'streaming', name: 'Streaming', description: 'Real-time response streaming' },
        { id: 'local', name: 'Local Processing', description: 'Runs locally without API calls' }
      ]
    });
  }

  private saveConversations(): void {
    try {
      const conversationsData = Array.from(this.conversations.values());
      localStorage.setItem('omnipanel-ai-conversations', JSON.stringify(conversationsData));
    } catch (error) {
      console.error('Failed to save conversations:', error);
    }
  }

  private loadConversations(): void {
    try {
      const saved = localStorage.getItem('omnipanel-ai-conversations');
      if (saved) {
        const conversationsData: AIConversation[] = JSON.parse(saved);
        conversationsData.forEach(conv => {
          // Convert date strings back to Date objects
          conv.createdAt = new Date(conv.createdAt);
          conv.updatedAt = new Date(conv.updatedAt);
          conv.messages.forEach(msg => {
            msg.timestamp = new Date(msg.timestamp);
          });
          
          this.conversations.set(conv.id, conv);
        });
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }

  // Export/Import
  public exportConversations(): string {
    const conversations = Array.from(this.conversations.values());
    return JSON.stringify(conversations, null, 2);
  }

  public importConversations(data: string): boolean {
    try {
      const conversations: AIConversation[] = JSON.parse(data);
      conversations.forEach(conv => {
        conv.createdAt = new Date(conv.createdAt);
        conv.updatedAt = new Date(conv.updatedAt);
        conv.messages.forEach(msg => {
          msg.timestamp = new Date(msg.timestamp);
        });
        
        this.conversations.set(conv.id, conv);
      });
      
      this.saveConversations();
      return true;
    } catch (error) {
      console.error('Failed to import conversations:', error);
      return false;
    }
  }

  public clearAllConversations(): void {
    this.conversations.clear();
    localStorage.removeItem('omnipanel-ai-conversations');
  }
}

// Export singleton instance
export const aiService = new AIService(); 