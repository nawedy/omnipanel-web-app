import { 
  PluginAPI, 
  ChatProvider, 
  ModelInfo, 
  RequestOptions, 
  Response, 
  PluginDisposable 
} from './types';

export class PluginAPI implements PluginAPI {
  workspace: WorkspaceAPI;
  chat: ChatAPI;
  terminal: TerminalAPI;
  notebook: NotebookAPI;
  fs: FileSystemAPI;
  ui: UIAPI;
  storage: StorageAPI;
  http: HttpAPI;

  constructor() {
    this.workspace = new WorkspaceAPI();
    this.chat = new ChatAPI();
    this.terminal = new TerminalAPI();
    this.notebook = new NotebookAPI();
    this.fs = new FileSystemAPI();
    this.ui = new UIAPI();
    this.storage = new StorageAPI();
    this.http = new HttpAPI();
  }
}

class WorkspaceAPI {
  private configuration = new Map<string, any>();
  private configurationListeners = new Set<(e: any) => void>();

  getConfiguration(section?: string): any {
    if (section) {
      return this.configuration.get(section);
    }
    return Object.fromEntries(this.configuration);
  }

  onDidChangeConfiguration(listener: (e: any) => void): PluginDisposable {
    this.configurationListeners.add(listener);
    return {
      dispose: () => this.configurationListeners.delete(listener),
    };
  }

  async openTextDocument(uri: string): Promise<any> {
    // Mock implementation
    return {
      uri,
      getText: () => 'File content',
      languageId: 'typescript',
    };
  }

  async showTextDocument(document: any): Promise<any> {
    // Mock implementation
    console.log('Opening document:', document);
    return document;
  }

  updateConfiguration(section: string, value: any): void {
    this.configuration.set(section, value);
    const event = { section, value };
    this.configurationListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in configuration listener:', error);
      }
    });
  }
}

class ChatAPI {
  private providers = new Map<string, ChatProvider>();
  private messageListeners = new Set<(message: any) => void>();

  async sendMessage(message: string, options?: any): Promise<any> {
    // Mock implementation
    const response = `Echo: ${message}`;
    const messageEvent = { message, response, timestamp: Date.now() };
    
    this.messageListeners.forEach(listener => {
      try {
        listener(messageEvent);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });

    return {
      id: Math.random().toString(36),
      message,
      response,
      timestamp: Date.now(),
    };
  }

  onDidReceiveMessage(listener: (message: any) => void): PluginDisposable {
    this.messageListeners.add(listener);
    return {
      dispose: () => this.messageListeners.delete(listener),
    };
  }

  addProvider(provider: ChatProvider): PluginDisposable {
    this.providers.set(provider.id, provider);
    return {
      dispose: () => this.providers.delete(provider.id),
    };
  }

  getProviders(): ChatProvider[] {
    return Array.from(this.providers.values());
  }

  getProvider(id: string): ChatProvider | undefined {
    return this.providers.get(id);
  }
}

class TerminalAPI {
  private terminals = new Map<string, any>();
  private terminalListeners = new Set<(terminal: any) => void>();

  createTerminal(options?: any): any {
    const terminal = {
      id: Math.random().toString(36),
      name: options?.name || 'Terminal',
      sendText: (text: string) => this.sendText(text),
      dispose: () => this.terminals.delete(terminal.id),
    };

    this.terminals.set(terminal.id, terminal);
    this.notifyTerminalOpened(terminal);
    
    return terminal;
  }

  onDidOpenTerminal(listener: (terminal: any) => void): PluginDisposable {
    this.terminalListeners.add(listener);
    return {
      dispose: () => this.terminalListeners.delete(listener),
    };
  }

  sendText(text: string): void {
    console.log('Terminal input:', text);
  }

  private notifyTerminalOpened(terminal: any): void {
    this.terminalListeners.forEach(listener => {
      try {
        listener(terminal);
      } catch (error) {
        console.error('Error in terminal listener:', error);
      }
    });
  }
}

class NotebookAPI {
  private notebooks = new Map<string, any>();
  private notebookListeners = new Set<(notebook: any) => void>();

  async createNotebook(type = 'jupyter'): Promise<any> {
    const notebook = {
      id: Math.random().toString(36),
      type,
      cells: [],
      addCell: (cell: any) => notebook.cells.push(cell),
      executeCell: (cell: any) => this.executeCell(cell),
    };

    this.notebooks.set(notebook.id, notebook);
    return notebook;
  }

  async executeCell(cell: any): Promise<any> {
    // Mock cell execution
    const result = {
      output: `Executed: ${cell.source}`,
      type: 'text/plain',
    };

    this.notifyNotebookChanged({ cell, result });
    return result;
  }

  onDidChangeNotebook(listener: (notebook: any) => void): PluginDisposable {
    this.notebookListeners.add(listener);
    return {
      dispose: () => this.notebookListeners.delete(listener),
    };
  }

  private notifyNotebookChanged(event: any): void {
    this.notebookListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in notebook listener:', error);
      }
    });
  }
}

class FileSystemAPI {
  async readFile(uri: string): Promise<Buffer> {
    // Mock implementation
    return Buffer.from(`Content of ${uri}`, 'utf-8');
  }

  async writeFile(uri: string, content: Buffer): Promise<void> {
    // Mock implementation
    console.log(`Writing ${content.length} bytes to ${uri}`);
  }

  async exists(uri: string): Promise<boolean> {
    // Mock implementation
    return true;
  }

  async readDirectory(uri: string): Promise<string[]> {
    // Mock implementation
    return ['file1.txt', 'file2.js', 'folder1/'];
  }

  async createDirectory(uri: string): Promise<void> {
    // Mock implementation
    console.log(`Creating directory: ${uri}`);
  }

  async delete(uri: string, options?: { recursive?: boolean }): Promise<void> {
    // Mock implementation
    console.log(`Deleting: ${uri}`, options);
  }
}

class UIAPI {
  private commands = new Map<string, (...args: any[]) => any>();

  async showInformationMessage(message: string, ...items: string[]): Promise<string | undefined> {
    // Mock implementation
    console.log('Info:', message);
    return items[0];
  }

  async showWarningMessage(message: string, ...items: string[]): Promise<string | undefined> {
    // Mock implementation
    console.warn('Warning:', message);
    return items[0];
  }

  async showErrorMessage(message: string, ...items: string[]): Promise<string | undefined> {
    // Mock implementation
    console.error('Error:', message);
    return items[0];
  }

  async showInputBox(options?: any): Promise<string | undefined> {
    // Mock implementation
    const input = prompt(options?.prompt || 'Enter value:');
    return input || undefined;
  }

  async showQuickPick(items: any[], options?: any): Promise<any> {
    // Mock implementation
    return items[0];
  }

  registerCommand(command: string, callback: (...args: any[]) => any): PluginDisposable {
    this.commands.set(command, callback);
    return {
      dispose: () => this.commands.delete(command),
    };
  }

  registerWebviewPanel(type: string, title: string, column: any, options?: any): any {
    // Mock implementation
    return {
      type,
      title,
      webview: {
        html: '',
        onDidReceiveMessage: () => ({ dispose: () => {} }),
        postMessage: (message: any) => console.log('Webview message:', message),
      },
      dispose: () => console.log(`Disposed webview: ${title}`),
    };
  }

  executeCommand(command: string, ...args: any[]): Promise<any> {
    const commandHandler = this.commands.get(command);
    if (commandHandler) {
      return Promise.resolve(commandHandler(...args));
    }
    return Promise.reject(new Error(`Command '${command}' not found`));
  }
}

class StorageAPI {
  private storage = new Map<string, any>();

  async get<T>(key: string): Promise<T | undefined> {
    return this.storage.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    this.storage.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async keys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }
}

class HttpAPI {
  async request(options: RequestOptions): Promise<Response> {
    const response = await fetch(options.url || '', {
      method: options.method || 'GET',
      headers: options.headers,
      // Add timeout and other options
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: await response.json().catch(() => null),
      text: () => response.text(),
      json: () => response.json(),
      blob: () => response.blob(),
    };
  }

  async get(url: string, options?: RequestOptions): Promise<Response> {
    return this.request({ ...options, url, method: 'GET' });
  }

  async post(url: string, data?: any, options?: RequestOptions): Promise<Response> {
    return this.request({
      ...options,
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(data),
    } as any);
  }

  async put(url: string, data?: any, options?: RequestOptions): Promise<Response> {
    return this.request({
      ...options,
      url,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(data),
    } as any);
  }

  async delete(url: string, options?: RequestOptions): Promise<Response> {
    return this.request({ ...options, url, method: 'DELETE' });
  }
} 