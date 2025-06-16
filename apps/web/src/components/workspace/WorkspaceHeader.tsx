'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  Menu, 
  Bell, 
  Sun, 
  Moon, 
  User as UserIcon, 
  LogOut, 
  Settings as SettingsIcon,
  ChevronDown,
  PanelLeft,
  Laptop,
  Folder,
  Search,
  HelpCircle,
  Command,
  Settings,
  User,
  Palette
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceStore } from '@/stores/workspace';
import { useTheme } from '@/components/ThemeProvider';
import { SyncStatusIndicator, type SyncStatus } from '../sync/SyncStatusIndicator';
import { NotificationsPanel } from '@/components/modals/NotificationsPanel';
import { UserProfileModal } from '@/components/modals/UserProfileModal';

interface WorkspaceNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  date: Date;
}

export function WorkspaceHeader() {
  const { theme, setTheme } = useTheme();
  const { toggleSidebar, currentProject, selectedModel, modelProvider, layout, toggleFileTree } = useWorkspaceStore();
  const pathname = usePathname();
  const router = useRouter();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [notifications, setNotifications] = useState<WorkspaceNotification[]>([
    {
      id: '1',
      title: 'New feature available',
      message: 'Check out the new AI model selection in settings!',
      read: false,
      date: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      id: '2',
      title: 'Workspace updated',
      message: 'Your workspace settings have been updated successfully.',
      read: true,
      date: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    }
  ]);

  // Initialize sync status after hydration
  useEffect(() => {
    setSyncStatus({
      isOnline: navigator.onLine,
      isConnected: true,
      isSyncing: false,
      lastSync: new Date(),
      pendingOperations: 0,
      error: undefined,
    });

    // Listen to online/offline events
    const handleOnline = () => {
      setSyncStatus(prev => prev ? { ...prev, isOnline: true, isConnected: true, error: undefined } : null);
    };

    const handleOffline = () => {
      setSyncStatus(prev => prev ? { ...prev, isOnline: false, isConnected: false } : null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowUserMenu(false);
        setShowNotificationsPanel(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleThemeToggle = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  const handleSettingsClick = () => {
    router.push('/settings');
    setShowUserMenu(false);
  };

  const handleNotificationsClick = () => {
    setShowNotificationsPanel(!showNotificationsPanel);
  };

  const handleHelpClick = () => {
    window.open('/docs', '_blank');
  };

  const handleUserProfileClick = () => {
    setShowUserMenu(false);
    setShowUserProfileModal(true);
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    if (confirm('Are you sure you want to sign out?')) {
      // Implement logout functionality
      window.location.href = '/auth/signin';
    }
  };

  const handleNewChat = () => {
    setShowCommandPalette(false);
    // Add new chat tab logic
    const { addTab } = useWorkspaceStore.getState();
    addTab({
      title: 'New Chat',
      type: 'chat',
      projectId: currentProject?.id
    });
  };

  const handleNewCodeFile = () => {
    setShowCommandPalette(false);
    // Add new code file logic
    const fileName = prompt('Enter file name:');
    if (fileName) {
      const { addTab } = useWorkspaceStore.getState();
      addTab({
        title: fileName,
        type: 'code',
        filePath: `/${fileName}`,
        projectId: currentProject?.id
      });
    }
  };

  const handleNewNotebook = () => {
    setShowCommandPalette(false);
    // Add new notebook logic
    const { addTab } = useWorkspaceStore.getState();
    addTab({
      title: 'New Notebook',
      type: 'notebook',
      projectId: currentProject?.id
    });
  };

  const getThemeIcon = () => {
    return theme === 'light' ? Sun : Moon;
  };

  const ThemeIcon = getThemeIcon();

  return (
    <>
      <header className="h-14 w-full bg-background/80 backdrop-blur-lg border-b border-border flex items-center px-6 justify-between flex-shrink-0">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-shrink-0">
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
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <Image 
                src="/logo.png" 
                alt="OmniPanel Logo" 
                width={32}
                height={32}
                className="object-contain rounded-lg"
                priority
              />
            </div>
            <span className="font-semibold text-base hidden sm:block">OmniPanel</span>
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
        <div className="flex-1 max-w-2xl px-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files, chats, or press Cmd+K"
              className="w-full pl-10 pr-16 py-2 bg-accent/30 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              onFocus={() => setShowCommandPalette(true)}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground">K</kbd>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 flex-shrink-0">
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
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">
                {modelProvider}/{selectedModel}
              </span>
            </div>
          )}

          {/* Notifications */}
          <button
            onClick={handleNotificationsClick}
            className="p-2 hover:bg-accent rounded-md transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.some(n => !n.read) && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* Help */}
          <button
            onClick={handleHelpClick}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            title="Help & Documentation"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Command Palette */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            title="Command Palette (Cmd+K)"
          >
            <Command className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            <ThemeIcon className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={handleSettingsClick}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-1 hover:bg-accent rounded-full transition-colors"
              title="User Menu"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">U</span>
              </div>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-md shadow-lg z-50">
                <div className="flex items-center gap-2 p-3 border-b border-border">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">U</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Demo User</span>
                    <span className="text-xs text-muted-foreground">demo@omnipanel.app</span>
                  </div>
                </div>
                
                <div className="p-1">
                  <button
                    onClick={handleUserProfileClick}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-accent rounded-sm"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={handleSettingsClick}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-accent rounded-sm"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={handleThemeToggle}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-accent rounded-sm"
                  >
                    <Palette className="w-4 h-4" />
                    Themes
                  </button>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-accent rounded-sm text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notifications Panel */}
      <NotificationsPanel 
        isOpen={showNotificationsPanel} 
        onClose={() => setShowNotificationsPanel(false)} 
      />

      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={showUserProfileModal} 
        onClose={() => setShowUserProfileModal(false)} 
      />

      {/* Command Palette Modal */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 z-50">
          <div className="w-full max-w-lg bg-popover border border-border rounded-lg shadow-xl">
            <div className="p-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Type a command or search..."
                  className="w-full pl-10 pr-4 py-3 bg-transparent border border-border rounded-md text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
              </div>
              <div className="mt-4 space-y-1">
                <div className="text-xs font-medium text-muted-foreground px-2 py-1">SUGGESTIONS</div>
                <button 
                  onClick={handleNewChat}
                  className="w-full text-left px-3 py-2 rounded hover:bg-accent text-sm"
                >
                  New Chat
                </button>
                <button 
                  onClick={handleNewCodeFile}
                  className="w-full text-left px-3 py-2 rounded hover:bg-accent text-sm"
                >
                  New Code File
                </button>
                <button 
                  onClick={handleNewNotebook}
                  className="w-full text-left px-3 py-2 rounded hover:bg-accent text-sm"
                >
                  New Notebook
                </button>
                <button 
                  onClick={() => {
                    setShowCommandPalette(false);
                    router.push('/settings');
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-accent text-sm"
                >
                  Open Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 