'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MessageSquare, 
  Code, 
  BookOpen, 
  Terminal, 
  File,
  Plus,
  Copy,
  XCircle,
  ArrowLeft,
  ArrowRight
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

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  tabId: string;
  onClose: () => void;
  onCloseTab: (tabId: string) => void;
  onCloseOthers: (tabId: string) => void;
  onCloseAll: () => void;
  onDuplicate: (tabId: string) => void;
  onMoveLeft: (tabId: string) => void;
  onMoveRight: (tabId: string) => void;
}

function TabContextMenu({ 
  isOpen, 
  position, 
  tabId, 
  onClose, 
  onCloseTab, 
  onCloseOthers, 
  onCloseAll, 
  onDuplicate,
  onMoveLeft,
  onMoveRight 
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="fixed z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[160px]"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: 'translateY(-100%)' 
      }}
    >
      <button
        onClick={() => { onCloseTab(tabId); onClose(); }}
        className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2"
      >
        <X className="w-4 h-4" />
        Close Tab
      </button>
      
      <button
        onClick={() => { onCloseOthers(tabId); onClose(); }}
        className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2"
      >
        <XCircle className="w-4 h-4" />
        Close Others
      </button>
      
      <button
        onClick={() => { onCloseAll(); onClose(); }}
        className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2"
      >
        <XCircle className="w-4 h-4" />
        Close All
      </button>
      
      <div className="border-t border-border my-1" />
      
      <button
        onClick={() => { onDuplicate(tabId); onClose(); }}
        className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2"
      >
        <Copy className="w-4 h-4" />
        Duplicate Tab
      </button>
      
      <div className="border-t border-border my-1" />
      
      <button
        onClick={() => { onMoveLeft(tabId); onClose(); }}
        className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Move Left
      </button>
      
      <button
        onClick={() => { onMoveRight(tabId); onClose(); }}
        className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2"
      >
        <ArrowRight className="w-4 h-4" />
        Move Right
      </button>
    </div>
  );
}

export function TabManager() {
  const { 
    tabs, 
    activeTabId, 
    setActiveTab, 
    removeTab, 
    addTab, 
    closeOtherTabs,
    moveTab,
    duplicateTab,
    closeAllTabs,
    currentProject 
  } = useWorkspaceStore();

  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    tabId: string;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    tabId: ''
  });

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    removeTab(tabId);
  };

  const handleTabContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      tabId
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  const handleCloseOthers = (tabId: string) => {
    closeOtherTabs(tabId);
  };

  const handleCloseAll = () => {
    closeAllTabs();
  };

  const handleDuplicate = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      duplicateTab(tabId);
    }
  };

  const handleMoveLeft = (tabId: string) => {
    const currentIndex = tabs.findIndex(t => t.id === tabId);
    if (currentIndex > 0) {
      moveTab(tabId, currentIndex - 1);
    }
  };

  const handleMoveRight = (tabId: string) => {
    const currentIndex = tabs.findIndex(t => t.id === tabId);
    if (currentIndex < tabs.length - 1) {
      moveTab(tabId, currentIndex + 1);
    }
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
      <div className="h-12 w-full bg-card/30 border-b border-border flex items-center justify-center">
        <button
          onClick={handleNewTab}
          className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Tab</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="h-12 w-full bg-card/30 border-b border-border flex items-center overflow-hidden px-1">
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
                    relative flex items-center gap-2 px-4 py-2 min-w-0 max-w-56 cursor-pointer group border-r border-border/50
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
        <div className="flex-shrink-0 px-3">
          <button
            onClick={handleNewTab}
            className="p-2 hover:bg-accent/50 rounded-md transition-colors"
            title="New Tab"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Menu */}
      <TabContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        tabId={contextMenu.tabId}
        onClose={handleCloseContextMenu}
        onCloseTab={removeTab}
        onCloseOthers={handleCloseOthers}
        onCloseAll={handleCloseAll}
        onDuplicate={handleDuplicate}
        onMoveLeft={handleMoveLeft}
        onMoveRight={handleMoveRight}
      />
    </>
  );
} 