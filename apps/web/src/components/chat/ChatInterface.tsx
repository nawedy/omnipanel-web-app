'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  User, 
  Bot, 
  Copy, 
  RotateCcw, 
  Loader2,
  Settings,
  Plus,
  Archive,
  MessageSquare,
  Trash2,
  Download,
  Upload,
  Paperclip,
  Image,
  Code,
  FileText,
  Terminal,
  BookOpen,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  StopCircle
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspace';
import { LLMAdapterRegistry, ChatMessage, StreamingManager } from '@omnipanel/llm-adapters';
import { nanoid } from '@omnipanel/core';
import { useMonitoring } from '@/components/providers/MonitoringProvider';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { configService } from '@/services/configService';

// Enhanced chat message interface with context awareness
interface ExtendedChatMessage extends ChatMessage {
  id: string;
  timestamp: Date;
  isStreaming?: boolean;
  model?: string;
  provider?: string;
  context?: {
    files?: string[];
    terminal?: string[];
    notebook?: string[];
    selection?: string;
    projectPath?: string;
  };
  metadata?: {
    tokenCount?: number;
    responseTime?: number;
    cost?: number;
  };
}

// Conversation interface for chat history management
interface Conversation {
  id: string;
  title: string;
  messages: ExtendedChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  context?: {
    projectId?: string;
    projectName?: string;
    activeFiles?: string[];
  };
}

interface ChatInterfaceProps {
  sessionId?: string;
  projectId?: string;
  initialContext?: {
    files?: string[];
    selection?: string;
    terminal?: string[];
  };
}

export function ChatInterface({ sessionId, projectId, initialContext }: ChatInterfaceProps) {
  const { selectedModel, modelProvider, currentProject } = useWorkspaceStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [streamingManager, setStreamingManager] = useState<StreamingManager | null>(null);
  const [showConversations, setShowConversations] = useState(false);
  const [contextEnabled, setContextEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get monitoring utilities
  const { captureError, captureMessage, measure, startMeasure, endMeasure } = useMonitoring();

  // Get active conversation
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  // Keyboard shortcuts for chat
  useKeyboardShortcuts({
    'chat.new-conversation': () => { createNewConversation(); },
    'chat.send-message': () => { handleSendMessage(); },
    'chat.clear-conversation': () => { clearCurrentConversation(); },
    'chat.focus-input': () => { inputRef.current?.focus(); }
  }, { context: 'chat' });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize streaming manager
  useEffect(() => {
    const manager = new StreamingManager();
    setStreamingManager(manager);
    
    return () => {
      manager.cancelAllStreams();
    };
  }, []);

  // Load conversations from localStorage
  useEffect(() => {
    const savedConversations = localStorage.getItem('omnipanel-conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        const conversationsWithDates = parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setConversations(conversationsWithDates);
        
        // Set active conversation to the most recent one
        if (conversationsWithDates.length > 0) {
          setActiveConversationId(conversationsWithDates[0].id);
        }
      } catch (error) {
        captureError(error instanceof Error ? error : new Error('Failed to load conversations'), {
          component: 'ChatInterface',
          operation: 'loadConversations'
        });
      }
    }
    
    // Create initial conversation if none exist
    if (conversations.length === 0) {
      createNewConversation();
    }
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('omnipanel-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: nanoid(),
      title: 'New Conversation',
      messages: [{
        id: 'welcome',
        content: `Welcome to OmniPanel! I'm your AI assistant with full workspace context awareness. I can help you with:

• **Code Analysis**: Understanding your project structure and codebase
• **Development Tasks**: Writing, debugging, and optimizing code
• **Terminal Commands**: Executing and explaining command-line operations
• **Notebook Operations**: Working with Jupyter notebooks and data analysis
• **File Management**: Organizing and manipulating project files
• **Context-Aware Assistance**: Leveraging your current workspace state

${contextEnabled ? '🔗 **Context Mode**: Enabled - I can see your active files, terminal history, and workspace state.' : '🔗 **Context Mode**: Disabled - Working in isolated mode.'}

What would you like to work on today?`,
        role: 'assistant',
        timestamp: new Date(),
        model: selectedModel || 'gpt-4o',
        provider: modelProvider || 'openai'
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      context: {
        projectId,
        projectName: currentProject?.name,
        activeFiles: initialContext?.files
      }
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    
    captureMessage('New conversation created', 'info', {
      conversationId: newConversation.id,
      projectId,
      contextEnabled
    });
  }, [selectedModel, modelProvider, projectId, currentProject, initialContext, contextEnabled]);

  const updateConversationTitle = useCallback((conversationId: string, firstUserMessage: string) => {
    const title = firstUserMessage.length > 50 
      ? firstUserMessage.substring(0, 50) + '...'
      : firstUserMessage;
    
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, title, updatedAt: new Date() }
        : conv
    ));
  }, []);

  const buildContextPrompt = useCallback(() => {
    if (!contextEnabled || !activeConversation) return '';

    const contextParts = [];
    
    // Project context
    if (currentProject) {
      contextParts.push(`**Current Project**: ${currentProject.name}`);
    }

    // File context
    if (initialContext?.files && initialContext.files.length > 0) {
      contextParts.push(`**Active Files**: ${initialContext.files.join(', ')}`);
    }

    // Selection context
    if (initialContext?.selection) {
      contextParts.push(`**Selected Code**:\n\`\`\`\n${initialContext.selection}\n\`\`\``);
    }

    // Terminal context
    if (initialContext?.terminal && initialContext.terminal.length > 0) {
      const recentCommands = initialContext.terminal.slice(-5);
      contextParts.push(`**Recent Terminal Commands**: ${recentCommands.join(', ')}`);
    }

    if (contextParts.length > 0) {
      return `\n\n**Workspace Context**:\n${contextParts.join('\n')}\n\n`;
    }

    return '';
  }, [contextEnabled, activeConversation, currentProject, initialContext]);

  const sendMessage = async (messageContent: string, isRegeneration = false, originalMessageId?: string) => {
    if (!streamingManager || !activeConversationId) {
      console.error('StreamingManager or active conversation not available');
      return;
    }

    const perfMeasureId = startMeasure('chat.sendMessage', {
      messageLength: messageContent.length.toString(),
      isRegeneration: isRegeneration.toString(),
      model: selectedModel || 'unknown',
      provider: modelProvider || 'unknown',
      contextEnabled: contextEnabled.toString()
    });

    setIsLoading(true);
    
    if (isRegeneration && originalMessageId) {
      setIsRegenerating(originalMessageId);
    }

    try {
      // Build context-aware prompt
      const contextPrompt = buildContextPrompt();
      const enhancedMessage = contextPrompt + messageContent;

      // Add user message to the conversation
      const userMessage: ExtendedChatMessage = {
        id: nanoid(),
        content: messageContent,
        role: 'user',
        timestamp: new Date(),
        context: {
          files: initialContext?.files,
          terminal: initialContext?.terminal,
          selection: initialContext?.selection,
          projectPath: currentProject?.name
        }
      };

      // Update conversation with user message
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeConversationId) {
          const updatedMessages = isRegeneration 
            ? conv.messages.filter(m => m.id !== originalMessageId)
            : [...conv.messages, userMessage];
          
          // Update title if this is the first user message
          const isFirstUserMessage = conv.messages.filter(m => m.role === 'user').length === 0;
          const title = isFirstUserMessage ? 
            (messageContent.length > 50 ? messageContent.substring(0, 50) + '...' : messageContent) :
            conv.title;

          return {
            ...conv,
            title,
            messages: updatedMessages,
            updatedAt: new Date()
          };
        }
        return conv;
      }));

      // Prepare message history for the LLM
      const currentConv = conversations.find(c => c.id === activeConversationId);
      const messageHistory: ChatMessage[] = (currentConv?.messages || [])
        .filter(m => m.id !== originalMessageId)
        .concat(isRegeneration ? [] : [userMessage])
        .map(msg => ({
          role: msg.role,
          content: msg.role === 'user' && contextEnabled ? 
            (msg.content === messageContent ? enhancedMessage : msg.content) : 
            msg.content
        }));

      // Create assistant message placeholder for streaming
      const assistantMessageId = nanoid();
      const streamingMeasureId = startMeasure('chat.streamResponse', {
        messageId: assistantMessageId,
        model: selectedModel || 'unknown',
        provider: modelProvider || 'unknown'
      });

      const streamingMessage: ExtendedChatMessage = {
        id: assistantMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        isStreaming: true,
        model: selectedModel || undefined,
        provider: modelProvider || undefined
      };

      // Add streaming message to conversation
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, streamingMessage],
            updatedAt: new Date()
          };
        }
        return conv;
      }));
      
      captureMessage('Started streaming response', 'info', {
        messageId: assistantMessageId,
        model: selectedModel,
        contextEnabled
      });

      // Get the LLM adapter for the selected model
      const adapter = LLMAdapterRegistry.get(modelProvider || 'openai');
      if (!adapter) {
        const error = new Error(`No adapter available for provider: ${modelProvider}`);
        captureError(error, {
          component: 'ChatInterface',
          operation: 'getAdapter',
          provider: modelProvider
        });
        throw error;
      }
      
      // Start streaming session
      const streamController = streamingManager.startStream(assistantMessageId);
      
      // Start streaming the response
      const streamGenerator = adapter.streamChat(messageHistory, {
        temperature: 0.7,
        max_tokens: 4096
      });
      
      let fullResponse = '';
      const startTime = Date.now();
      let firstTokenTime: number | null = null;
      
      for await (const chunk of streamGenerator) {
        // Check if stream was cancelled
        if (streamController.signal.aborted) {
          break;
        }
        
        if (chunk.content) {
          fullResponse += chunk.content;
          
          // Record first token latency
          if (firstTokenTime === null) {
            firstTokenTime = Date.now();
            captureMessage('First token received', 'info', {
              messageId: assistantMessageId,
              latencyMs: firstTokenTime - startTime
            });
          }
          
          // Update the streaming message with new content
          setConversations(prev => prev.map(conv => {
            if (conv.id === activeConversationId) {
              return {
                ...conv,
                messages: conv.messages.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: fullResponse }
                    : msg
                ),
                updatedAt: new Date()
              };
            }
            return conv;
          }));
        }
        
        // Check if streaming is complete
        if (chunk.finishReason) {
          const endTime = Date.now();
          const totalTime = endTime - startTime;
          
          // Finalize the message
          setConversations(prev => prev.map(conv => {
            if (conv.id === activeConversationId) {
              return {
                ...conv,
                messages: conv.messages.map(msg => 
                  msg.id === assistantMessageId 
                    ? { 
                        ...msg, 
                        content: fullResponse,
                        isStreaming: false,
                        metadata: {
                          responseTime: totalTime,
                          tokenCount: fullResponse.split(' ').length
                        }
                      }
                    : msg
                ),
                updatedAt: new Date()
              };
            }
            return conv;
          }));
          
          endMeasure(streamingMeasureId, {
            success: 'true',
            responseLength: fullResponse.length.toString(),
            totalTimeMs: totalTime.toString()
          });
          
          captureMessage('Streaming completed', 'info', {
            messageId: assistantMessageId,
            totalTimeMs: totalTime,
            responseLength: fullResponse.length
          });
          
          break;
        }
      }
      
      // Clean up streaming state
      streamingManager.cancelStream(assistantMessageId);
      
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Chat error'), {
        component: 'ChatInterface',
        operation: 'sendMessage',
        model: selectedModel,
        provider: modelProvider
      });
      
      // Add error message to conversation
      const errorMessage: ExtendedChatMessage = {
        id: nanoid(),
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      };
      
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, errorMessage],
            updatedAt: new Date()
          };
        }
        return conv;
      }));
    } finally {
      setIsLoading(false);
      setIsRegenerating(null);
      endMeasure(perfMeasureId, { success: 'true' });
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const messageContent = input.trim();
    setInput('');
    
    await sendMessage(messageContent);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    captureMessage('Message copied to clipboard', 'info');
  };

  const regenerateResponse = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    // Find the previous user message
    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.role !== 'user') return;
    
    await sendMessage(userMessage.content, true, messageId);
  };

  const clearCurrentConversation = () => {
    if (!activeConversationId) return;
    
    setConversations(prev => prev.filter(conv => conv.id !== activeConversationId));
    
    // Create a new conversation
    createNewConversation();
    
    captureMessage('Conversation cleared', 'info', {
      conversationId: activeConversationId
    });
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    
    if (conversationId === activeConversationId) {
      const remaining = conversations.filter(conv => conv.id !== conversationId);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        createNewConversation();
      }
    }
    
    captureMessage('Conversation deleted', 'info', {
      conversationId
    });
  };

  const exportConversation = (conversation: Conversation) => {
    const exportData = {
      title: conversation.title,
      messages: conversation.messages,
      createdAt: conversation.createdAt,
      context: conversation.context,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const stopGeneration = () => {
    if (streamingManager) {
      streamingManager.cancelAllStreams();
      setIsLoading(false);
      setIsRegenerating(null);
      
      captureMessage('Generation stopped by user', 'info');
    }
  };

  return (
    <div className="flex h-full bg-background">
      {/* Conversations Sidebar */}
      <AnimatePresence>
        {showConversations && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-border bg-card flex flex-col"
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Conversations</h3>
                <button
                  onClick={createNewConversation}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="New conversation"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => setContextEnabled(!contextEnabled)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
                    contextEnabled 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  Context {contextEnabled ? 'On' : 'Off'}
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 border-b border-border cursor-pointer hover:bg-muted transition-colors ${
                    conversation.id === activeConversationId ? 'bg-muted' : ''
                  }`}
                  onClick={() => setActiveConversationId(conversation.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{conversation.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(conversation.updatedAt)} • {conversation.messages.length} messages
                      </p>
                      {conversation.context?.projectName && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Code className="w-3 h-3" />
                          {conversation.context.projectName}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportConversation(conversation);
                        }}
                        className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
                        title="Export conversation"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conversation.id);
                        }}
                        className="p-1 hover:bg-destructive/20 text-destructive rounded transition-colors"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConversations(!showConversations)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Toggle conversations"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              
              <div>
                <h2 className="font-semibold">
                  {activeConversation?.title || 'Chat'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedModel} via {modelProvider}
                  {contextEnabled && ' • Context Enabled'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isLoading && (
                <button
                  onClick={stopGeneration}
                  className="p-2 hover:bg-muted rounded-lg transition-colors text-destructive"
                  title="Stop generation"
                >
                  <StopCircle className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={clearCurrentConversation}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => {/* Open settings */}}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Chat settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {message.content}
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
                      )}
                    </div>
                    
                    {/* Message metadata */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2 text-xs opacity-70">
                        <Clock className="w-3 h-3" />
                        {formatTime(message.timestamp)}
                        {message.model && (
                          <>
                            <span>•</span>
                            <span>{message.model}</span>
                          </>
                        )}
                        {message.metadata?.responseTime && (
                          <>
                            <span>•</span>
                            <span>{message.metadata.responseTime}ms</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyMessage(message.content)}
                          className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
                          title="Copy message"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        
                        {message.role === 'assistant' && !message.isStreaming && (
                          <button
                            onClick={() => regenerateResponse(message.id)}
                            disabled={isRegenerating === message.id}
                            className="p-1 hover:bg-muted-foreground/20 rounded transition-colors disabled:opacity-50"
                            title="Regenerate response"
                          >
                            {isRegenerating === message.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Context indicators */}
                    {message.context && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <div className="flex flex-wrap gap-1">
                          {message.context.files && message.context.files.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                              <FileText className="w-3 h-3" />
                              {message.context.files.length} files
                            </span>
                          )}
                          {message.context.terminal && message.context.terminal.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
                              <Terminal className="w-3 h-3" />
                              Terminal
                            </span>
                          )}
                          {message.context.selection && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                              <Code className="w-3 h-3" />
                              Selection
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={contextEnabled ? 
                    "Ask me anything about your workspace..." : 
                    "Ask me anything..."
                  }
                  className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={1}
                  disabled={isLoading}
                />
                
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 hover:bg-muted rounded transition-colors"
                    title="Attach file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => {/* Handle image upload */}}
                    className="p-1.5 hover:bg-muted rounded transition-colors"
                    title="Upload image"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send message (Enter)"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {/* Context status */}
            {contextEnabled && (initialContext?.files || initialContext?.selection || initialContext?.terminal) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {initialContext.files && initialContext.files.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                    <FileText className="w-3 h-3" />
                    {initialContext.files.length} active files
                  </span>
                )}
                {initialContext.selection && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                    <Code className="w-3 h-3" />
                    Code selection
                  </span>
                )}
                {initialContext.terminal && initialContext.terminal.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
                    <Terminal className="w-3 h-3" />
                    Terminal history
                  </span>
                )}
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              // Handle file upload
              const files = Array.from(e.target.files || []);
              console.log('Files selected:', files);
            }}
          />
        </div>
      </div>
    </div>
  );
} 