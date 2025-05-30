'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MessageSquare, 
  Code, 
  BookOpen, 
  Terminal, 
  File,
  Plus
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspace';

const getTabIcon = (type: string) => {
  switch (type) {
    case 'chat': return MessageSquare;
    case 'code': return Code;
    case 'notebook': return BookOpen;
    case 'terminal': return Terminal;
    case 'file': return File;
    default: return File;
  }
};

export function TabManager() {
  const { 
    tabs, 
    activeTabId, 
    setActiveTab, 
    removeTab, 
    addTab, 
    closeOtherTabs,
    currentProject 
  } = useWorkspaceStore();

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    removeTab(tabId);
  };

  const handleTabContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    // TODO: Implement context menu for tabs
    console.log('Tab context menu:', tabId);
  };

  const handleNewTab = () => {
    addTab({
      title: 'New Chat',
      type: 'chat',
      icon: 'message-square',
      projectId: currentProject?.id
    });
  };

  if (tabs.length === 0) {
    return (
      <div className="h-12 bg-card/30 border-b border-border flex items-center justify-center">
        <button
          onClick={handleNewTab}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Tab</span>
        </button>
      </div>
    );
  }

  return (
    <div className="h-12 bg-card/30 border-b border-border flex items-center overflow-hidden">
      <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {tabs.map((tab) => {
            const Icon = getTabIcon(tab.type);
            const isActive = tab.id === activeTabId;
            
            return (
              <motion.div
                key={tab.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={`
                  relative flex items-center gap-2 px-3 py-2 min-w-0 max-w-48 cursor-pointer group border-r border-border/50
                  ${isActive 
                    ? 'bg-background text-foreground' 
                    : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/30'
                  }
                  transition-colors
                `}
                onClick={() => handleTabClick(tab.id)}
                onContextMenu={(e) => handleTabContextMenu(e, tab.id)}
              >
                {/* Active Tab Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute top-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ duration: 0.2 }}
                  />
                )}

                {/* Tab Icon */}
                <Icon className="w-4 h-4 flex-shrink-0" />

                {/* Tab Title */}
                <span className="flex-1 truncate text-sm">
                  {tab.title}
                  {tab.isDirty && <span className="ml-1">•</span>}
                </span>

                {/* Close Button */}
                <button
                  onClick={(e) => handleTabClose(e, tab.id)}
                  className="opacity-0 group-hover:opacity-100 hover:bg-accent/50 rounded p-0.5 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Dirty Indicator (when not hovered) */}
                {tab.isDirty && (
                  <div className="w-2 h-2 bg-primary rounded-full group-hover:hidden" />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* New Tab Button */}
      <div className="flex-shrink-0 px-2">
        <button
          onClick={handleNewTab}
          className="p-1.5 hover:bg-accent/50 rounded-md transition-colors"
          title="New Tab"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 