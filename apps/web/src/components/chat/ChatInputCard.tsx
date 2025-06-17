'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Image, 
  Code, 
  FileText, 
  Terminal, 
  BookOpen, 
  Zap,
  X,
  Loader2,
  Mic,
  MicOff,
  Settings,
  Sparkles,
  Brain,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useWorkspaceContext } from '@/hooks/useWorkspaceContext';
import { useContextStore } from '@/stores/contextStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export interface ChatInputCardProps {
  onSendMessage: (message: string, attachments?: File[], context?: any) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  showContextIndicators?: boolean;
  showSuggestions?: boolean;
  className?: string;
}

export interface AttachedFile {
  file: File;
  id: string;
  type: 'image' | 'document' | 'code' | 'other';
  preview?: string;
}

const ChatInputCard: React.FC<ChatInputCardProps> = ({
  onSendMessage,
  isLoading = false,
  disabled = false,
  placeholder = "Ask me anything about your workspace...",
  maxLength = 4000,
  showContextIndicators = true,
  showSuggestions = true,
  className = ""
}) => {
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showSuggestionsState, setShowSuggestionsState] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Context integration
  const { context, getRelevantContext } = useWorkspaceContext();
  const { 
    contextEnabled, 
    currentSelection, 
    activeFiles,
    setContextEnabled 
  } = useContextStore();

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'chat.send-message': handleSendMessage,
    'chat.focus-input': () => textareaRef.current?.focus(),
    'chat.toggle-context': () => setContextEnabled(!contextEnabled),
    'chat.attach-file': () => fileInputRef.current?.click()
  }, { context: 'chat-input' });

  // Handle message sending
  function handleSendMessage() {
    if (!message.trim() || isLoading || disabled) return;

    const files = attachedFiles.map(af => af.file);
    const contextData = contextEnabled ? {
      selection: currentSelection,
      activeFiles: activeFiles.slice(0, 5), // Limit context
      relevantContext: getRelevantContext(message, 1000)
    } : undefined;

    onSendMessage(message.trim(), files, contextData);
    
    // Reset form
    setMessage('');
    setAttachedFiles([]);
    setShowSuggestionsState(false);
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // File handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const newAttachments: AttachedFile[] = files.map(file => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: getFileType(file),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setAttachedFiles(prev => [...prev, ...newAttachments].slice(0, 10)); // Max 10 files
  };

  const removeFile = (id: string) => {
    setAttachedFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      // Clean up preview URLs
      const removed = prev.find(f => f.id === id);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const getFileType = (file: File): AttachedFile['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.includes('text/') || file.name.match(/\.(js|ts|jsx|tsx|py|java|cpp|c|h|css|html|xml|json|md)$/i)) return 'code';
    if (file.type.includes('document') || file.name.match(/\.(pdf|doc|docx|txt)$/i)) return 'document';
    return 'other';
  };

  // Drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addFiles(files);
    }
  };

  // Suggestions
  const suggestions = [
    { icon: Brain, text: "Analyze this code", action: () => setMessage("Analyze this code and suggest improvements") },
    { icon: Lightbulb, text: "Explain the project", action: () => setMessage("Explain what this project does and its main components") },
    { icon: Code, text: "Debug this error", action: () => setMessage("Help me debug this error") },
    { icon: Sparkles, text: "Optimize performance", action: () => setMessage("How can I optimize the performance of this code?") }
  ];

  const contextIndicators = [
    ...(currentSelection ? [{ icon: Code, label: "Code Selection", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" }] : []),
    ...(activeFiles.length > 0 ? [{ icon: FileText, label: `${activeFiles.length} Active Files`, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" }] : []),
    ...(context?.terminalHistory.length ? [{ icon: Terminal, label: "Terminal History", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" }] : [])
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Context Indicators */}
      {showContextIndicators && contextEnabled && contextIndicators.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mb-3"
        >
          {contextIndicators.map((indicator, index) => (
            <Badge
              key={index}
              variant="secondary"
              className={`inline-flex items-center gap-1 ${indicator.color}`}
            >
              <indicator.icon className="w-3 h-3" />
              {indicator.label}
            </Badge>
          ))}
        </motion.div>
      )}

      {/* Suggestions */}
      {showSuggestions && !message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mb-3"
        >
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={suggestion.action}
              className="inline-flex items-center gap-2 text-sm"
            >
              <suggestion.icon className="w-4 h-4" />
              {suggestion.text}
            </Button>
          ))}
        </motion.div>
      )}

      {/* Attached Files */}
      <AnimatePresence>
        {attachedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 mb-3 p-3 bg-muted/50 rounded-lg"
          >
            {attachedFiles.map((attachment) => (
              <motion.div
                key={attachment.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <div className="flex items-center gap-2 px-3 py-2 bg-background border rounded-lg">
                  {attachment.type === 'image' && attachment.preview ? (
                    <img 
                      src={attachment.preview} 
                      alt={attachment.file.name}
                      className="w-6 h-6 object-cover rounded"
                    />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span className="text-sm truncate max-w-[120px]">
                    {attachment.file.name}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(attachment.id)}
                    className="w-4 h-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Area */}
      <div 
        className={`relative border rounded-lg transition-all duration-200 ${
          isDragOver 
            ? 'border-primary border-2 bg-primary/5' 
            : 'border-border bg-background hover:border-primary/50'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drag Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <Paperclip className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-primary">Drop files to attach</p>
            </div>
          </div>
        )}

        <div className="flex items-end gap-3 p-4">
          {/* Context Toggle */}
          <Button
            size="sm"
            variant={contextEnabled ? "default" : "outline"}
            onClick={() => setContextEnabled(!contextEnabled)}
            className="flex-shrink-0"
            title={contextEnabled ? 'Disable context' : 'Enable context'}
          >
            <Zap className="w-4 h-4" />
          </Button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setShowSuggestionsState(false);
              }}
              onKeyDown={handleKeyPress}
              placeholder={contextEnabled ? placeholder : "Ask me anything..."}
              disabled={disabled}
              maxLength={maxLength}
              className="min-h-[44px] max-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
              rows={1}
            />
            
            {/* Character Count */}
            {message.length > maxLength * 0.8 && (
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {message.length}/{maxLength}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* File Upload */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              title="Attach files"
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            {/* Voice Recording */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsRecording(!isRecording)}
              disabled={disabled}
              className={isRecording ? 'text-red-500' : ''}
              title={isRecording ? 'Stop recording' : 'Voice input'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading || disabled}
              size="sm"
              className="px-4"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.txt,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.css,.html,.xml,.json,.md"
      />
    </div>
  );
};

export default ChatInputCard;