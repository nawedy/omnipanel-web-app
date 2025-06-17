// apps/web/src/stores/contextStore.ts
// Shared context state management for workspace components

'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { contextService, WorkspaceContext, ContextFilter } from '@/services/contextService';

export interface ContextState {
  // Current context
  context: WorkspaceContext | null;
  isContextLoading: boolean;
  contextError: string | null;
  
  // Context settings
  contextEnabled: boolean;
  autoContextUpdate: boolean;
  contextFilter: ContextFilter;
  maxContextTokens: number;
  
  // Active context tracking
  activeFiles: string[];
  currentSelection: {
    file: string;
    text: string;
    language: string;
  } | null;
  terminalHistory: string[];
  notebookCells: string[];
  
  // Context sharing between components
  sharedContext: {
    chat: any;
    terminal: any;
    notebook: any;
    editor: any;
  };
  
  // Performance tracking
  lastContextUpdate: Date | null;
  contextUpdateCount: number;
  averageUpdateTime: number;
}

export interface ContextActions {
  // Context management
  updateContext: (context: WorkspaceContext) => void;
  refreshContext: () => Promise<void>;
  clearContext: () => void;
  setContextLoading: (loading: boolean) => void;
  setContextError: (error: string | null) => void;
  
  // Context settings
  setContextEnabled: (enabled: boolean) => void;
  setAutoContextUpdate: (enabled: boolean) => void;
  setContextFilter: (filter: ContextFilter) => void;
  setMaxContextTokens: (tokens: number) => void;
  
  // Active context tracking
  addActiveFile: (filePath: string) => void;
  removeActiveFile: (filePath: string) => void;
  setCurrentSelection: (file: string, text: string, language: string) => void;
  clearCurrentSelection: () => void;
  addTerminalCommand: (command: string) => void;
  addNotebookCell: (cellId: string) => void;
  
  // Context sharing
  updateSharedContext: (component: keyof ContextState['sharedContext'], data: any) => void;
  getSharedContext: (component: keyof ContextState['sharedContext']) => any;
  
  // Performance tracking
  recordContextUpdate: (updateTime: number) => void;
  getContextStats: () => {
    updateCount: number;
    averageTime: number;
    lastUpdate: Date | null;
  };
}

export type ContextStore = ContextState & ContextActions;

const initialState: ContextState = {
  context: null,
  isContextLoading: false,
  contextError: null,
  contextEnabled: true,
  autoContextUpdate: true,
  contextFilter: {
    includeFiles: true,
    includeTerminal: true,
    includeNotebook: true,
    includeSelection: true,
    maxFileSize: 50000,
    maxHistoryItems: 50
  },
  maxContextTokens: 4000,
  activeFiles: [],
  currentSelection: null,
  terminalHistory: [],
  notebookCells: [],
  sharedContext: {
    chat: null,
    terminal: null,
    notebook: null,
    editor: null
  },
  lastContextUpdate: null,
  contextUpdateCount: 0,
  averageUpdateTime: 0
};

export const useContextStore = create<ContextStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Context management
        updateContext: (context: WorkspaceContext) => {
          const startTime = Date.now();
          
          set((state) => {
            const updateTime = Date.now() - startTime;
            const newUpdateCount = state.contextUpdateCount + 1;
            const newAverageTime = (state.averageUpdateTime * state.contextUpdateCount + updateTime) / newUpdateCount;
            
            return {
              context,
              lastContextUpdate: new Date(),
              contextUpdateCount: newUpdateCount,
              averageUpdateTime: newAverageTime,
              contextError: null
            };
          });
        },

        refreshContext: async () => {
          const state = get();
          if (!state.contextEnabled) return;

          set({ isContextLoading: true, contextError: null });
          
          try {
            const startTime = Date.now();
            const context = contextService.getContext(state.contextFilter);
            const updateTime = Date.now() - startTime;
            
            set((prevState) => {
              const newUpdateCount = prevState.contextUpdateCount + 1;
              const newAverageTime = (prevState.averageUpdateTime * prevState.contextUpdateCount + updateTime) / newUpdateCount;
              
              return {
                context,
                isContextLoading: false,
                lastContextUpdate: new Date(),
                contextUpdateCount: newUpdateCount,
                averageUpdateTime: newAverageTime,
                contextError: null
              };
            });
          } catch (error) {
            set({
              isContextLoading: false,
              contextError: error instanceof Error ? error.message : 'Failed to refresh context'
            });
          }
        },

        clearContext: () => {
          contextService.clearContext();
          set({
            context: null,
            activeFiles: [],
            currentSelection: null,
            terminalHistory: [],
            notebookCells: [],
            sharedContext: {
              chat: null,
              terminal: null,
              notebook: null,
              editor: null
            },
            contextError: null
          });
        },

        setContextLoading: (loading: boolean) => {
          set({ isContextLoading: loading });
        },

        setContextError: (error: string | null) => {
          set({ contextError: error });
        },

        // Context settings
        setContextEnabled: (enabled: boolean) => {
          set({ contextEnabled: enabled });
          if (!enabled) {
            set({ context: null });
          }
        },

        setAutoContextUpdate: (enabled: boolean) => {
          set({ autoContextUpdate: enabled });
        },

        setContextFilter: (filter: ContextFilter) => {
          set({ contextFilter: filter });
          // Refresh context with new filter
          get().refreshContext();
        },

        setMaxContextTokens: (tokens: number) => {
          set({ maxContextTokens: Math.max(1000, Math.min(8000, tokens)) });
        },

        // Active context tracking
        addActiveFile: (filePath: string) => {
          set((state) => ({
            activeFiles: [...new Set([...state.activeFiles, filePath])]
          }));
        },

        removeActiveFile: (filePath: string) => {
          set((state) => ({
            activeFiles: state.activeFiles.filter(f => f !== filePath)
          }));
        },

        setCurrentSelection: (file: string, text: string, language: string) => {
          set({
            currentSelection: { file, text, language }
          });
        },

        clearCurrentSelection: () => {
          set({ currentSelection: null });
        },

        addTerminalCommand: (command: string) => {
          set((state) => ({
            terminalHistory: [...state.terminalHistory.slice(-49), command]
          }));
        },

        addNotebookCell: (cellId: string) => {
          set((state) => ({
            notebookCells: [...new Set([...state.notebookCells, cellId])]
          }));
        },

        // Context sharing
        updateSharedContext: (component, data) => {
          set((state) => ({
            sharedContext: {
              ...state.sharedContext,
              [component]: data
            }
          }));
        },

        getSharedContext: (component) => {
          return get().sharedContext[component];
        },

        // Performance tracking
        recordContextUpdate: (updateTime: number) => {
          set((state) => {
            const newUpdateCount = state.contextUpdateCount + 1;
            const newAverageTime = (state.averageUpdateTime * state.contextUpdateCount + updateTime) / newUpdateCount;
            
            return {
              contextUpdateCount: newUpdateCount,
              averageUpdateTime: newAverageTime,
              lastContextUpdate: new Date()
            };
          });
        },

        getContextStats: () => {
          const state = get();
          return {
            updateCount: state.contextUpdateCount,
            averageTime: state.averageUpdateTime,
            lastUpdate: state.lastContextUpdate
          };
        }
      }),
      {
        name: 'omnipanel-context-store',
        partialize: (state) => ({
          contextEnabled: state.contextEnabled,
          autoContextUpdate: state.autoContextUpdate,
          contextFilter: state.contextFilter,
          maxContextTokens: state.maxContextTokens
        })
      }
    ),
    {
      name: 'context-store'
    }
  )
);

export default useContextStore; 