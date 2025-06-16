'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Archive
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspace';
import { LLMAdapterRegistry, ChatMessage, StreamingManager } from '@omnipanel/llm-adapters';
import { nanoid } from '@omnipanel/core';
import { useMonitoring } from '@/components/providers/MonitoringProvider';

// Using ChatMessage from @omnipanel/llm-adapters
interface ExtendedChatMessage extends ChatMessage {
  id: string;
  timestamp: Date;
  isStreaming?: boolean;
  model?: string;
  provider?: string;
}

interface ChatInterfaceProps {
  sessionId?: string;
  projectId?: string;
}

export function ChatInterface({ sessionId, projectId }: ChatInterfaceProps) {
  const { selectedModel, modelProvider, currentProject } = useWorkspaceStore();
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [streamingManager, setStreamingManager] = useState<StreamingManager | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get monitoring utilities
  const { captureError, captureMessage, measure, startMeasure, endMeasure } = useMonitoring();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize streaming manager and LLM adapter registry
  useEffect(() => {
    const manager = new StreamingManager();
    setStreamingManager(manager);
    
    return () => {
      manager.cancelAllStreams();
    };
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ExtendedChatMessage = {
        id: 'welcome',
        content: `Welcome to OmniPanel! I'm your AI assistant. I can help you with coding, analysis, creative tasks, and more. What would you like to work on today?`,
        role: 'assistant',
        timestamp: new Date(),
        model: selectedModel || 'gpt-4o',
        provider: modelProvider || 'openai'
      };
      setMessages([welcomeMessage]);
    }
  }, [selectedModel, modelProvider]);

  const sendMessage = async (messageContent: string, isRegeneration = false, originalMessageId?: string) => {
    if (!streamingManager) {
      console.error('StreamingManager not initialized');
      return;
    }

    // Start performance measurement for the entire operation
    const perfMeasureId = startMeasure('chat.sendMessage', {
      messageLength: messageContent.length.toString(),
      isRegeneration: isRegeneration.toString(),
      model: selectedModel || 'unknown',
      provider: modelProvider || 'unknown'
    });

    setIsLoading(true);
    
    if (isRegeneration && originalMessageId) {
      setIsRegenerating(originalMessageId);
    }

    try {
      // Add user message to the conversation
      const userMessage: ExtendedChatMessage = {
        id: nanoid(),
        content: messageContent,
        role: 'user',
        timestamp: new Date()
      };

      const updatedMessages = isRegeneration 
        ? messages.filter(m => m.id !== originalMessageId)
        : [...messages, userMessage];
      
      setMessages(updatedMessages);

      // Prepare message history for the LLM
      const messageHistory: ChatMessage[] = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
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
      setMessages([...updatedMessages, streamingMessage]);
      
      captureMessage('Started streaming response', 'info', {
        messageId: assistantMessageId,
        model: selectedModel
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
      
      // Start streaming session with the streaming manager
      const streamController = streamingManager.startStream(assistantMessageId);
      
      // Start streaming the response using the correct async generator pattern
      const streamGenerator = adapter.streamChat(messageHistory, {
        temperature: 0.7,
        max_tokens: 4096
      });
      
      let fullResponse = '';
      
      for await (const chunk of streamGenerator) {
        // Check if stream was cancelled
        if (streamController.signal.aborted) {
          break;
        }
        
        if (chunk.content) {
          fullResponse += chunk.content;
          
          // First token received - log latency
          if (streamingMessage.content === '') {
            captureMessage('First token received', 'info', {
              messageId: assistantMessageId,
              latencyMs: Date.now() - streamingMessage.timestamp.getTime()
            });
          }
          
          // Update the streaming message with new content
          setMessages(prev => {
            const updatedMessages = [...prev];
            const messageIndex = updatedMessages.findIndex(m => m.id === assistantMessageId);
            if (messageIndex !== -1) {
              updatedMessages[messageIndex] = {
                ...updatedMessages[messageIndex],
                content: fullResponse
              };
            }
            return updatedMessages;
          });
        }
        
        // Check if streaming is complete
        if (chunk.finishReason) {
          // End streaming performance measurement
          endMeasure(streamingMeasureId, {
            tokenCount: fullResponse.length / 4, // Approximate token count
            responseLength: fullResponse.length
          });
          
          // Mark message as complete
          setMessages(prev => {
            const updatedMessages = [...prev];
            const messageIndex = updatedMessages.findIndex(m => m.id === assistantMessageId);
            if (messageIndex !== -1) {
              updatedMessages[messageIndex] = {
                ...updatedMessages[messageIndex],
                content: fullResponse,
                isStreaming: false
              };
            }
            return updatedMessages;
          });
          break;
        }
      }
      
    } catch (error) {
      // Capture any errors that weren't caught in the specific handlers
      captureError(error instanceof Error ? error : new Error(String(error)), {
        component: 'ChatInterface',
        operation: 'sendMessage',
        model: selectedModel,
        provider: modelProvider
      });
      console.error('Error sending message:', error);
      const errorMessage: ExtendedChatMessage = {
        id: nanoid(),
        content: 'Sorry, there was an error processing your message. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // End the overall performance measurement
      endMeasure(perfMeasureId);
      setIsLoading(false);
      setIsRegenerating(null);
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
    try {
      navigator.clipboard.writeText(content);
      captureMessage('Message copied to clipboard', 'info');
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Failed to copy message'), {
        component: 'ChatInterface',
        operation: 'copyMessage'
      });
    }
  };

  const regenerateResponse = async (messageId: string) => {
    // Measure regeneration performance
    const regenerationMeasureId = startMeasure('chat.regenerateResponse', {
      messageId,
      model: selectedModel || 'unknown',
      provider: modelProvider || 'unknown'
    });
    
    try {
      // Log the regeneration attempt for monitoring
      captureMessage('Regenerating response', 'info', {
        messageId,
        model: selectedModel,
        provider: modelProvider
      });
      
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) {
        captureError(new Error('Message not found for regeneration'), {
          component: 'ChatInterface',
          operation: 'regenerateResponse',
          messageId
        });
        endMeasure(regenerationMeasureId, { error: true, errorType: 'message_not_found' });
        return;
      }

      // Find the user message that prompted this response
      let userMessage = '';
      for (let i = messageIndex - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          userMessage = messages[i].content;
          break;
        }
      }

      if (userMessage) {
        await sendMessage(userMessage, true, messageId);
      } else {
        captureError(new Error('No user message found to regenerate from'), {
          component: 'ChatInterface',
          operation: 'regenerateResponse',
          messageId
        });
        endMeasure(regenerationMeasureId, { error: true, errorType: 'no_user_message' });
      }
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        component: 'ChatInterface',
        operation: 'regenerateResponse',
        messageId
      });
      endMeasure(regenerationMeasureId, { error: true, errorType: 'unknown_error' });
    } finally {
      endMeasure(regenerationMeasureId);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Chat Header */}
      <div className="flex-shrink-0 h-14 bg-card/30 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-neon-blue" />
            <span className="font-medium">AI Assistant</span>
          </div>
          {selectedModel && (
            <div className="flex items-center gap-2 px-2 py-1 bg-accent/50 rounded-md text-sm">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
              <span className="text-muted-foreground">{modelProvider}/{selectedModel}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-accent/50 rounded-md transition-colors" title="New Chat">
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-accent/50 rounded-md transition-colors" title="Archive Chat">
            <Archive className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-accent/50 rounded-md transition-colors" title="Chat Settings">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`max-w-[70%] ${message.role === 'user' ? 'order-first' : ''}`}>
                <div
                  className={`p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-card border border-border'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                      {message.model && (
                        <span className="ml-2">• {message.model}</span>
                      )}
                    </span>
                    
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyMessage(message.content)}
                          className="p-1 hover:bg-accent/50 rounded transition-colors"
                          title="Copy message"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => regenerateResponse(message.id)}
                          disabled={isLoading || isRegenerating === message.id}
                          className="p-1 hover:bg-accent/50 rounded transition-colors disabled:opacity-50"
                          title="Regenerate response"
                        >
                          {isRegenerating === message.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming Message */}
        {isLoading && !messages.some(m => m.isStreaming) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="max-w-[70%]">
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-border bg-card/30">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="w-full p-3 pr-12 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 min-h-[50px] max-h-32"
              rows={1}
              disabled={isLoading}
            />
            <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
              {input.length}/2000
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Quick Suggestions */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {['Explain this code', 'Write a function', 'Debug this error', 'Optimize performance'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="px-3 py-1 text-sm bg-accent/30 hover:bg-accent/50 rounded-full transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 