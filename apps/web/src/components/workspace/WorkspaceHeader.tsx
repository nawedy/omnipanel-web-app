'use client';

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Settings, 
  User, 
  Folder,
  Command,
  Moon,
  Sun,
  Monitor,
  FileText
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspace';
import { SyncStatusIndicator, type SyncStatus } from '../sync/SyncStatusIndicator';

export function WorkspaceHeader() {
  const { 
    toggleSidebar, 
    currentProject, 
    theme, 
    setTheme,
    selectedModel,
    modelProvider,
    layout,
    toggleFileTree
  } = useWorkspaceStore();

  // Initialize sync status as null to avoid hydration mismatch
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  // Initialize sync status only on the client side
  useEffect(() => {
    // Set initial sync status after hydration
    setSyncStatus({
      isOnline: true,
      isConnected: true,
      isSyncing: false,
      lastSync: new Date(),
      pendingOperations: 0,
    });

    // Simulate sync status changes
    const interval = setInterval(() => {
      setSyncStatus(prev => prev ? {
        ...prev,
        lastSync: new Date(),
        isSyncing: Math.random() > 0.8,
        pendingOperations: Math.floor(Math.random() * 3),
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      } : null);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleThemeToggle = () => {
    const themes = ['light', 'dark', 'system'] as const;
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      case 'system': return Monitor;
      default: return Moon;
    }
  };

  const ThemeIcon = getThemeIcon();

  return (
    <header className="h-14 bg-background/80 backdrop-blur-lg border-b border-border flex items-center px-4 gap-4 flex-shrink-0">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Menu Toggle */}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* File Tree Toggle */}
        <button
          onClick={toggleFileTree}
          className={`p-2 hover:bg-accent rounded-md transition-colors ${
            layout.showFileTree ? 'bg-accent/50' : ''
          }`}
          title="Toggle File Tree"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="font-semibold text-sm hidden sm:block">OmniPanel</span>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/50 rounded-md min-w-0">
          <Folder className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm truncate">
            {currentProject?.name || 'No Project'}
          </span>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search files, chats, or press Cmd+K"
            className="w-full pl-10 pr-16 py-2 bg-accent/30 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground">K</kbd>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Sync Status Indicator - only render after hydration */}
        {syncStatus && (
          <SyncStatusIndicator 
            status={syncStatus}
            onRetrySync={() => {
              setSyncStatus(prev => prev ? { ...prev, isSyncing: true, error: undefined } : null);
              setTimeout(() => {
                setSyncStatus(prev => prev ? { ...prev, isSyncing: false, lastSync: new Date() } : null);
              }, 2000);
            }}
          />
        )}

        {/* Model Indicator */}
        {selectedModel && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent/50 rounded-md">
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">
              {modelProvider}/{selectedModel}
            </span>
          </div>
        )}

        {/* Command Palette */}
        <button
          className="p-2 hover:bg-accent rounded-md transition-colors"
          title="Command Palette (Cmd+K)"
        >
          <Command className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          title={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
        >
          <ThemeIcon className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          className="p-2 hover:bg-accent rounded-md transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Menu */}
        <button
          className="p-2 hover:bg-accent rounded-md transition-colors"
          title="User Menu"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
} 