// apps/web/src/providers/WorkspaceProvider.tsx
// React context provider for workspace state management
"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useWorkspaceStore } from '@/stores/workspace';
import { workspaceService } from '@/services/workspaceService';
import type { WorkspaceSession, WorkspaceTab } from '@/types/workspace';
import type { WorkspaceTab as ServiceWorkspaceTab } from '@/services/workspaceService';

interface WorkspaceContextType {
  // State
  currentSession: WorkspaceSession | null;
  sessions: WorkspaceSession[];
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createSession: (name: string, projectPath?: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  openFile: (filePath: string) => Promise<WorkspaceTab>;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  saveTabContent: (tabId: string, content: string) => Promise<void>;
  openProject: (projectPath: string) => Promise<void>;
  closeProject: () => Promise<void>;
  refreshProject: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps): React.JSX.Element {
  const store = useWorkspaceStore();
  const [currentSession, setCurrentSession] = useState<WorkspaceSession | null>(null);
  const [sessions, setSessions] = useState<WorkspaceSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize workspace service
  useEffect(() => {
    const initializeWorkspace = async () => {
      try {
        setIsLoading(true);
        await workspaceService.initialize();
        const loadedSessions = await workspaceService.loadSessions();
        setSessions(loadedSessions as unknown as WorkspaceSession[]);
        
        // Load the most recent session if available
        if (loadedSessions.length > 0) {
          const lastSession = loadedSessions[0];
          await workspaceService.loadSession(lastSession.id);
          
          // Convert service tabs to workspace tabs
          const convertedTabs: WorkspaceTab[] = lastSession.openTabs.map((tab: any) => ({
            id: tab.id,
            title: tab.title,
            filePath: tab.filePath,
            type: (tab.type || 'file') as 'file' | 'terminal' | 'notebook' | 'chat' | 'code',
            isActive: tab.isActive,
            isDirty: tab.isDirty,
            content: tab.content,
            scrollPosition: tab.scrollPosition || 0,
            cursorPosition: tab.cursorPosition || { line: 1, column: 1 }
          }));
          
          setCurrentSession({
            id: lastSession.id,
            name: lastSession.name,
            projectPath: lastSession.projectPath,
            openTabs: convertedTabs,
            activeTabId: lastSession.activeTabId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      } catch (err) {
        console.error('Failed to initialize workspace:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize workspace');
      } finally {
        setIsLoading(false);
      }
    };

    initializeWorkspace();
  }, []);

  // Convert store tabs to WorkspaceTab format
  const workspaceTabs: WorkspaceTab[] = store.tabs.map(tab => ({
    id: tab.id,
    title: tab.title,
    filePath: tab.filePath || '',
    type: (tab.type || 'file') as 'file' | 'terminal' | 'notebook' | 'chat' | 'code',
    isActive: tab.isActive || false,
    isDirty: tab.isDirty || false,
    content: tab.content,
    scrollPosition: 0,
    cursorPosition: { line: 1, column: 1 }
  }));

  const contextValue: WorkspaceContextType = {
    // State
    currentSession,
    sessions,
    tabs: workspaceTabs,
    activeTabId: store.activeTabId,
    isLoading,
    error,
    
    // Actions
    createSession: async (name: string, projectPath?: string) => {
      try {
        setIsLoading(true);
        const session = await workspaceService.createSession(name, projectPath);
        
        // Convert service tabs to workspace tabs
        const convertedTabs: WorkspaceTab[] = session.openTabs.map((tab: any) => ({
          id: tab.id,
          title: tab.title,
          filePath: tab.filePath,
          type: (tab.type || 'file') as 'file' | 'terminal' | 'notebook' | 'chat' | 'code',
          isActive: tab.isActive,
          isDirty: tab.isDirty,
          content: tab.content,
          scrollPosition: tab.scrollPosition || 0,
          cursorPosition: tab.cursorPosition || { line: 1, column: 1 }
        }));
        
        const sessionWithDates: WorkspaceSession = {
          id: session.id,
          name: session.name,
          projectPath: session.projectPath,
          openTabs: convertedTabs,
          activeTabId: session.activeTabId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setCurrentSession(sessionWithDates);
        setSessions((prev: WorkspaceSession[]) => [...prev, sessionWithDates]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create session';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },

    loadSession: async (sessionId: string) => {
      try {
        setIsLoading(true);
        await workspaceService.loadSession(sessionId);
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
          setCurrentSession(session);
        }
        
        // Load session tabs
        const sessionTabs = await workspaceService.getSessionTabs(sessionId);
        // Convert to store tabs and add them
        sessionTabs.forEach((wsTab: any) => {
          store.addTab({
            title: wsTab.title,
            type: (wsTab.type || 'file') as any,
            content: wsTab.content,
            filePath: wsTab.filePath
          });
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load session';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },

    deleteSession: async (sessionId: string) => {
      try {
        await workspaceService.deleteSession(sessionId);
                 setSessions((prev: WorkspaceSession[]) => prev.filter((s: WorkspaceSession) => s.id !== sessionId));
        
        // If deleted session was current, clear it
        if (currentSession?.id === sessionId) {
          setCurrentSession(null);
          store.closeAllTabs();
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete session';
        setError(message);
        throw err;
      }
    },

    openFile: async (filePath: string) => {
      try {
        const tab = await workspaceService.openFile(filePath);
        const tabId = store.addTab({
          title: tab.title,
          type: 'file',
          content: tab.content,
          filePath: tab.filePath
        });
        store.setActiveTab(tabId);
        
        // Return the workspace tab format
        return {
          id: tabId,
          title: tab.title,
          filePath: tab.filePath,
          type: 'file' as const,
          isActive: true,
          isDirty: false,
          content: tab.content,
          scrollPosition: 0,
          cursorPosition: { line: 1, column: 1 }
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to open file';
        setError(message);
        throw err;
      }
    },

    closeTab: (tabId: string) => {
      workspaceService.closeTab(tabId);
      store.removeTab(tabId);
    },

    setActiveTab: (tabId: string) => {
      store.setActiveTab(tabId);
    },

    saveTabContent: async (tabId: string, content: string) => {
      try {
        await workspaceService.saveTabContent(tabId, content);
        store.updateTab(tabId, { content, isDirty: false });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save tab content';
        setError(message);
        throw err;
      }
    },

    openProject: async (projectPath: string) => {
      try {
        setIsLoading(true);
        await workspaceService.openProject(projectPath);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to open project';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },

    closeProject: async () => {
      try {
        await workspaceService.closeProject();
        setCurrentSession(null);
        store.closeAllTabs();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to close project';
        setError(message);
        throw err;
      }
    },

    refreshProject: async () => {
      try {
        await workspaceService.refreshProject();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to refresh project';
        setError(message);
        throw err;
      }
    }
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
} 