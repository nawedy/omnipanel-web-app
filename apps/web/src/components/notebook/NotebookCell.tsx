// apps/web/src/components/notebook/NotebookCell.tsx
// Enhanced notebook cell with context awareness and AI integration

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Square, 
  Trash2, 
  Copy, 
  MoreVertical,
  Code,
  Type,
  Image,
  Bot,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Download,
  Upload,
  Zap,
  Brain,
  FileText,
  Terminal,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useWorkspaceContext } from '@/hooks/useWorkspaceContext';
import { useContextStore } from '@/stores/contextStore';
import { aiService } from '@/services/aiService';

export type CellType = 'code' | 'markdown' | 'text' | 'ai' | 'terminal';
export type CellStatus = 'idle' | 'running' | 'completed' | 'error';

export interface NotebookCellData {
  id: string;
  type: CellType;
  content: string;
  output?: string;
  status: CellStatus;
  language?: string;
  metadata?: {
    executionCount?: number;
    executionTime?: number;
    lastExecuted?: Date;
    tags?: string[];
    collapsed?: boolean;
    aiGenerated?: boolean;
  };
}

export interface NotebookCellProps {
  cell: NotebookCellData;
  index: number;
  isSelected: boolean;
  isEditing: boolean;
  onUpdate: (id: string, updates: Partial<NotebookCellData>) => void;
  onExecute: (id: string) => Promise<void>;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onInsertBelow: (id: string, type: CellType) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  enableAI?: boolean;
  enableContext?: boolean;
}

const NotebookCell: React.FC<NotebookCellProps> = ({
  cell,
  index,
  isSelected,
  isEditing,
  onUpdate,
  onExecute,
  onDelete,
  onSelect,
  onInsertBelow,
  onMoveUp,
  onMoveDown,
  enableAI = true,
  enableContext = true
}) => {
  const [isExpanded, setIsExpanded] = useState(!cell.metadata?.collapsed);
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { getRelevantContext } = useWorkspaceContext();
  const { addNotebookCell, contextEnabled } = useContextStore();

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = contentRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 400)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [cell.content, adjustTextareaHeight]);

  // Handle content change
  const handleContentChange = (content: string) => {
    onUpdate(cell.id, { content });
    
    // Add to context if enabled
    if (enableContext && contextEnabled) {
      addNotebookCell(content);
    }
  };

  // Handle AI assistance
  const handleAIAssist = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsAIProcessing(true);
    
    try {
      // Get relevant context for AI
      const relevantContext = enableContext && contextEnabled ? 
        getRelevantContext(aiPrompt, 1000) : '';
      
      const contextualPrompt = relevantContext ? 
        `Context: ${relevantContext}\n\nRequest: ${aiPrompt}` : 
        aiPrompt;

      const messages = [
        {
          role: 'system' as const,
          content: `You are a helpful notebook assistant. Help with code, explanations, and analysis.
          Current cell type: ${cell.type}
          Current cell content: ${cell.content || 'Empty'}
          
          Provide helpful, concise responses. For code requests, provide executable code.
          For explanations, be clear and educational.`,
          timestamp: new Date()
        },
        {
          role: 'user' as const,
          content: contextualPrompt,
          timestamp: new Date()
        }
      ];

      const response = await aiService.generateResponse(messages, relevantContext);
      
      // Insert AI response as new cell or update current cell
      if (aiPrompt.toLowerCase().includes('replace') || aiPrompt.toLowerCase().includes('update')) {
        onUpdate(cell.id, { 
          content: response,
          metadata: { ...cell.metadata, aiGenerated: true }
        });
      } else {
        onInsertBelow(cell.id, cell.type === 'code' ? 'code' : 'markdown');
        // Note: In a real implementation, you'd need to update the newly created cell
      }
      
      setAiPrompt('');
      setShowAIAssist(false);
    } catch (error) {
      console.error('AI assistance failed:', error);
    } finally {
      setIsAIProcessing(false);
    }
  };

  // Execute cell
  const handleExecute = async () => {
    if (cell.status === 'running') return;
    
    onUpdate(cell.id, { 
      status: 'running',
      metadata: { 
        ...cell.metadata, 
        lastExecuted: new Date() 
      }
    });
    
    try {
      await onExecute(cell.id);
    } catch (error) {
      onUpdate(cell.id, { status: 'error' });
    }
  };

  // Get cell type icon
  const getCellTypeIcon = () => {
    switch (cell.type) {
      case 'code': return <Code className="w-4 h-4" />;
      case 'markdown': return <FileText className="w-4 h-4" />;
      case 'text': return <Type className="w-4 h-4" />;
      case 'ai': return <Bot className="w-4 h-4" />;
      case 'terminal': return <Terminal className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (cell.status) {
      case 'running': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group relative border rounded-lg transition-all duration-200 ${
        isSelected 
          ? 'border-primary bg-primary/5 shadow-md' 
          : 'border-border bg-background hover:border-primary/50'
      }`}
      onClick={() => onSelect(cell.id)}
    >
      {/* Cell Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          {/* Cell Type & Index */}
          <div className="flex items-center gap-2">
            {getCellTypeIcon()}
            <span className="text-sm font-medium text-muted-foreground">
              [{index + 1}]
            </span>
            <Badge variant="outline" className="text-xs">
              {cell.type}
            </Badge>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1">
            {getStatusIcon()}
            {cell.metadata?.executionTime && (
              <span className="text-xs text-muted-foreground">
                {cell.metadata.executionTime}ms
              </span>
            )}
          </div>

          {/* AI Generated Badge */}
          {cell.metadata?.aiGenerated && (
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              AI
            </Badge>
          )}

          {/* Context Indicator */}
          {enableContext && contextEnabled && (
            <Badge variant="outline" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Context
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Collapse/Expand */}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
              onUpdate(cell.id, {
                metadata: { ...cell.metadata, collapsed: !isExpanded }
              });
            }}
            className="w-6 h-6 p-0"
          >
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>

          {/* Execute */}
          {cell.type === 'code' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleExecute();
              }}
              disabled={cell.status === 'running'}
              className="w-6 h-6 p-0"
            >
              {cell.status === 'running' ? (
                <Square className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3" />
              )}
            </Button>
          )}

          {/* AI Assist */}
          {enableAI && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setShowAIAssist(!showAIAssist);
              }}
              className="w-6 h-6 p-0"
            >
              <Brain className="w-3 h-3" />
            </Button>
          )}

          {/* More Actions */}
          <Button
            size="sm"
            variant="ghost"
            className="w-6 h-6 p-0"
          >
            <MoreVertical className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* AI Assistance Panel */}
      <AnimatePresence>
        {showAIAssist && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border/50 p-3 bg-muted/30"
          >
            <div className="flex gap-2">
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask AI to help with this cell..."
                className="flex-1 min-h-[60px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    handleAIAssist();
                  }
                }}
              />
              <Button
                onClick={handleAIAssist}
                disabled={!aiPrompt.trim() || isAIProcessing}
                size="sm"
              >
                {isAIProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ctrl+Enter to send • Try: "explain this code", "add comments", "optimize performance"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cell Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3"
          >
            {isEditing ? (
              <Textarea
                ref={contentRef}
                value={cell.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder={`Enter ${cell.type} content...`}
                className="w-full min-h-[100px] font-mono text-sm resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.shiftKey && cell.type === 'code') {
                    e.preventDefault();
                    handleExecute();
                  }
                }}
              />
            ) : (
              <div 
                className="min-h-[100px] p-3 rounded border bg-muted/30 cursor-text"
                onClick={() => onSelect(cell.id)}
              >
                {cell.content ? (
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {cell.content}
                  </pre>
                ) : (
                  <span className="text-muted-foreground italic">
                    Click to edit {cell.type} content...
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cell Output */}
      {cell.output && isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-border/50 p-3 bg-muted/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Output:</span>
            <Button size="sm" variant="ghost" className="w-4 h-4 p-0">
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-sm bg-background p-3 rounded border">
            {cell.output}
          </pre>
        </motion.div>
      )}
    </motion.div>
  );
};

export default NotebookCell; 