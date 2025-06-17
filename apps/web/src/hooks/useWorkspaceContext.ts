// apps/web/src/hooks/useWorkspaceContext.ts
// Hook for workspace context awareness and management

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { contextService, WorkspaceContext, ContextFilter, ContextSummary } from '@/services/contextService';
import { useWorkspaceStore } from '@/stores/workspace';

export interface UseWorkspaceContextOptions {
  autoUpdate?: boolean;
  filter?: ContextFilter;
  debounceMs?: number;
}

export interface WorkspaceContextHook {
  context: WorkspaceContext;
  summary: ContextSummary | null;
  isLoading: boolean;
  error: string | null;
  
  // Context management
  updateFileContent: (path: string, content: string, selection?: any) => void;
  addTerminalCommand: (command: string, output?: string, exitCode?: number) => void;
  addNotebookCell: (cellId: string, cellType: 'code' | 'markdown' | 'raw', content: string, output?: any) => void;
  setCurrentSelection: (file: string, text: string, language: string) => void;
  clearSelection: () => void;
  
  // Context queries
  getRelevantContext: (query: string, maxTokens?: number) => string;
  refreshContext: () => void;
  clearContext: () => void;
  
  // Subscriptions
  subscribe: (callback: (context: WorkspaceContext) => void) => () => void;
}

export function useWorkspaceContext(options: UseWorkspaceContextOptions = {}): WorkspaceContextHook {
  const {
    autoUpdate = true,
    filter,
    debounceMs = 300
  } = options;

  const { currentProject } = useWorkspaceStore();
  const [context, setContext] = useState<WorkspaceContext>(() => contextService.getContext(filter));
  const [summary, setSummary] = useState<ContextSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<Date>(new Date());

  // Debounced context update
  const debouncedUpdate = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      try {
        const newContext = contextService.getContext(filter);
        setContext(newContext);
        lastUpdateRef.current = new Date();
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update context');
      }
    }, debounceMs);
  }, [filter, debounceMs]);

  // Subscribe to context changes
  useEffect(() => {
    if (!autoUpdate) return;

    const unsubscribe = contextService.subscribe((newContext) => {
      debouncedUpdate();
    });

    return () => {
      unsubscribe();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [autoUpdate, debouncedUpdate]);

  // Update project context when current project changes
  useEffect(() => {
    if (currentProject) {
      contextService.updateProject({
        id: currentProject.id,
        name: currentProject.name,
        rootPath: `/projects/${currentProject.name}`,
        type: 'web', // Default type, could be enhanced
        framework: 'next.js', // Could be detected
        language: 'typescript',
        packageManager: 'pnpm'
      });
    }
  }, [currentProject]);

  // Generate summary when context changes
  useEffect(() => {
    const generateSummary = async () => {
      try {
        setIsLoading(true);
        const newSummary = contextService.generateContextSummary(filter);
        setSummary(newSummary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate summary');
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce summary generation
    const summaryTimeout = setTimeout(generateSummary, 500);
    return () => clearTimeout(summaryTimeout);
  }, [context, filter]);

  // Context management functions
  const updateFileContent = useCallback((path: string, content: string, selection?: any) => {
    try {
      contextService.updateFileContent(path, content, selection);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update file content');
    }
  }, []);

  const addTerminalCommand = useCallback((command: string, output?: string, exitCode?: number) => {
    try {
      contextService.addTerminalCommand({
        command,
        output,
        exitCode,
        timestamp: new Date(),
        workingDirectory: currentProject?.name ? `/projects/${currentProject.name}` : '/workspace'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add terminal command');
    }
  }, [currentProject]);

  const addNotebookCell = useCallback((cellId: string, cellType: 'code' | 'markdown' | 'raw', content: string, output?: any) => {
    try {
      contextService.addNotebookCell({
        cellId,
        cellType,
        content,
        output,
        timestamp: new Date(),
        executionCount: cellType === 'code' ? Date.now() : undefined
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add notebook cell');
    }
  }, []);

  const setCurrentSelection = useCallback((file: string, text: string, language: string) => {
    try {
      const fileContext = context.activeFiles.find(f => f.path === file);
      if (fileContext) {
        contextService.updateFileContent(file, fileContext.content || '', {
          start: 0,
          end: text.length,
          text
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set selection');
    }
  }, [context.activeFiles]);

  const clearSelection = useCallback(() => {
    try {
      contextService.clearSelection();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear selection');
    }
  }, []);

  const getRelevantContext = useCallback((query: string, maxTokens: number = 2000) => {
    try {
      return contextService.getRelevantContext(query, maxTokens);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get relevant context');
      return '';
    }
  }, []);

  const refreshContext = useCallback(() => {
    try {
      setIsLoading(true);
      const newContext = contextService.getContext(filter);
      setContext(newContext);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh context');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  const clearContext = useCallback(() => {
    try {
      contextService.clearContext();
      setContext(contextService.getContext(filter));
      setSummary(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear context');
    }
  }, [filter]);

  const subscribe = useCallback((callback: (context: WorkspaceContext) => void) => {
    return contextService.subscribe(callback);
  }, []);

  return {
    context,
    summary,
    isLoading,
    error,
    updateFileContent,
    addTerminalCommand,
    addNotebookCell,
    setCurrentSelection,
    clearSelection,
    getRelevantContext,
    refreshContext,
    clearContext,
    subscribe
  };
}

export default useWorkspaceContext; 