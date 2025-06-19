import { 
  PluginAPIInterface,
  PluginContext,
  PluginMetadata,
  UIComponent,
  TerminalInterface,
  TerminalOptions,
  TerminalResult,
  NotebookInterface,
  NotebookCell,
  FileSystemInterface,
  FileStat,
  FileEvent,
  NetworkInterface,
  RequestOptions,
  Response,
  WorkspaceInterface,
  PluginEventEmitter,
  PluginDisposable,
  InputBoxOptions,
  QuickPickOptions
} from './types';

export class PluginAPI implements PluginAPIInterface {
  public context: PluginContext;
  public metadata: PluginMetadata;
  public events: PluginEventEmitter;

  constructor(context: PluginContext, metadata: PluginMetadata) {
    this.context = context;
    this.metadata = metadata;
    this.events = new PluginEventEmitter();
    
    // Initialize workspace API
    this.workspace = {
      root: this.context.workspaceRoot,
      name: '',
      files: [],

      openFile: async (path: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          this.events.emit('workspace:openFile', { path, resolve, reject });
        });
      },

      closeFile: async (path: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          this.events.emit('workspace:closeFile', { path, resolve, reject });
        });
      },

      saveFile: async (path: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          this.events.emit('workspace:saveFile', { path, resolve, reject });
        });
      },

      onFileOpen: (callback: (path: string) => void): PluginDisposable => {
        this.events.on('workspace:fileOpened', callback);
        return {
          dispose: () => this.events.removeListener('workspace:fileOpened', callback)
        };
      },

      onFileClose: (callback: (path: string) => void): PluginDisposable => {
        this.events.on('workspace:fileClosed', callback);
        return {
          dispose: () => this.events.removeListener('workspace:fileClosed', callback)
        };
      },

      onFileChange: (callback: (path: string) => void): PluginDisposable => {
        this.events.on('workspace:fileChanged', callback);
        return {
          dispose: () => this.events.removeListener('workspace:fileChanged', callback)
        };
      }
    };
  }

  // UI API
  public ui = {
    createComponent: (component: Omit<UIComponent, 'id'>): UIComponent => {
      const id = `${this.metadata.id}-${Date.now()}`;
      const fullComponent: UIComponent = { ...component, id };
      
      // Implementation would integrate with OmniPanel's UI system
      this.events.emit('ui:component:created', fullComponent);
      
      return fullComponent;
    },

    updateComponent: (id: string, updates: Partial<UIComponent>): void => {
      this.events.emit('ui:component:updated', { id, updates });
    },

    removeComponent: (id: string): void => {
      this.events.emit('ui:component:removed', { id });
    },

    showNotification: (message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info'): void => {
      this.events.emit('ui:notification', { message, type });
    }
  };

  // Terminal API
  public terminal: TerminalInterface = {
    execute: async (command: string, options?: TerminalOptions): Promise<TerminalResult> => {
      return new Promise((resolve, reject) => {
        this.events.emit('terminal:execute', { command, options, resolve, reject });
      });
    },

    write: (data: string): void => {
      this.events.emit('terminal:write', { data });
    },

    clear: (): void => {
      this.events.emit('terminal:clear');
    },

    onData: (callback: (data: string) => void): PluginDisposable => {
      this.events.on('terminal:data', callback);
      return {
        dispose: () => this.events.removeListener('terminal:data', callback)
      };
    },

    onExit: (callback: (code: number) => void): PluginDisposable => {
      this.events.on('terminal:exit', callback);
      return {
        dispose: () => this.events.removeListener('terminal:exit', callback)
      };
    }
  };

  // Notebook API
  public notebook: NotebookInterface = {
    cells: [],

    addCell: (cell: Partial<NotebookCell>): void => {
      const fullCell: NotebookCell = {
        id: `cell-${Date.now()}`,
        type: 'code',
        content: '',
        ...cell
      };
      this.notebook.cells.push(fullCell);
      this.events.emit('notebook:cell:added', fullCell);
    },

    removeCell: (id: string): void => {
      const index = this.notebook.cells.findIndex(cell => cell.id === id);
      if (index !== -1) {
        this.notebook.cells.splice(index, 1);
        this.events.emit('notebook:cell:removed', { id });
      }
    },

    updateCell: (id: string, updates: Partial<NotebookCell>): void => {
      const cell = this.notebook.cells.find(c => c.id === id);
      if (cell) {
        Object.assign(cell, updates);
        this.events.emit('notebook:cell:updated', { id, updates });
      }
    },

    executeCell: async (id: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        this.events.emit('notebook:cell:execute', { id, resolve, reject });
      });
    },

    onCellChange: (callback: (cell: NotebookCell) => void): PluginDisposable => {
      this.events.on('notebook:cell:changed', callback);
      return {
        dispose: () => this.events.removeListener('notebook:cell:changed', callback)
      };
    }
  };

  // File System API
  public fs: FileSystemInterface = {
    readFile: async (path: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        this.events.emit('fs:readFile', { path, resolve, reject });
      });
    },

    writeFile: async (path: string, content: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        this.events.emit('fs:writeFile', { path, content, resolve, reject });
      });
    },

    readDir: async (path: string): Promise<string[]> => {
      return new Promise((resolve, reject) => {
        this.events.emit('fs:readDir', { path, resolve, reject });
      });
    },

    exists: async (path: string): Promise<boolean> => {
      return new Promise((resolve, reject) => {
        this.events.emit('fs:exists', { path, resolve, reject });
      });
    },

    stat: async (path: string): Promise<FileStat> => {
      return new Promise((resolve, reject) => {
        this.events.emit('fs:stat', { path, resolve, reject });
      });
    },

    watch: (path: string, callback: (event: FileEvent) => void): PluginDisposable => {
      this.events.emit('fs:watch', { path, callback });
      return {
        dispose: () => this.events.emit('fs:unwatch', { path, callback })
      };
    },

    delete: async (path: string, options?: { recursive?: boolean }): Promise<void> => {
      return new Promise((resolve, reject) => {
        this.events.emit('fs:delete', { path, options, resolve, reject });
      });
    }
  };

  // Network API
  public network: NetworkInterface = {
    request: async (options: RequestOptions): Promise<Response> => {
      const response = await fetch(options.url, {
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body,
        signal: options.timeout ? AbortSignal.timeout(options.timeout) : undefined
      });

      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        text: () => response.text(),
        json: () => response.json(),
        blob: () => response.blob()
      };
    },

    get: async (url: string, options?: Omit<RequestOptions, 'method' | 'url'>): Promise<Response> => {
      return this.network.request({ ...options, url, method: 'GET' });
    },

    post: async (url: string, options?: Omit<RequestOptions, 'method' | 'url'>): Promise<Response> => {
      return this.network.request({ ...options, url, method: 'POST' });
    },

    put: async (url: string, options?: Omit<RequestOptions, 'method' | 'url'>): Promise<Response> => {
      return this.network.request({ ...options, url, method: 'PUT' });
    },

    delete: async (url: string, options?: Omit<RequestOptions, 'method' | 'url'>): Promise<Response> => {
      return this.network.request({ ...options, url, method: 'DELETE' });
    }
  };

  // Workspace API - initialized in constructor
  public workspace!: WorkspaceInterface;

  // Utilities API
  public utils = {
    log: (message: string, level: 'debug' | 'info' | 'warn' | 'error' = 'info'): void => {
      this.events.emit('utils:log', { message, level, plugin: this.metadata.id });
    },

    showProgress: async (title: string, task: () => Promise<void>): Promise<void> => {
      this.events.emit('utils:progress:start', { title });
      try {
        await task();
        this.events.emit('utils:progress:end', { title });
      } catch (error) {
        this.events.emit('utils:progress:error', { title, error });
        throw error;
      }
    },

    showInputBox: async (options: InputBoxOptions): Promise<string | undefined> => {
      return new Promise((resolve) => {
        this.events.emit('utils:inputBox', { options, resolve });
      });
    },

    showQuickPick: async (items: string[], options?: QuickPickOptions): Promise<string | undefined> => {
      return new Promise((resolve) => {
        this.events.emit('utils:quickPick', { items, options, resolve });
      });
    }
  };
} 