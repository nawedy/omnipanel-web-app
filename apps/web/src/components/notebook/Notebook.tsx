'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Play, 
  Square, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Code, 
  Type, 
  Save, 
  Download,
  Bot,
  Copy,
  RefreshCw,
  Loader2,
  Check,
  X,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { useWorkspaceStore } from '@/stores/workspace';
import { contextService } from '@/services/contextService';
import { aiService } from '@/services/aiService';
import { useMonitoring } from '@/components/providers/MonitoringProvider';
import { v4 as uuidv4 } from '@/lib/uuid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useWorkspaceContext } from '@/hooks/useWorkspaceContext';
import { useContextStore } from '@/stores/contextStore';

// Dynamic import for markdown rendering to avoid SSR issues
import dynamic from 'next/dynamic';

const ReactMarkdown = dynamic<React.ComponentProps<typeof import('react-markdown').default>>(
  () => import('react-markdown').then((mod) => mod.default),
  { ssr: false }
);

// TypeScript interfaces for notebook cells and related types
interface CellOutputData {
  type: 'text' | 'error' | 'image' | 'html' | 'table';
  content: string;
  mimeType?: string;
}

interface NotebookCell {
  id: string;
  type: 'code' | 'markdown' | 'raw';
  content: string;
  output?: CellOutputData[];
  execution_count?: number;
  metadata?: Record<string, any>;
  isExecuting?: boolean;
}

interface NotebookProps {
  filePath?: string;
  initialContent?: string;
  onSave?: (content: string) => void;
}

interface AiAssistModalState {
  isOpen: boolean;
  cellId: string;
  cellContent: string;
  isLoading: boolean;
  suggestion: string;
}

// Loading component for notebook
function NotebookLoading() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-background text-foreground p-8">
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <h3 className="text-xl font-semibold">Loading Notebook</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Initializing Jupyter-compatible notebook environment...
        </p>
      </div>
    </div>
  );
}

// Enhanced AI Assistance Modal Component with streaming support
function AiAssistModal({
  isOpen,
  onClose,
  cellContent,
  suggestion,
  isLoading,
  onApplySuggestion,
  streamingContent
}: {
  isOpen: boolean;
  onClose: () => void;
  cellContent: string;
  suggestion: string;
  isLoading: boolean;
  onApplySuggestion: (suggestion: string) => void;
  streamingContent?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background border border-border rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-slate-100">AI Code Assistant</h3>
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
              Context-Aware
            </span>
          </div>
          <button onClick={onClose} className="hover:bg-muted rounded p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2 text-slate-100 flex items-center gap-2">
              <Code className="h-4 w-4" />
              Your Code
            </h4>
            <div className="bg-muted/30 rounded-md p-3 font-mono text-sm overflow-x-auto max-h-64">
              <pre className="text-slate-100">{cellContent}</pre>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2 text-slate-100 flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Suggestion
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            </h4>
            {isLoading ? (
              <div className="bg-muted/30 rounded-md p-3 min-h-[200px] flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Analyzing code with context...</span>
                </div>
                {streamingContent && (
                  <div className="font-mono text-sm overflow-x-auto flex-grow">
                    <pre className="text-slate-100">{streamingContent}</pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-muted/30 rounded-md p-3 font-mono text-sm overflow-x-auto max-h-64">
                <pre className="text-slate-100">{suggestion}</pre>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-border p-4 flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            💡 Suggestions are based on your current project context and recent files
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => onApplySuggestion(suggestion)}
              disabled={isLoading || !suggestion}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Apply Suggestion
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Code Cell Component
function CodeCell({
  cell,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isSelected,
  onSelect,
  onExecute,
  onAiAssist
}: {
  cell: NotebookCell;
  onChange: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
  onExecute: (id: string) => void;
  onAiAssist: (id: string, content: string) => void;
}) {
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(cell.id, value);
    }
  };

  return (
    <div 
      className={`border rounded-md mb-4 overflow-hidden ${isSelected ? 'border-primary ring-1 ring-primary' : 'border-border'}`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between bg-muted/30 px-3 py-1">
        <div className="flex items-center gap-2">
          <Code size={14} className="text-slate-300" />
          <span className="text-xs text-slate-300">Code</span>
          {cell.execution_count !== undefined && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-md text-slate-200">
              [{cell.execution_count}]
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onExecute(cell.id); }}
            className="p-1 hover:bg-muted rounded"
            title="Run Cell"
          >
            {cell.isExecuting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onAiAssist(cell.id, cell.content); }}
            className="p-1 hover:bg-muted rounded text-primary hover:text-primary/80"
            title="AI Assist"
          >
            <Bot size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onMoveUp(cell.id); }}
            className="p-1 hover:bg-muted rounded"
            title="Move Up"
          >
            <ChevronUp size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onMoveDown(cell.id); }}
            className="p-1 hover:bg-muted rounded"
            title="Move Down"
          >
            <ChevronDown size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(cell.id); }}
            className="p-1 hover:bg-muted rounded text-red-500 hover:text-red-600"
            title="Delete Cell"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="h-auto min-h-[100px]">
        <Editor
          height="100px"
          language="python"
          value={cell.content}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            lineHeight: 1.6,
            padding: { top: 8, bottom: 8 },
            lineNumbersMinChars: 1, // Absolute minimum for line numbers
            folding: false, // Disable folding to save space
            scrollbar: { vertical: 'visible', horizontalSliderSize: 12 },
            overviewRulerBorder: false, // Remove border around scrollbar
            glyphMargin: false, // Disable glyph margin to save space
            renderLineHighlight: 'none', // Remove line highlight to avoid overlapping with text
            fixedOverflowWidgets: true, // Fix overflow widgets positioning
            lineDecorationsWidth: 0, // Remove decorations width
            theme: 'omnipanel-theme', // Use our custom theme
          }}
        />
      </div>
      {cell.output && cell.output.length > 0 && (
        <div className="bg-muted/20 border-t border-border p-3 max-h-[300px] overflow-auto text-slate-100">
          {cell.output.map((output, idx) => (
            <div key={idx} className="font-mono text-sm whitespace-pre-wrap text-slate-100">
              {output.type === 'error' ? (
                <div className="text-red-500">{output.content}</div>
              ) : output.type === 'image' ? (
                <div className="flex justify-center">
                  <img src={output.content} alt="Output" className="max-w-full" />
                </div>
              ) : output.type === 'html' ? (
                <div dangerouslySetInnerHTML={{ __html: output.content }} />
              ) : output.type === 'table' ? (
                <div className="overflow-x-auto">
                  <div dangerouslySetInnerHTML={{ __html: output.content }} />
                </div>
              ) : (
                <div className="text-slate-100">{output.content}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Markdown Cell Component
function MarkdownCell({ 
  cell, 
  onChange, 
  onDelete,
  onMoveUp,
  onMoveDown,
  isSelected,
  onSelect
}: { 
  cell: NotebookCell; 
  onChange: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(cell.id, value);
    }
  };

  const toggleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(!isEditing);
  };

  return (
    <div 
      className={`border rounded-md mb-4 overflow-hidden ${isSelected ? 'border-primary ring-1 ring-primary' : 'border-border'}`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between bg-muted/30 px-3 py-1">
        <div className="flex items-center gap-2">
          <Type size={14} className="text-slate-300" />
          <span className="text-xs text-slate-300">Markdown</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={toggleEdit}
            className="p-1 hover:bg-muted rounded"
            title={isEditing ? "Preview" : "Edit"}
          >
            {isEditing ? <FileText size={14} /> : <Code size={14} />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onMoveUp(cell.id); }}
            className="p-1 hover:bg-muted rounded"
            title="Move Up"
          >
            <ChevronUp size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onMoveDown(cell.id); }}
            className="p-1 hover:bg-muted rounded"
            title="Move Down"
          >
            <ChevronDown size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(cell.id); }}
            className="p-1 hover:bg-muted rounded text-red-500 hover:text-red-600"
            title="Delete Cell"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {isEditing ? (
        <div className="h-auto min-h-[100px]">
          <Editor
            height="100px"
            language="markdown"
            value={cell.content}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineNumbers: 'off',
              wordWrap: 'on',
              automaticLayout: true,
              lineHeight: 1.6,
              padding: { top: 8, bottom: 8 },
              folding: false, // Disable folding to save space
              scrollbar: { vertical: 'visible', horizontalSliderSize: 12 },
              overviewRulerBorder: false, // Remove border around scrollbar
              glyphMargin: false, // Disable glyph margin to save space
              renderLineHighlight: 'none', // Remove line highlight to avoid overlapping with text
              fixedOverflowWidgets: true, // Fix overflow widgets positioning
              lineDecorationsWidth: 0, // Remove decorations width
              theme: 'omnipanel-theme', // Use our custom theme
            }}
          />
        </div>
      ) : (
        <div className="p-4 prose prose-invert prose-headings:text-slate-100 prose-p:text-slate-200 prose-a:text-blue-400 prose-code:text-emerald-300 prose-strong:text-slate-100 max-w-none prose-p:my-1 prose-headings:mb-2 prose-headings:mt-3 prose-ul:my-1 prose-li:my-0">
          {cell.id === '1' && cell.content.includes('Welcome to OmniPanel') ? (
            <div className="flex items-center gap-3 mb-4">
              <Image 
                src="/logo.png" 
                alt="OmniPanel Logo" 
                width={32}
                height={32}
                className="rounded-md"
              />
              <h1>Welcome to OmniPanel Notebook</h1>
            </div>
          ) : null}
          <ReactMarkdown>
            {cell.id === '1' && cell.content.includes('Welcome to OmniPanel') 
              ? cell.content.replace('# Welcome to OmniPanel Notebook', '') 
              : cell.content
            }
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

// Sample empty notebook for initialization
const emptyNotebook = {
  cells: [
    {
      cell_type: "markdown",
      metadata: {},
      source: "# Welcome to OmniPanel Notebook\n\nThis is a full-featured Jupyter notebook environment integrated into OmniPanel.",
    },
    {
      cell_type: "code",
      metadata: {
        trusted: true,
      },
      execution_count: null,
      source: "# Example Python code\nimport numpy as np\nimport matplotlib.pyplot as plt\n\n# Generate sample data\nx = np.linspace(0, 10, 100)\ny = np.sin(x)\n\nprint(\"Hello from OmniPanel Notebook!\")\nprint(f\"Generated {len(x)} data points\")",
      outputs: [],
    },
  ],
  metadata: {
    kernelspec: {
      display_name: "Python 3",
      language: "python",
      name: "python3",
    },
    language_info: {
      codemirror_mode: {
        name: "ipython",
        version: 3,
      },
      file_extension: ".py",
      mimetype: "text/x-python",
      name: "python",
      nbconvert_exporter: "python",
      pygments_lexer: "ipython3",
      version: "3.8.0",
    },
  },
  nbformat: 4,
  nbformat_minor: 4,
};

// Main Notebook Component
export default function Notebook({ filePath, initialContent, onSave }: NotebookProps) {
  const workspace = useWorkspaceStore();
  const [cells, setCells] = useState<NotebookCell[]>([]);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiModal, setAiModal] = useState<AiAssistModalState>({
    isOpen: false,
    cellId: '',
    cellContent: '',
    isLoading: false,
    suggestion: ''
  });
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [executionCount, setExecutionCount] = useState(1);
  const [notebookMetadata, setNotebookMetadata] = useState({
    kernelspec: {
      display_name: 'Python 3',
      language: 'python',
      name: 'python3'
    },
    language_info: {
      name: 'python',
      version: '3.9.0'
    }
  });
  
  const monitoring = useMonitoring();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getRelevantContext } = useWorkspaceContext();
  const { contextEnabled, addNotebookCell } = useContextStore();
  
  // Initialize notebook with default cells if no content provided
  useEffect(() => {
    if (!initialContent) {
      // Create default cells
      const defaultCells: NotebookCell[] = [
        {
          id: '1',
          type: 'markdown',
          content: '# Welcome to OmniPanel Notebook\nThis is an interactive computing environment. You can write and execute code or create rich documentation.\n\n## Getting Started\n- Execute code by clicking the Run button\n- Add new cells using the + buttons\n- Convert between code and markdown using the cell toolbar\n- Use AI assistance by clicking the bot icon in code cells',
        },
        {
          id: '2',
          type: 'code',
          content: '# Try running this code\nimport numpy as np\nimport matplotlib.pyplot as plt\n\nx = np.linspace(0, 10, 100)\ny = np.sin(x)\n\nplt.plot(x, y)\nplt.title("Sine Wave")\nplt.show()',
          output: [],
        },
      ];
      
      setCells(defaultCells);
      setSelectedCellId(defaultCells[0].id);
      setIsLoading(false);
    } else {
      // Handle existing content initialization
      setIsLoading(false);
    }
  }, [initialContent]);
  
  // Add a new cell of specified type after the given cell ID
  const addCell = (type: 'code' | 'markdown', afterId?: string) => {
    const newCell: NotebookCell = {
      id: uuidv4(),
      type,
      content: type === 'code' ? '# New code cell\n' : '## New markdown cell\n\nEdit this cell...',
      output: type === 'code' ? [] : undefined,
      execution_count: type === 'code' ? undefined : undefined,
      isExecuting: false
    };

    setCells((prevCells) => {
      if (!afterId) {
        return [...prevCells, newCell];
      }
      
      const index = prevCells.findIndex(cell => cell.id === afterId);
      if (index === -1) return [...prevCells, newCell];
      
      const newCells = [...prevCells];
      newCells.splice(index + 1, 0, newCell);
      return newCells;
    });
    
    // Select the newly created cell
    setSelectedCellId(newCell.id);
  };
  
  // Delete a cell by ID
  const deleteCell = (id: string) => {
    // Don't delete the last cell
    if (cells.length <= 1) return;
    
    const deletedIndex = cells.findIndex(cell => cell.id === id);
    
    setCells(prevCells => {
      const newCells = prevCells.filter(cell => cell.id !== id);
      return newCells;
    });
    
    // Select an adjacent cell if the deleted cell was selected
    if (id === selectedCellId) {
      const newCells = cells.filter(cell => cell.id !== id);
      if (newCells.length > 0) {
        const nextIndex = Math.min(deletedIndex, newCells.length - 1);
        setSelectedCellId(newCells[nextIndex].id);
      }
    }
  };
  
  // Move a cell up or down
  const moveCell = (id: string, direction: 'up' | 'down') => {
    const index = cells.findIndex(cell => cell.id === id);
    if (index === -1) return;
    
    // Can't move first cell up or last cell down
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === cells.length - 1)) {
      return;
    }
    
    setCells(prevCells => {
      const newCells = [...prevCells];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      // Swap cells
      [newCells[index], newCells[targetIndex]] = [newCells[targetIndex], newCells[index]];
      return newCells;
    });
  };
  
  // Update cell content
  const updateCellContent = (id: string, content: string) => {
    setCells(prevCells => 
      prevCells.map(cell => 
        cell.id === id ? { ...cell, content } : cell
      )
    );
  };
  
  // Execute a code cell
  const executeCell = async (id: string) => {
    const cell = cells.find(cell => cell.id === id);
    if (!cell || cell.type !== 'code') return;
    
    // Set cell to executing state
    setCells(prevCells => 
      prevCells.map(cell => 
        cell.id === id ? { ...cell, isExecuting: true, output: [] } : cell
      )
    );
    
    setIsLoading(true);
    
    try {
      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock execution result
      const mockOutput: CellOutputData[] = [
        {
          type: 'text',
          content: `Execution result for:\n${cell.content}\n\nOutput: Hello from OmniPanel Notebook!`,
        }
      ];
      
      // Update cell with output
      setCells(prevCells => 
        prevCells.map(cell => 
          cell.id === id ? { 
            ...cell, 
            isExecuting: false, 
            output: mockOutput,
            execution_count: (cell.execution_count || 0) + 1
          } : cell
        )
      );

      // Add to context if enabled
      if (contextEnabled) {
        addNotebookCell(cell.content);
      }

    } catch (error) {
      console.error('Error executing cell:', error);
      
      // Update cell with error output
      setCells(prevCells => 
        prevCells.map(c => 
          c.id === id 
            ? { 
                ...c, 
                isExecuting: false,
                output: [{
                  type: 'error',
                  content: error instanceof Error ? error.message : 'Unknown error'
                }]
              } 
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle AI assistance for a cell
  const handleAiAssist = async (id: string, content: string) => {
    setAiModal({
      isOpen: true,
      cellId: id,
      cellContent: content,
      isLoading: true,
      suggestion: ''
    });

    try {
      // Get workspace context for better AI assistance
      const projectContext = contextService.getProjectContext();
      const recentFiles = contextService.getRecentFiles();
      
      let contextPrompt = `You are helping with a Jupyter notebook cell. Here's the context:\n\n`;
      
      if (projectContext) {
        contextPrompt += `Project: ${projectContext.name}\n`;
        contextPrompt += `Type: ${projectContext.type}\n`;
        if (projectContext.language) {
          contextPrompt += `Language: ${projectContext.language}\n`;
        }
        contextPrompt += `\n`;
      }
      
      if (recentFiles.length > 0) {
        contextPrompt += `Recent files:\n`;
        recentFiles.slice(0, 5).forEach((f: any) => {
          contextPrompt += `- ${f.name} (${f.language || 'unknown'})\n`;
        });
        contextPrompt += `\n`;
      }
      
      contextPrompt += `\nPlease analyze this code and provide improvements, optimizations, or suggestions:\n\n\`\`\`python\n${content}\n\`\`\`\n\nProvide:\n1. Code improvements or optimizations\n2. Best practices suggestions\n3. Potential issues or bugs\n4. Alternative approaches if applicable\n\nReturn only the improved code without explanations.`;

      // Stream AI response
      let fullResponse = '';
      await aiService.streamCompletion(
        contextPrompt,
        {
          onChunk: (chunk) => {
            fullResponse += chunk;
            setStreamingContent(fullResponse);
          },
          onComplete: (response) => {
            setAiModal(prev => ({
              ...prev,
              isLoading: false,
              suggestion: response
            }));
            setStreamingContent('');
            
            // Track AI assistance usage
            console.log('AI assistance used in notebook', {
              cellId: id,
              contentLength: content.length,
              responseLength: response.length
            });
          },
          onError: (error) => {
            console.error('AI assistance error:', error);
            setAiModal(prev => ({
              ...prev,
              isLoading: false,
              suggestion: 'Error getting AI suggestion. Please try again.'
            }));
            console.log('AI assistance error in notebook', { error: error.message });
          }
        }
      );
    } catch (error) {
      console.error('AI assistance error:', error);
      setAiModal(prev => ({
        ...prev,
        isLoading: false,
        suggestion: 'Error getting AI suggestion. Please try again.'
      }));
      console.log('AI assistance error in notebook', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };
  
  // Apply AI suggestion to a cell
  const applyAiSuggestion = (suggestion: string) => {
    if (aiModal.cellId && suggestion) {
      updateCellContent(aiModal.cellId, suggestion);
      setAiModal({ isOpen: false, cellId: '', cellContent: '', isLoading: false, suggestion: '' });
      console.log('AI suggestion applied in notebook', {
        cellId: aiModal.cellId,
        suggestionLength: suggestion.length
      });
    }
  };
  
  // Save notebook to JSON format
  const saveNotebook = () => {
    const notebookData = {
      cells: cells.map(cell => ({
        cell_type: cell.type,
        source: cell.content.split('\n'),
        metadata: cell.metadata || {},
        outputs: cell.output || [],
        execution_count: cell.execution_count || null
      })),
      metadata: notebookMetadata,
      nbformat: 4,
      nbformat_minor: 4
    };

    const content = JSON.stringify(notebookData, null, 2);
    onSave?.(content);
  };

  const exportNotebook = () => {
    const notebookData = {
      cells: cells.map(cell => ({
        cell_type: cell.type,
        source: cell.content.split('\n'),
        metadata: cell.metadata || {},
        outputs: cell.output || [],
        execution_count: cell.execution_count || null
      })),
      metadata: notebookMetadata,
      nbformat: 4,
      nbformat_minor: 4
    };

    const content = JSON.stringify(notebookData, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filePath ? filePath.split('/').pop() || 'notebook.ipynb' : 'notebook.ipynb';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importNotebook = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const notebookData = JSON.parse(content);
        
        if (notebookData.cells && Array.isArray(notebookData.cells)) {
          const convertedCells: NotebookCell[] = notebookData.cells.map((cell: any) => ({
            id: `cell-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: cell.cell_type === 'code' ? 'code' : cell.cell_type === 'markdown' ? 'markdown' : 'raw',
            content: Array.isArray(cell.source) ? cell.source.join('') : cell.source,
            metadata: cell.metadata || {},
            output: cell.outputs ? cell.outputs.map((output: any) => {
              if (output.output_type === 'stream') {
                return {
                  type: 'text',
                  content: Array.isArray(output.text) ? output.text.join('') : output.text
                };
              } else if (output.output_type === 'error') {
                return {
                  type: 'error',
                  content: output.ename + ': ' + output.evalue + '\n' + output.traceback.join('\n')
                };
              } else if (output.output_type === 'display_data' || output.output_type === 'execute_result') {
                if (output.data && output.data['image/png']) {
                  return {
                    type: 'image',
                    content: output.data['image/png'],
                    mimeType: 'image/png'
                  };
                } else if (output.data && output.data['text/html']) {
                  return {
                    type: 'html',
                    content: output.data['text/html']
                  };
                } else if (output.data['text/plain']) {
                  return {
                    type: 'text',
                    content: output.data['text/plain']
                  };
                }
              }
              return {
                type: 'text',
                content: 'Unsupported output type'
              };
            }) : [],
            execution_count: cell.execution_count || null
          }));
          
          setCells(convertedCells);
          if (convertedCells.length > 0) {
            setSelectedCellId(convertedCells[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to import notebook:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  // Effect to initialize notebook from provided content
  useEffect(() => {
    if (initialContent) {
      try {
        const parsed = JSON.parse(initialContent);
        if (parsed.cells) {
          const convertedCells = parsed.cells.map((cell: any) => ({
            id: uuidv4(),
            type: cell.cell_type,
            content: Array.isArray(cell.source) ? cell.source.join('') : cell.source || '',
            output: cell.outputs ? cell.outputs.map((output: any) => {
              if (output.output_type === 'stream') {
                return {
                  type: 'text',
                  content: Array.isArray(output.text) ? output.text.join('') : output.text
                };
              } else if (output.output_type === 'error') {
                return {
                  type: 'error',
                  content: output.ename + ': ' + output.evalue + '\n' + output.traceback.join('\n')
                };
              } else if (output.output_type === 'display_data' || output.output_type === 'execute_result') {
                if (output.data && output.data['image/png']) {
                  return {
                    type: 'image',
                    content: output.data['image/png'],
                    mimeType: 'image/png'
                  };
                } else if (output.data && output.data['text/html']) {
                  return {
                    type: 'html',
                    content: output.data['text/html']
                  };
                } else if (output.data['text/plain']) {
                  return {
                    type: 'text',
                    content: output.data['text/plain']
                  };
                }
              }
              return {
                type: 'text',
                content: 'Unsupported output type'
              };
            }) : [],
            execution_count: cell.execution_count || null
          }));
          
          setCells(convertedCells);
          if (convertedCells.length > 0) {
            setSelectedCellId(convertedCells[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to parse notebook content:', error);
        // Fall back to default cells
      }
    }
  }, [initialContent]);

  // Language for the notebook (could be made configurable)
  const language = 'python';

  return (
    <div className="w-full h-full flex flex-col bg-background text-foreground">
      {isLoading ? (
        <NotebookLoading />
      ) : (
        <>
          {/* Enhanced Toolbar */}
          <div className="border-b border-border p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {filePath ? filePath.split('/').pop() : 'Untitled Notebook'}
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs">
                    {notebookMetadata.kernelspec.display_name}
                  </span>
                  <span>{cells.length} cells</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => addCell('code')}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <Code className="h-4 w-4" />
                  Code
                </button>
                <button
                  onClick={() => addCell('markdown')}
                  className="flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-muted transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <Type className="h-4 w-4" />
                  Markdown
                </button>
                <div className="w-px h-6 bg-border" />
                <button
                  onClick={saveNotebook}
                  className="flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-muted transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
                <button
                  onClick={exportNotebook}
                  className="flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-muted transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Notebook Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <AnimatePresence>
                {cells.map((cell, index) => (
                  <motion.div
                    key={cell.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {cell.type === 'code' ? (
                      <CodeCell
                        cell={cell}
                        onChange={updateCellContent}
                        onDelete={deleteCell}
                        onMoveUp={(id) => moveCell(id, 'up')}
                        onMoveDown={(id) => moveCell(id, 'down')}
                        isSelected={selectedCellId === cell.id}
                        onSelect={() => setSelectedCellId(cell.id)}
                        onExecute={executeCell}
                        onAiAssist={handleAiAssist}
                      />
                    ) : (
                      <MarkdownCell
                        cell={cell}
                        onChange={updateCellContent}
                        onDelete={deleteCell}
                        onMoveUp={(id) => moveCell(id, 'up')}
                        onMoveDown={(id) => moveCell(id, 'down')}
                        isSelected={selectedCellId === cell.id}
                        onSelect={() => setSelectedCellId(cell.id)}
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {cells.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Empty Notebook</h3>
                  <p className="text-muted-foreground mb-6">Start by adding a code or markdown cell</p>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => addCell('code')}
                      className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Code className="h-4 w-4" />
                      Add Code Cell
                    </button>
                    <button
                      onClick={() => addCell('markdown')}
                      className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors"
                    >
                      <Type className="h-4 w-4" />
                      Add Markdown Cell
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Enhanced AI Modal */}
          <AiAssistModal
            isOpen={aiModal.isOpen}
            onClose={() => setAiModal({ isOpen: false, cellId: '', cellContent: '', isLoading: false, suggestion: '' })}
            cellContent={aiModal.cellContent}
            suggestion={aiModal.suggestion}
            isLoading={aiModal.isLoading}
            onApplySuggestion={applyAiSuggestion}
            streamingContent={streamingContent}
          />

          {/* Hidden file input for import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".ipynb"
            onChange={importNotebook}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}