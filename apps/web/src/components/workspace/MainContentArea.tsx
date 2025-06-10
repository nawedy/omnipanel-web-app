'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspace';
import { WelcomeScreen } from './WelcomeScreen';
import { ChatInterface } from '../chat/ChatInterface';
import { CodeEditor } from '../editor/CodeEditor';
import { Terminal } from '../terminal/Terminal';
import { Notebook } from '../notebook/Notebook';
import { fileService, type FileContent } from '@/services/fileService';
import { Loader2 } from 'lucide-react';

export function MainContentArea({ children }: { children: React.ReactNode }) {
  const { tabs, activeTabId } = useWorkspaceStore();
  const [fileContent, setFileContent] = useState<FileContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // Load file content when active tab changes
  useEffect(() => {
    const loadFileContent = async () => {
      if (!activeTab || (activeTab.type !== 'file' && activeTab.type !== 'code')) {
        setFileContent(null);
        setIsLoading(false);
        setError(null);
        return;
      }

      const filePath = activeTab.filePath || activeTab.title;
      if (!filePath) {
        // For new files without path, create empty content
        setFileContent({
          content: '',
          language: 'typescript',
          lastModified: new Date(),
          size: 0
        });
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const content = await fileService.readFile(filePath);
        setFileContent(content);
      } catch (err) {
        console.log('File not found, creating new file:', filePath);
        // Instead of showing error, create a new empty file
        const fileExtension = filePath.split('.').pop()?.toLowerCase();
        const language = fileExtension === 'js' ? 'javascript' : 
                        fileExtension === 'py' ? 'python' : 
                        fileExtension === 'md' ? 'markdown' : 
                        fileExtension === 'json' ? 'json' : 'typescript';
        
        setFileContent({
          content: '',
          language,
          lastModified: new Date(),
          size: 0
        });
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadFileContent();
  }, [activeTab?.id, activeTab?.filePath, activeTab?.title, activeTab?.type]);

  // If no tabs are open, show welcome screen
  if (!activeTab) {
    return <div className="w-full h-full"><WelcomeScreen /></div>;
  }

  // Show loading state for file/code tabs
  if ((activeTab.type === 'file' || activeTab.type === 'code') && isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading file...</span>
        </div>
      </div>
    );
  }

  // Show error state for file/code tabs
  if ((activeTab.type === 'file' || activeTab.type === 'code') && error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-red-600">Error Loading File</h3>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render content based on tab type
  const renderTabContent = () => {
    switch (activeTab.type) {
      case 'chat':
        return (
          <ChatInterface 
            sessionId={activeTab.id}
            projectId={activeTab.projectId}
          />
        );
      
      case 'code':
        const getDefaultContent = (language: string, fileName: string) => {
          switch (language) {
            case 'javascript':
              return `// ${fileName}\n// Welcome to OmniPanel JavaScript Editor\n\nconsole.log('Hello from OmniPanel!');\n\n// Try these AI shortcuts:\n// Ctrl+E - Explain selected code\n// Ctrl+I - Improve selected code\n// Ctrl+Shift+C - Send to AI chat\n\nfunction greetOmniPanel() {\n  console.log('Ready to code with AI assistance!');\n}\n\ngreetOmniPanel();`;
            case 'python':
              return `# ${fileName}\n# Welcome to OmniPanel Python Editor\n\nprint('Hello from OmniPanel!')\n\n# Try these AI shortcuts:\n# Ctrl+E - Explain selected code\n# Ctrl+I - Improve selected code\n# Ctrl+Shift+C - Send to AI chat\n\ndef greet_omnipanel():\n    print('Ready to code with AI assistance!')\n\nif __name__ == '__main__':\n    greet_omnipanel()`;
            case 'typescript':
              return `// ${fileName}\n// Welcome to OmniPanel TypeScript Editor\n\ninterface GreetingOptions {\n  name: string;\n  enthusiastic?: boolean;\n}\n\nfunction greetOmniPanel(options: GreetingOptions): void {\n  const message = \`Hello \${options.name} from OmniPanel!\`;\n  console.log(options.enthusiastic ? message.toUpperCase() + '!' : message);\n}\n\n// Try these AI shortcuts:\n// Ctrl+E - Explain selected code\n// Ctrl+I - Improve selected code\n// Ctrl+Shift+C - Send to AI chat\n\ngreetOmniPanel({ name: 'Developer', enthusiastic: true });`;
            case 'markdown':
              return `# ${fileName}\n\nWelcome to **OmniPanel Markdown Editor**!\n\n## Features\n\n- Real-time preview\n- Syntax highlighting\n- AI assistance\n\n### Getting Started\n\n1. Start typing your markdown content\n2. Use the preview toggle to see rendered output\n3. Try AI shortcuts for help\n\n> **Tip**: Use Ctrl+E to explain selected text or Ctrl+I to improve it!\n\n\`\`\`javascript\n// You can even include code blocks\nconsole.log('Hello from OmniPanel!');\n\`\`\`\n\n---\n\nHappy writing! 🚀`;
            default:
              return `// ${fileName}\n// Welcome to OmniPanel Code Editor\n\nconsole.log('Hello from OmniPanel!');\n\n// Try these AI shortcuts:\n// Ctrl+E - Explain selected code\n// Ctrl+I - Improve selected code\n// Ctrl+Shift+C - Send to AI chat`;
          }
        };

        return (
          <CodeEditor 
            filePath={activeTab.filePath || activeTab.title}
            initialContent={fileContent?.content || getDefaultContent(fileContent?.language || 'typescript', activeTab.title)}
            language={fileContent?.language || 'typescript'}
            onSave={async (content) => {
              const filePath = activeTab.filePath || activeTab.title;
              try {
                await fileService.writeFile(filePath, content);
                console.log('File saved successfully:', filePath);
              } catch (err) {
                console.error('Failed to save file:', err);
              }
            }}
            onContentChange={(content) => {
              console.log('Content changed:', content.length, 'characters');
            }}
          />
        );
      
      case 'notebook':
        return (
          <Notebook 
            filePath={activeTab.filePath || activeTab.title}
            onSave={(content) => {
              console.log('Saving notebook:', activeTab.filePath, content);
            }}
          />
        );
      
      case 'terminal':
        return (
          <Terminal 
            sessionId={activeTab.id}
            projectId={activeTab.projectId}
            initialPath={activeTab.projectId ? `~/projects/${activeTab.projectId}` : '~/'}
          />
        );
      
      case 'file':
        return (
          <CodeEditor 
            filePath={activeTab.filePath || activeTab.title}
            initialContent={fileContent?.content || `# File: ${activeTab.filePath || activeTab.title}\n\nThis file will be loaded from the file system.\nCurrently showing placeholder content.\n\n## File Operations\n- Read from disk\n- Auto-detect language\n- Syntax highlighting\n- Save changes\n- AI assistance`}
            language={fileContent?.language || 'markdown'}
            onSave={async (content) => {
              const filePath = activeTab.filePath || activeTab.title;
              try {
                await fileService.writeFile(filePath, content);
                console.log('File saved successfully:', filePath);
              } catch (err) {
                console.error('Failed to save file:', err);
              }
            }}
            onContentChange={(content) => {
              console.log('Content changed:', content.length, 'characters');
            }}
          />
        );
      
      default:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Unknown Tab Type</h3>
              <p className="text-muted-foreground">Tab type "{activeTab.type}" is not supported yet</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-background">
      {renderTabContent()}
      {children}
    </div>
  );
} 