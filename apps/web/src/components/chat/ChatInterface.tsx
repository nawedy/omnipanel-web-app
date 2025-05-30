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

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: `Welcome to OmniPanel! I'm your AI assistant. I can help you with coding, analysis, creative tasks, and more. What would you like to work on today?`,
        role: 'assistant',
        timestamp: new Date(),
        model: selectedModel || 'gpt-3.5-turbo',
        provider: modelProvider || 'openai'
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Mock AI response for now - will integrate with LLM adapters later
      await new Promise(resolve => setTimeout(resolve, 1000));

      const responses = [
        "I understand your question. Let me help you with that.",
        "That's an interesting point! Here's what I think about it:",
        "Great question! Let me break this down for you:",
        "I can definitely help with that. Here's my approach:",
        "Excellent! Let's work through this step by step:"
      ];

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)] + "\n\nThis is a mock response. In the full implementation, this will connect to your selected LLM model through our adapter system.",
        role: 'assistant',
        timestamp: new Date(),
        model: selectedModel || 'gpt-3.5-turbo',
        provider: modelProvider || 'openai'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your message. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const regenerateResponse = (messageId: string) => {
    // TODO: Implement response regeneration
    console.log('Regenerating response for:', messageId);
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
                          className="p-1 hover:bg-accent/50 rounded transition-colors"
                          title="Regenerate response"
                        >
                          <RotateCcw className="w-3 h-3" />
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
        {isLoading && (
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