// apps/web/src/services/fileSystemService.ts
// Real-time file system monitoring and operations service

import { configService } from './configService';
import { contextService } from './contextService';

export interface FileSystemEntry {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified: Date;
  created: Date;
  permissions: {
    read: boolean;
    write: boolean;
    execute: boolean;
  };
  metadata: {
    encoding?: string;
    mimeType?: string;
    language?: string;
    lines?: number;
    isSymlink?: boolean;
    target?: string;
    isHidden?: boolean;
    isGitTracked?: boolean;
    gitStatus?: 'modified' | 'added' | 'deleted' | 'untracked';
  };
  children?: FileSystemEntry[];
}

export interface FileWatchEvent {
  type: 'created' | 'modified' | 'deleted' | 'moved';
  path: string;
  oldPath?: string;
  timestamp: Date;
  entry?: FileSystemEntry;
}

export interface FileSystemStats {
  totalFiles: number;
  totalDirectories: number;
  totalSize: number;
  lastModified: Date;
  gitTrackedFiles: number;
  modifiedFiles: number;
  languages: Record<string, number>;
}

type FileWatchCallback = (event: FileWatchEvent) => void;
type FileSystemChangeCallback = (stats: FileSystemStats) => void;

class FileSystemService {
  private watchers: Map<string, FileWatchCallback[]> = new Map();
  private changeListeners: FileSystemChangeCallback[] = [];
  private fileSystemCache: Map<string, FileSystemEntry> = new Map();
  private watcherInstance: FileSystemWatcher | null = null;
  private isInitialized = false;
  private currentStats: FileSystemStats | null = null;

  constructor() {
    this.initializeFileSystem();
  }

  // Initialize file system monitoring
  private async initializeFileSystem(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check for File System Access API support
      if ('showDirectoryPicker' in window) {
        console.log('File System Access API supported');
      } else {
        console.log('File System Access API not supported, using mock implementation');
      }

      // Initialize with mock file system for demo
      await this.loadMockFileSystem();
      
      // Start file watching
      this.startFileWatching();
      
      this.isInitialized = true;
      console.log('File system service initialized');
      
    } catch (error) {
      console.error('Failed to initialize file system service:', error);
    }
  }

  // Load mock file system data
  private async loadMockFileSystem(): Promise<void> {
    const mockEntries: FileSystemEntry[] = [
      {
        id: 'root',
        name: 'omnipanel-project',
        path: '/',
        type: 'directory',
        lastModified: new Date(),
        created: new Date(Date.now() - 86400000 * 30), // 30 days ago
        permissions: { read: true, write: true, execute: true },
        metadata: { isGitTracked: true },
        children: [
          {
            id: 'src',
            name: 'src',
            path: '/src',
            type: 'directory',
            lastModified: new Date(),
            created: new Date(Date.now() - 86400000 * 25),
            permissions: { read: true, write: true, execute: true },
            metadata: { isGitTracked: true },
            children: [
              {
                id: 'components',
                name: 'components',
                path: '/src/components',
                type: 'directory',
                lastModified: new Date(),
                created: new Date(Date.now() - 86400000 * 20),
                permissions: { read: true, write: true, execute: true },
                metadata: { isGitTracked: true },
                children: [
                  {
                    id: 'chat-tsx',
                    name: 'Chat.tsx',
                    path: '/src/components/Chat.tsx',
                    type: 'file',
                    size: 2048,
                    lastModified: new Date(Date.now() - 3600000), // 1 hour ago
                    created: new Date(Date.now() - 86400000 * 15),
                    permissions: { read: true, write: true, execute: false },
                    metadata: {
                      encoding: 'utf-8',
                      mimeType: 'text/typescript',
                      language: 'typescript',
                      lines: 85,
                      isGitTracked: true,
                      gitStatus: 'modified'
                    }
                  },
                  {
                    id: 'filetree-tsx',
                    name: 'FileTree.tsx',
                    path: '/src/components/FileTree.tsx',
                    type: 'file',
                    size: 15360,
                    lastModified: new Date(Date.now() - 1800000), // 30 minutes ago
                    created: new Date(Date.now() - 86400000 * 10),
                    permissions: { read: true, write: true, execute: false },
                    metadata: {
                      encoding: 'utf-8',
                      mimeType: 'text/typescript',
                      language: 'typescript',
                      lines: 560,
                      isGitTracked: true,
                      gitStatus: 'modified'
                    }
                  }
                ]
              },
              {
                id: 'services',
                name: 'services',
                path: '/src/services',
                type: 'directory',
                lastModified: new Date(),
                created: new Date(Date.now() - 86400000 * 5),
                permissions: { read: true, write: true, execute: true },
                metadata: { isGitTracked: true },
                children: [
                  {
                    id: 'context-service',
                    name: 'contextService.ts',
                    path: '/src/services/contextService.ts',
                    type: 'file',
                    size: 8192,
                    lastModified: new Date(Date.now() - 900000), // 15 minutes ago
                    created: new Date(Date.now() - 86400000 * 2),
                    permissions: { read: true, write: true, execute: false },
                    metadata: {
                      encoding: 'utf-8',
                      mimeType: 'text/typescript',
                      language: 'typescript',
                      lines: 245,
                      isGitTracked: true,
                      gitStatus: 'added'
                    }
                  },
                  {
                    id: 'filesystem-service',
                    name: 'fileSystemService.ts',
                    path: '/src/services/fileSystemService.ts',
                    type: 'file',
                    size: 12288,
                    lastModified: new Date(), // Just now
                    created: new Date(),
                    permissions: { read: true, write: true, execute: false },
                    metadata: {
                      encoding: 'utf-8',
                      mimeType: 'text/typescript',
                      language: 'typescript',
                      lines: 380,
                      isGitTracked: false,
                      gitStatus: 'untracked'
                    }
                  }
                ]
              }
            ]
          },
          {
            id: 'package-json',
            name: 'package.json',
            path: '/package.json',
            type: 'file',
            size: 2048,
            lastModified: new Date(Date.now() - 7200000), // 2 hours ago
            created: new Date(Date.now() - 86400000 * 30),
            permissions: { read: true, write: true, execute: false },
            metadata: {
              encoding: 'utf-8',
              mimeType: 'application/json',
              language: 'json',
              lines: 45,
              isGitTracked: true
            }
          },
          {
            id: 'env-local',
            name: '.env.local',
            path: '/.env.local',
            type: 'file',
            size: 256,
            lastModified: new Date(Date.now() - 86400000), // 1 day ago
            created: new Date(Date.now() - 86400000 * 7),
            permissions: { read: true, write: true, execute: false },
            metadata: {
              encoding: 'utf-8',
              mimeType: 'text/plain',
              language: 'env',
              lines: 8,
              isHidden: true,
              isGitTracked: false,
              gitStatus: 'untracked'
            }
          }
        ]
      }
    ];

    // Cache all entries
    const cacheEntry = (entry: FileSystemEntry) => {
      this.fileSystemCache.set(entry.path, entry);
      if (entry.children) {
        entry.children.forEach(cacheEntry);
      }
    };

    mockEntries.forEach(cacheEntry);
    
    // Calculate initial stats
    this.updateStats();
  }

  // Start file watching
  private startFileWatching(): void {
    // Mock file watcher - in real implementation, use File System Access API
    const mockWatcher = {
      addEventListener: (event: string, callback: () => void) => {
        const interval = setInterval(() => {
          if (Math.random() > 0.98) { // 2% chance of file change
            this.simulateFileChange();
          }
        }, 5000);
        
        return () => clearInterval(interval);
      }
    } as any;

    this.watcherInstance = mockWatcher;
    
    // Start watching
    mockWatcher.addEventListener('change', () => {
      this.updateStats();
    });
  }

  // Simulate file changes for demo
  private simulateFileChange(): void {
    const files = Array.from(this.fileSystemCache.values()).filter(entry => entry.type === 'file');
    if (files.length === 0) return;

    const randomFile = files[Math.floor(Math.random() * files.length)];
    const changeTypes: FileWatchEvent['type'][] = ['modified', 'created', 'deleted'];
    const changeType = changeTypes[Math.floor(Math.random() * changeTypes.length)];

    // Update file metadata
    if (changeType === 'modified') {
      randomFile.lastModified = new Date();
      randomFile.metadata.gitStatus = 'modified';
      
      // Update cache
      this.fileSystemCache.set(randomFile.path, randomFile);
    }

    // Emit watch event
    const event: FileWatchEvent = {
      type: changeType,
      path: randomFile.path,
      timestamp: new Date(),
      entry: randomFile
    };

    this.emitWatchEvent(event);
    
    // Add to context service
    if (changeType === 'modified') {
      contextService.addFile({
        path: randomFile.path,
        name: randomFile.name,
        type: 'file',
        language: randomFile.metadata.language,
        size: randomFile.size,
        lastModified: randomFile.lastModified
      });
    }
  }

  // Emit watch event to listeners
  private emitWatchEvent(event: FileWatchEvent): void {
    const pathWatchers = this.watchers.get(event.path) || [];
    const globalWatchers = this.watchers.get('*') || [];
    
    [...pathWatchers, ...globalWatchers].forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in file watch callback:', error);
      }
    });
  }

  // Update file system statistics
  private updateStats(): void {
    const allEntries = Array.from(this.fileSystemCache.values());
    const files = allEntries.filter(entry => entry.type === 'file');
    const directories = allEntries.filter(entry => entry.type === 'directory');

    const stats: FileSystemStats = {
      totalFiles: files.length,
      totalDirectories: directories.length,
      totalSize: files.reduce((sum, file) => sum + (file.size || 0), 0),
      lastModified: new Date(Math.max(...files.map(f => f.lastModified.getTime()))),
      gitTrackedFiles: files.filter(f => f.metadata.isGitTracked).length,
      modifiedFiles: files.filter(f => f.metadata.gitStatus === 'modified').length,
      languages: files.reduce((acc, file) => {
        const lang = file.metadata.language || 'unknown';
        acc[lang] = (acc[lang] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    this.currentStats = stats;
    
    // Notify change listeners
    this.changeListeners.forEach(callback => {
      try {
        callback(stats);
      } catch (error) {
        console.error('Error in file system change callback:', error);
      }
    });
  }

  // Public API methods

  // Get file system entry by path
  async getEntry(path: string): Promise<FileSystemEntry | null> {
    await this.initializeFileSystem();
    return this.fileSystemCache.get(path) || null;
  }

  // Get directory contents
  async getDirectoryContents(path: string): Promise<FileSystemEntry[]> {
    await this.initializeFileSystem();
    const entry = this.fileSystemCache.get(path);
    
    if (!entry || entry.type !== 'directory') {
      throw new Error(`Directory not found: ${path}`);
    }
    
    return entry.children || [];
  }

  // Get file system tree
  async getFileSystemTree(rootPath: string = '/'): Promise<FileSystemEntry | null> {
    await this.initializeFileSystem();
    return this.fileSystemCache.get(rootPath) || null;
  }

  // Search files
  async searchFiles(query: string, options: {
    includeContent?: boolean;
    fileTypes?: string[];
    maxResults?: number;
  } = {}): Promise<FileSystemEntry[]> {
    await this.initializeFileSystem();
    
    const { includeContent = false, fileTypes = [], maxResults = 50 } = options;
    const allFiles = Array.from(this.fileSystemCache.values()).filter(entry => entry.type === 'file');
    
    let results = allFiles.filter(file => {
      // Name match
      const nameMatch = file.name.toLowerCase().includes(query.toLowerCase());
      
      // Type filter
      const typeMatch = fileTypes.length === 0 || 
        (file.metadata.language && fileTypes.includes(file.metadata.language));
      
      return nameMatch && typeMatch;
    });

    // Sort by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === query.toLowerCase() ? 1 : 0;
      const bExact = b.name.toLowerCase() === query.toLowerCase() ? 1 : 0;
      return bExact - aExact;
    });

    return results.slice(0, maxResults);
  }

  // Watch file or directory changes
  watchPath(path: string, callback: FileWatchCallback): () => void {
    if (!this.watchers.has(path)) {
      this.watchers.set(path, []);
    }
    
    this.watchers.get(path)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.watchers.get(path);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
        
        if (callbacks.length === 0) {
          this.watchers.delete(path);
        }
      }
    };
  }

  // Watch all file system changes
  watchFileSystem(callback: FileSystemChangeCallback): () => void {
    this.changeListeners.push(callback);
    
    // Send current stats immediately
    if (this.currentStats) {
      callback(this.currentStats);
    }
    
    // Return unsubscribe function
    return () => {
      const index = this.changeListeners.indexOf(callback);
      if (index > -1) {
        this.changeListeners.splice(index, 1);
      }
    };
  }

  // Get current file system statistics
  async getStats(): Promise<FileSystemStats | null> {
    await this.initializeFileSystem();
    return this.currentStats;
  }

  // Create file or directory
  async createEntry(path: string, type: 'file' | 'directory', content?: string): Promise<FileSystemEntry> {
    await this.initializeFileSystem();
    
    const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
    const name = path.substring(path.lastIndexOf('/') + 1);
    
    const newEntry: FileSystemEntry = {
      id: `${type}-${Date.now()}`,
      name,
      path,
      type,
      size: type === 'file' ? (content?.length || 0) : undefined,
      lastModified: new Date(),
      created: new Date(),
      permissions: { read: true, write: true, execute: type === 'directory' },
      metadata: {
        encoding: type === 'file' ? 'utf-8' : undefined,
        mimeType: type === 'file' ? this.getMimeType(name) : undefined,
        language: type === 'file' ? this.getLanguage(name) : undefined,
        lines: type === 'file' && content ? content.split('\n').length : undefined,
        isGitTracked: false,
        gitStatus: 'untracked'
      },
      children: type === 'directory' ? [] : undefined
    };

    // Add to cache
    this.fileSystemCache.set(path, newEntry);
    
    // Update parent directory
    const parent = this.fileSystemCache.get(parentPath);
    if (parent && parent.type === 'directory') {
      parent.children = parent.children || [];
      parent.children.push(newEntry);
      parent.lastModified = new Date();
    }

    // Emit watch event
    this.emitWatchEvent({
      type: 'created',
      path,
      timestamp: new Date(),
      entry: newEntry
    });

    this.updateStats();
    return newEntry;
  }

  // Delete file or directory
  async deleteEntry(path: string): Promise<void> {
    await this.initializeFileSystem();
    
    const entry = this.fileSystemCache.get(path);
    if (!entry) {
      throw new Error(`Entry not found: ${path}`);
    }

    // Remove from cache
    this.fileSystemCache.delete(path);
    
    // Remove from parent
    const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
    const parent = this.fileSystemCache.get(parentPath);
    if (parent && parent.type === 'directory' && parent.children) {
      parent.children = parent.children.filter(child => child.path !== path);
      parent.lastModified = new Date();
    }

    // Remove from context service
    contextService.removeFile(path);

    // Emit watch event
    this.emitWatchEvent({
      type: 'deleted',
      path,
      timestamp: new Date(),
      entry
    });

    this.updateStats();
  }

  // Move/rename file or directory
  async moveEntry(oldPath: string, newPath: string): Promise<FileSystemEntry> {
    await this.initializeFileSystem();
    
    const entry = this.fileSystemCache.get(oldPath);
    if (!entry) {
      throw new Error(`Entry not found: ${oldPath}`);
    }

    // Update entry
    const newName = newPath.substring(newPath.lastIndexOf('/') + 1);
    const updatedEntry: FileSystemEntry = {
      ...entry,
      name: newName,
      path: newPath,
      lastModified: new Date()
    };

    // Update cache
    this.fileSystemCache.delete(oldPath);
    this.fileSystemCache.set(newPath, updatedEntry);

    // Update parent directories
    const oldParentPath = oldPath.substring(0, oldPath.lastIndexOf('/')) || '/';
    const newParentPath = newPath.substring(0, newPath.lastIndexOf('/')) || '/';
    
    // Remove from old parent
    const oldParent = this.fileSystemCache.get(oldParentPath);
    if (oldParent && oldParent.type === 'directory' && oldParent.children) {
      oldParent.children = oldParent.children.filter(child => child.path !== oldPath);
      oldParent.lastModified = new Date();
    }
    
    // Add to new parent
    const newParent = this.fileSystemCache.get(newParentPath);
    if (newParent && newParent.type === 'directory') {
      newParent.children = newParent.children || [];
      newParent.children.push(updatedEntry);
      newParent.lastModified = new Date();
    }

    // Update context service
    if (entry.type === 'file') {
      contextService.removeFile(oldPath);
      contextService.addFile({
        path: newPath,
        name: newName,
        type: 'file',
        language: entry.metadata.language,
        size: entry.size,
        lastModified: updatedEntry.lastModified
      });
    }

    // Emit watch event
    this.emitWatchEvent({
      type: 'moved',
      path: newPath,
      oldPath,
      timestamp: new Date(),
      entry: updatedEntry
    });

    this.updateStats();
    return updatedEntry;
  }

  // Utility methods
  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'ts': 'text/typescript',
      'tsx': 'text/typescript',
      'js': 'text/javascript',
      'jsx': 'text/javascript',
      'json': 'application/json',
      'css': 'text/css',
      'html': 'text/html',
      'md': 'text/markdown',
      'txt': 'text/plain',
      'svg': 'image/svg+xml',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg'
    };
    
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  private getLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languages: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'json': 'json',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'html': 'html',
      'md': 'markdown',
      'py': 'python',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
      'sql': 'sql',
      'sh': 'shell',
      'yml': 'yaml',
      'yaml': 'yaml',
      'xml': 'xml',
      'svg': 'svg'
    };
    
    return languages[ext || ''] || 'text';
  }

  // Cleanup
  destroy(): void {
    this.watchers.clear();
    this.changeListeners.length = 0;
    this.fileSystemCache.clear();
    this.watcherInstance = null;
    this.isInitialized = false;
  }
}

// Export singleton instance
export const fileSystemService = new FileSystemService(); 