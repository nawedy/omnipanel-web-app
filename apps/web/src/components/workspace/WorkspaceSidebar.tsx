'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Code, 
  BookOpen, 
  Terminal, 
  File,
  Folder,
  FolderOpen,
  Plus,
  MoreHorizontal,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspace';

interface SidebarSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  items?: any[];
  collapsed?: boolean;
}

export function WorkspaceSidebar() {
  const { 
    addTab, 
    currentProject, 
    layout,
    toggleFileTree,
    toggleTerminal,
    toggleNotebook
  } = useWorkspaceStore();

  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleNewChat = () => {
    addTab({
      title: 'New Chat',
      type: 'chat',
      icon: 'message-square',
      projectId: currentProject?.id
    });
  };

  const handleNewFile = () => {
    addTab({
      title: 'Untitled',
      type: 'code',
      icon: 'code',
      projectId: currentProject?.id
    });
  };

  const handleNewNotebook = () => {
    addTab({
      title: 'Untitled Notebook',
      type: 'notebook',
      icon: 'book-open',
      projectId: currentProject?.id
    });
  };

  const handleToggleTerminal = () => {
    toggleTerminal();
    if (!layout.showTerminal) {
      addTab({
        title: 'Terminal',
        type: 'terminal',
        icon: 'terminal',
        projectId: currentProject?.id
      });
    }
  };

  const quickActions = [
    {
      label: 'New Chat',
      icon: MessageSquare,
      action: handleNewChat,
      shortcut: '⌘N'
    },
    {
      label: 'New File',
      icon: Code,
      action: handleNewFile,
      shortcut: '⌘⇧N'
    },
    {
      label: 'New Notebook',
      icon: BookOpen,
      action: handleNewNotebook,
      shortcut: '⌘⇧B'
    },
    {
      label: 'Terminal',
      icon: Terminal,
      action: handleToggleTerminal,
      shortcut: '⌘⇧T',
      active: layout.showTerminal
    }
  ];

  const mockFiles = [
    { name: 'README.md', type: 'file', path: '/README.md' },
    { name: 'src', type: 'folder', expanded: true, children: [
      { name: 'components', type: 'folder', children: [
        { name: 'Button.tsx', type: 'file', path: '/src/components/Button.tsx' },
        { name: 'Modal.tsx', type: 'file', path: '/src/components/Modal.tsx' }
      ]},
      { name: 'utils', type: 'folder', children: [
        { name: 'helpers.ts', type: 'file', path: '/src/utils/helpers.ts' }
      ]},
      { name: 'App.tsx', type: 'file', path: '/src/App.tsx' },
      { name: 'index.ts', type: 'file', path: '/src/index.ts' }
    ]},
    { name: 'package.json', type: 'file', path: '/package.json' }
  ];

  const renderFileTree = (items: any[], level = 0) => {
    return items.map((item, index) => (
      <div key={`${item.name}-${level}-${index}`} style={{ paddingLeft: `${level * 12}px` }}>
        <div 
          className="flex items-center gap-2 px-2 py-1 hover:bg-accent/50 rounded cursor-pointer group"
          onClick={() => {
            if (item.type === 'file') {
              addTab({
                title: item.name,
                type: 'code',
                icon: 'file',
                filePath: item.path,
                projectId: currentProject?.id
              });
            }
          }}
        >
          {item.type === 'folder' ? (
            <>
              {item.expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              {item.expanded ? <FolderOpen className="w-4 h-4 text-blue-500" /> : <Folder className="w-4 h-4 text-blue-500" />}
            </>
          ) : (
            <>
              <div className="w-3 h-3" />
              <File className="w-4 h-4 text-muted-foreground" />
            </>
          )}
          <span className="text-sm truncate">{item.name}</span>
        </div>
        {item.type === 'folder' && item.expanded && item.children && (
          <div>
            {renderFileTree(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col bg-card/50">
      {/* Quick Actions */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent/50 transition-colors ${
                action.active ? 'bg-accent text-accent-foreground' : ''
              }`}
            >
              <action.icon className="w-4 h-4" />
              <span className="flex-1 text-left">{action.label}</span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground hidden sm:block">
                {action.shortcut}
              </kbd>
            </button>
          ))}
        </div>
      </div>

      {/* File Explorer */}
      <div className="flex-1 overflow-hidden">
        <div className="p-2">
          <div className="flex items-center justify-between px-2 py-1">
            <button
              onClick={() => toggleSection('files')}
              className="flex items-center gap-2 text-sm font-medium hover:bg-accent/50 rounded px-1 py-1"
            >
              {collapsedSections.includes('files') ? 
                <ChevronRight className="w-3 h-3" /> : 
                <ChevronDown className="w-3 h-3" />
              }
              <Folder className="w-4 h-4" />
              <span>Files</span>
            </button>
            <button className="p-1 hover:bg-accent/50 rounded">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          
          {!collapsedSections.includes('files') && (
            <div className="mt-1 max-h-96 overflow-y-auto">
              {currentProject ? (
                renderFileTree(mockFiles)
              ) : (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No project selected
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Chats */}
        <div className="p-2 border-t border-border">
          <div className="flex items-center justify-between px-2 py-1">
            <button
              onClick={() => toggleSection('chats')}
              className="flex items-center gap-2 text-sm font-medium hover:bg-accent/50 rounded px-1 py-1"
            >
              {collapsedSections.includes('chats') ? 
                <ChevronRight className="w-3 h-3" /> : 
                <ChevronDown className="w-3 h-3" />
              }
              <MessageSquare className="w-4 h-4" />
              <span>Recent Chats</span>
            </button>
            <button className="p-1 hover:bg-accent/50 rounded">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          
          {!collapsedSections.includes('chats') && (
            <div className="mt-1 space-y-1">
              {['AI Assistant', 'Code Review', 'Debug Session'].map((chat, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-2 py-1 hover:bg-accent/50 rounded cursor-pointer"
                  onClick={() => addTab({
                    title: chat,
                    type: 'chat',
                    icon: 'message-square',
                    projectId: currentProject?.id
                  })}
                >
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm truncate">{chat}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 