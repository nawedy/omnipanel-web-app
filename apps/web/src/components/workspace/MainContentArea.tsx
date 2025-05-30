'use client';

import React from 'react';
import { useWorkspaceStore } from '@/stores/workspace';
import { WelcomeScreen } from './WelcomeScreen';
import { ChatInterface } from '../chat/ChatInterface';
import { CodeEditor } from '../editor/CodeEditor';
import { Terminal } from '../terminal/Terminal';
import { Notebook } from '../notebook/Notebook';

export function MainContentArea({ children }: { children: React.ReactNode }) {
  const { tabs, activeTabId } = useWorkspaceStore();

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // If no tabs are open, show welcome screen
  if (!activeTab) {
    return <WelcomeScreen />;
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
        return (
          <CodeEditor 
            filePath={activeTab.filePath || activeTab.title}
            initialContent={'// Welcome to OmniPanel Code Editor\n// This is a powerful Monaco-based editor with AI assistance\n\nfunction greetOmniPanel() {\n  console.log("Hello from OmniPanel!");\n  console.log("Ready to code with AI assistance!");\n}\n\n// Try these AI shortcuts:\n// Ctrl+E - Explain selected code\n// Ctrl+I - Improve selected code\n\ngreetOmniPanel();'}
            language="typescript"
            onSave={(content) => {
              console.log('Saving file:', activeTab.filePath, content);
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
            initialContent={`# File: ${activeTab.filePath || activeTab.title}\n\nThis file will be loaded from the file system.\nCurrently showing placeholder content.\n\n## File Operations\n- Read from disk\n- Auto-detect language\n- Syntax highlighting\n- Save changes\n- AI assistance`}
            language="markdown"
            onSave={(content) => {
              console.log('Saving file:', activeTab.filePath, content);
            }}
          />
        );
      
      default:
        return (
          <div className="h-full flex items-center justify-center">
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