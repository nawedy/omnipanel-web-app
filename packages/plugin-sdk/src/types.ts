import { ReactNode, ComponentType } from 'react';
import { EventEmitter } from 'events';

// Plugin Status
export type PluginStatus = 
  | 'registered'
  | 'loading'
  | 'loaded'
  | 'unloading'
  | 'error';

// Plugin Metadata
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  engines?: {
    omnipanel?: string;
    node?: string;
  };
  main?: string;
  category?: PluginCategory;
  permissions?: PluginPermission[];
}

// Plugin Configuration
export interface PluginConfig {
  enabled: boolean;
  settings: Record<string, any>;
  permissions: PluginPermission[];
}

// Plugin Lifecycle
export interface PluginLifecycle {
  activate(api: PluginAPIInterface): Promise<void> | void;
  deactivate(): Promise<void> | void;
}

// Plugin Categories
export type PluginCategory = 
  | 'ai-models'
  | 'code-tools'
  | 'data-science'
  | 'productivity'
  | 'themes'
  | 'integrations'
  | 'utilities'
  | 'extensions';

// Plugin Permissions
export type PluginPermission = 
  | 'filesystem:read'
  | 'filesystem:write'
  | 'network:request'
  | 'ui:create'
  | 'ui:modify'
  | 'terminal:execute'
  | 'notebook:read'
  | 'notebook:write'
  | 'workspace:read'
  | 'workspace:write'
  | 'file-system'
  | 'network'
  | 'workspace'
  | 'chat'
  | 'terminal'
  | 'notebook'
  | 'settings'
  | 'clipboard'
  | 'notifications'
  | 'storage';

// Plugin Contributions
export interface PluginContributions {
  commands?: CommandContribution[];
  menus?: MenuContribution[];
  keybindings?: KeybindingContribution[];
  views?: ViewContribution[];
  panels?: PanelContribution[];
  themes?: ThemeContribution[];
  languages?: LanguageContribution[];
  models?: ModelContribution[];
}

// Command Contribution
export interface CommandContribution {
  command: string;
  title: string;
  category?: string;
  icon?: string;
  enablement?: string;
}

// Menu Contribution
export interface MenuContribution {
  command: string;
  when?: string;
  group?: string;
  order?: number;
}

// Keybinding Contribution
export interface KeybindingContribution {
  command: string;
  key: string;
  mac?: string;
  linux?: string;
  win?: string;
  when?: string;
}

// View Contribution
export interface ViewContribution {
  id: string;
  name: string;
  when?: string;
  icon?: string;
  contextualTitle?: string;
}

// Panel Contribution
export interface PanelContribution {
  id: string;
  title: string;
  when?: string;
  icon?: string;
}

// Theme Contribution
export interface ThemeContribution {
  id: string;
  label: string;
  uiTheme: 'vs' | 'vs-dark' | 'hc-black';
  path: string;
}

// Language Contribution
export interface LanguageContribution {
  id: string;
  aliases?: string[];
  extensions?: string[];
  filenames?: string[];
  mimetypes?: string[];
  configuration?: string;
}

// Model Contribution
export interface ModelContribution {
  id: string;
  name: string;
  provider: string;
  type: 'chat' | 'completion' | 'embedding' | 'image' | 'audio';
  config: Record<string, any>;
}

// Plugin Context
export interface PluginContext {
  workspaceRoot: string;
  extensionPath: string;
  globalState: PluginStorage;
  workspaceState: PluginStorage;
  subscriptions: PluginDisposable[];
  extensionUri?: string;
  hasPermission(permission: PluginPermission): boolean;
}

// Plugin Storage
export interface PluginStorage {
  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  update(key: string, value: any): Promise<void>;
  keys(): readonly string[];
}

// Plugin Disposable
export interface PluginDisposable {
  dispose(): void;
}

// Plugin Event Emitter
export class PluginEventEmitter extends EventEmitter {
  constructor() {
    super();
  }
}

// Plugin Logger
export interface PluginLogger {
  trace(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

// UI Components
export interface UIComponent {
  id: string;
  type: 'panel' | 'sidebar' | 'statusbar' | 'modal' | 'notification';
  title: string;
  content: string | HTMLElement;
  visible: boolean;
  position?: 'left' | 'right' | 'top' | 'bottom' | 'center';
}

// Terminal Interface
export interface TerminalInterface {
  execute(command: string, options?: TerminalOptions): Promise<TerminalResult>;
  write(data: string): void;
  clear(): void;
  onData(callback: (data: string) => void): PluginDisposable;
  onExit(callback: (code: number) => void): PluginDisposable;
}

export interface TerminalOptions {
  cwd?: string;
  env?: Record<string, string>;
  shell?: string;
  timeout?: number;
}

export interface TerminalResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  signal?: string;
}

// Notebook Interface
export interface NotebookInterface {
  cells: NotebookCell[];
  addCell(cell: Partial<NotebookCell>): void;
  removeCell(id: string): void;
  updateCell(id: string, updates: Partial<NotebookCell>): void;
  executeCell(id: string): Promise<void>;
  onCellChange(callback: (cell: NotebookCell) => void): PluginDisposable;
}

export interface NotebookCell {
  id: string;
  type: 'code' | 'markdown' | 'raw';
  content: string;
  language?: string;
  outputs?: NotebookOutput[];
  metadata?: Record<string, any>;
}

export interface NotebookOutput {
  type: 'text' | 'html' | 'image' | 'error';
  content: string;
  metadata?: Record<string, any>;
}

// File System Interface
export interface FileSystemInterface {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  readDir(path: string): Promise<string[]>;
  exists(path: string): Promise<boolean>;
  stat(path: string): Promise<FileStat>;
  watch(path: string, callback: (event: FileEvent) => void): PluginDisposable;
  delete(path: string, options?: { recursive?: boolean }): Promise<void>;
}

export interface FileStat {
  isFile: boolean;
  isDirectory: boolean;
  size: number;
  mtime: Date;
  ctime: Date;
}

export interface FileEvent {
  type: 'create' | 'change' | 'delete';
  path: string;
}

// Network Interface
export interface NetworkInterface {
  request(options: RequestOptions): Promise<Response>;
  get(url: string, options?: Omit<RequestOptions, 'method' | 'url'>): Promise<Response>;
  post(url: string, options?: Omit<RequestOptions, 'method' | 'url'>): Promise<Response>;
  put(url: string, options?: Omit<RequestOptions, 'method' | 'url'>): Promise<Response>;
  delete(url: string, options?: Omit<RequestOptions, 'method' | 'url'>): Promise<Response>;
}

export interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string | FormData | URLSearchParams;
  timeout?: number;
}

export interface Response {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  text(): Promise<string>;
  json(): Promise<any>;
  blob(): Promise<Blob>;
}

// Workspace Interface
export interface WorkspaceInterface {
  root: string;
  name: string;
  files: string[];
  openFile(path: string): Promise<void>;
  closeFile(path: string): Promise<void>;
  saveFile(path: string): Promise<void>;
  onFileOpen(callback: (path: string) => void): PluginDisposable;
  onFileClose(callback: (path: string) => void): PluginDisposable;
  onFileChange(callback: (path: string) => void): PluginDisposable;
}

// Plugin API Interface
export interface PluginAPIInterface {
  // Core
  context: PluginContext;
  metadata: PluginMetadata;
  
  // UI
  ui: {
    createComponent(component: Omit<UIComponent, 'id'>): UIComponent;
    updateComponent(id: string, updates: Partial<UIComponent>): void;
    removeComponent(id: string): void;
    showNotification(message: string, type?: 'info' | 'warning' | 'error' | 'success'): void;
  };
  
  // Terminal
  terminal: TerminalInterface;
  
  // Notebook
  notebook: NotebookInterface;
  
  // File System
  fs: FileSystemInterface;
  
  // Network
  network: NetworkInterface;
  
  // Workspace
  workspace: WorkspaceInterface;
  
  // Events
  events: PluginEventEmitter;
  
  // Utilities
  utils: {
    log(message: string, level?: 'debug' | 'info' | 'warn' | 'error'): void;
    showProgress(title: string, task: () => Promise<void>): Promise<void>;
    showInputBox(options: InputBoxOptions): Promise<string | undefined>;
    showQuickPick(items: string[], options?: QuickPickOptions): Promise<string | undefined>;
  };
}

export interface InputBoxOptions {
  prompt?: string;
  placeholder?: string;
  value?: string;
  password?: boolean;
  validateInput?: (value: string) => string | undefined;
}

export interface QuickPickOptions {
  placeholder?: string;
  canPickMany?: boolean;
  matchOnDescription?: boolean;
  matchOnDetail?: boolean;
}

// Plugin Entry Point
export interface Plugin extends PluginLifecycle {
  metadata: PluginMetadata;
  activate(api: PluginAPIInterface): Promise<void> | void;
  deactivate(): Promise<void> | void;
}

// Plugin React Components
export interface PluginComponentProps {
  plugin: Plugin;
  context: PluginContext;
}

export type PluginComponent = ComponentType<PluginComponentProps>;

// Plugin Hook Types
export type PluginHook<T = any> = {
  use(): T;
  dispose(): void;
};

// Plugin Events
export interface PluginEvents {
  'plugin:activate': { plugin: Plugin };
  'plugin:deactivate': { plugin: Plugin };
  'plugin:error': { plugin: Plugin; error: Error };
  'workspace:change': { path: string; type: 'create' | 'update' | 'delete' };
  'chat:message': { message: string; response: string };
  'terminal:output': { output: string };
  'notebook:execute': { cell: any; result: any };
}

// Plugin Registry Types
export interface PluginRegistryEntry {
  manifest: PluginMetadata;
  path: string;
  enabled: boolean;
  instance?: Plugin;
  error?: Error;
}

// Plugin Marketplace Types
export interface MarketplacePlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  downloads: number;
  rating: number;
  reviews: number;
  category: PluginCategory;
  tags: string[];
  screenshots: string[];
  readme: string;
  changelog: string;
  license: string;
  homepage?: string;
  repository?: string;
  downloadUrl: string;
  publishedAt: string;
  updatedAt: string;
}

// Plugin Installation Types
export interface PluginInstallOptions {
  version?: string;
  prerelease?: boolean;
  force?: boolean;
}

export interface PluginInstallResult {
  success: boolean;
  plugin?: PluginRegistryEntry;
  error?: string;
}

// Plugin Development Types
export interface PluginDevServer {
  start(port?: number): Promise<void>;
  stop(): Promise<void>;
  reload(): Promise<void>;
  getUrl(): string;
}

export interface PluginBuildOptions {
  mode: 'development' | 'production';
  watch?: boolean;
  outDir?: string;
  minify?: boolean;
  sourcemap?: boolean;
}

export interface PluginBuildResult {
  success: boolean;
  outputFiles: string[];
  errors: string[];
  warnings: string[];
  stats?: any;
}

// Export alias for compatibility
export type PluginManifest = PluginMetadata; 