// apps/web/src/types/workspace.ts
// Workspace type definitions for OmniPanel workspace management

export interface WorkspaceFile {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  lastModified: Date;
  size?: number;
  isOpen?: boolean;
  isDirty?: boolean;
  language?: string;
}

export interface WorkspaceFolder {
  id: string;
  name: string;
  path: string;
  files: WorkspaceFile[];
  isExpanded?: boolean;
  isRoot?: boolean;
}

export interface WorkspaceTab {
  id: string;
  title: string;
  filePath: string;
  type: 'file' | 'terminal' | 'notebook' | 'chat' | 'code';
  isActive: boolean;
  isDirty: boolean;
  content?: string;
  scrollPosition?: number;
  cursorPosition?: { line: number; column: number };
  projectId?: string;
}

export interface WorkspaceSession {
  id: string;
  name: string;
  projectPath?: string;
  openTabs: WorkspaceTab[];
  activeTabId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceProject {
  id: string;
  name: string;
  path: string;
  description?: string;
  folders: WorkspaceFolder[];
  tabs: WorkspaceTab[];
  activeTabId?: string;
  settings: WorkspaceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceSettings {
  autoSave: boolean;
  autoSaveDelay: number;
  showHiddenFiles: boolean;
  tabSize: number;
  insertSpaces: boolean;
  wordWrap: boolean;
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  fontFamily: string;
}

export interface WorkspaceState {
  currentProject?: WorkspaceProject;
  projects: WorkspaceProject[];
  isLoading: boolean;
  error: string | null;
  sidebarWidth: number;
  bottomPanelHeight: number;
  layout: 'default' | 'zen' | 'focus';
}

export interface WorkspaceActions {
  // Project management
  createProject: (name: string, path: string) => Promise<WorkspaceProject>;
  openProject: (projectId: string) => Promise<void>;
  closeProject: () => void;
  deleteProject: (projectId: string) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<WorkspaceProject>) => Promise<void>;
  
  // File management
  openFile: (filePath: string) => Promise<void>;
  closeFile: (filePath: string) => void;
  saveFile: (filePath: string, content: string) => Promise<void>;
  createFile: (folderPath: string, fileName: string) => Promise<void>;
  deleteFile: (filePath: string) => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => Promise<void>;
  
  // Tab management
  openTab: (tab: Omit<WorkspaceTab, 'id'>) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<WorkspaceTab>) => void;
  
  // Layout management
  setSidebarWidth: (width: number) => void;
  setBottomPanelHeight: (height: number) => void;
  setLayout: (layout: WorkspaceState['layout']) => void;
  
  // Settings
  updateSettings: (settings: Partial<WorkspaceSettings>) => void;
}

export type WorkspaceContextType = WorkspaceState & WorkspaceActions; 