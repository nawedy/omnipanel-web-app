'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Editor } from '@monaco-editor/react';
import { 
  Play, 
  Save, 
  Download, 
  Upload, 
  Settings, 
  Code, 
  FileText,
  Zap,
  Copy,
  Eye,
  EyeOff,
  Bot,
  Terminal as TerminalIcon,
  MessageSquare
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspace';

interface CodeEditorProps {
  filePath?: string;
  initialContent?: string;
  language?: string;
  readOnly?: boolean;
  onSave?: (content: string) => void;
  onContentChange?: (content: string) => void;
}

interface AiAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  action: 'explain' | 'improve';
  onResult: (result: string) => void;
}

function AiAssistModal({ isOpen, onClose, selectedText, action, onResult }: AiAssistModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');

  useEffect(() => {
    if (isOpen && selectedText) {
      handleAiRequest();
    }
  }, [isOpen, selectedText, action]);

  const handleAiRequest = async () => {
    setIsLoading(true);
    setResult('');
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = action === 'explain' 
        ? `## Code Explanation\n\nThe selected code:\n\`\`\`\n${selectedText}\n\`\`\`\n\nThis code appears to be doing the following:\n- Processing data structures\n- Implementing business logic\n- Handling user interactions\n\nKey points:\n1. The function uses modern JavaScript/TypeScript patterns\n2. It follows clean code principles\n3. Consider adding error handling for production use`
        : `## Improved Code\n\nHere's an optimized version of your code:\n\n\`\`\`typescript\n// Improved version with better performance and readability\n${selectedText.replace(/console\.log/g, '// TODO: Replace with proper logging')}\n// Added type safety and error handling\n\`\`\`\n\n**Improvements made:**\n- Added type annotations\n- Improved error handling\n- Enhanced readability\n- Better performance optimizations`;
      
      setResult(mockResult);
      onResult(mockResult);
    } catch (error) {
      setResult('Sorry, there was an error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-2xl bg-popover border border-border rounded-lg shadow-xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-500" />
            AI {action === 'explain' ? 'Code Explanation' : 'Code Improvement'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" />
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-100" />
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-200" />
                <span className="ml-2 text-muted-foreground">AI is analyzing your code...</span>
              </div>
            </div>
          ) : result ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md">
                {result}
              </div>
            </div>
          ) : null}
        </div>
        
        {result && (
          <div className="p-4 border-t border-border flex justify-end gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              Copy Result
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  const renderMarkdown = (text: string) => {
    // Simple markdown rendering - in production, use a proper markdown library
    return text
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mb-2">$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/`([^`]*)`/gim, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/gim, '<br>');
  };

  return (
    <div 
      className="prose prose-sm dark:prose-invert max-w-none p-4"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}

export function CodeEditor({ 
  filePath, 
  initialContent = '', 
  language = 'typescript',
  readOnly = false,
  onSave,
  onContentChange 
}: CodeEditorProps) {
  const { currentProject, updateTab, activeTabId, theme, layout, addTab } = useWorkspaceStore();
  const [content, setContent] = useState(initialContent);
  const [isDirty, setIsDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [aiModal, setAiModal] = useState<{
    isOpen: boolean;
    selectedText: string;
    action: 'explain' | 'improve';
  }>({
    isOpen: false,
    selectedText: '',
    action: 'explain'
  });
  const [executionOutput, setExecutionOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const editorRef = useRef<any>(null);

  // Detect language from file extension
  const getLanguageFromPath = (path: string): string => {
    const extension = path.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'sh': 'shell',
      'sql': 'sql',
      'json': 'json',
      'xml': 'xml',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'md': 'markdown',
      'yaml': 'yaml',
      'yml': 'yaml',
      'dockerfile': 'dockerfile'
    };
    return languageMap[extension || ''] || 'plaintext';
  };

  const currentLanguage = filePath ? getLanguageFromPath(filePath) : language;
  const monacoTheme = theme === 'light' ? 'light' : 'vs-dark';

  useEffect(() => {
    if (content !== initialContent) {
      setIsDirty(true);
      if (activeTabId) {
        updateTab(activeTabId, { isDirty: true });
      }
    } else {
      setIsDirty(false);
      if (activeTabId) {
        updateTab(activeTabId, { isDirty: false });
      }
    }
  }, [content, initialContent, activeTabId, updateTab]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure editor options
    editor.updateOptions({
      fontSize: fontSize,
      fontFamily: '"Fira Code", "SF Mono", Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace',
      fontLigatures: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      renderWhitespace: 'selection',
      guides: {
        indentation: true,
        highlightActiveIndentation: true
      }
    });

    // Add AI assistance shortcuts
    editor.addAction({
      id: 'ai-explain-code',
      label: 'AI: Explain Selected Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyE],
      run: () => {
        const selection = editor.getSelection();
        const selectedText = editor.getModel()?.getValueInRange(selection);
        if (selectedText) {
          setAiModal({
            isOpen: true,
            selectedText,
            action: 'explain'
          });
        }
      }
    });

    editor.addAction({
      id: 'ai-improve-code',
      label: 'AI: Improve Selected Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI],
      run: () => {
        const selection = editor.getSelection();
        const selectedText = editor.getModel()?.getValueInRange(selection);
        if (selectedText) {
          setAiModal({
            isOpen: true,
            selectedText,
            action: 'improve'
          });
        }
      }
    });

    editor.addAction({
      id: 'send-to-chat',
      label: 'Send to Chat',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyC],
      run: () => {
        const selection = editor.getSelection();
        const selectedText = editor.getModel()?.getValueInRange(selection) || content;
        if (selectedText) {
          // Create a new chat tab with the code as context
          const chatTabId = addTab({
            title: 'Code Discussion',
            type: 'chat',
            icon: 'message-square',
            projectId: currentProject?.id,
            content: {
              initialMessage: `Please help me with this code:\n\n\`\`\`${currentLanguage}\n${selectedText}\n\`\`\``
            }
          });
        }
      }
    });

    // Auto-save functionality
    let saveTimeout: NodeJS.Timeout;
    editor.onDidChangeModelContent(() => {
      const newContent = editor.getValue();
      setContent(newContent);
      onContentChange?.(newContent);
      
      // Auto-save after 2 seconds of inactivity
      if (!readOnly) {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          handleSave();
        }, 2000);
      }
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(content);
      setIsDirty(false);
      if (activeTabId) {
        updateTab(activeTabId, { isDirty: false });
      }
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filePath || 'untitled.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const handleRun = async () => {
    if (isExecuting) return;
    
    setIsExecuting(true);
    setExecutionOutput('');
    
    try {
      // Create or focus terminal tab for code execution
      const terminalTabId = addTab({
        title: `Terminal - ${filePath ? filePath.split('/').pop() : 'Code'}`,
        type: 'terminal',
        icon: 'terminal',
        projectId: currentProject?.id,
        content: {
          executeCommand: getExecutionCommand(currentLanguage, content, filePath)
        }
      });
      
      // Show execution feedback
      setExecutionOutput(`Code sent to terminal for execution.\nLanguage: ${currentLanguage}\nFile: ${filePath || 'untitled'}`);
      
      // Optional: If terminal integration allows, capture output
      setTimeout(() => {
        setExecutionOutput(prev => prev + '\n\n✓ Execution initiated in terminal tab');
        setIsExecuting(false);
      }, 1000);
      
    } catch (error) {
      setExecutionOutput(`Error: ${error}`);
      setIsExecuting(false);
    }
  };

  const getExecutionCommand = (lang: string, code: string, path?: string): string => {
    switch (lang) {
      case 'python':
        return path ? `python "${path}"` : `python -c "${code.replace(/"/g, '\\"')}"`;
      case 'javascript':
      case 'typescript':
        return path ? `node "${path}"` : `node -e "${code.replace(/"/g, '\\"')}"`;
      case 'java':
        return path ? `java "${path}"` : 'echo "Save file first to execute Java code"';
      case 'cpp':
        return path ? `g++ "${path}" -o temp && ./temp` : 'echo "Save file first to execute C++ code"';
      case 'go':
        return path ? `go run "${path}"` : 'echo "Save file first to execute Go code"';
      case 'rust':
        return path ? `rustc "${path}" && ./${path.replace('.rs', '')}` : 'echo "Save file first to execute Rust code"';
      case 'shell':
      case 'bash':
        return path ? `bash "${path}"` : code;
      default:
        return `echo "Execution not supported for ${lang}"`;
    }
  };

  const handleAiModalClose = () => {
    setAiModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleAiResult = (result: string) => {
    // Could integrate the result back into the editor or show in a separate panel
    console.log('AI Result:', result);
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
    }
  };

  const getLanguageDisplayName = (lang: string): string => {
    const names: Record<string, string> = {
      'typescript': 'TypeScript',
      'javascript': 'JavaScript',
      'python': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'csharp': 'C#',
      'go': 'Go',
      'rust': 'Rust',
      'php': 'PHP',
      'ruby': 'Ruby',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'scala': 'Scala',
      'shell': 'Shell',
      'sql': 'SQL',
      'json': 'JSON',
      'xml': 'XML',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'markdown': 'Markdown',
      'yaml': 'YAML',
      'dockerfile': 'Dockerfile',
      'plaintext': 'Plain Text'
    };
    return names[lang] || lang.toUpperCase();
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Editor Header */}
      <div className="flex-shrink-0 h-14 bg-card/30 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-neon-purple" />
            <span className="font-medium">{filePath || 'Untitled'}</span>
            {isDirty && <span className="text-neon-blue">•</span>}
          </div>
          <div className="flex items-center gap-2 px-2 py-1 bg-accent/50 rounded-md text-sm">
            <span className="text-muted-foreground">{getLanguageDisplayName(currentLanguage)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {currentLanguage === 'markdown' && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 hover:bg-accent/50 rounded-md transition-colors"
              title={showPreview ? 'Hide Preview' : 'Show Preview'}
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={() => {
              const selection = editorRef.current?.getSelection();
              const selectedText = editorRef.current?.getModel()?.getValueInRange(selection);
              if (selectedText) {
                setAiModal({ isOpen: true, selectedText, action: 'explain' });
              }
            }}
            className="p-2 hover:bg-accent/50 rounded-md transition-colors text-blue-500"
            title="AI Explain Code (Ctrl+E)"
          >
            <Bot className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const selection = editorRef.current?.getSelection();
              const selectedText = editorRef.current?.getModel()?.getValueInRange(selection) || content;
              if (selectedText) {
                const chatTabId = addTab({
                  title: 'Code Discussion',
                  type: 'chat',
                  icon: 'message-square',
                  projectId: currentProject?.id,
                  content: {
                    initialMessage: `Please help me with this code:\n\n\`\`\`${currentLanguage}\n${selectedText}\n\`\`\``
                  }
                });
              }
            }}
            className="p-2 hover:bg-accent/50 rounded-md transition-colors text-green-500"
            title="Send to Chat (Ctrl+Shift+C)"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={handleRun}
            disabled={isExecuting}
            className="p-2 hover:bg-accent/50 rounded-md transition-colors disabled:opacity-50"
            title="Run Code"
          >
            {isExecuting ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={formatCode}
            className="p-2 hover:bg-accent/50 rounded-md transition-colors"
            title="Format Code"
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-accent/50 rounded-md transition-colors"
            title="Copy All"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="p-2 hover:bg-accent/50 rounded-md transition-colors disabled:opacity-50"
            title="Save (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-accent/50 rounded-md transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            className="p-2 hover:bg-accent/50 rounded-md transition-colors"
            title="Editor Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} transition-all`}>
          <Editor
            height="100%"
            language={currentLanguage}
            value={content}
            theme={monacoTheme}
            onMount={handleEditorDidMount}
            options={{
              readOnly: readOnly,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              detectIndentation: true,
              formatOnPaste: true,
              formatOnType: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              snippetSuggestions: 'top',
              quickSuggestions: true,
              folding: true,
              foldingHighlight: true,
              showFoldingControls: 'always',
              bracketPairColorization: { enabled: true },
              colorDecorators: true,
              contextmenu: true,
              copyWithSyntaxHighlighting: true
            }}
          />
        </div>

        {/* Preview Panel (for Markdown) */}
        {showPreview && currentLanguage === 'markdown' && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '50%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="w-1/2 border-l border-border bg-card/30 overflow-auto"
          >
            <div className="p-4">
              <div className="prose prose-invert max-w-none">
                <MarkdownRenderer content={content} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Execution Output */}
      {executionOutput && (
        <div className="px-4 py-2 bg-muted/30 border-b border-border">
          <div className="text-sm">
            <div className="font-medium mb-1 flex items-center gap-2">
              <TerminalIcon className="w-4 h-4" />
              Execution Output:
            </div>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
              {executionOutput}
            </pre>
          </div>
        </div>
      )}

      {/* Editor Footer */}
      <div className="flex-shrink-0 h-8 bg-card/20 border-t border-border flex items-center justify-between px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Language: {getLanguageDisplayName(currentLanguage)}</span>
          <span>Lines: {content.split('\n').length}</span>
          <span>Characters: {content.length}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Encoding: UTF-8</span>
          <span>CRLF</span>
          {isDirty && <span className="text-primary">●</span>}
        </div>
      </div>

      {/* AI Assistance Modal */}
      <AiAssistModal
        isOpen={aiModal.isOpen}
        onClose={handleAiModalClose}
        selectedText={aiModal.selectedText}
        action={aiModal.action}
        onResult={handleAiResult}
      />
    </div>
  );
} 