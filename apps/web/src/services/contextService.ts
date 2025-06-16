// apps/web/src/services/contextService.ts
// Workspace context management service for AI-aware interactions

import { configService } from './configService';

// Context types for different workspace components
export interface FileContext {
  path: string;
  name: string;
  type: 'file' | 'directory';
  language?: string;
  size?: number;
  lastModified?: Date;
  content?: string;
  selection?: {
    start: number;
    end: number;
    text: string;
  };
}

export interface TerminalContext {
  command: string;
  output?: string;
  exitCode?: number;
  timestamp: Date;
  workingDirectory: string;
}

export interface NotebookContext {
  cellId: string;
  cellType: 'code' | 'markdown' | 'raw';
  content: string;
  output?: any;
  executionCount?: number;
  timestamp: Date;
}

export interface ProjectContext {
  id: string;
  name: string;
  rootPath: string;
  type: 'web' | 'mobile' | 'desktop' | 'library' | 'other';
  framework?: string;
  language?: string;
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';
  gitBranch?: string;
  gitStatus?: {
    modified: string[];
    added: string[];
    deleted: string[];
    untracked: string[];
  };
}

export interface WorkspaceContext {
  project?: ProjectContext;
  activeFiles: FileContext[];
  terminalHistory: TerminalContext[];
  notebookCells: NotebookContext[];
  currentSelection?: {
    file: string;
    text: string;
    language: string;
  };
  recentActions: ContextAction[];
  timestamp: Date;
}

export interface ContextAction {
  type: 'file_open' | 'file_edit' | 'terminal_command' | 'notebook_execute' | 'ai_query';
  data: any;
  timestamp: Date;
  component: 'editor' | 'terminal' | 'notebook' | 'chat' | 'file_explorer';
}

export interface ContextFilter {
  includeFiles?: boolean;
  includeTerminal?: boolean;
  includeNotebook?: boolean;
  includeSelection?: boolean;
  maxFileSize?: number;
  maxHistoryItems?: number;
  fileTypes?: string[];
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export interface ContextSummary {
  projectInfo: string;
  activeFiles: string;
  recentCommands: string;
  currentTask: string;
  relevantContext: string;
}

class ContextService {
  private context: WorkspaceContext;
  private listeners: Set<(context: WorkspaceContext) => void> = new Set();
  private maxHistorySize = 100;
  private maxFileContentSize = 50000; // 50KB
  private contextCache = new Map<string, any>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.context = {
      activeFiles: [],
      terminalHistory: [],
      notebookCells: [],
      recentActions: [],
      timestamp: new Date()
    };

    this.loadPersistedContext();
  }

  // Context Management
  public getContext(filter?: ContextFilter): WorkspaceContext {
    if (!filter) return { ...this.context };

    const filtered: WorkspaceContext = {
      project: this.context.project,
      activeFiles: filter.includeFiles ? this.filterFiles(this.context.activeFiles, filter) : [],
      terminalHistory: filter.includeTerminal ? this.filterTerminalHistory(this.context.terminalHistory, filter) : [],
      notebookCells: filter.includeNotebook ? this.filterNotebookCells(this.context.notebookCells, filter) : [],
      currentSelection: filter.includeSelection ? this.context.currentSelection : undefined,
      recentActions: this.filterActions(this.context.recentActions, filter),
      timestamp: this.context.timestamp
    };

    return filtered;
  }

  public updateProject(project: ProjectContext): void {
    this.context.project = project;
    this.addAction({
      type: 'file_open',
      data: { projectName: project.name, projectPath: project.rootPath },
      timestamp: new Date(),
      component: 'file_explorer'
    });
    this.notifyListeners();
    this.persistContext();
  }

  public addFile(file: FileContext): void {
    // Remove existing file with same path
    this.context.activeFiles = this.context.activeFiles.filter(f => f.path !== file.path);
    
    // Add new file to the beginning
    this.context.activeFiles.unshift(file);
    
    // Limit active files
    if (this.context.activeFiles.length > 20) {
      this.context.activeFiles = this.context.activeFiles.slice(0, 20);
    }

    this.addAction({
      type: 'file_open',
      data: { path: file.path, name: file.name },
      timestamp: new Date(),
      component: 'editor'
    });

    this.notifyListeners();
    this.persistContext();
  }

  public updateFileContent(path: string, content: string, selection?: FileContext['selection']): void {
    const fileIndex = this.context.activeFiles.findIndex(f => f.path === path);
    if (fileIndex !== -1) {
      this.context.activeFiles[fileIndex].content = content.length > this.maxFileContentSize 
        ? content.substring(0, this.maxFileContentSize) + '\n... [content truncated]'
        : content;
      this.context.activeFiles[fileIndex].selection = selection;
      this.context.activeFiles[fileIndex].lastModified = new Date();

      if (selection) {
        this.context.currentSelection = {
          file: path,
          text: selection.text,
          language: this.context.activeFiles[fileIndex].language || 'text'
        };
      }

      this.addAction({
        type: 'file_edit',
        data: { path, hasSelection: !!selection },
        timestamp: new Date(),
        component: 'editor'
      });

      this.notifyListeners();
    }
  }

  public removeFile(path: string): void {
    this.context.activeFiles = this.context.activeFiles.filter(f => f.path !== path);
    
    if (this.context.currentSelection?.file === path) {
      this.context.currentSelection = undefined;
    }

    this.notifyListeners();
    this.persistContext();
  }

  public addTerminalCommand(command: TerminalContext): void {
    this.context.terminalHistory.unshift(command);
    
    // Limit terminal history
    if (this.context.terminalHistory.length > this.maxHistorySize) {
      this.context.terminalHistory = this.context.terminalHistory.slice(0, this.maxHistorySize);
    }

    this.addAction({
      type: 'terminal_command',
      data: { command: command.command, exitCode: command.exitCode },
      timestamp: new Date(),
      component: 'terminal'
    });

    this.notifyListeners();
    this.persistContext();
  }

  public addNotebookCell(cell: NotebookContext): void {
    // Remove existing cell with same ID
    this.context.notebookCells = this.context.notebookCells.filter(c => c.cellId !== cell.cellId);
    
    // Add new cell to the beginning
    this.context.notebookCells.unshift(cell);
    
    // Limit notebook cells
    if (this.context.notebookCells.length > 50) {
      this.context.notebookCells = this.context.notebookCells.slice(0, 50);
    }

    this.addAction({
      type: 'notebook_execute',
      data: { cellId: cell.cellId, cellType: cell.cellType },
      timestamp: new Date(),
      component: 'notebook'
    });

    this.notifyListeners();
    this.persistContext();
  }

  public clearSelection(): void {
    this.context.currentSelection = undefined;
    this.notifyListeners();
  }

  // Context Analysis and Summarization
  public generateContextSummary(filter?: ContextFilter): ContextSummary {
    const cacheKey = `summary_${JSON.stringify(filter)}_${this.context.timestamp.getTime()}`;
    
    if (this.contextCache.has(cacheKey)) {
      const cached = this.contextCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    const context = this.getContext(filter);
    
    const summary: ContextSummary = {
      projectInfo: this.summarizeProject(context.project),
      activeFiles: this.summarizeFiles(context.activeFiles),
      recentCommands: this.summarizeTerminalHistory(context.terminalHistory),
      currentTask: this.inferCurrentTask(context),
      relevantContext: this.buildRelevantContext(context)
    };

    // Cache the summary
    this.contextCache.set(cacheKey, {
      data: summary,
      timestamp: Date.now()
    });

    return summary;
  }

  public getRelevantContext(query: string, maxTokens: number = 2000): string {
    const context = this.getContext();
    const relevantParts: string[] = [];
    let tokenCount = 0;

    // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
    const estimateTokens = (text: string) => Math.ceil(text.length / 4);

    // Add project context
    if (context.project) {
      const projectInfo = `Project: ${context.project.name} (${context.project.type})`;
      const tokens = estimateTokens(projectInfo);
      if (tokenCount + tokens < maxTokens) {
        relevantParts.push(projectInfo);
        tokenCount += tokens;
      }
    }

    // Add current selection if relevant
    if (context.currentSelection && this.isRelevantToQuery(context.currentSelection.text, query)) {
      const selectionInfo = `Selected code (${context.currentSelection.language}):\n${context.currentSelection.text}`;
      const tokens = estimateTokens(selectionInfo);
      if (tokenCount + tokens < maxTokens) {
        relevantParts.push(selectionInfo);
        tokenCount += tokens;
      }
    }

    // Add relevant files
    const relevantFiles = context.activeFiles
      .filter(file => this.isRelevantToQuery(file.name + (file.content || ''), query))
      .slice(0, 5);

    for (const file of relevantFiles) {
      const fileInfo = `File: ${file.name}\n${file.content?.substring(0, 500) || '[No content]'}`;
      const tokens = estimateTokens(fileInfo);
      if (tokenCount + tokens < maxTokens) {
        relevantParts.push(fileInfo);
        tokenCount += tokens;
      } else {
        break;
      }
    }

    // Add recent terminal commands
    const recentCommands = context.terminalHistory.slice(0, 5);
    for (const cmd of recentCommands) {
      const cmdInfo = `Command: ${cmd.command}${cmd.output ? `\nOutput: ${cmd.output.substring(0, 200)}` : ''}`;
      const tokens = estimateTokens(cmdInfo);
      if (tokenCount + tokens < maxTokens) {
        relevantParts.push(cmdInfo);
        tokenCount += tokens;
      } else {
        break;
      }
    }

    return relevantParts.join('\n\n');
  }

  // Event Listeners
  public subscribe(listener: (context: WorkspaceContext) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Private Methods
  private addAction(action: ContextAction): void {
    this.context.recentActions.unshift(action);
    
    if (this.context.recentActions.length > this.maxHistorySize) {
      this.context.recentActions = this.context.recentActions.slice(0, this.maxHistorySize);
    }

    this.context.timestamp = new Date();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.context });
      } catch (error) {
        console.error('Error in context listener:', error);
      }
    });
  }

  private filterFiles(files: FileContext[], filter: ContextFilter): FileContext[] {
    let filtered = [...files];

    if (filter.fileTypes) {
      filtered = filtered.filter(file => 
        filter.fileTypes!.some(type => file.name.endsWith(type))
      );
    }

    if (filter.maxFileSize) {
      filtered = filtered.filter(file => 
        !file.size || file.size <= filter.maxFileSize!
      );
    }

    if (filter.timeRange) {
      filtered = filtered.filter(file => 
        file.lastModified && 
        file.lastModified >= filter.timeRange!.start &&
        file.lastModified <= filter.timeRange!.end
      );
    }

    return filtered;
  }

  private filterTerminalHistory(history: TerminalContext[], filter: ContextFilter): TerminalContext[] {
    let filtered = [...history];

    if (filter.maxHistoryItems) {
      filtered = filtered.slice(0, filter.maxHistoryItems);
    }

    if (filter.timeRange) {
      filtered = filtered.filter(cmd => 
        cmd.timestamp >= filter.timeRange!.start &&
        cmd.timestamp <= filter.timeRange!.end
      );
    }

    return filtered;
  }

  private filterNotebookCells(cells: NotebookContext[], filter: ContextFilter): NotebookContext[] {
    let filtered = [...cells];

    if (filter.maxHistoryItems) {
      filtered = filtered.slice(0, filter.maxHistoryItems);
    }

    if (filter.timeRange) {
      filtered = filtered.filter(cell => 
        cell.timestamp >= filter.timeRange!.start &&
        cell.timestamp <= filter.timeRange!.end
      );
    }

    return filtered;
  }

  private filterActions(actions: ContextAction[], filter: ContextFilter): ContextAction[] {
    let filtered = [...actions];

    if (filter.maxHistoryItems) {
      filtered = filtered.slice(0, filter.maxHistoryItems);
    }

    if (filter.timeRange) {
      filtered = filtered.filter(action => 
        action.timestamp >= filter.timeRange!.start &&
        action.timestamp <= filter.timeRange!.end
      );
    }

    return filtered;
  }

  private summarizeProject(project?: ProjectContext): string {
    if (!project) return 'No active project';
    
    return `${project.name} - ${project.type} project${project.framework ? ` using ${project.framework}` : ''}${project.language ? ` (${project.language})` : ''}`;
  }

  private summarizeFiles(files: FileContext[]): string {
    if (files.length === 0) return 'No active files';
    
    const fileTypes = files.reduce((acc, file) => {
      const ext = file.name.split('.').pop() || 'unknown';
      acc[ext] = (acc[ext] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typesSummary = Object.entries(fileTypes)
      .map(([type, count]) => `${count} ${type}`)
      .join(', ');

    return `${files.length} active files: ${typesSummary}`;
  }

  private summarizeTerminalHistory(history: TerminalContext[]): string {
    if (history.length === 0) return 'No recent commands';
    
    const recentCommands = history.slice(0, 5).map(cmd => cmd.command);
    return `Recent commands: ${recentCommands.join(', ')}`;
  }

  private inferCurrentTask(context: WorkspaceContext): string {
    const recentActions = context.recentActions.slice(0, 10);
    
    // Analyze recent actions to infer current task
    const actionTypes = recentActions.reduce((acc, action) => {
      acc[action.type] = (acc[action.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (actionTypes.file_edit > actionTypes.terminal_command) {
      return 'Code editing and development';
    } else if (actionTypes.terminal_command > 0) {
      return 'Command line operations';
    } else if (actionTypes.notebook_execute > 0) {
      return 'Data analysis and experimentation';
    } else {
      return 'General workspace exploration';
    }
  }

  private buildRelevantContext(context: WorkspaceContext): string {
    const parts: string[] = [];

    if (context.currentSelection) {
      parts.push(`Current selection: ${context.currentSelection.text.substring(0, 200)}`);
    }

    if (context.activeFiles.length > 0) {
      const mainFile = context.activeFiles[0];
      parts.push(`Working on: ${mainFile.name}`);
    }

    if (context.terminalHistory.length > 0) {
      const lastCommand = context.terminalHistory[0];
      parts.push(`Last command: ${lastCommand.command}`);
    }

    return parts.join(' | ');
  }

  private isRelevantToQuery(text: string, query: string): boolean {
    const queryWords = query.toLowerCase().split(/\s+/);
    const textLower = text.toLowerCase();
    
    return queryWords.some(word => textLower.includes(word));
  }

  private persistContext(): void {
    try {
      const persistData = {
        project: this.context.project,
        activeFiles: this.context.activeFiles.slice(0, 10), // Limit persisted files
        terminalHistory: this.context.terminalHistory.slice(0, 20), // Limit persisted history
        timestamp: this.context.timestamp
      };
      
      localStorage.setItem('omnipanel-workspace-context', JSON.stringify(persistData));
    } catch (error) {
      console.error('Failed to persist context:', error);
    }
  }

  private loadPersistedContext(): void {
    try {
      const saved = localStorage.getItem('omnipanel-workspace-context');
      if (saved) {
        const parsed = JSON.parse(saved);
        
        this.context.project = parsed.project;
        this.context.activeFiles = parsed.activeFiles || [];
        this.context.terminalHistory = parsed.terminalHistory || [];
        this.context.timestamp = new Date(parsed.timestamp || Date.now());
      }
    } catch (error) {
      console.error('Failed to load persisted context:', error);
    }
  }

  // Cleanup
  public clearContext(): void {
    this.context = {
      activeFiles: [],
      terminalHistory: [],
      notebookCells: [],
      recentActions: [],
      timestamp: new Date()
    };
    
    this.contextCache.clear();
    localStorage.removeItem('omnipanel-workspace-context');
    this.notifyListeners();
  }

  public clearCache(): void {
    this.contextCache.clear();
  }
}

// Export singleton instance
export const contextService = new ContextService(); 