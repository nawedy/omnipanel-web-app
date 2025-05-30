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
  EyeOff
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

export function CodeEditor({ 
  filePath, 
  initialContent = '', 
  language = 'typescript',
  readOnly = false,
  onSave,
  onContentChange 
}: CodeEditorProps) {
  const { currentProject, updateTab, activeTabId } = useWorkspaceStore();
  const [content, setContent] = useState(initialContent);
  const [isDirty, setIsDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState('vs-dark');
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
          console.log('AI Explain:', selectedText);
          // TODO: Integrate with chat interface
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
          console.log('AI Improve:', selectedText);
          // TODO: Integrate with LLM adapters
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

  const handleRun = () => {
    console.log('Running code:', content);
    // TODO: Integrate with terminal for code execution
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
            onClick={handleRun}
            className="p-2 hover:bg-accent/50 rounded-md transition-colors"
            title="Run Code"
          >
            <Play className="w-4 h-4" />
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
            theme={theme}
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
                {/* TODO: Add markdown renderer */}
                <div className="text-center text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <p>Markdown preview will be implemented here</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex-shrink-0 h-8 bg-card/20 border-t border-border flex items-center justify-between px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Line {editorRef.current?.getPosition()?.lineNumber || 1}</span>
          <span>Column {editorRef.current?.getPosition()?.column || 1}</span>
          <span>{content.length} characters</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Font Size: {fontSize}px</span>
          <span>{theme === 'vs-dark' ? 'Dark' : 'Light'} Theme</span>
          <span>Auto-save: On</span>
        </div>
      </div>
    </div>
  );
} 