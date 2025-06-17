// apps/web/src/services/aiService.ts
// AI service for workspace integration with real LLM providers

"use client";

import { 
  OpenAIAdapter,
  AnthropicAdapter,
  OllamaAdapter,
  GoogleAIAdapter,
  DeepSeekAdapter,
  MistralAdapter,
  globalAdapterRegistry,
  type ChatMessage,
  type ChatResponse,
  type StreamingChatResponse
} from '@omnipanel/llm-adapters';

import { useAIConfigStore } from '@/stores/aiConfigStore';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    provider?: string;
    tokens?: number;
    cost?: number;
    responseTime?: number;
  };
}

export interface AIStreamOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (response: string) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: { current: number; total: number }) => void;
  context?: string;
  model?: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  conversationId?: string;
}

export interface AIProvider {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  isActive?: boolean;
  capabilities?: string[];
}

export interface CustomProviderConfig {
  id: string;
  name: string;
  displayName: string;
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  models: CustomModelConfig[];
  headers?: Record<string, string>;
  timeout?: number;
  maxRetries?: number;
  isCustom: true;
}

export interface CustomModelConfig {
  id: string;
  name: string;
  contextLength: number;
  supportsStreaming: boolean;
  supportsFunctions: boolean;
  pricing?: {
    input: number;
    output: number;
  };
  capabilities: string[];
}

export interface Conversation {
  id: string;
  title?: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    totalTokens?: number;
    totalCost?: number;
    model?: string;
    provider?: string;
    tags?: string[];
  };
}

export interface AICapabilities {
  chat: boolean;
  codeGeneration: boolean;
  codeAnalysis: boolean;
  imageGeneration: boolean;
  imageAnalysis: boolean;
  functionCalling: boolean;
  streaming: boolean;
  contextWindow: number;
  maxTokens: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  capabilities: AICapabilities;
  pricing?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// Generic adapter for custom providers
class CustomProviderAdapter {
  private config: CustomProviderConfig;

  constructor(config: CustomProviderConfig) {
    this.config = config;
  }

  async chat(messages: ChatMessage[], options?: any): Promise<ChatResponse> {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        ...this.config.headers
      },
      body: JSON.stringify({
        model: options?.model || this.config.defaultModel,
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 4096,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Custom provider error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id || `custom-${Date.now()}`,
      content: data.choices[0]?.message?.content || '',
      role: 'assistant',
      model: data.model,
      usage: data.usage,
      finishReason: data.choices[0]?.finish_reason,
      created: new Date()
    };
  }

  async *streamChat(messages: ChatMessage[], options?: any): AsyncGenerator<StreamingChatResponse> {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        ...this.config.headers
      },
      body: JSON.stringify({
        model: options?.model || this.config.defaultModel,
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 4096,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`Custom provider error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices[0]?.delta;
              if (delta?.content) {
                yield {
                  id: parsed.id || `custom-stream-${Date.now()}`,
                  content: delta.content,
                  role: 'assistant',
                  model: parsed.model,
                  delta: true,
                  created: new Date()
                };
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.chat([{ role: 'user', content: 'test' }]);
      return true;
    } catch {
      return false;
    }
  }
}

class AIService {
  private conversations: Map<string, Conversation> = new Map();
  private activeStreams: Map<string, AbortController> = new Map();
  private modelCache: Map<string, ModelInfo> = new Map();
  private conversationHistory: Map<string, AIMessage[]> = new Map();
  private customProviders: Map<string, CustomProviderConfig> = new Map();
  private defaultProvider = 'openai';
  private defaultModel = 'gpt-4o';

  // All available providers including custom ones
  private readonly ALL_PROVIDERS = [
    'openai',
    'anthropic', 
    'google',
    'deepseek',
    'mistral',
    'ollama',
    'huggingface',
    'qwen',
    'vllm',
    'llamacpp'
  ];

  constructor() {
    this.initializeAdapters();
    this.loadConversationsFromStorage();
    this.loadCustomProviders();
  }

  private initializeAdapters(): void {
    try {
      const aiConfig = useAIConfigStore.getState();
      
      // OpenAI adapter
      const openaiConfig = aiConfig.apiConfigs.find(config => config.provider === 'openai');
      if (openaiConfig?.apiKey) {
        const openaiAdapter = new OpenAIAdapter({
          apiKey: openaiConfig.apiKey,
          baseUrl: openaiConfig.baseUrl || 'https://api.openai.com/v1',
          timeout: 30000,
          maxRetries: 3
        });
        globalAdapterRegistry.register(openaiAdapter, 'openai');
      }

      // Anthropic adapter
      const anthropicConfig = aiConfig.apiConfigs.find(config => config.provider === 'anthropic');
      if (anthropicConfig?.apiKey) {
        const anthropicAdapter = new AnthropicAdapter({
          apiKey: anthropicConfig.apiKey,
          baseUrl: anthropicConfig.baseUrl || 'https://api.anthropic.com',
          timeout: 30000,
          maxRetries: 3
        });
        globalAdapterRegistry.register(anthropicAdapter, 'anthropic');
      }

      // Google AI adapter
      const googleConfig = aiConfig.apiConfigs.find(config => config.provider === 'google');
      if (googleConfig?.apiKey) {
        const googleAdapter = new GoogleAIAdapter({
          apiKey: googleConfig.apiKey,
          model: 'gemini-pro',
          baseUrl: googleConfig.baseUrl || 'https://generativelanguage.googleapis.com/v1beta',
          timeout: 30000,
          maxRetries: 3
        });
        globalAdapterRegistry.register(googleAdapter, 'google');
      }

      // DeepSeek adapter
      const deepseekConfig = aiConfig.apiConfigs.find(config => config.provider === 'deepseek');
      if (deepseekConfig?.apiKey) {
        const deepseekAdapter = new DeepSeekAdapter({
          apiKey: deepseekConfig.apiKey,
          baseUrl: deepseekConfig.baseUrl || 'https://api.deepseek.com/v1',
          timeout: 30000,
          maxRetries: 3
        });
        globalAdapterRegistry.register(deepseekAdapter, 'deepseek');
      }

      // Mistral adapter
      const mistralConfig = aiConfig.apiConfigs.find(config => config.provider === 'mistral');
      if (mistralConfig?.apiKey) {
        const mistralAdapter = new MistralAdapter({
          apiKey: mistralConfig.apiKey,
          baseUrl: mistralConfig.baseUrl || 'https://api.mistral.ai/v1',
          timeout: 30000,
          maxRetries: 3
        });
        globalAdapterRegistry.register(mistralAdapter, 'mistral');
      }

      // Ollama adapter (local)
      const ollamaConfig = aiConfig.apiConfigs.find(config => config.provider === 'ollama');
      if (ollamaConfig) {
        const ollamaAdapter = new OllamaAdapter({
          baseUrl: ollamaConfig.baseUrl || 'http://localhost:11434',
          timeout: 60000, // Longer timeout for local models
          maxRetries: 2
        });
        globalAdapterRegistry.register(ollamaAdapter, 'ollama');
      }

      // Initialize custom providers
      this.customProviders.forEach((config, providerId) => {
        const customAdapter = new CustomProviderAdapter(config);
        globalAdapterRegistry.register(customAdapter as any, providerId);
      });

      console.log('AI adapters initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI adapters:', error);
    }
  }

  // Custom provider management
  addCustomProvider(config: Omit<CustomProviderConfig, 'isCustom'>): string {
    const providerId = `custom_${config.id}`;
    const fullConfig: CustomProviderConfig = {
      ...config,
      isCustom: true
    };
    
    this.customProviders.set(providerId, fullConfig);
    this.saveCustomProviders();
    
    // Initialize the adapter
    const customAdapter = new CustomProviderAdapter(fullConfig);
    globalAdapterRegistry.register(customAdapter as any, providerId);
    
    return providerId;
  }

  updateCustomProvider(providerId: string, config: Partial<CustomProviderConfig>): boolean {
    const existing = this.customProviders.get(providerId);
    if (!existing) return false;
    
    const updated = { ...existing, ...config };
    this.customProviders.set(providerId, updated);
    this.saveCustomProviders();
    
    // Re-initialize the adapter
    const customAdapter = new CustomProviderAdapter(updated);
    globalAdapterRegistry.register(customAdapter as any, providerId);
    
    return true;
  }

  removeCustomProvider(providerId: string): boolean {
    const removed = this.customProviders.delete(providerId);
    if (removed) {
      this.saveCustomProviders();
      // Remove from registry
      try {
        globalAdapterRegistry.unregister(providerId);
      } catch (e) {
        console.warn(`Failed to unregister provider ${providerId}:`, e);
      }
    }
    return removed;
  }

  getCustomProviders(): CustomProviderConfig[] {
    return Array.from(this.customProviders.values());
  }

  getCustomProvider(providerId: string): CustomProviderConfig | null {
    return this.customProviders.get(providerId) || null;
  }

  async testCustomProvider(config: Omit<CustomProviderConfig, 'isCustom'>): Promise<boolean> {
    try {
      const adapter = new CustomProviderAdapter({ ...config, isCustom: true });
      return await adapter.testConnection();
    } catch {
      return false;
    }
  }

  private loadCustomProviders(): void {
    try {
      if (typeof window === 'undefined') return;
      const stored = localStorage.getItem('omnipanel-custom-providers');
      if (stored) {
        const providers = JSON.parse(stored);
        Object.entries(providers).forEach(([id, config]) => {
          this.customProviders.set(id, config as CustomProviderConfig);
        });
      }
    } catch (error) {
      console.error('Failed to load custom providers:', error);
    }
  }

  private saveCustomProviders(): void {
    try {
      if (typeof window === 'undefined') return;
      const providers = Object.fromEntries(this.customProviders);
      localStorage.setItem('omnipanel-custom-providers', JSON.stringify(providers));
    } catch (error) {
      console.error('Failed to save custom providers:', error);
    }
  }

  // Enhanced provider management
  getAllAvailableProviders(): Array<{
    id: string;
    name: string;
    type: 'built-in' | 'custom';
    isActive: boolean;
    models?: string[];
  }> {
    const providers = [];
    
    // Built-in providers
    for (const providerId of this.ALL_PROVIDERS) {
      try {
        const adapter = globalAdapterRegistry.get(providerId);
        providers.push({
          id: providerId,
          name: this.getProviderDisplayName(providerId),
          type: 'built-in' as const,
          isActive: !!adapter,
          models: this.getProviderModels(providerId)
        });
      } catch {
        providers.push({
          id: providerId,
          name: this.getProviderDisplayName(providerId),
          type: 'built-in' as const,
          isActive: false
        });
      }
    }
    
    // Custom providers
    this.customProviders.forEach((config, providerId) => {
      providers.push({
        id: providerId,
        name: config.displayName,
        type: 'custom' as const,
        isActive: true,
        models: config.models.map(m => m.id)
      });
    });
    
    return providers;
  }

  private getProviderDisplayName(providerId: string): string {
    const names: Record<string, string> = {
      'openai': 'OpenAI',
      'anthropic': 'Anthropic',
      'google': 'Google AI',
      'deepseek': 'DeepSeek',
      'mistral': 'Mistral AI',
      'ollama': 'Ollama',
      'huggingface': 'Hugging Face',
      'qwen': 'Qwen',
      'vllm': 'vLLM',
      'llamacpp': 'llama.cpp'
    };
    return names[providerId] || providerId;
  }

  private getProviderModels(providerId: string): string[] {
    // This would ideally fetch from the actual adapters
    // For now, return common models for each provider
    const models: Record<string, string[]> = {
      'openai': ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'o1-preview', 'o1-mini'],
      'anthropic': ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
      'google': ['gemini-pro', 'gemini-pro-vision', 'gemini-1.5-pro', 'gemini-1.5-flash'],
      'deepseek': ['deepseek-chat', 'deepseek-coder'],
      'mistral': ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
      'ollama': ['llama3.2', 'llama3.1', 'codellama', 'mistral', 'phi3'],
      'huggingface': ['meta-llama/Llama-2-7b-chat-hf', 'microsoft/DialoGPT-medium'],
      'qwen': ['qwen-turbo', 'qwen-plus', 'qwen-max'],
      'vllm': ['custom-model'],
      'llamacpp': ['custom-model']
    };
    return models[providerId] || [];
  }

  // Enhanced provider availability check
  getAvailableProviders(): string[] {
    const allProviders = [
      ...this.ALL_PROVIDERS,
      ...Array.from(this.customProviders.keys())
    ];
    
    return allProviders.filter(provider => {
      try {
        globalAdapterRegistry.get(provider);
        return true;
      } catch {
        return false;
      }
    });
  }

  private getAdapter(provider: string) {
    const adapter = globalAdapterRegistry.get(provider);
    if (!adapter) {
      throw new Error(`No adapter found for provider: ${provider}`);
    }
    return adapter;
  }

  private loadConversationsFromStorage(): void {
    try {
      if (typeof window === 'undefined') return;
      const stored = localStorage.getItem('omnipanel-ai-conversations');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.conversations = new Map(
          parsed.map((conv: any) => [
            conv.id,
            {
              ...conv,
              createdAt: new Date(conv.createdAt),
              updatedAt: new Date(conv.updatedAt),
              messages: conv.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }))
            }
          ])
        );
      }
    } catch (error) {
      console.error('Failed to load conversations from storage:', error);
    }
  }

  private saveConversationsToStorage(): void {
    try {
      if (typeof window === 'undefined') return;
      const conversations = Array.from(this.conversations.values());
      localStorage.setItem('omnipanel-ai-conversations', JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversations to storage:', error);
    }
  }

  createConversation(title?: string, systemPrompt?: string): Conversation {
    const conversation: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title || 'New Conversation',
      messages: systemPrompt ? [{
        role: 'system',
        content: systemPrompt,
        timestamp: new Date()
      }] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        totalTokens: 0,
        totalCost: 0,
        model: this.defaultModel,
        provider: this.defaultProvider,
        tags: []
      }
    };

    this.conversations.set(conversation.id, conversation);
    this.saveConversationsToStorage();
    return conversation;
  }

  updateConversationTitle(conversationId: string, title: string): boolean {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.title = title;
      conversation.updatedAt = new Date();
      this.saveConversationsToStorage();
      return true;
    }
    return false;
  }

  addTagToConversation(conversationId: string, tag: string): boolean {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      if (!conversation.metadata?.tags) {
        conversation.metadata = { ...conversation.metadata, tags: [] };
      }
      if (conversation.metadata.tags && !conversation.metadata.tags.includes(tag)) {
        conversation.metadata.tags.push(tag);
        conversation.updatedAt = new Date();
        this.saveConversationsToStorage();
        return true;
      }
    }
    return false;
  }

  removeTagFromConversation(conversationId: string, tag: string): boolean {
    const conversation = this.conversations.get(conversationId);
    if (conversation && conversation.metadata?.tags) {
      const index = conversation.metadata.tags.indexOf(tag);
      if (index > -1) {
        conversation.metadata.tags.splice(index, 1);
        conversation.updatedAt = new Date();
        this.saveConversationsToStorage();
        return true;
      }
    }
    return false;
  }

  searchConversations(query: string): Conversation[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.conversations.values()).filter(conversation => {
      // Search in title
      if (conversation.title?.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search in messages
      if (conversation.messages.some(msg => 
        msg.content.toLowerCase().includes(searchTerm)
      )) {
        return true;
      }
      
      // Search in tags
      if (conversation.metadata?.tags?.some(tag => 
        tag.toLowerCase().includes(searchTerm)
      )) {
        return true;
      }
      
      return false;
    }).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async streamChat(messages: AIMessage[], options: AIStreamOptions = {}): Promise<void> {
    const {
      onChunk,
      onComplete,
      onError,
      onProgress,
      context,
      model,
      provider = this.defaultProvider,
      temperature = 0.7,
      maxTokens = 4096,
      systemPrompt,
      conversationId
    } = options;

    try {
      const adapter = this.getAdapter(provider);
      
      // Convert AIMessage to ChatMessage format
      const chatMessages: ChatMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add system prompt if provided
      if (systemPrompt) {
        chatMessages.unshift({
          role: 'system',
          content: systemPrompt
        });
      }

      // Add context if provided
      if (context) {
        const contextMessage = `Context: ${context}\n\n${chatMessages[chatMessages.length - 1].content}`;
        chatMessages[chatMessages.length - 1] = {
          ...chatMessages[chatMessages.length - 1],
          content: contextMessage
        };
      }

      let fullResponse = '';
      let tokenCount = 0;
      const startTime = Date.now();

      // Stream the response
      for await (const chunk of adapter.streamChat(chatMessages, {
        temperature,
        max_tokens: maxTokens
      })) {
        if (chunk.content) {
          fullResponse += chunk.content;
          tokenCount += chunk.content.split(' ').length; // Rough token estimation
          onChunk?.(chunk.content);
          
          // Report progress if callback provided
          if (onProgress && maxTokens) {
            onProgress({
              current: tokenCount,
              total: maxTokens
            });
          }
        }
        
        if (chunk.finishReason) {
          const responseTime = Date.now() - startTime;
          
          // Update conversation metadata if conversationId provided
          if (conversationId) {
            const conversation = this.conversations.get(conversationId);
            if (conversation && conversation.metadata) {
              conversation.metadata.totalTokens = (conversation.metadata.totalTokens || 0) + tokenCount;
              conversation.metadata.model = options.model || this.defaultModel;
              conversation.metadata.provider = provider;
              this.saveConversationsToStorage();
            }
          }
          
          onComplete?.(fullResponse);
          break;
        }
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      
      // Provide more detailed error information
      const enhancedError = new Error(
        `AI Service failed for provider ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      
      onError?.(enhancedError);
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
        conversationId,
        onChunk: (chunk) => {
          assistantResponse += chunk;
          options.onChunk?.(chunk);
        },
        onComplete: (response) => {
          const assistantMessage: AIMessage = {
            role: 'assistant',
            content: response,
            timestamp: new Date(),
            metadata: {
              model: options.model || this.defaultModel,
              provider: options.provider || this.defaultProvider,
              responseTime: Date.now() - userMessage.timestamp.getTime()
            }
          };
          
          conversation.messages.push(assistantMessage);
          conversation.updatedAt = new Date();
          this.saveConversationsToStorage();
          
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

  async generateResponse(messages: AIMessage[], context?: string, provider = this.defaultProvider): Promise<string> {
    return new Promise((resolve, reject) => {
      let response = '';
      
      this.streamChat(messages, {
        context,
        provider,
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

  // Enhanced code generation with multiple programming languages and frameworks
  async generateCode(requirements: string, language: string, style?: string, provider = this.defaultProvider): Promise<string> {
    const prompt = `Generate ${language} code based on these requirements: ${requirements}
    
${style ? `Code style: ${style}` : ''}

Please provide:
1. Clean, well-commented code
2. Follow best practices for ${language}
3. Include error handling where appropriate
4. Make the code production-ready

Return only the code without explanations.`;

    return this.generateResponse([{
      role: 'user',
      content: prompt,
      timestamp: new Date()
    }], undefined, provider);
  }

  // Enhanced code explanation with different complexity levels
  async explainCode(code: string, language: string, level: 'beginner' | 'intermediate' | 'advanced' = 'intermediate', provider = this.defaultProvider): Promise<string> {
    const prompt = `Explain this ${language} code at a ${level} level:

\`\`\`${language}
${code}
\`\`\`

Please provide:
1. What the code does (overview)
2. How it works (step by step)
3. Key concepts used
4. ${level === 'beginner' ? 'Simple explanations of programming concepts' : 
     level === 'advanced' ? 'Technical details and optimization opportunities' : 
     'Balanced explanation with some technical details'}`;

    return this.generateResponse([{
      role: 'user',
      content: prompt,
      timestamp: new Date()
    }], undefined, provider);
  }

  // Enhanced code analysis with multiple analysis types
  async analyzeCode(code: string, language: string, analysisType: 'general' | 'security' | 'performance' | 'style' = 'general', provider = this.defaultProvider): Promise<string> {
    const analysisPrompts = {
      general: `Analyze this ${language} code and provide insights about its functionality, potential improvements, and any issues:`,
      security: `Perform a security analysis of this ${language} code. Look for vulnerabilities, security anti-patterns, and potential exploits:`,
      performance: `Analyze this ${language} code for performance issues. Identify bottlenecks, inefficient algorithms, and optimization opportunities:`,
      style: `Review this ${language} code for style and best practices. Check for code quality, readability, and adherence to conventions:`
    };

    const prompt = `${analysisPrompts[analysisType]}

\`\`\`${language}
${code}
\`\`\`

Please provide:
1. A brief summary of what the code does
2. ${analysisType === 'security' ? 'Security vulnerabilities and risks' : 
     analysisType === 'performance' ? 'Performance bottlenecks and optimizations' :
     analysisType === 'style' ? 'Style issues and best practice recommendations' :
     'Any potential issues or bugs'}
3. Specific suggestions for improvement
4. ${analysisType === 'general' ? 'Code quality assessment' : `${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)} rating (1-10)`}`;

    return this.generateResponse([{
      role: 'user',
      content: prompt,
      timestamp: new Date()
    }], undefined, provider);
  }

  // Enhanced command suggestions with context awareness
  async suggestCommand(context: string, intent: string, workspaceType?: string, provider = this.defaultProvider): Promise<string> {
    const prompt = `Based on this context: "${context}"
${workspaceType ? `\nWorkspace type: ${workspaceType}` : ''}
    
User wants to: "${intent}"

Suggest the most appropriate command or action. Consider the workspace type and provide only the command without explanation.`;

    return this.generateResponse([{
      role: 'user',
      content: prompt,
      timestamp: new Date()
    }], undefined, provider);
  }

  // Test provider connectivity and capabilities
  async testProvider(provider: string): Promise<boolean> {
    try {
      const adapter = this.getAdapter(provider);
      
      // Simple test message
      const testMessages: ChatMessage[] = [{
        role: 'user',
        content: 'Hello, please respond with "OK" to confirm you are working.'
      }];

      let responseReceived = false;
      
      // Test streaming capability
      for await (const chunk of adapter.streamChat(testMessages, {
        temperature: 0,
        max_tokens: 10
      })) {
        if (chunk.content) {
          responseReceived = true;
          break;
        }
      }

      return responseReceived;
    } catch (error) {
      console.error(`Provider test failed for ${provider}:`, error);
      return false;
    }
  }

  // Get model information for a specific provider
  getModelInfo(provider: string, modelId: string): ModelInfo | null {
    const cacheKey = `${provider}:${modelId}`;
    return this.modelCache.get(cacheKey) || null;
  }

  // Set default provider and model
  setDefaults(provider: string, model: string): void {
    this.defaultProvider = provider;
    this.defaultModel = model;
  }

  // Get conversation statistics
  getConversationStats(conversationId: string): {
    messageCount: number;
    totalTokens: number;
    totalCost: number;
    averageResponseTime: number;
  } | null {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return null;

    const messageCount = conversation.messages.length;
    const totalTokens = conversation.metadata?.totalTokens || 0;
    const totalCost = conversation.metadata?.totalCost || 0;
    
    const responseTimes = conversation.messages
      .filter(msg => msg.metadata?.responseTime)
      .map(msg => msg.metadata!.responseTime!);
    
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    return {
      messageCount,
      totalTokens,
      totalCost,
      averageResponseTime
    };
  }

  // Export conversation in different formats
  exportConversation(conversationId: string, format: 'json' | 'markdown' | 'txt' = 'json'): string {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    switch (format) {
      case 'json':
        return JSON.stringify(conversation, null, 2);
      
      case 'markdown':
        let markdown = `# ${conversation.title}\n\n`;
        markdown += `**Created:** ${conversation.createdAt.toISOString()}\n`;
        markdown += `**Updated:** ${conversation.updatedAt.toISOString()}\n\n`;
        
        conversation.messages.forEach((msg, index) => {
          markdown += `## Message ${index + 1} (${msg.role})\n\n`;
          markdown += `${msg.content}\n\n`;
          markdown += `*${msg.timestamp.toISOString()}*\n\n`;
        });
        
        return markdown;
      
      case 'txt':
        let text = `${conversation.title}\n`;
        text += `Created: ${conversation.createdAt.toISOString()}\n`;
        text += `Updated: ${conversation.updatedAt.toISOString()}\n\n`;
        
        conversation.messages.forEach((msg, index) => {
          text += `[${msg.role.toUpperCase()}] ${msg.timestamp.toISOString()}\n`;
          text += `${msg.content}\n\n`;
        });
        
        return text;
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Import conversation from exported data
  importConversation(data: string, format: 'json' = 'json'): string {
    try {
      let conversation: Conversation;
      
      switch (format) {
        case 'json':
          const parsed = JSON.parse(data);
          conversation = {
            ...parsed,
            id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate new ID
            createdAt: new Date(parsed.createdAt),
            updatedAt: new Date(parsed.updatedAt),
            messages: parsed.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          };
          break;
        
        default:
          throw new Error(`Unsupported import format: ${format}`);
      }
      
      this.conversations.set(conversation.id, conversation);
      this.saveConversationsToStorage();
      
      return conversation.id;
    } catch (error) {
      throw new Error(`Failed to import conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Conversation management methods
  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  getConversationsByTag(tag: string): Conversation[] {
    return Array.from(this.conversations.values())
      .filter(conv => conv.metadata?.tags?.includes(tag))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  deleteConversation(id: string): boolean {
    const deleted = this.conversations.delete(id);
    if (deleted) {
      this.saveConversationsToStorage();
    }
    return deleted;
  }

  clearAllConversations(): void {
    this.conversations.clear();
    this.saveConversationsToStorage();
  }

  // Service status and health check
  getServiceStatus(): {
    isInitialized: boolean;
    availableProviders: string[];
    activeStreams: number;
    totalConversations: number;
    defaultProvider: string;
    defaultModel: string;
  } {
    return {
      isInitialized: true,
      availableProviders: this.getAvailableProviders(),
      activeStreams: this.activeStreams.size,
      totalConversations: this.conversations.size,
      defaultProvider: this.defaultProvider,
      defaultModel: this.defaultModel
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService; 