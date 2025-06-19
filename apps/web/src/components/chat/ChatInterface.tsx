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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useWorkspaceStore } from '@/stores/workspace';
import { useAIConfigStore } from '@/stores/aiConfigStore';
import { LLMAdapterRegistry, ChatMessage, StreamingManager } from '@omnipanel/llm-adapters';
import { nanoid } from '@omnipanel/core';
import { useMonitoring } from '@/components/providers/MonitoringProvider';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { configService } from '@/services/configService';
import { ChatInput } from './ChatInput';

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

export function ChatInterface({ sessionId, projectId, initialContext }: ChatInterfaceProps): React.JSX.Element {
  const { currentProject } = useWorkspaceStore();
  const { selectedModel, availableModels, apiConfigs } = useAIConfigStore();
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

  // Get the current selected model and its provider
  const currentModel = availableModels.find(model => model.id === selectedModel);
  const modelProvider = currentModel?.provider || 'openai';

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
        projectId: currentProject?.id,
        projectName: currentProject?.name,
        activeFiles: initialContext?.files
      }
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    
    captureMessage('New conversation created', 'info', {
      conversationId: newConversation.id,
      projectId: currentProject?.id,
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
    if (!contextEnabled) return '';
    
    const contextParts = [];
    
    // Project context
    if (currentProject) {
      contextParts.push(`Project: ${currentProject.name}`);
    }
    
    // File context
    if (initialContext?.files?.length) {
      contextParts.push(`Active Files: ${initialContext.files.join(', ')}`);
    }
    
    // Selection context
    if (initialContext?.selection) {
      contextParts.push(`Selected Code:\n\`\`\`\n${initialContext.selection}\n\`\`\``);
    }
    
    // Terminal context
    if (initialContext?.terminal?.length) {
      contextParts.push(`Recent Terminal Commands:\n${initialContext.terminal.slice(-3).join('\n')}`);
    }
    
    if (contextParts.length === 0) return '';
    
    return `Context:\n${contextParts.join('\n')}\n\nUser Query: `;
  }, [currentProject, initialContext, contextEnabled]);

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

    // Create assistant message ID outside try block so it's available in catch
    const assistantMessageId = nanoid();

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
      
      // Update the streaming message to show error instead of adding a new message
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === assistantMessageId 
                ? { 
                    ...msg, 
                    content: 'Sorry, I encountered an error while processing your request. Please try again.',
                    isStreaming: false,
                    metadata: {
                      error: true,
                      responseTime: Date.now() - (msg.timestamp?.getTime() || Date.now())
                    }
                  }
                : msg
            ),
            updatedAt: new Date()
          };
        }
        return conv;
      }));
      
      // Clean up streaming state
      streamingManager.cancelStream(assistantMessageId);
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
    <div data-testid="chat-interface" className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">AI Assistant</h3>
            <p className="text-sm text-gray-400">
              {activeConversation?.title || 'New Conversation'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowConversations(!showConversations)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            title="Conversation History"
          >
            <Archive size={18} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={createNewConversation}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            title="New Conversation"
          >
            <Plus size={18} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setContextEnabled(!contextEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              contextEnabled 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
            title={`Context Mode: ${contextEnabled ? 'On' : 'Off'}`}
          >
            <Zap size={18} />
          </motion.button>
        </div>
      </div>

      {/* Conversation History Sidebar */}
      <AnimatePresence>
        {showConversations && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="absolute left-0 top-0 h-full w-80 bg-gray-800 border-r border-gray-700 z-10 overflow-y-auto"
          >
            <div className="p-4">
              <h4 className="font-semibold mb-4">Conversations</h4>
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      setActiveConversationId(conversation.id);
                      setShowConversations(false);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      conversation.id === activeConversationId
                        ? 'bg-blue-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{conversation.title}</p>
                        <p className="text-sm text-gray-400">
                          {formatDate(conversation.updatedAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conversation.id);
                        }}
                        className="p-1 rounded hover:bg-gray-600 ml-2"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              
              <div className={`max-w-[70%] ${
                message.role === 'user' ? 'order-1' : ''
              }`}>
                <div className={`p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white ml-auto'
                    : 'bg-gray-800 text-white'
                }`}>
                  <div className="prose prose-sm max-w-none">
                    {message.content.split('\n').map((line, i) => (
                      <p key={i} className="mb-2 last:mb-0">
                        {line}
                      </p>
                    ))}
                  </div>
                  
                  {message.isStreaming && (
                    <div className="flex items-center gap-2 mt-2 text-gray-400">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-xs">Generating...</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>{formatTime(message.timestamp)}</span>
                  
                  {message.role === 'assistant' && (
                    <>
                      <button
                        onClick={() => copyMessage(message.content)}
                        className="p-1 rounded hover:bg-gray-700 transition-colors"
                        title="Copy message"
                      >
                        <Copy size={12} />
                      </button>
                      
                      <button
                        onClick={() => regenerateResponse(message.id)}
                        disabled={isLoading || isRegenerating === message.id}
                        className="p-1 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                        title="Regenerate response"
                      >
                        {isRegenerating === message.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <RotateCcw size={12} />
                        )}
                      </button>
                    </>
                  )}
                  
                  {message.metadata?.responseTime && (
                    <span className="text-xs">
                      {message.metadata.responseTime}ms
                    </span>
                  )}
                </div>
              </div>
              
              {message.role === 'user' && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback>
                    <User size={16} />
                  </AvatarFallback>
                </Avatar>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && !messages.find(m => m.isStreaming) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div className="bg-gray-800 p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm text-gray-400">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Stop Generation Button */}
      {isLoading && (
        <div className="px-4 pb-2">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={stopGeneration}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors mx-auto"
          >
            <StopCircle size={16} />
            Stop Generation
          </motion.button>
        </div>
      )}

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-700">
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          isLoading={isLoading}
          onAttachFile={() => fileInputRef.current?.click()}
          onAttachImage={() => fileInputRef.current?.click()}
          onWebSearch={() => {
            setInput(input + " [web search] ");
            inputRef.current?.focus();
          }}
        />
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            // Handle file attachment
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
              captureMessage(`${files.length} file(s) selected for attachment`, 'info');
              // TODO: Implement file processing
            }
          }}
        />
      </div>
    </div>
  );
} 