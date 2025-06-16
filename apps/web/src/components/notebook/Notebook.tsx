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
  Upload,
  Settings,
  Bot,
  Copy,
  MoreVertical,
  FileDown,
  RefreshCw,
  Loader2,
  Check,
  X,
  Image as ImageIcon,
  Table,
  BarChart,
  FileText
} from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { useWorkspaceStore } from '@/stores/workspace';
import { v4 as uuidv4 } from 'uuid';

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

// AI Assistance Modal Component
function AiAssistModal({
  isOpen,
  onClose,
  cellContent,
  suggestion,
  isLoading,
  onApplySuggestion
}: {
  isOpen: boolean;
  onClose: () => void;
  cellContent: string;
  suggestion: string;
  isLoading: boolean;
  onApplySuggestion: (suggestion: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-slate-100">AI Assistant</h3>
          </div>
          <button onClick={onClose} className="hover:bg-muted rounded p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-grow">
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 text-slate-100">Your Code</h4>
            <div className="bg-muted/30 rounded-md p-3 font-mono text-sm overflow-x-auto">
              <pre className="text-slate-100">{cellContent}</pre>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2 text-slate-100">AI Suggestion</h4>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="bg-muted/30 rounded-md p-3 font-mono text-sm overflow-x-auto">
                <pre className="text-slate-100">{suggestion}</pre>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-border p-4 flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-border hover:bg-muted"
          >
            Cancel
          </button>
          <button 
            onClick={() => onApplySuggestion(suggestion)}
            disabled={isLoading || !suggestion}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Apply Suggestion
          </button>
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
  const [selectedCellId, setSelectedCellId] = useState<string>('');
  const [isKernelRunning, setIsKernelRunning] = useState(false);
  const [aiAssistState, setAiAssistState] = useState<AiAssistModalState>({
    isOpen: false,
    cellId: '',
    cellContent: '',
    isLoading: false,
    suggestion: ''
  });
  
  // Add custom styles for editor to fix text positioning
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      /* Fix line number width and text positioning */
      .editor-container .monaco-editor .margin,
      .editor-container .monaco-editor .margin-view-overlays {
        width: 20px !important;
      }
      .editor-container .monaco-editor .line-numbers {
        width: 20px !important;
        text-align: center !important;
      }
      .editor-container .monaco-editor .monaco-scrollable-element {
        left: 20px !important;
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  
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
    
    setIsKernelRunning(true);
    
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
    } catch (error) {
      // Handle execution error
      setCells(prevCells => 
        prevCells.map(cell => 
          cell.id === id ? { 
            ...cell, 
            isExecuting: false, 
            output: [{
              type: 'error',
              content: `Error executing cell: ${error instanceof Error ? error.message : String(error)}`
            }]
          } : cell
        )
      );
    } finally {
      setIsKernelRunning(false);
    }
  };
  
  // Handle AI assistance for a cell
  const handleAiAssist = async (id: string, content: string) => {
    setAiAssistState({
      isOpen: true,
      cellId: id,
      cellContent: content,
      isLoading: true,
      suggestion: ''
    });
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock suggestion based on the content
      let suggestion = '';
      
      if (content.includes('print')) {
        suggestion = content.replace('print', '# Enhanced with better output formatting\nprint(f"Result: {');
        suggestion += content.includes('"') ? content.split('"')[1].split('"')[0] : 'result';
        suggestion += '}")'; 
      } else {
        suggestion = '# AI enhanced version\n# Added error handling and documentation\n\ntry:\n    ' + 
          content.replace(/\n/g, '\n    ') + 
          '\nexcept Exception as e:\n    print(f"Error occurred: {e}")\n';
      }
      
      setAiAssistState(prev => ({
        ...prev,
        isLoading: false,
        suggestion
      }));
    } catch (error) {
      setAiAssistState(prev => ({
        ...prev,
        isLoading: false,
        suggestion: '# Error generating suggestion\n# Please try again'
      }));
    }
  };
  
  // Apply AI suggestion to a cell
  const applyAiSuggestion = (suggestion: string) => {
    if (aiAssistState.cellId) {
      updateCellContent(aiAssistState.cellId, suggestion);
      setAiAssistState({
        isOpen: false,
        cellId: '',
        cellContent: '',
        isLoading: false,
        suggestion: ''
      });
    }
  };
  
  // Save notebook to JSON format
  const saveNotebook = () => {
    if (!onSave) return;
    
    const notebookData = {
      cells: cells.map(cell => ({
        cell_type: cell.type,
        metadata: cell.metadata || {},
        source: cell.content.split('\n'),
        execution_count: cell.type === 'code' ? cell.execution_count : null,
        outputs: cell.output ? cell.output.map(out => ({
          output_type: out.type === 'error' ? 'error' : 'execute_result',
          data: { 'text/plain': out.content }
        })) : []
      })),
      metadata: {
        kernelspec: {
          display_name: "Python 3",
          language: "python",
          name: "python3"
        },
        language_info: {
          file_extension: ".py",
          mimetype: "text/x-python",
          name: "python",
          nbconvert_exporter: "python",
          pygments_lexer: "ipython3",
          version: "3.8.0"
        }
      },
      nbformat: 4,
      nbformat_minor: 5
    };
    
    onSave(JSON.stringify(notebookData, null, 2));
  };

  // Effect to initialize notebook from provided content
  // Add custom styles for editor to fix text positioning
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      /* Fix line number width and text positioning */
      .editor-container .monaco-editor .margin,
      .editor-container .monaco-editor .margin-view-overlays {
        width: 20px !important;
      }
      .editor-container .monaco-editor .line-numbers {
        width: 20px !important;
        text-align: center !important;
      }
      .editor-container .monaco-editor .monaco-scrollable-element {
        left: 20px !important;
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // Add custom styles for better text contrast in the editor
  useEffect(() => {
    const contrastStyleEl = document.createElement('style');
    contrastStyleEl.textContent = `
      /* Improve text contrast in Monaco editor */
      .monaco-editor .mtk1 { color: #f1f5f9 !important; } /* Default text - slate-100 */
      .monaco-editor .mtk7 { color: #38bdf8 !important; } /* Keywords - sky-400 */
      .monaco-editor .mtk8 { color: #4ade80 !important; } /* Variables - green-400 */
      .monaco-editor .mtk5 { color: #fb923c !important; } /* Functions - orange-400 */
      .monaco-editor .mtk9 { color: #c084fc !important; } /* Strings - purple-400 */
      .monaco-editor .mtk6 { color: #e879f9 !important; } /* Special - fuchsia-400 */
      .monaco-editor .mtk20 { color: #94a3b8 !important; } /* Comments - slate-400 */
      .monaco-editor .mtk4 { color: #f472b6 !important; } /* Numbers - pink-400 */
      .monaco-editor .line-numbers { color: #94a3b8 !important; } /* Line numbers - slate-400 */
    `;
    document.head.appendChild(contrastStyleEl);
    
    return () => {
      document.head.removeChild(contrastStyleEl);
    };
  }, []);

  useEffect(() => {
    // Try to parse initial content if provided
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
  } // Close if (initialContent) block
  }, [initialContent]);

  // Language for the notebook (could be made configurable)
  const language = 'python';

  return (
    <div className="h-full flex flex-col bg-background px-4">
      {/* Notebook toolbar */}
      <div className="flex items-center justify-between border-b border-border p-2 bg-muted/30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => addCell('code')}
            className="p-1.5 hover:bg-muted rounded-md flex items-center gap-1 text-xs"
            title="Add Code Cell"
          >
            <Code size={14} />
            <span>Code</span>
          </button>
          <button
            onClick={() => addCell('markdown')}
            className="p-1.5 hover:bg-muted rounded-md flex items-center gap-1 text-xs"
            title="Add Markdown Cell"
          >
            <Type size={14} />
            <span>Markdown</span>
          </button>
          <div className="h-4 border-r border-border mx-1"></div>
          <button
            onClick={saveNotebook}
            className="p-1.5 hover:bg-muted rounded-md"
            title="Save Notebook"
          >
            <Save size={14} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs px-2 py-1 bg-muted rounded-md">
            <div className={`w-2 h-2 rounded-full ${isKernelRunning ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
            <span>{isKernelRunning ? 'Running' : 'Ready'}</span>
          </div>
          <button
            className="p-1.5 hover:bg-muted rounded-md"
            title="Settings"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>
      
      {/* Notebook cells */}
      <div className="flex-1 overflow-y-auto py-4 editor-container">
        {cells.map(cell => (
          <div key={cell.id}>
            {cell.type === 'code' ? (
              <CodeCell
                cell={cell}
                onChange={updateCellContent}
                onDelete={deleteCell}
                onMoveUp={() => moveCell(cell.id, 'up')}
                onMoveDown={() => moveCell(cell.id, 'down')}
                isSelected={cell.id === selectedCellId}
                onSelect={() => setSelectedCellId(cell.id)}
                onExecute={executeCell}
                onAiAssist={handleAiAssist}
              />
            ) : (
              <MarkdownCell
                cell={cell}
                onChange={updateCellContent}
                onDelete={deleteCell}
                onMoveUp={() => moveCell(cell.id, 'up')}
                onMoveDown={() => moveCell(cell.id, 'down')}
                isSelected={cell.id === selectedCellId}
                onSelect={() => setSelectedCellId(cell.id)}
              />
            )}
          </div>
        ))}
        
        {/* Add cell buttons at the end */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button 
            onClick={() => addCell('code')} 
            className="px-3 py-1.5 rounded-md border border-border hover:bg-muted flex items-center gap-1.5 text-sm"
          >
            <Plus size={14} />
            <span>Code</span>
          </button>
          <button 
            onClick={() => addCell('markdown')} 
            className="px-3 py-1.5 rounded-md border border-border hover:bg-muted flex items-center gap-1.5 text-sm"
          >
            <Plus size={14} />
            <span>Markdown</span>
          </button>
        </div>
      </div>
      
      {/* AI Assistant Modal */}
      <AiAssistModal
        isOpen={aiAssistState.isOpen}
        onClose={() => setAiAssistState(prev => ({ ...prev, isOpen: false }))}
        cellContent={aiAssistState.cellContent}
        suggestion={aiAssistState.suggestion}
        isLoading={aiAssistState.isLoading}
        onApplySuggestion={applyAiSuggestion}
      />
    </div>
  );
}