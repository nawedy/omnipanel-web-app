import { ReactNode, ComponentType } from 'react';

// Plugin Metadata
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license?: string;
  homepage?: string;
  repository?: string;
  keywords?: string[];
  category: PluginCategory;
  
  // Plugin configuration
  main: string;
  icon?: string;
  permissions: PluginPermission[];
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  
  // Runtime requirements
  engines: {
    omnipanel: string;
    node?: string;
  };
  
  // UI contributions
  contributes?: PluginContributions;
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

// Plugin Interface
export interface Plugin {
  manifest: PluginManifest;
  activate(context: PluginContext): Promise<void> | void;
  deactivate?(): Promise<void> | void;
}

// Plugin Context
export interface PluginContext {
  extensionPath: string;
  extensionUri: string;
  globalState: PluginStorage;
  workspaceState: PluginStorage;
  subscriptions: PluginDisposable[];
  
  // API access
  api: PluginAPI;
  
  // Logger
  logger: PluginLogger;
  
  // Event emitter
  events: PluginEventEmitter;
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

// Plugin Logger
export interface PluginLogger {
  trace(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

// Plugin Event Emitter
export interface PluginEventEmitter {
  on(event: string, listener: (...args: any[]) => void): PluginDisposable;
  emit(event: string, ...args: any[]): void;
  removeListener(event: string, listener: (...args: any[]) => void): void;
}

// Plugin API Interface
export interface PluginAPI {
  // Workspace API
  workspace: {
    getConfiguration(section?: string): any;
    onDidChangeConfiguration: (listener: (e: any) => void) => PluginDisposable;
    openTextDocument(uri: string): Promise<any>;
    showTextDocument(document: any): Promise<any>;
  };
  
  // Chat API
  chat: {
    sendMessage(message: string, options?: any): Promise<any>;
    onDidReceiveMessage: (listener: (message: any) => void) => PluginDisposable;
    addProvider(provider: ChatProvider): PluginDisposable;
  };
  
  // Terminal API
  terminal: {
    createTerminal(options?: any): any;
    onDidOpenTerminal: (listener: (terminal: any) => void) => PluginDisposable;
    sendText(text: string): void;
  };
  
  // Notebook API
  notebook: {
    createNotebook(type?: string): Promise<any>;
    executeCell(cell: any): Promise<any>;
    onDidChangeNotebook: (listener: (notebook: any) => void) => PluginDisposable;
  };
  
  // File System API
  fs: {
    readFile(uri: string): Promise<Buffer>;
    writeFile(uri: string, content: Buffer): Promise<void>;
    exists(uri: string): Promise<boolean>;
    readDirectory(uri: string): Promise<string[]>;
    createDirectory(uri: string): Promise<void>;
    delete(uri: string, options?: { recursive?: boolean }): Promise<void>;
  };
  
  // UI API
  ui: {
    showInformationMessage(message: string, ...items: string[]): Promise<string | undefined>;
    showWarningMessage(message: string, ...items: string[]): Promise<string | undefined>;
    showErrorMessage(message: string, ...items: string[]): Promise<string | undefined>;
    showInputBox(options?: any): Promise<string | undefined>;
    showQuickPick(items: any[], options?: any): Promise<any>;
    registerCommand(command: string, callback: (...args: any[]) => any): PluginDisposable;
    registerWebviewPanel(type: string, title: string, column: any, options?: any): any;
  };
  
  // Storage API
  storage: {
    get<T>(key: string): Promise<T | undefined>;
    set(key: string, value: any): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
  };
  
  // HTTP API
  http: {
    request(options: RequestOptions): Promise<Response>;
    get(url: string, options?: RequestOptions): Promise<Response>;
    post(url: string, data?: any, options?: RequestOptions): Promise<Response>;
    put(url: string, data?: any, options?: RequestOptions): Promise<Response>;
    delete(url: string, options?: RequestOptions): Promise<Response>;
  };
}

// Chat Provider Interface
export interface ChatProvider {
  id: string;
  name: string;
  sendMessage(message: string, options?: any): Promise<string>;
  streamMessage?(message: string, options?: any): AsyncGenerator<string, void, unknown>;
  getModels?(): Promise<ModelInfo[]>;
}

// Model Info
export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  contextLength?: number;
  pricing?: {
    input?: number;
    output?: number;
  };
}

// Request/Response Types
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  timeout?: number;
}

export interface Response {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  text(): Promise<string>;
  json(): Promise<any>;
  blob(): Promise<Blob>;
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
  manifest: PluginManifest;
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