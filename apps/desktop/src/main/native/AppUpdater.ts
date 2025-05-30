import { autoUpdater, UpdateInfo, ProgressInfo } from 'electron-updater';
import { EventEmitter } from 'events';
import { BrowserWindow, dialog } from 'electron';
import Store from 'electron-store';

export interface UpdateStatus {
  available: boolean;
  version?: string;
  releaseNotes?: string;
  releaseDate?: string;
  downloadProgress?: number;
  downloading?: boolean;
  downloaded?: boolean;
  error?: string;
}

export interface UpdateSettings {
  autoCheck: boolean;
  autoDownload: boolean;
  autoInstall: boolean;
  checkInterval: number; // in hours
  allowPrerelease: boolean;
  channel: 'latest' | 'beta' | 'alpha';
}

export class AppUpdater extends EventEmitter {
  private mainWindow: BrowserWindow | null = null;
  private store: Store;
  private updateStatus: UpdateStatus = { available: false };
  private checkInterval: NodeJS.Timeout | null = null;
  private settings: UpdateSettings;

  constructor() {
    super();
    
    this.store = new Store({
      name: 'updater-config',
      defaults: {
        autoCheck: true,
        autoDownload: true,
        autoInstall: false,
        checkInterval: 24, // 24 hours
        allowPrerelease: false,
        channel: 'latest',
      },
    });

    this.settings = this.store.get() as UpdateSettings;
    this.setupAutoUpdater();
  }

  /**
   * Initialize the updater
   */
  initialize(mainWindow?: BrowserWindow): void {
    this.mainWindow = mainWindow || null;
    
    // Configure auto-updater
    autoUpdater.allowPrerelease = this.settings.allowPrerelease;
    autoUpdater.channel = this.settings.channel;
    autoUpdater.autoDownload = this.settings.autoDownload;
    autoUpdater.autoInstallOnAppQuit = this.settings.autoInstall;

    // Start automatic checking if enabled
    if (this.settings.autoCheck) {
      this.startAutoCheck();
    }

    this.emit('initialized', this.settings);
  }

  /**
   * Check for updates manually
   */
  async checkForUpdates(): Promise<UpdateStatus> {
    try {
      this.emit('checking-for-update');
      
      const updateCheckResult = await autoUpdater.checkForUpdates();
      
      if (updateCheckResult?.updateInfo) {
        this.updateStatus = {
          available: true,
          version: updateCheckResult.updateInfo.version,
          releaseNotes: updateCheckResult.updateInfo.releaseNotes as string,
          releaseDate: updateCheckResult.updateInfo.releaseDate,
        };
      } else {
        this.updateStatus = { available: false };
      }

      this.emit('update-status-changed', this.updateStatus);
      return this.updateStatus;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.updateStatus = {
        available: false,
        error: errorMessage,
      };
      
      this.emit('error', errorMessage);
      return this.updateStatus;
    }
  }

  /**
   * Download update
   */
  async downloadUpdate(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.updateStatus.available) {
        return {
          success: false,
          message: 'No update available to download',
        };
      }

      this.updateStatus.downloading = true;
      this.emit('update-status-changed', this.updateStatus);

      await autoUpdater.downloadUpdate();
      
      return {
        success: true,
        message: 'Update download started',
      };
    } catch (error) {
      this.updateStatus.downloading = false;
      this.updateStatus.error = error instanceof Error ? error.message : 'Unknown error';
      this.emit('update-status-changed', this.updateStatus);
      
      return {
        success: false,
        message: `Download failed: ${this.updateStatus.error}`,
      };
    }
  }

  /**
   * Install update and restart app
   */
  quitAndInstall(): void {
    if (this.updateStatus.downloaded) {
      autoUpdater.quitAndInstall();
    } else {
      this.emit('error', 'No update downloaded to install');
    }
  }

  /**
   * Get current update status
   */
  getUpdateStatus(): UpdateStatus {
    return { ...this.updateStatus };
  }

  /**
   * Get update settings
   */
  getSettings(): UpdateSettings {
    return { ...this.settings };
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<UpdateSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.store.set(this.settings);

    // Apply settings to auto-updater
    autoUpdater.allowPrerelease = this.settings.allowPrerelease;
    autoUpdater.channel = this.settings.channel;
    autoUpdater.autoDownload = this.settings.autoDownload;
    autoUpdater.autoInstallOnAppQuit = this.settings.autoInstall;

    // Restart auto-check if interval changed
    if (newSettings.checkInterval || newSettings.autoCheck !== undefined) {
      this.stopAutoCheck();
      if (this.settings.autoCheck) {
        this.startAutoCheck();
      }
    }

    this.emit('settings-updated', this.settings);
  }

  /**
   * Start automatic update checking
   */
  private startAutoCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    const intervalMs = this.settings.checkInterval * 60 * 60 * 1000; // Convert hours to ms
    
    this.checkInterval = setInterval(() => {
      this.checkForUpdates();
    }, intervalMs);

    // Check immediately on start
    setTimeout(() => {
      this.checkForUpdates();
    }, 5000); // Wait 5 seconds after app start
  }

  /**
   * Stop automatic update checking
   */
  private stopAutoCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Setup auto-updater event handlers
   */
  private setupAutoUpdater(): void {
    autoUpdater.on('checking-for-update', () => {
      this.emit('checking-for-update');
    });

    autoUpdater.on('update-available', (info: UpdateInfo) => {
      this.updateStatus = {
        available: true,
        version: info.version,
        releaseNotes: info.releaseNotes as string,
        releaseDate: info.releaseDate,
      };
      
      this.emit('update-available', info);
      this.emit('update-status-changed', this.updateStatus);
      
      // Show notification to user
      this.showUpdateNotification(info);
    });

    autoUpdater.on('update-not-available', (info: UpdateInfo) => {
      this.updateStatus = { available: false };
      this.emit('update-not-available', info);
      this.emit('update-status-changed', this.updateStatus);
    });

    autoUpdater.on('error', (error: Error) => {
      this.updateStatus.error = error.message;
      this.emit('error', error);
      this.emit('update-status-changed', this.updateStatus);
    });

    autoUpdater.on('download-progress', (progress: ProgressInfo) => {
      this.updateStatus.downloadProgress = progress.percent;
      this.updateStatus.downloading = true;
      
      this.emit('download-progress', progress);
      this.emit('update-status-changed', this.updateStatus);
    });

    autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
      this.updateStatus.downloading = false;
      this.updateStatus.downloaded = true;
      this.updateStatus.downloadProgress = 100;
      
      this.emit('update-downloaded', info);
      this.emit('update-status-changed', this.updateStatus);
      
      // Show install notification
      this.showInstallNotification(info);
    });
  }

  /**
   * Show update available notification
   */
  private showUpdateNotification(info: UpdateInfo): void {
    if (!this.mainWindow) return;

    const response = dialog.showMessageBoxSync(this.mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available!`,
      detail: 'Would you like to download it now?',
      buttons: ['Download Now', 'Later'],
      defaultId: 0,
      cancelId: 1,
    });

    if (response === 0) {
      this.downloadUpdate();
    }
  }

  /**
   * Show install notification
   */
  private showInstallNotification(info: UpdateInfo): void {
    if (!this.mainWindow) return;

    const response = dialog.showMessageBoxSync(this.mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: `Update ${info.version} has been downloaded and is ready to install.`,
      detail: 'The application will restart to apply the update.',
      buttons: ['Install Now', 'Install on Next Restart'],
      defaultId: 0,
      cancelId: 1,
    });

    if (response === 0) {
      this.quitAndInstall();
    }
  }

  /**
   * Get update feed URL
   */
  getFeedURL(): string {
    return autoUpdater.getFeedURL();
  }

  /**
   * Set custom update feed URL
   */
  setFeedURL(url: string): void {
    autoUpdater.setFeedURL(url);
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopAutoCheck();
    this.removeAllListeners();
  }
} 