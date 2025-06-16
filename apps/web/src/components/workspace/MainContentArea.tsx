'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspace';
import { WelcomeScreen } from './WelcomeScreen';
import { ChatInterface } from '../chat/ChatInterface';
import { CodeEditor } from '../editor/CodeEditor';
import { Terminal } from '../terminal/Terminal';
import Notebook from '../notebook/Notebook';
import { fileService, type FileContent } from '@/services/fileService';
import { contextService } from '@/services/contextService';
import { useCurrentProject } from '@/stores/projectStore';
import { useMonitoring } from '@/components/providers/MonitoringProvider';
import { Loader2, AlertCircle, FileText, Code, BookOpen, Terminal as TerminalIcon, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export function MainContentArea({ children }: { children: React.ReactNode }) {
  const { tabs, activeTabId, updateTab } = useWorkspaceStore();
  const currentProject = useCurrentProject();
  const { captureMessage } = useMonitoring();
  
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
        const fileExtension = activeTab.title.split('.').pop()?.toLowerCase();
        const language = getLanguageFromExtension(fileExtension);
        
        setFileContent({
          content: getDefaultContent(language, activeTab.title),
          language,
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
        
        // Update context service with file access
        if (currentProject) {
          contextService.addFile({
            path: filePath,
            name: filePath.split('/').pop() || filePath,
            type: 'file',
            content: content.content,
            language: content.language,
            lastModified: content.lastModified,
            size: content.size
          });
        }
      } catch (err) {
        console.log('File not found, creating new file:', filePath);
        // Instead of showing error, create a new empty file
        const fileExtension = filePath.split('.').pop()?.toLowerCase();
        const language = getLanguageFromExtension(fileExtension);
        
        setFileContent({
          content: getDefaultContent(language, activeTab.title),
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
  }, [activeTab?.id, activeTab?.filePath, activeTab?.title, activeTab?.type, currentProject]);

  // Helper function to get language from file extension
  const getLanguageFromExtension = (extension?: string): string => {
    switch (extension) {
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'py': return 'python';
      case 'md': return 'markdown';
      case 'json': return 'json';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'scss': return 'scss';
      case 'yaml': case 'yml': return 'yaml';
      case 'xml': return 'xml';
      case 'sql': return 'sql';
      case 'sh': return 'shell';
      case 'rs': return 'rust';
      case 'go': return 'go';
      case 'java': return 'java';
      case 'cpp': case 'cc': case 'cxx': return 'cpp';
      case 'c': return 'c';
      case 'php': return 'php';
      case 'rb': return 'ruby';
      default: return 'typescript';
    }
  };

  // Helper function to get default content for new files
  const getDefaultContent = (language: string, fileName: string): string => {
    const projectName = currentProject?.name || 'OmniPanel';
    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (language) {
      case 'javascript':
        return `// ${fileName}
// Created in ${projectName} on ${timestamp}

console.log('Hello from ${fileName}!');

// Welcome to OmniPanel JavaScript Editor
// Try these AI shortcuts:
// Ctrl+E - Explain selected code
// Ctrl+I - Improve selected code
// Ctrl+Shift+C - Send to AI chat

function main() {
  console.log('Ready to code with AI assistance!');
}

main();`;

      case 'typescript':
        return `// ${fileName}
// Created in ${projectName} on ${timestamp}

interface GreetingOptions {
  name: string;
  enthusiastic?: boolean;
}

function greetOmniPanel(options: GreetingOptions): void {
  const message = \`Hello \${options.name} from ${fileName}!\`;
  console.log(options.enthusiastic ? message.toUpperCase() + '!' : message);
}

// Welcome to OmniPanel TypeScript Editor
// Try these AI shortcuts:
// Ctrl+E - Explain selected code
// Ctrl+I - Improve selected code
// Ctrl+Shift+C - Send to AI chat

greetOmniPanel({ name: 'Developer', enthusiastic: true });`;

      case 'python':
        return `# ${fileName}
# Created in ${projectName} on ${timestamp}

def main():
    """Main function for ${fileName}"""
    print(f"Hello from {fileName}!")
    print("Ready to code with AI assistance!")

# Welcome to OmniPanel Python Editor
# Try these AI shortcuts:
# Ctrl+E - Explain selected code
# Ctrl+I - Improve selected code
# Ctrl+Shift+C - Send to AI chat

if __name__ == "__main__":
    main()`;

      case 'markdown':
        return `# ${fileName}

*Created in ${projectName} on ${timestamp}*

Welcome to **OmniPanel Markdown Editor**!

## Features

- Real-time preview
- Syntax highlighting
- AI assistance
- Project integration

### Getting Started

1. Start typing your markdown content
2. Use the preview toggle to see rendered output
3. Try AI shortcuts for help

> **Tip**: Use Ctrl+E to explain selected text or Ctrl+I to improve it!

\`\`\`javascript
// You can even include code blocks
console.log('Hello from ${fileName}!');
\`\`\`

---

Happy writing! 🚀`;

      case 'json':
        return `{
  "name": "${fileName}",
  "description": "JSON file created in ${projectName}",
  "version": "1.0.0",
  "created": "${timestamp}",
  "project": "${projectName}",
  "metadata": {
    "editor": "OmniPanel",
    "features": [
      "AI assistance",
      "Real-time validation",
      "Syntax highlighting"
    ]
  }
}`;

      case 'html':
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName}</title>
    <!-- Created in ${projectName} on ${timestamp} -->
</head>
<body>
    <h1>Welcome to OmniPanel HTML Editor</h1>
    <p>Start building your web page here!</p>
    
    <!-- Try these AI shortcuts:
         Ctrl+E - Explain selected code
         Ctrl+I - Improve selected code
         Ctrl+Shift+C - Send to AI chat -->
    
    <script>
        console.log('Hello from ${fileName}!');
    </script>
</body>
</html>`;

      case 'css':
        return `/* ${fileName} */
/* Created in ${projectName} on ${timestamp} */

/* Welcome to OmniPanel CSS Editor */
/* Try these AI shortcuts:
   Ctrl+E - Explain selected code
   Ctrl+I - Improve selected code
   Ctrl+Shift+C - Send to AI chat */

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
  margin-bottom: 20px;
}`;

      default:
        return `// ${fileName}
// Created in ${projectName} on ${timestamp}

console.log('Hello from ${fileName}!');

// Welcome to OmniPanel Code Editor
// Try these AI shortcuts:
// Ctrl+E - Explain selected code
// Ctrl+I - Improve selected code
// Ctrl+Shift+C - Send to AI chat

// Start coding here...`;
    }
  };

  // Get tab icon based on type
  const getTabIcon = (type: string) => {
    switch (type) {
      case 'chat': return MessageSquare;
      case 'code': case 'file': return Code;
      case 'notebook': return BookOpen;
      case 'terminal': return TerminalIcon;
      default: return FileText;
    }
  };

  // If no tabs are open, show welcome screen
  if (!activeTab) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full"
      >
        <WelcomeScreen />
      </motion.div>
    );
  }

  // Show loading state for file/code tabs
  if ((activeTab.type === 'file' || activeTab.type === 'code') && isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <div className="text-center">
            <h3 className="font-medium mb-1">Loading {activeTab.title}</h3>
            <p className="text-sm">Preparing your file...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show error state for file/code tabs
  if ((activeTab.type === 'file' || activeTab.type === 'code') && error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full flex items-center justify-center"
      >
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading File</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Retry
            </Button>
            <Button
              onClick={() => {
                setError(null);
                setFileContent({
                  content: getDefaultContent('typescript', activeTab.title),
                  language: 'typescript',
                  lastModified: new Date(),
                  size: 0
                });
              }}
            >
              Create New File
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Render content based on tab type
  const renderTabContent = () => {
    const IconComponent = getTabIcon(activeTab.type);
    
    switch (activeTab.type) {
      case 'chat':
        return (
          <motion.div
            key={activeTab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full h-full"
          >
            <ChatInterface 
              sessionId={activeTab.id}
              projectId={currentProject?.id}
            />
          </motion.div>
        );
      
      case 'code':
      case 'file':
        return (
          <motion.div
            key={activeTab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full h-full"
          >
            <CodeEditor 
              filePath={activeTab.filePath || activeTab.title}
              initialContent={fileContent?.content || ''}
              language={fileContent?.language || 'typescript'}
              onSave={async (content) => {
                const filePath = activeTab.filePath || activeTab.title;
                try {
                  await fileService.writeFile(filePath, content);
                  
                  // Update tab to show saved state
                  updateTab(activeTab.id, { 
                    title: activeTab.title.replace(' •', ''),
                    filePath 
                  });
                  
                  // Update context service
                  if (currentProject) {
                    contextService.addFile({
                      path: filePath,
                      name: filePath.split('/').pop() || filePath,
                      type: 'file',
                      content,
                      language: fileContent?.language || 'typescript',
                      lastModified: new Date(),
                      size: content.length
                    });
                  }
                  
                  captureMessage('File saved successfully', 'info', {
                    filePath,
                    projectId: currentProject?.id,
                    size: content.length
                  });
                } catch (err) {
                  const errorMessage = err instanceof Error ? err.message : 'Failed to save file';
                  captureMessage('Failed to save file', 'error', {
                    error: errorMessage,
                    filePath,
                    projectId: currentProject?.id
                  });
                  console.error('Failed to save file:', err);
                }
              }}
              onContentChange={(content) => {
                // Mark tab as modified if content changed
                if (content !== fileContent?.content && !activeTab.title.includes(' •')) {
                  updateTab(activeTab.id, { 
                    title: activeTab.title + ' •' 
                  });
                }
              }}
            />
          </motion.div>
        );
      
      case 'notebook':
        return (
          <motion.div
            key={activeTab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full h-full"
          >
            <Notebook 
              filePath={activeTab.filePath || activeTab.title}
              onSave={(content) => {
                captureMessage('Notebook saved', 'info', {
                  filePath: activeTab.filePath,
                  projectId: currentProject?.id
                });
                console.log('Saving notebook:', activeTab.filePath, content);
              }}
            />
          </motion.div>
        );
      
      case 'terminal':
        return (
          <motion.div
            key={activeTab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full h-full"
          >
            <Terminal 
              sessionId={activeTab.id}
              projectId={currentProject?.id}
              initialPath={currentProject?.path || '~/'}
            />
          </motion.div>
        );
      
      default:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex items-center justify-center"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <IconComponent className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Unknown Tab Type</h3>
                <p className="text-muted-foreground">
                  This tab type ({activeTab.type}) is not supported yet.
                </p>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      {renderTabContent()}
    </AnimatePresence>
  );
} 