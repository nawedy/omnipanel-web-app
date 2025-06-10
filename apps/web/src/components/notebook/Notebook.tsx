'use client';

import React, { useState, useRef } from 'react';
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
  MoreVertical
} from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { useWorkspaceStore } from '@/stores/workspace';

interface NotebookCell {
  id: string;
  type: 'code' | 'markdown' | 'raw';
  content: string;
  output?: any[];
  execution_count?: number;
  metadata?: any;
  isExecuting?: boolean;
  isSelected?: boolean;
}

interface NotebookProps {
  filePath?: string;
  initialContent?: string;
  onSave?: (content: string) => void;
}

export function Notebook({ filePath, initialContent, onSave }: NotebookProps) {
  const { currentProject, updateTab, activeTabId } = useWorkspaceStore();
  const [cells, setCells] = useState<NotebookCell[]>([
    {
      id: '1',
      type: 'markdown',
      content: '# Welcome to OmniPanel Notebook\n\nThis is a Jupyter-style interactive notebook. You can create code cells, markdown cells, and execute them in sequence.\n\n**Features:**\n- Run Python, JavaScript, and more\n- AI-powered code suggestions\n- Rich markdown rendering\n- Export to various formats',
      isSelected: false
    },
    {
      id: '2',
      type: 'code',
      content: '# Example Python code\nimport numpy as np\nimport matplotlib.pyplot as plt\n\n# Generate sample data\nx = np.linspace(0, 10, 100)\ny = np.sin(x)\n\nprint("Hello from OmniPanel Notebook!")\nprint(f"Generated {len(x)} data points")',
      output: [],
      execution_count: undefined,
      isExecuting: false,
      isSelected: false
    }
  ]);
  
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [isKernelRunning, setIsKernelRunning] = useState(false);
  const [language, setLanguage] = useState('python');
  const [aiAssistModal, setAiAssistModal] = useState<{
    isOpen: boolean;
    cellId: string;
    cellContent: string;
    isLoading: boolean;
    suggestion: string;
  }>({
    isOpen: false,
    cellId: '',
    cellContent: '',
    isLoading: false,
    suggestion: ''
  });

  const addCell = (type: 'code' | 'markdown', afterId?: string) => {
    const newCell: NotebookCell = {
      id: Date.now().toString(),
      type,
      content: type === 'code' ? '# New code cell\n' : '## New markdown cell\n\nEdit this cell...',
      output: type === 'code' ? [] : undefined,
      execution_count: type === 'code' ? undefined : undefined,
      isExecuting: false,
      isSelected: true
    };

    setCells(prev => {
      if (afterId) {
        const index = prev.findIndex(cell => cell.id === afterId);
        const newCells = [...prev];
        newCells.splice(index + 1, 0, newCell);
        return newCells.map(cell => ({ ...cell, isSelected: cell.id === newCell.id }));
      }
      return [...prev.map(cell => ({ ...cell, isSelected: false })), newCell];
    });
    
    setSelectedCellId(newCell.id);
  };

  const deleteCell = (cellId: string) => {
    if (cells.length <= 1) return; // Don't delete the last cell
    
    setCells(prev => {
      const newCells = prev.filter(cell => cell.id !== cellId);
      const deletedIndex = prev.findIndex(cell => cell.id === cellId);
      
      // Select the next cell or previous if it was the last one
      if (newCells.length > 0) {
        const nextIndex = Math.min(deletedIndex, newCells.length - 1);
        const nextCellId = newCells[nextIndex]?.id;
        setSelectedCellId(nextCellId);
        return newCells.map(cell => ({ ...cell, isSelected: cell.id === nextCellId }));
      }
      return newCells;
    });
  };

  const moveCell = (cellId: string, direction: 'up' | 'down') => {
    setCells(prev => {
      const index = prev.findIndex(cell => cell.id === cellId);
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === prev.length - 1)
      ) {
        return prev; // Can't move further
      }

      const newCells = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newCells[index], newCells[targetIndex]] = [newCells[targetIndex], newCells[index]];
      return newCells;
    });
  };

  const updateCellContent = (cellId: string, content: string) => {
    setCells(prev =>
      prev.map(cell =>
        cell.id === cellId ? { ...cell, content } : cell
      )
    );
  };

  const executeCell = async (cellId: string) => {
    const cell = cells.find(c => c.id === cellId);
    if (!cell || cell.type !== 'code') return;

    // Update cell to executing state
    setCells(prev =>
      prev.map(c =>
        c.id === cellId
          ? { ...c, isExecuting: true, output: [] }
          : c
      )
    );

    setIsKernelRunning(true);

    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock execution results
      const mockResults = [
        {
          output_type: 'stream',
          name: 'stdout',
          text: 'Hello from OmniPanel Notebook!\nGenerated 100 data points\n'
        },
        {
          output_type: 'execute_result',
          execution_count: (cell.execution_count || 0) + 1,
          data: {
            'text/plain': 'Execution completed successfully'
          }
        }
      ];

      // Update cell with results
      setCells(prev =>
        prev.map(c =>
          c.id === cellId
            ? {
                ...c,
                isExecuting: false,
                output: mockResults,
                execution_count: (c.execution_count || 0) + 1
              }
            : c
        )
      );
    } catch (error) {
      // Handle execution error
      setCells(prev =>
        prev.map(c =>
          c.id === cellId
            ? {
                ...c,
                isExecuting: false,
                output: [{
                  output_type: 'error',
                  ename: 'ExecutionError',
                  evalue: String(error),
                  traceback: ['Error executing cell']
                }]
              }
            : c
        )
      );
    } finally {
      setIsKernelRunning(false);
    }
  };

  const executeAllCells = async () => {
    const codeCells = cells.filter(cell => cell.type === 'code');
    for (const cell of codeCells) {
      await executeCell(cell.id);
    }
  };

  const selectCell = (cellId: string) => {
    setSelectedCellId(cellId);
    setCells(prev =>
      prev.map(cell => ({ ...cell, isSelected: cell.id === cellId }))
    );
  };

  const renderCellOutput = (output: any[]) => {
    if (!output || output.length === 0) return null;

    return (
      <div className="mt-2 border-l-4 border-blue-500 pl-4">
        {output.map((item, index) => (
          <div key={index} className="mb-2">
            {item.output_type === 'stream' && (
              <pre className="text-base bg-gray-100 dark:bg-gray-800 p-3 rounded text-green-600 dark:text-green-400 font-mono leading-relaxed" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                {item.text}
              </pre>
            )}
            {item.output_type === 'execute_result' && (
              <div className="text-base">
                <div className="text-sm text-muted-foreground mb-1">
                  Out[{item.execution_count}]:
                </div>
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-base leading-relaxed" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  {item.data['text/plain']}
                </pre>
              </div>
            )}
            {item.output_type === 'error' && (
              <div className="text-base">
                <div className="text-red-600 dark:text-red-400 font-medium text-base" style={{ fontSize: '15px' }}>
                  {item.ename}: {item.evalue}
                </div>
                <pre className="text-red-500 text-sm mt-1 font-mono leading-relaxed" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  {item.traceback?.join('\n')}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const saveNotebook = () => {
    const notebookData = {
      cells: cells.map(cell => ({
        cell_type: cell.type,
        source: cell.content.split('\n'),
        metadata: cell.metadata || {},
        outputs: cell.output || [],
        execution_count: cell.execution_count || undefined
      })),
      metadata: {
        kernelspec: {
          display_name: language === 'python' ? 'Python 3' : 'JavaScript',
          language: language,
          name: language
        }
      },
      nbformat: 4,
      nbformat_minor: 4
    };

    if (onSave) {
      onSave(JSON.stringify(notebookData, null, 2));
    }

    if (activeTabId) {
      updateTab(activeTabId, { isDirty: false });
    }
  };

  const downloadNotebook = () => {
    saveNotebook();
    const notebookData = {
      cells: cells.map(cell => ({
        cell_type: cell.type,
        source: cell.content.split('\n'),
        metadata: cell.metadata || {},
        outputs: cell.output || [],
        execution_count: cell.execution_count || undefined
      })),
      metadata: {
        kernelspec: {
          display_name: language === 'python' ? 'Python 3' : 'JavaScript',
          language: language,
          name: language
        }
      },
      nbformat: 4,
      nbformat_minor: 4
    };

    const blob = new Blob([JSON.stringify(notebookData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filePath || 'notebook.ipynb';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAiAssist = async (cellId: string) => {
    const cell = cells.find(c => c.id === cellId);
    if (!cell || cell.type !== 'code') return;

    setAiAssistModal({
      isOpen: true,
      cellId,
      cellContent: cell.content,
      isLoading: true,
      suggestion: ''
    });

    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const suggestions = [
        "# AI Suggestion: Add error handling\ntry:\n    # Your code here\n    " + cell.content.replace(/\n/g, '\n    ') + "\nexcept Exception as e:\n    print(f'Error: {e}')",
        "# AI Suggestion: Add type hints and documentation\ndef improved_function(data: list) -> None:\n    \"\"\"\n    Improved version of your code with better structure\n    Args:\n        data: Input data list\n    \"\"\"\n    " + cell.content.replace(/\n/g, '\n    '),
        "# AI Suggestion: Optimize for performance\n# Using numpy operations for better performance\n" + cell.content + "\n\n# Consider using vectorized operations for better performance",
        "# AI Suggestion: Add logging and monitoring\nimport logging\nlogging.basicConfig(level=logging.INFO)\n\n" + cell.content + "\n\nlogging.info('Code execution completed')"
      ];
      
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      
      setAiAssistModal(prev => ({
        ...prev,
        isLoading: false,
        suggestion: randomSuggestion
      }));
    } catch (error) {
      setAiAssistModal(prev => ({
        ...prev,
        isLoading: false,
        suggestion: 'Sorry, there was an error getting AI suggestions. Please try again.'
      }));
    }
  };

  const applyAiSuggestion = () => {
    if (aiAssistModal.suggestion && aiAssistModal.cellId) {
      updateCellContent(aiAssistModal.cellId, aiAssistModal.suggestion);
      setAiAssistModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const closeAiModal = () => {
    setAiAssistModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Notebook Header */}
      <div className="flex-shrink-0 h-14 bg-card/30 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">Nb</span>
            </div>
            <span className="font-medium">{filePath || 'Untitled Notebook'}</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 bg-accent/50 rounded-md text-sm">
            <div className={`w-2 h-2 rounded-full ${isKernelRunning ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
            <span className="text-muted-foreground">
              {language === 'python' ? 'Python 3' : 'JavaScript'} Kernel
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => executeAllCells()}
            className="p-2 hover:bg-accent/50 rounded-md transition-colors"
            title="Run All Cells"
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            className="p-2 hover:bg-accent/50 rounded-md transition-colors"
            title="Stop Kernel"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => addCell('code')}
            className="p-2 hover:bg-accent/50 rounded-md transition-colors"
            title="Add Code Cell"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => addCell('markdown')}
            className="p-2 hover:bg-accent/50 rounded-md transition-colors"
            title="Add Markdown Cell"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            onClick={saveNotebook}
            className="p-2 hover:bg-accent/50 rounded-md transition-colors"
            title="Save Notebook"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={downloadNotebook}
            className="p-2 hover:bg-accent/50 rounded-md transition-colors"
            title="Download Notebook"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            className="p-2 hover:bg-accent/50 rounded-md transition-colors"
            title="Notebook Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notebook Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence>
            {cells.map((cell, index) => (
              <motion.div
                key={cell.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`border rounded-lg overflow-hidden ${
                  cell.isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                }`}
                onClick={() => selectCell(cell.id)}
              >
                {/* Cell Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-card/50 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      cell.type === 'code' ? 'bg-blue-500' : 
                      cell.type === 'markdown' ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                    <span className="text-sm font-medium capitalize">{cell.type}</span>
                    {cell.type === 'code' && cell.execution_count && (
                      <span className="text-xs text-muted-foreground">
                        [{cell.execution_count}]
                      </span>
                    )}
                    {cell.isExecuting && (
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce delay-100" />
                        <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce delay-200" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {cell.type === 'code' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            executeCell(cell.id);
                          }}
                          className="p-1 hover:bg-accent/50 rounded"
                          title="Run Cell"
                        >
                          <Play className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAiAssist(cell.id);
                          }}
                          className="p-1 hover:bg-accent/50 rounded text-blue-500"
                          title="AI Assistance"
                        >
                          <Bot className="w-3 h-3" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveCell(cell.id, 'up');
                      }}
                      disabled={index === 0}
                      className="p-1 hover:bg-accent/50 rounded disabled:opacity-50"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveCell(cell.id, 'down');
                      }}
                      disabled={index === cells.length - 1}
                      className="p-1 hover:bg-accent/50 rounded disabled:opacity-50"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addCell('code', cell.id);
                      }}
                      className="p-1 hover:bg-accent/50 rounded"
                      title="Add Cell Below"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCell(cell.id);
                      }}
                      className="p-1 hover:bg-accent/50 rounded text-red-500"
                      title="Delete Cell"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Cell Content */}
                <div className="relative">
                  {cell.type === 'code' ? (
                    <div className="min-h-[120px]">
                      <Editor
                        height="auto"
                        language={language}
                        value={cell.content}
                        onChange={(value) => updateCellContent(cell.id, value || '')}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          lineNumbers: 'on',
                          wordWrap: 'on',
                          automaticLayout: true,
                          fontSize: 18,
                          fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
                          lineHeight: 1.6,
                          tabSize: 4,
                          insertSpaces: true,
                          scrollBeyondLastLine: false,
                          readOnly: cell.isExecuting,
                          padding: { top: 12, bottom: 12 }
                        }}
                      />
                    </div>
                  ) : (
                    <textarea
                      value={cell.content}
                      onChange={(e) => updateCellContent(cell.id, e.target.value)}
                      className="w-full min-h-[120px] p-4 bg-transparent border-none outline-none resize-none font-mono text-lg leading-relaxed"
                      placeholder={cell.type === 'markdown' ? 'Enter markdown...' : 'Enter text...'}
                      style={{
                        fontSize: '18px',
                        lineHeight: '1.6',
                        fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace'
                      }}
                    />
                  )}

                  {/* Cell Output */}
                  {cell.type === 'code' && cell.output && (
                    <div className="px-4 pb-4">
                      {renderCellOutput(cell.output)}
                    </div>
                  )}

                  {/* Markdown Preview */}
                  {cell.type === 'markdown' && !cell.isSelected && (
                    <div className="absolute inset-0 p-4 bg-card/90 backdrop-blur-sm">
                      <div className="prose prose-lg dark:prose-invert max-w-none" style={{ fontSize: '18px', lineHeight: '1.6' }}>
                        <div className="text-muted-foreground">
                          <p className="text-lg">Markdown preview: {cell.content.substring(0, 100)}...</p>
                          <p className="text-base">Click to edit</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Cell Button */}
          <div className="flex justify-center gap-2 py-4">
            <button
              onClick={() => addCell('code')}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg transition-colors"
            >
              <Code className="w-4 h-4" />
              <span>Code</span>
            </button>
            <button
              onClick={() => addCell('markdown')}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg transition-colors"
            >
              <Type className="w-4 h-4" />
              <span>Markdown</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notebook Footer */}
      <div className="flex-shrink-0 h-8 bg-card/20 border-t border-border flex items-center justify-between px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Cells: {cells.length}</span>
          <span>Kernel: {language}</span>
          <span>Status: {isKernelRunning ? 'Running' : 'Ready'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Auto-save: On</span>
          <span>Last saved: Just now</span>
        </div>
      </div>

      {/* AI Assistance Modal */}
      {aiAssistModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-4xl bg-popover border border-border rounded-lg shadow-xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-500" />
                AI Code Assistant
              </h3>
              <button
                onClick={closeAiModal}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {aiAssistModal.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-100" />
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-200" />
                    <span className="ml-2 text-muted-foreground">AI is analyzing your code...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Original Code:</h4>
                    <pre className="bg-muted p-3 rounded-md text-sm font-mono overflow-x-auto">
                      {aiAssistModal.cellContent}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">AI Suggestion:</h4>
                    <pre className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-md text-sm font-mono overflow-x-auto">
                      {aiAssistModal.suggestion}
                    </pre>
                  </div>
                </div>
              )}
            </div>
            
            {!aiAssistModal.isLoading && aiAssistModal.suggestion && (
              <div className="p-4 border-t border-border flex justify-end gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(aiAssistModal.suggestion)}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  Copy Suggestion
                </button>
                <button
                  onClick={applyAiSuggestion}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Apply Suggestion
                </button>
                <button
                  onClick={closeAiModal}
                  className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 