// apps/web/src/services/workspaceService.ts
// Complete workspace state management service

"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fileSystemService } from './fileSystemService';
import { projectService } from './projectService';
import { contextService } from './contextService';
import { FileContext } from './contextService';

// Workspace configuration interfaces
interface WorkspaceLayout {
  sidebarWidth: number;
  fileTreeWidth: number;
  panelSizes: {
    left: number;
    center: number;
    right: number;
  };
  activePanel: 'files' | 'search' | 'git' | 'debug' | 'extensions';
  showMinimap: boolean;
  showLineNumbers: boolean;
  wordWrap: boolean;
}

interface WorkspaceSession {
  id: string;
  name: string;
  projectPath?: string;
  openTabs: WorkspaceTab[];
  activeTabId?: string;
  layout: WorkspaceLayout;
  lastAccessed: Date;
  bookmarks: WorkspaceBookmark[];
  breakpoints: WorkspaceBreakpoint[];
}

interface WorkspaceTab {
  id: string;
  title: string;
  filePath: string;
  isDirty: boolean;
  content?: string;
  cursorPosition: { line: number; column: number };
  scrollPosition: number;
  language: string;
  isActive: boolean;
  isPinned: boolean;
}

interface WorkspaceBookmark {
  id: string;
  filePath: string;
  line: number;
  column: number;
  label: string;
  description?: string;
  createdAt: Date;
}

interface WorkspaceBreakpoint {
  id: string;
  filePath: string;
  line: number;
  condition?: string;
  enabled: boolean;
  hitCount: number;
  createdAt: Date;
}

interface WorkspaceSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  insertSpaces: boolean;
  autoSave: 'off' | 'afterDelay' | 'onFocusChange' | 'onWindowChange';
  autoSaveDelay: number;
  formatOnSave: boolean;
  formatOnPaste: boolean;
  trimTrailingWhitespace: boolean;
  insertFinalNewline: boolean;
  detectIndentation: boolean;
}

interface WorkspaceState {
  // Current session
  currentSession: WorkspaceSession | null;
  sessions: WorkspaceSession[];
  
  // Workspace settings
  settings: WorkspaceSettings;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Store management methods
  setSessions: (sessions: WorkspaceSession[]) => void;
  setCurrentSession: (session: WorkspaceSession | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  addSession: (session: WorkspaceSession) => void;
  removeSession: (sessionId: string) => void;
  setTabs: (tabs: WorkspaceTab[]) => void;
  updateTabContent: (tabId: string, content: string) => void;
  setActiveTab: (tabId: string | null) => void;
  
  // Recent workspaces
  recentWorkspaces: Array<{
    path: string;
    name: string;
    lastOpened: Date;
    projectType?: string;
  }>;
  
  // Actions
  createSession: (name: string, projectPath?: string) => Promise<WorkspaceSession>;
  loadSession: (sessionId: string) => Promise<void>;
  saveSession: (session?: WorkspaceSession) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  
  // Tab management
  openTab: (filePath: string) => Promise<WorkspaceTab>;
  closeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;
  pinTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<WorkspaceTab>) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  
  // Layout management
  updateLayout: (layout: Partial<WorkspaceLayout>) => void;
  resetLayout: () => void;
  
  // Bookmarks
  addBookmark: (filePath: string, line: number, column: number, label: string) => void;
  removeBookmark: (bookmarkId: string) => void;
  updateBookmark: (bookmarkId: string, updates: Partial<WorkspaceBookmark>) => void;
  
  // Breakpoints
  addBreakpoint: (filePath: string, line: number, condition?: string) => void;
  removeBreakpoint: (breakpointId: string) => void;
  toggleBreakpoint: (breakpointId: string) => void;
  
  // Settings
  updateSettings: (settings: Partial<WorkspaceSettings>) => void;
  resetSettings: () => void;
  
  // Project integration
  openProject: (projectPath: string) => Promise<void>;
  closeProject: () => Promise<void>;
  refreshProject: () => Promise<void>;
  
  // Search and navigation
  searchInWorkspace: (query: string, options?: SearchOptions) => Promise<SearchResult[]>;
  goToDefinition: (filePath: string, line: number, column: number) => Promise<void>;
  findReferences: (filePath: string, line: number, column: number) => Promise<Reference[]>;
}

interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  regex?: boolean;
  includePatterns?: string[];
  excludePatterns?: string[];
  maxResults?: number;
}

interface SearchResult {
  filePath: string;
  line: number;
  column: number;
  text: string;
  preview: string;
  matches: Array<{ start: number; end: number }>;
}

interface Reference {
  filePath: string;
  line: number;
  column: number;
  text: string;
  isDefinition: boolean;
}

// Default workspace settings
const defaultSettings: WorkspaceSettings = {
  theme: 'dark',
  fontSize: 14,
  fontFamily: 'JetBrains Mono, Monaco, Consolas, "Ubuntu Mono", monospace',
  tabSize: 2,
  insertSpaces: true,
  autoSave: 'afterDelay',
  autoSaveDelay: 1000,
  formatOnSave: true,
  formatOnPaste: true,
  trimTrailingWhitespace: true,
  insertFinalNewline: true,
  detectIndentation: true,
};

// Default workspace layout
const defaultLayout: WorkspaceLayout = {
  sidebarWidth: 320,
  fileTreeWidth: 280,
  panelSizes: {
    left: 25,
    center: 50,
    right: 25,
  },
  activePanel: 'files',
  showMinimap: true,
  showLineNumbers: true,
  wordWrap: false,
};

// Workspace service implementation
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      sessions: [],
      settings: defaultSettings,
      isLoading: false,
      error: null,
      recentWorkspaces: [],

      // Create new workspace session
      createSession: async (name: string, projectPath?: string) => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newSession: WorkspaceSession = {
          id: sessionId,
          name,
          projectPath,
          openTabs: [],
          layout: { ...defaultLayout },
          lastAccessed: new Date(),
          bookmarks: [],
          breakpoints: [],
        };
        
        try {
          // If project path provided, load project files
          if (projectPath) {
            await projectService.openProject({ path: projectPath });
            
            // Update recent workspaces
            const { recentWorkspaces } = get();
            const updatedRecent = [
              { path: projectPath, name, lastOpened: new Date() },
              ...recentWorkspaces.filter(w => w.path !== projectPath).slice(0, 9)
            ];
            
            set({ recentWorkspaces: updatedRecent });
          }
          
          set(state => ({
            currentSession: newSession,
            sessions: [...state.sessions, newSession],
            error: null,
          }));
          
          // Initialize context service with workspace
          contextService.updateWorkspaceContext({
            sessionId,
            projectPath,
            activeFiles: [],
            openTabs: [],
          });
          
          return newSession;
        } catch (error) {
          set({ error: `Failed to create workspace session: ${error}` });
          throw error;
        }
      },

      // Load existing workspace session
      loadSession: async (sessionId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const { sessions } = get();
          const session = sessions.find(s => s.id === sessionId);
          
          if (!session) {
            throw new Error(`Session ${sessionId} not found`);
          }
          
          // Load project if available
          if (session.projectPath) {
            await projectService.openProject({ path: session.projectPath });
          }
          
          // Update last accessed time
          const updatedSession = {
            ...session,
            lastAccessed: new Date(),
          };
          
          set(state => ({
            currentSession: updatedSession,
            sessions: state.sessions.map(s => 
              s.id === sessionId ? updatedSession : s
            ),
            isLoading: false,
          }));
          
          // Update context service
          contextService.updateWorkspaceContext({
            sessionId,
            projectPath: session.projectPath,
            activeFiles: session.openTabs.map((tab: WorkspaceTab) => ({
              path: tab.filePath,
              content: tab.content || '',
              language: tab.language,
              isActive: tab.isActive,
            })),
            openTabs: session.openTabs.map(tab => ({
              path: tab.filePath,
              name: tab.title,
              type: 'file' as const,
              language: tab.language,
              content: tab.content
            })),
          });
          
        } catch (error) {
          set({ error: `Failed to load session: ${error}`, isLoading: false });
          throw error;
        }
      },

      // Save current workspace session
      saveSession: async (session?: WorkspaceSession) => {
        const { currentSession, sessions } = get();
        const sessionToSave = session || currentSession;
        
        if (!sessionToSave) return;
        
        try {
          const updatedSession = {
            ...sessionToSave,
            lastAccessed: new Date(),
          };
          
          set(state => ({
            currentSession: state.currentSession?.id === sessionToSave.id 
              ? updatedSession 
              : state.currentSession,
            sessions: state.sessions.map(s => 
              s.id === sessionToSave.id ? updatedSession : s
            ),
          }));
          
        } catch (error) {
          set({ error: `Failed to save session: ${error}` });
          throw error;
        }
      },

      // Delete workspace session
      deleteSession: async (sessionId: string) => {
        try {
          const { currentSession, sessions } = get();
          
          set(state => ({
            currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
            sessions: state.sessions.filter(s => s.id !== sessionId),
          }));
          
          // If deleted session was current, close project
          if (currentSession?.id === sessionId && currentSession.projectPath) {
            projectService.closeProject({ path: currentSession.projectPath });
          }
          
        } catch (error) {
          set({ error: `Failed to delete session: ${error}` });
          throw error;
        }
      },

      // Tab management
      openTab: async (filePath: string) => {
        const { currentSession } = get();
        if (!currentSession) throw new Error('No active workspace session');
        
        try {
          // Check if tab already exists
          const existingTab = currentSession.openTabs.find(tab => tab.filePath === filePath);
          if (existingTab) {
            get().switchTab(existingTab.id);
            return existingTab;
          }
          
          // Read file content
          const fileContent = fileSystemService.readFile({ path: filePath });
          const fileInfo = fileSystemService.getFileInfo({ path: filePath });
          
          const tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const newTab: WorkspaceTab = {
            id: tabId,
            title: filePath.split('/').pop() || 'Untitled',
            filePath,
            isDirty: false,
            content: fileContent ?? '',
            cursorPosition: { line: 1, column: 1 },
            scrollPosition: 0,
            language: (fileInfo as any)?.language ?? 'plaintext',
            isActive: true,
            isPinned: false,
          };
          // Deactivate other tabs
          const updatedTabs = currentSession.openTabs.map(tab => ({
            ...tab,
            isActive: false,
          }));
          
          const updatedSession = {
            ...currentSession,
            openTabs: [...updatedTabs, newTab],
            activeTabId: tabId,
          };
          
          set({ currentSession: updatedSession });
          await get().saveSession(updatedSession);
          
          // Update context service
          contextService.addFileContext({
            filePath,
            fileContent,
            language: (fileInfo as any)?.language || 'plaintext',
          });
          
          return newTab;
        } catch (error) {
          set({ error: `Failed to open tab: ${error}` });
          throw error;
        }
      },

      closeTab: (tabId: string) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const updatedTabs = currentSession.openTabs.filter(tab => tab.id !== tabId);
        const closedTab = currentSession.openTabs.find(tab => tab.id === tabId);
        
        // If closing active tab, switch to next available tab
        let newActiveTabId = currentSession.activeTabId;
        if (closedTab?.isActive && updatedTabs.length > 0) {
          const closedTabIndex = currentSession.openTabs.indexOf(closedTab);
          const nextTab = updatedTabs[Math.min(closedTabIndex, updatedTabs.length - 1)];
          newActiveTabId = nextTab.id;
          updatedTabs.forEach(tab => {
            tab.isActive = tab.id === newActiveTabId;
          });
        }
        
        const updatedSession = {
          ...currentSession,
          openTabs: updatedTabs,
          activeTabId: newActiveTabId,
        };
        
        set({ currentSession: updatedSession });
        get().saveSession(updatedSession);
        
        // Update context service
        if (closedTab) {
          contextService.removeFileContext({ path: closedTab.filePath });
        }
      },

      switchTab: (tabId: string) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const updatedTabs = currentSession.openTabs.map(tab => ({
          ...tab,
          isActive: tab.id === tabId,
        }));
        
        const updatedSession = {
          ...currentSession,
          openTabs: updatedTabs,
          activeTabId: tabId,
        };
        
        set({ currentSession: updatedSession });
        get().saveSession(updatedSession);
        
        // Update context service with active file
        const activeTab = updatedTabs.find(tab => tab.id === tabId);
        if (activeTab) {
          contextService.setActiveFile(activeTab.filePath);
        }
      },

      pinTab: (tabId: string) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const updatedTabs = currentSession.openTabs.map(tab =>
          tab.id === tabId ? { ...tab, isPinned: !tab.isPinned } : tab
        );
        
        const updatedSession = {
          ...currentSession,
          openTabs: updatedTabs,
        };
        
        set({ currentSession: updatedSession });
        get().saveSession(updatedSession);
      },

      updateTab: (tabId: string, updates: Partial<WorkspaceTab>) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const updatedTabs = currentSession.openTabs.map(tab =>
          tab.id === tabId ? { ...tab, ...updates } : tab
        );
        
        const updatedSession = {
          ...currentSession,
          openTabs: updatedTabs,
        };
        
        set({ currentSession: updatedSession });
        get().saveSession(updatedSession);
        
        // Update context service if content changed
        if (updates.content !== undefined) {
          const tab = updatedTabs.find(t => t.id === tabId);
          if (tab) {
            contextService.updateFileContext(tab.filePath, updates.content);
          }
        }
      },

      reorderTabs: (fromIndex: number, toIndex: number) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const tabs = [...currentSession.openTabs];
        const [movedTab] = tabs.splice(fromIndex, 1);
        tabs.splice(toIndex, 0, movedTab);
        
        const updatedSession = {
          ...currentSession,
          openTabs: tabs,
        };
        
        set({ currentSession: updatedSession });
        get().saveSession(updatedSession);
      },

      // Layout management
      updateLayout: (layout: Partial<WorkspaceLayout>) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const updatedSession = {
          ...currentSession,
          layout: { ...currentSession.layout, ...layout },
        };
        
        set({ currentSession: updatedSession });
        get().saveSession(updatedSession);
      },

      resetLayout: () => {
        get().updateLayout(defaultLayout);
      },

      // Bookmarks
      addBookmark: (filePath: string, line: number, column: number, label: string) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const bookmarkId = `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newBookmark: WorkspaceBookmark = {
          id: bookmarkId,
          filePath,
          line,
          column,
          label,
          createdAt: new Date(),
        };
        
        const updatedSession = {
          ...currentSession,
          bookmarks: [...currentSession.bookmarks, newBookmark],
        };
        
        set({ currentSession: updatedSession });
        get().saveSession(updatedSession);
      },

      removeBookmark: (bookmarkId: string) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const updatedSession = {
          ...currentSession,
          bookmarks: currentSession.bookmarks.filter(b => b.id !== bookmarkId),
        };
        
        set({ currentSession: updatedSession });
        get().saveSession(updatedSession);
      },

      updateBookmark: (bookmarkId: string, updates: Partial<WorkspaceBookmark>) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const updatedSession = {
          ...currentSession,
          bookmarks: currentSession.bookmarks.map(b =>
            b.id === bookmarkId ? { ...b, ...updates } : b
          ),
        };
        
        set({ currentSession: updatedSession });
        get().saveSession(updatedSession);
      },

      // Breakpoints
      addBreakpoint: (filePath: string, line: number, condition?: string) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const breakpointId = `breakpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newBreakpoint: WorkspaceBreakpoint = {
          id: breakpointId,
          filePath,
          line,
          condition,
          enabled: true,
          hitCount: 0,
          createdAt: new Date(),
        };
        
        const updatedSession = {
          ...currentSession,
          breakpoints: [...currentSession.breakpoints, newBreakpoint],
        };
        
        set({ currentSession: updatedSession });
        get().saveSession(updatedSession);
      },

      removeBreakpoint: (breakpointId: string) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const updatedSession = {
          ...currentSession,
          breakpoints: currentSession.breakpoints.filter(b => b.id !== breakpointId),
        };
        
        set({ currentSession: updatedSession });
        get().saveSession(updatedSession);
      },

      toggleBreakpoint: (breakpointId: string) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const updatedSession = {
          ...currentSession,
          breakpoints: currentSession.breakpoints.map(b =>
            b.id === breakpointId ? { ...b, enabled: !b.enabled } : b
          ),
        };
        
        set({ currentSession: updatedSession });
        get().saveSession(updatedSession);
      },

      // Settings
      updateSettings: (settings: Partial<WorkspaceSettings>) => {
        set(state => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      },

      // Store management methods
      setSessions: (sessions: WorkspaceSession[]) => {
        set({ sessions });
      },

      setCurrentSession: (session: WorkspaceSession | null) => {
        set({ currentSession: session });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      addSession: (session: WorkspaceSession) => {
        set(state => ({
          sessions: [...state.sessions, session]
        }));
      },

      removeSession: (sessionId: string) => {
        set(state => ({
          sessions: state.sessions.filter(s => s.id !== sessionId)
        }));
      },

      setTabs: (tabs: WorkspaceTab[]) => {
        set(state => ({
          currentSession: state.currentSession ? {
            ...state.currentSession,
            openTabs: tabs
          } : null
        }));
      },

      updateTabContent: (tabId: string, content: string) => {
        set(state => ({
          currentSession: state.currentSession ? {
            ...state.currentSession,
            openTabs: state.currentSession.openTabs.map(tab =>
              tab.id === tabId ? { ...tab, content, isDirty: true } : tab
            )
          } : null
        }));
      },

      setActiveTab: (tabId: string | null) => {
        set(state => ({
          currentSession: state.currentSession ? {
            ...state.currentSession,
            activeTabId: tabId || undefined,
            openTabs: state.currentSession.openTabs.map(tab => ({
              ...tab,
              isActive: tab.id === tabId
            }))
          } : null
        }));
      },

      // Project integration
      openProject: async (projectPath: string) => {
        try {
          set({ isLoading: true, error: null });
          
          await projectService.openProject({ path: projectPath });
          
          // Create or update session for this project
          const projectName = projectPath.split('/').pop() || 'Untitled Project';
          const session = await get().createSession(projectName, projectPath);
          
          set({ isLoading: false });
          
        } catch (error) {
          set({ error: `Failed to open project: ${error}`, isLoading: false });
          throw error;
        }
      },

      closeProject: async () => {
        try {
          const currentSession = get().currentSession;
          if (currentSession?.projectPath) {
            projectService.closeProject({ path: currentSession.projectPath });
          }
          contextService.clearContext();
          
          set({
            currentSession: null,
            error: null,
          });
          
        } catch (error) {
          set({ error: `Failed to close project: ${error}` });
          throw error;
        }
      },

      refreshProject: async () => {
        const { currentSession } = get();
        if (!currentSession?.projectPath) return;
        
        try {
          projectService.refreshProject();
          
          // Refresh file system
          fileSystemService.refreshDirectory(currentSession.projectPath);
          
        } catch (error) {
          set({ error: `Failed to refresh project: ${error}` });
          throw error;
        }
      },

      // Search and navigation
      searchInWorkspace: async (query: string, options: SearchOptions = {}) => {
        const { currentSession } = get();
        if (!currentSession?.projectPath) return [];
        
        try {
          return await fileSystemService.searchInDirectory(
            currentSession.projectPath,
            query,
            {
              caseSensitive: options.caseSensitive,
              wholeWord: options.wholeWord,
              regex: options.regex,
              include: options.includePatterns,
              exclude: options.excludePatterns,
              maxResults: options.maxResults || 100,
            }
          );
          
        } catch (error) {
          set({ error: `Search failed: ${error}` });
          return [];
        }
      },

      goToDefinition: async (filePath: string, line: number, column: number) => {
        // Implementation would integrate with language servers
        // For now, open the file at the specified location
        try {
          const tab = await get().openTab(filePath);
          get().updateTab(tab.id, {
            cursorPosition: { line, column },
          });
        } catch (error) {
          set({ error: `Failed to go to definition: ${error}` });
        }
      },

      findReferences: async (filePath: string, line: number, column: number) => {
        // Implementation would integrate with language servers
        // For now, return empty array
        return [];
      },
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        settings: state.settings,
        recentWorkspaces: state.recentWorkspaces,
      }),
    }
  )
);

// Export the workspace service for direct access
export const workspaceService = {
  // Get current workspace state
  getState: () => useWorkspaceStore.getState(),
  
  // Subscribe to workspace changes
  subscribe: (callback: (state: WorkspaceState) => void) => 
    useWorkspaceStore.subscribe(callback),
  
  // Helper methods
  getCurrentSession: () => useWorkspaceStore.getState().currentSession,
  getActiveTab: () => {
    const { currentSession } = useWorkspaceStore.getState();
    return currentSession?.openTabs.find(tab => tab.isActive) || null;
  },

  // Methods expected by WorkspaceProvider
  initialize: async () => {
    // Initialize the workspace service
    const store = useWorkspaceStore.getState();
    
    // Load any persisted sessions
    // This is already handled by Zustand persist middleware
    return Promise.resolve();
  },

  loadSessions: async () => {
    const { sessions } = useWorkspaceStore.getState();
    return sessions;
  },

  createSession: async (name: string, projectPath?: string) => {
    return useWorkspaceStore.getState().createSession(name, projectPath);
  },

  loadSession: async (sessionId: string) => {
    return useWorkspaceStore.getState().loadSession(sessionId);
  },

  deleteSession: async (sessionId: string) => {
    return useWorkspaceStore.getState().deleteSession(sessionId);
  },

  getSessionTabs: async (sessionId: string) => {
    const { sessions } = useWorkspaceStore.getState();
    const session = sessions.find(s => s.id === sessionId);
    return session?.openTabs || [];
  },

  openFile: async (filePath: string) => {
    return useWorkspaceStore.getState().openTab(filePath);
  },

  closeTab: (tabId: string) => {
    useWorkspaceStore.getState().closeTab(tabId);
  },

  saveTabContent: async (tabId: string, content: string) => {
    useWorkspaceStore.getState().updateTab(tabId, { content, isDirty: false });
    
    // Save to file system
    const { currentSession } = useWorkspaceStore.getState();
    const tab = currentSession?.openTabs.find(t => t.id === tabId);
    if (tab) {
      fileSystemService.writeFile(tab.filePath, content);
    }
  },

  openProject: async (projectPath: string) => {
    return useWorkspaceStore.getState().openProject(projectPath);
  },

  closeProject: async () => {
    return useWorkspaceStore.getState().closeProject();
  },

  refreshProject: async () => {
    return useWorkspaceStore.getState().refreshProject();
  },
  
  // Batch operations
  saveAllTabs: async () => {
    const { currentSession } = useWorkspaceStore.getState();
    if (!currentSession) return;
    
    const savePromises = currentSession.openTabs
      .filter(tab => tab.isDirty && tab.content)
      .map(tab => fileSystemService.writeFile(tab.filePath, tab.content!));
    
    await Promise.all(savePromises);
    
    // Update tabs to mark as saved
    currentSession.openTabs.forEach(tab => {
      if (tab.isDirty) {
        useWorkspaceStore.getState().updateTab(tab.id, { isDirty: false });
      }
    });
  },
  
  // Export/import workspace
  exportWorkspace: () => {
    const { sessions, settings } = useWorkspaceStore.getState();
    return {
      sessions,
      settings,
      exportedAt: new Date().toISOString(),
    };
  },
  
  importWorkspace: (data: any) => {
    if (data.sessions) {
      useWorkspaceStore.setState({ sessions: data.sessions });
    }
    if (data.settings) {
      useWorkspaceStore.setState({ settings: data.settings });
    }
  },
};

// Export types for external use
export type {
  WorkspaceSession,
  WorkspaceTab,
  WorkspaceLayout,
  WorkspaceSettings,
  WorkspaceBookmark,
  WorkspaceBreakpoint,
  SearchOptions,
  SearchResult,
  Reference,
}; 