import { app, BrowserWindow, ipcMain, dialog, shell, Menu, Tray, nativeTheme, globalShortcut } from 'electron';
import { autoUpdater } from 'electron-updater';
import windowStateKeeper from 'electron-window-state';
import Store from 'electron-store';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as chokidar from 'chokidar';
import { machineId } from 'node-machine-id';
import si from 'systeminformation';

// Import our native APIs
import { FileSystemManager } from './native/FileSystemManager';
import { ModelServerManager } from './native/ModelServerManager';
import { SystemMonitor } from './native/SystemMonitor';
import { AppUpdater } from './native/AppUpdater';

interface DesktopConfig {
  windowState: {
    width: number;
    height: number;
    x?: number;
    y?: number;
    isMaximized: boolean;
  };
  workspace: {
    currentProject?: string;
    recentProjects: string[];
    autoSave: boolean;
    syncEnabled: boolean;
  };
  llm: {
    providers: Record<string, any>;
    defaultProvider?: string;
    localModels: string[];
  };
  system: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    startMinimized: boolean;
    closeToTray: boolean;
  };
}

class OmniPanelDesktop {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;
  private store: Store<DesktopConfig>;
  private fileSystemManager: FileSystemManager;
  private modelServerManager: ModelServerManager;
  private systemMonitor: SystemMonitor;
  private appUpdater: AppUpdater;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    
    // Initialize persistent store
    this.store = new Store<DesktopConfig>({
      defaults: {
        windowState: {
          width: 1200,
          height: 800,
          isMaximized: false,
        },
        workspace: {
          recentProjects: [],
          autoSave: true,
          syncEnabled: true,
        },
        llm: {
          providers: {},
          localModels: [],
        },
        system: {
          theme: 'system',
          notifications: true,
          startMinimized: false,
          closeToTray: true,
        },
      },
    });

    // Initialize native managers
    this.fileSystemManager = new FileSystemManager();
    this.modelServerManager = new ModelServerManager();
    this.systemMonitor = new SystemMonitor();
    this.appUpdater = new AppUpdater();

    this.setupApp();
  }

  private setupApp(): void {
    // App event handlers
    app.whenReady().then(() => {
      this.createWindow();
      this.setupMenu();
      this.setupTray();
      this.setupGlobalShortcuts();
      this.setupAutoUpdater();
      this.registerIpcHandlers();
      
      // Start system monitoring
      this.systemMonitor.start();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });

    app.on('before-quit', () => {
      // Cleanup before quitting
      this.systemMonitor.stop();
      this.modelServerManager.stopAllServers();
    });

    // Security: Prevent navigation to external URLs
    app.on('web-contents-created', (_, contents) => {
      contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (parsedUrl.origin !== 'http://localhost:3000' && parsedUrl.origin !== 'http://localhost:3001') {
          event.preventDefault();
        }
      });
    });
  }

  private async createWindow(): Promise<void> {
    // Restore window state
    const mainWindowState = windowStateKeeper({
      defaultWidth: this.store.get('windowState.width'),
      defaultHeight: this.store.get('windowState.height'),
    });

    // Create the main window
    this.mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: 800,
      minHeight: 600,
      show: !this.store.get('system.startMinimized'),
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, '../preload/preload.js'),
        webSecurity: true,
      },
      icon: this.getAppIcon(),
    });

    // Manage window state
    mainWindowState.manage(this.mainWindow);

    // Save window state on close
    this.mainWindow.on('close', (event) => {
      if (this.store.get('system.closeToTray') && !app.isQuittingFromTray) {
        event.preventDefault();
        this.mainWindow?.hide();
        return false;
      }

      this.store.set('windowState', {
        width: this.mainWindow!.getBounds().width,
        height: this.mainWindow!.getBounds().height,
        isMaximized: this.mainWindow!.isMaximized(),
      });
    });

    // Load the app
    if (this.isDevelopment) {
      await this.mainWindow.loadURL('http://localhost:3001');
      this.mainWindow.webContents.openDevTools();
    } else {
      await this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  private setupMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Project',
            accelerator: 'CmdOrCtrl+N',
            click: () => this.handleNewProject(),
          },
          {
            label: 'Open Project',
            accelerator: 'CmdOrCtrl+O',
            click: () => this.handleOpenProject(),
          },
          {
            label: 'Save Project',
            accelerator: 'CmdOrCtrl+S',
            click: () => this.handleSaveProject(),
          },
          { type: 'separator' },
          {
            label: 'Import...',
            click: () => this.handleImport(),
          },
          {
            label: 'Export...',
            click: () => this.handleExport(),
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => app.quit(),
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectall' },
        ],
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
      {
        label: 'LLM',
        submenu: [
          {
            label: 'Manage Local Models',
            click: () => this.handleModelManagement(),
          },
          {
            label: 'Configure Providers',
            click: () => this.handleProviderConfig(),
          },
          { type: 'separator' },
          {
            label: 'Start Ollama Server',
            click: () => this.modelServerManager.startOllama(),
          },
          {
            label: 'Stop Ollama Server',
            click: () => this.modelServerManager.stopOllama(),
          },
        ],
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' },
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About OmniPanel',
            click: () => this.showAbout(),
          },
          {
            label: 'Check for Updates',
            click: () => this.appUpdater.checkForUpdates(),
          },
          {
            label: 'Report Issue',
            click: () => shell.openExternal('https://github.com/omnipanel/omnipanel/issues'),
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private setupTray(): void {
    this.tray = new Tray(this.getAppIcon());
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show OmniPanel',
        click: () => this.mainWindow?.show(),
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.isQuittingFromTray = true;
          app.quit();
        },
      },
    ]);

    this.tray.setToolTip('OmniPanel AI Workspace');
    this.tray.setContextMenu(contextMenu);
    
    this.tray.on('click', () => {
      this.mainWindow?.show();
    });
  }

  private setupGlobalShortcuts(): void {
    // Global shortcut to show/hide the app
    globalShortcut.register('CommandOrControl+Shift+O', () => {
      if (this.mainWindow?.isVisible()) {
        this.mainWindow.hide();
      } else {
        this.mainWindow?.show();
      }
    });
  }

  private setupAutoUpdater(): void {
    if (!this.isDevelopment) {
      this.appUpdater.initialize();
    }
  }

  private registerIpcHandlers(): void {
    // File system operations
    ipcMain.handle('fs:selectFolder', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        properties: ['openDirectory'],
      });
      return result.filePaths[0];
    });

    ipcMain.handle('fs:selectFile', async (_, filters?: Electron.FileFilter[]) => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        properties: ['openFile'],
        filters,
      });
      return result.filePaths[0];
    });

    ipcMain.handle('fs:saveFile', async (_, defaultPath?: string, filters?: Electron.FileFilter[]) => {
      const result = await dialog.showSaveDialog(this.mainWindow!, {
        defaultPath,
        filters,
      });
      return result.filePath;
    });

    ipcMain.handle('fs:readFile', async (_, filePath: string) => {
      return this.fileSystemManager.readFile(filePath);
    });

    ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
      return this.fileSystemManager.writeFile(filePath, content);
    });

    ipcMain.handle('fs:readDir', async (_, dirPath: string) => {
      return this.fileSystemManager.readDirectory(dirPath);
    });

    ipcMain.handle('fs:createDir', async (_, dirPath: string) => {
      return this.fileSystemManager.createDirectory(dirPath);
    });

    ipcMain.handle('fs:delete', async (_, itemPath: string) => {
      return this.fileSystemManager.deleteItem(itemPath);
    });

    ipcMain.handle('fs:watchProject', async (_, projectPath: string) => {
      return this.fileSystemManager.watchProject(projectPath);
    });

    // System information
    ipcMain.handle('system:getInfo', async () => {
      return this.systemMonitor.getSystemInfo();
    });

    ipcMain.handle('system:getResourceUsage', async () => {
      return this.systemMonitor.getResourceUsage();
    });

    // Model server management
    ipcMain.handle('llm:startOllama', async () => {
      return this.modelServerManager.startOllama();
    });

    ipcMain.handle('llm:stopOllama', async () => {
      return this.modelServerManager.stopOllama();
    });

    ipcMain.handle('llm:getLocalModels', async () => {
      return this.modelServerManager.getLocalModels();
    });

    ipcMain.handle('llm:downloadModel', async (_, modelName: string) => {
      return this.modelServerManager.downloadModel(modelName);
    });

    // App configuration
    ipcMain.handle('config:get', async (_, key: string) => {
      return this.store.get(key as any);
    });

    ipcMain.handle('config:set', async (_, key: string, value: any) => {
      return this.store.set(key as any, value);
    });

    // Window management
    ipcMain.handle('window:minimize', async () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('window:maximize', async () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle('window:close', async () => {
      this.mainWindow?.close();
    });

    // Auto-updater
    ipcMain.handle('updater:checkForUpdates', async () => {
      return this.appUpdater.checkForUpdates();
    });

    ipcMain.handle('updater:downloadUpdate', async () => {
      return this.appUpdater.downloadUpdate();
    });

    ipcMain.handle('updater:installUpdate', async () => {
      return this.appUpdater.quitAndInstall();
    });
  }

  private getAppIcon(): string {
    const platform = process.platform;
    const iconName = platform === 'win32' ? 'icon.ico' : platform === 'darwin' ? 'icon.icns' : 'icon.png';
    return path.join(__dirname, '../../assets', iconName);
  }

  // Menu handlers
  private async handleNewProject(): Promise<void> {
    const projectPath = await dialog.showOpenDialog(this.mainWindow!, {
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select folder for new project',
    });

    if (projectPath.filePaths[0]) {
      this.mainWindow?.webContents.send('project:new', projectPath.filePaths[0]);
    }
  }

  private async handleOpenProject(): Promise<void> {
    const projectPath = await dialog.showOpenDialog(this.mainWindow!, {
      properties: ['openDirectory'],
      title: 'Open project folder',
    });

    if (projectPath.filePaths[0]) {
      this.mainWindow?.webContents.send('project:open', projectPath.filePaths[0]);
    }
  }

  private async handleSaveProject(): Promise<void> {
    this.mainWindow?.webContents.send('project:save');
  }

  private async handleImport(): Promise<void> {
    this.mainWindow?.webContents.send('project:import');
  }

  private async handleExport(): Promise<void> {
    this.mainWindow?.webContents.send('project:export');
  }

  private async handleModelManagement(): Promise<void> {
    this.mainWindow?.webContents.send('llm:openModelManager');
  }

  private async handleProviderConfig(): Promise<void> {
    this.mainWindow?.webContents.send('llm:openProviderConfig');
  }

  private async showAbout(): Promise<void> {
    dialog.showMessageBox(this.mainWindow!, {
      type: 'info',
      title: 'About OmniPanel',
      message: 'OmniPanel AI Workspace',
      detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nNode: ${process.versions.node}`,
    });
  }
}

// Create the app instance
new OmniPanelDesktop(); 