// Standalone types for OmniPanel Web App

export interface Tab {
  id: string;
  title: string;
  type: 'chat' | 'code' | 'notebook' | 'terminal' | 'file' | 'editor' | 'research';
  path?: string;
  content?: string;
  isActive: boolean;
  isDirty?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  content?: string;
  isExpanded?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  path: string;
  files: FileNode[];
  tabs: Tab[];
  activeTabId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LLMModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'ollama' | 'huggingface' | 'deepseek' | 'qwen';
  endpoint?: string;
  apiKey?: string;
  isLocal: boolean;
  isAvailable: boolean;
}

export interface NotebookCell {
  id: string;
  type: 'code' | 'markdown';
  content: string;
  outputs?: any[];
  executionCount?: number;
  metadata?: Record<string, any>;
}

export interface Notebook {
  id: string;
  name: string;
  cells: NotebookCell[];
  kernel?: string;
  metadata: Record<string, any>;
}

export interface TerminalSession {
  id: string;
  name: string;
  cwd: string;
  isActive: boolean;
  history: string[];
}

export interface AppConfig {
  theme: 'light' | 'dark' | 'system';
  defaultModel: string;
  autoSave: boolean;
  fontSize: number;
  keyBindings: Record<string, string>;
}

export interface WorkspaceState {
  currentProject?: Project;
  projects: Project[];
  tabs: Tab[];
  activeTabId?: string;
  sidebarWidth: number;
  terminalHeight: number;
  config: AppConfig;
} 