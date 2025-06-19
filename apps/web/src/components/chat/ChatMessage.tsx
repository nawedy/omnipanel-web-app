"use client";

import React, { useState, useRef, useEffect, memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  MoreHorizontal, 
  Trash2, 
  Edit3, 
  ThumbsUp, 
  ThumbsDown,
  RefreshCw,
  Download,
  ExternalLink,
  Code,
  Volume2,
  VolumeX
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

// Markdown rendering (using react-markdown for production)
interface CodeBlockProps {
  language?: string;
  code: string;
  onCopy?: () => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language = 'text', code, onCopy }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
      toast.success('Code copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };
  
  return (
    <div className="relative group rounded-lg border border-border bg-muted/30 my-3">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
        <span className="text-sm font-medium text-muted-foreground">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Copy className={cn("w-4 h-4", copied && "text-green-500")} />
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm bg-muted/10">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};

// Message interfaces
export interface ChatMessageData {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: {
    model?: string;
    provider?: string;
    tokens?: number;
    cost?: number;
    duration?: number;
    context?: string[];
    files?: string[];
    isStreaming?: boolean;
    isComplete?: boolean;
    error?: string;
    citations?: Citation[];
  };
  reactions?: MessageReaction[];
  editing?: boolean;
  previousVersions?: string[];
}

export interface Citation {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface MessageReaction {
  type: 'like' | 'dislike' | 'helpful' | 'irrelevant';
  userId?: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: ChatMessageData;
  isLast?: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  enableActions?: boolean;
  enableEditing?: boolean;
  enableReactions?: boolean;
  enableTextToSpeech?: boolean;
  className?: string;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
  onReaction?: (messageId: string, reaction: MessageReaction) => void;
  onCopy?: (content: string) => void;
  onExport?: (message: ChatMessageData) => void;
}

// Markdown content renderer
const MessageContent: React.FC<{ 
  content: string; 
  onCopy?: () => void;
  className?: string;
}> = memo(({ content, onCopy, className }) => {
  // Simple markdown parsing for production
  const parseMarkdown = (text: string) => {
    // Code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textBefore = text.slice(lastIndex, match.index);
        parts.push(
          <div key={`text-${lastIndex}`} className="prose prose-sm dark:prose-invert max-w-none">
            {parseInlineMarkdown(textBefore)}
          </div>
        );
      }
      
      // Add code block
      const language = match[1] || 'text';
      const code = match[2].trim();
      parts.push(
        <CodeBlock 
          key={`code-${match.index}`}
          language={language}
          code={code}
          onCopy={onCopy}
        />
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      parts.push(
        <div key={`text-${lastIndex}`} className="prose prose-sm dark:prose-invert max-w-none">
          {parseInlineMarkdown(remainingText)}
        </div>
      );
    }
    
    return parts.length > 0 ? parts : (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {parseInlineMarkdown(text)}
      </div>
    );
  };
  
  const parseInlineMarkdown = (text: string) => {
    // Simple inline markdown parsing
    return text
      .split('\n')
      .map((line, index) => (
        <React.Fragment key={index}>
          {index > 0 && <br />}
          {line
            .split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g)
            .map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
                return <em key={partIndex}>{part.slice(1, -1)}</em>;
              }
              if (part.startsWith('`') && part.endsWith('`')) {
                return (
                  <code key={partIndex} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-sm">
                    {part.slice(1, -1)}
                  </code>
                );
              }
              const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
              if (linkMatch) {
                return (
                  <a 
                    key={partIndex}
                    href={linkMatch[2]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {linkMatch[1]}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                );
              }
              return part;
            })}
        </React.Fragment>
      ));
  };
  
  return (
    <div className={cn("text-sm leading-relaxed", className)}>
      {parseMarkdown(content)}
    </div>
  );
});

MessageContent.displayName = 'MessageContent';

// Main ChatMessage component
export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLast = false,
  showAvatar = true,
  showTimestamp = true,
  enableActions = true,
  enableEditing = true,
  enableReactions = true,
  enableTextToSpeech = false,
  className,
  onEdit,
  onDelete,
  onRegenerate,
  onReaction,
  onCopy,
  onExport,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showFullTimestamp, setShowFullTimestamp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isStreaming = message.metadata?.isStreaming && !message.metadata?.isComplete;
  
  // Auto-resize textarea
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, editContent]);
  
  // Handle copy
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success('Message copied to clipboard');
      onCopy?.(message.content);
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };
  
  // Handle edit save
  const handleEditSave = () => {
    if (editContent.trim() !== message.content) {
      onEdit?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };
  
  // Handle edit cancel
  const handleEditCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };
  
  // Handle text-to-speech
  const handleSpeak = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };
  
  // Handle reactions
  const handleReaction = (type: MessageReaction['type']) => {
    const reaction: MessageReaction = {
      type,
      timestamp: new Date(),
    };
    onReaction?.(message.id, reaction);
  };
  
  // Format timestamp
  const formatTimestamp = (date: Date) => {
    if (showFullTimestamp) {
      return date.toLocaleString();
    }
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };
  
  // Get avatar content
  const getAvatarContent = () => {
    if (isUser) {
      return {
        image: '/user-avatar.png',
        fallback: 'U',
        className: 'bg-primary text-primary-foreground'
      };
    }
    
    if (isSystem) {
      return {
        image: '/system-avatar.png',
        fallback: 'S',
        className: 'bg-orange-500 text-white'
      };
    }
    
    return {
      image: '/ai-avatar.png',
      fallback: 'AI',
      className: 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
    };
  };
  
  const avatarContent = getAvatarContent();
  
  return (
    <div className={cn(
      "group relative flex gap-3 p-4 rounded-lg transition-colors",
      isUser ? "bg-muted/30" : "bg-background",
      isStreaming && "animate-pulse",
      className
    )}>
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          <Avatar className="w-8 h-8">
            <AvatarImage src={avatarContent.image} alt={message.role} />
            <AvatarFallback className={avatarContent.className}>
              {avatarContent.fallback}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      
      {/* Message Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {isUser ? 'You' : isSystem ? 'System' : 'AI Assistant'}
            </span>
            
            {message.metadata?.model && (
              <Badge variant="secondary" className="text-xs">
                {message.metadata.model}
              </Badge>
            )}
            
            {isStreaming && (
              <Badge variant="outline" className="text-xs animate-pulse">
                Typing...
              </Badge>
            )}
            
            {message.metadata?.error && (
              <Badge variant="destructive" className="text-xs">
                Error
              </Badge>
            )}
          </div>
          
          {showTimestamp && (
            <button
              onClick={() => setShowFullTimestamp(!showFullTimestamp)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {formatTimestamp(message.timestamp)}
            </button>
          )}
        </div>
        
        {/* Message Content */}
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[60px] resize-none"
              placeholder="Edit your message..."
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEditSave}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleEditCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <MessageContent 
            content={message.content}
            onCopy={handleCopy}
          />
        )}
        
        {/* Metadata */}
        {message.metadata && (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {message.metadata.tokens && (
              <span>{message.metadata.tokens} tokens</span>
            )}
            {message.metadata.duration && (
              <span>{message.metadata.duration}ms</span>
            )}
            {message.metadata.cost && (
              <span>${message.metadata.cost.toFixed(4)}</span>
            )}
          </div>
        )}
        
        {/* Citations */}
        {message.metadata?.citations && message.metadata.citations.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Sources:</div>
            <div className="grid gap-2">
              {message.metadata.citations.map((citation) => (
                <a
                  key={citation.id}
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium text-sm">{citation.title}</div>
                  <div className="text-xs text-muted-foreground">{citation.snippet}</div>
                  <div className="text-xs text-muted-foreground mt-1">{citation.source}</div>
                </a>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        {enableActions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <Copy className="w-4 h-4" />
            </Button>
            
            {enableTextToSpeech && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSpeak}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            )}
            
            {enableReactions && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction('like')}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  <ThumbsUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction('dislike')}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {enableEditing && isUser && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit message
                  </DropdownMenuItem>
                )}
                
                {!isUser && onRegenerate && (
                  <DropdownMenuItem onClick={() => onRegenerate(message.id)}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate response
                  </DropdownMenuItem>
                )}
                
                {onExport && (
                  <DropdownMenuItem onClick={() => onExport(message)}>
                    <Download className="w-4 h-4 mr-2" />
                    Export message
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(message.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete message
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
};

// Export memo-ized component for performance
export default memo(ChatMessage); 