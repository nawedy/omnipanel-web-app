import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Tab {
  id: string;
  title: string;
  type: 'chat' | 'code' | 'notebook' | 'terminal' | 'file';
  icon?: string;
  content?: any;
  isActive?: boolean;
  isDirty?: boolean;
  projectId?: string;
  filePath?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  visibility: 'private' | 'public' | 'team';
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceState {
  // UI State
  sidebarOpen: boolean;
  sidebarWidth: number;
  theme: 'light' | 'dark' | 'system';
  
  // Projects
  currentProject: Project | null;
  projects: Project[];
  
  // Tabs
  tabs: Tab[];
  activeTabId: string | null;
  
  // LLM State
  selectedModel: string | null;
  modelProvider: string | null;
  
  // Layout
  layout: {
    showFileTree: boolean;
    showTerminal: boolean;
    showNotebook: boolean;
    terminalHeight: number;
    fileTreeWidth: number;
  };
}

export interface WorkspaceActions {
  // UI Actions
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Project Actions
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  
  // Tab Actions
  addTab: (tab: Omit<Tab, 'id'>) => string;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  reorderTabs: (startIndex: number, endIndex: number) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (id: string) => void;
  moveTab: (id: string, newIndex: number) => void;
  duplicateTab: (id: string) => void;
  
  // LLM Actions
  setSelectedModel: (model: string, provider: string) => void;
  
  // Layout Actions
  toggleFileTree: () => void;
  toggleTerminal: () => void;
  toggleNotebook: () => void;
  setTerminalHeight: (height: number) => void;
  setFileTreeWidth: (width: number) => void;
}

export type WorkspaceStore = WorkspaceState & WorkspaceActions;

export const useWorkspaceStore = create<WorkspaceStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      sidebarOpen: true,
      sidebarWidth: 240,
      theme: 'dark',
      currentProject: null,
      projects: [],
      tabs: [],
      activeTabId: null,
      selectedModel: 'gpt-4o',
      modelProvider: 'openai',
      layout: {
        showFileTree: true,
        showTerminal: false,
        showNotebook: false,
        terminalHeight: 200,
        fileTreeWidth: 200,
      },

      // UI Actions
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarWidth: (width) =>
        set({ sidebarWidth: Math.max(200, Math.min(400, width)) }),
      
      setTheme: (theme) =>
        set({ theme }),

      // Project Actions
      setCurrentProject: (project) =>
        set({ currentProject: project }),
      
      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),
      
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
          currentProject:
            state.currentProject?.id === id
              ? { ...state.currentProject, ...updates }
              : state.currentProject,
        })),
      
      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject:
            state.currentProject?.id === id ? null : state.currentProject,
        })),

      // Tab Actions
      addTab: (tabData) => {
        const id = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newTab: Tab = { ...tabData, id };
        
        set((state) => ({
          tabs: [...state.tabs, newTab],
          activeTabId: id,
        }));
        
        return id;
      },
      
      removeTab: (id) =>
        set((state) => {
          const newTabs = state.tabs.filter((t) => t.id !== id);
          let newActiveTabId = state.activeTabId;
          
          if (state.activeTabId === id) {
            if (newTabs.length > 0) {
              const currentIndex = state.tabs.findIndex((t) => t.id === id);
              const nextIndex = Math.min(currentIndex, newTabs.length - 1);
              newActiveTabId = newTabs[nextIndex]?.id || null;
            } else {
              newActiveTabId = null;
            }
          }
          
          return {
            tabs: newTabs,
            activeTabId: newActiveTabId,
          };
        }),
      
      setActiveTab: (id) =>
        set({ activeTabId: id }),
      
      updateTab: (id, updates) =>
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      
      reorderTabs: (startIndex, endIndex) =>
        set((state) => {
          const newTabs = [...state.tabs];
          const [removed] = newTabs.splice(startIndex, 1);
          newTabs.splice(endIndex, 0, removed);
          return { tabs: newTabs };
        }),
      
      closeAllTabs: () =>
        set({ tabs: [], activeTabId: null }),
      
      closeOtherTabs: (id) =>
        set((state) => ({
          tabs: state.tabs.filter((t) => t.id === id),
          activeTabId: id,
        })),

      moveTab: (id, newIndex) =>
        set((state) => {
          const currentIndex = state.tabs.findIndex((t) => t.id === id);
          if (currentIndex === -1 || newIndex < 0 || newIndex >= state.tabs.length) {
            return state;
          }
          
          const newTabs = [...state.tabs];
          const [movedTab] = newTabs.splice(currentIndex, 1);
          newTabs.splice(newIndex, 0, movedTab);
          
          return { tabs: newTabs };
        }),

      duplicateTab: (id) =>
        set((state) => {
          const tabToDuplicate = state.tabs.find((t) => t.id === id);
          if (!tabToDuplicate) return state;
          
          const newId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const duplicatedTab: Tab = {
            ...tabToDuplicate,
            id: newId,
            title: `${tabToDuplicate.title} (Copy)`,
            isDirty: false,
          };
          
          const currentIndex = state.tabs.findIndex((t) => t.id === id);
          const newTabs = [...state.tabs];
          newTabs.splice(currentIndex + 1, 0, duplicatedTab);
          
          return {
            tabs: newTabs,
            activeTabId: newId,
          };
        }),

      // LLM Actions
      setSelectedModel: (model, provider) =>
        set({ selectedModel: model, modelProvider: provider }),

      // Layout Actions
      toggleFileTree: () =>
        set((state) => ({
          layout: { ...state.layout, showFileTree: !state.layout.showFileTree },
        })),
      
      toggleTerminal: () =>
        set((state) => ({
          layout: { ...state.layout, showTerminal: !state.layout.showTerminal },
        })),
      
      toggleNotebook: () =>
        set((state) => ({
          layout: { ...state.layout, showNotebook: !state.layout.showNotebook },
        })),
      
      setTerminalHeight: (height) =>
        set((state) => ({
          layout: { ...state.layout, terminalHeight: Math.max(100, Math.min(500, height)) },
        })),

      setFileTreeWidth: (width) =>
        set((state) => ({
          layout: { ...state.layout, fileTreeWidth: Math.max(200, Math.min(600, width)) },
        })),
    }),
    {
      name: 'omnipanel-workspace',
    }
  )
); 