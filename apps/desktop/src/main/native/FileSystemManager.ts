import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as chokidar from 'chokidar';
import { spawn } from 'child_process';
import { promisify } from 'util';

export interface FileSystemItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: Date;
  extension?: string;
  isHidden?: boolean;
  permissions?: {
    readable: boolean;
    writable: boolean;
    executable: boolean;
  };
  gitStatus?: 'modified' | 'added' | 'deleted' | 'untracked' | 'staged' | 'clean';
}

export interface FileWatchOptions {
  ignored?: string[];
  persistent?: boolean;
  ignoreInitial?: boolean;
  followSymlinks?: boolean;
  depth?: number;
}

export interface ProjectMetadata {
  name: string;
  path: string;
  type: 'ai-workspace' | 'code' | 'notebook' | 'general';
  created: Date;
  lastModified: Date;
  gitRepository?: {
    hasGit: boolean;
    remoteUrl?: string;
    branch?: string;
    status?: string;
  };
  stats: {
    fileCount: number;
    totalSize: number;
    languages: Record<string, number>;
  };
}

export class FileSystemManager {
  private watchers = new Map<string, chokidar.FSWatcher>();
  private projectCache = new Map<string, ProjectMetadata>();

  constructor() {
    // Initialize any required state
  }

  /**
   * Read file contents
   */
  async readFile(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
  }

  /**
   * Write file contents
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      await fs.writeFile(filePath, content, 'utf8');
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${error}`);
    }
  }

  /**
   * Read directory contents with detailed information
   */
  async readDirectory(dirPath: string, includeHidden = false): Promise<FileSystemItem[]> {
    try {
      const items = await fs.readdir(dirPath);
      const results: FileSystemItem[] = [];

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = await fs.stat(itemPath);
        
        // Skip hidden files unless explicitly requested
        if (!includeHidden && item.startsWith('.')) {
          continue;
        }

        const fileItem: FileSystemItem = {
          name: item,
          path: itemPath,
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          modified: stats.mtime,
          extension: stats.isFile() ? path.extname(item).toLowerCase() : undefined,
          isHidden: item.startsWith('.'),
          permissions: await this.getPermissions(itemPath),
        };

        // Add git status if in a git repository
        fileItem.gitStatus = await this.getGitStatus(itemPath);

        results.push(fileItem);
      }

      // Sort: directories first, then files, alphabetically
      return results.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name, undefined, { numeric: true });
      });
    } catch (error) {
      throw new Error(`Failed to read directory ${dirPath}: ${error}`);
    }
  }

  /**
   * Create directory
   */
  async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory ${dirPath}: ${error}`);
    }
  }

  /**
   * Delete file or directory
   */
  async deleteItem(itemPath: string): Promise<void> {
    try {
      const stats = await fs.stat(itemPath);
      if (stats.isDirectory()) {
        await fs.rmdir(itemPath, { recursive: true });
      } else {
        await fs.unlink(itemPath);
      }
    } catch (error) {
      throw new Error(`Failed to delete ${itemPath}: ${error}`);
    }
  }

  /**
   * Move/rename file or directory
   */
  async moveItem(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      // Ensure destination directory exists
      const destDir = path.dirname(destinationPath);
      await fs.mkdir(destDir, { recursive: true });
      
      await fs.rename(sourcePath, destinationPath);
    } catch (error) {
      throw new Error(`Failed to move ${sourcePath} to ${destinationPath}: ${error}`);
    }
  }

  /**
   * Copy file or directory
   */
  async copyItem(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      const stats = await fs.stat(sourcePath);
      
      if (stats.isDirectory()) {
        await this.copyDirectory(sourcePath, destinationPath);
      } else {
        // Ensure destination directory exists
        const destDir = path.dirname(destinationPath);
        await fs.mkdir(destDir, { recursive: true });
        
        await fs.copyFile(sourcePath, destinationPath);
      }
    } catch (error) {
      throw new Error(`Failed to copy ${sourcePath} to ${destinationPath}: ${error}`);
    }
  }

  /**
   * Watch project directory for changes
   */
  async watchProject(projectPath: string, options: FileWatchOptions = {}): Promise<string> {
    const watchId = `project-${Date.now()}`;
    
    const defaultOptions: FileWatchOptions = {
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/.next/**'],
      persistent: true,
      ignoreInitial: true,
      followSymlinks: false,
      depth: 10,
    };

    const watchOptions = { ...defaultOptions, ...options };

    try {
      const watcher = chokidar.watch(projectPath, {
        ignored: watchOptions.ignored,
        persistent: watchOptions.persistent,
        ignoreInitial: watchOptions.ignoreInitial,
        followSymlinks: watchOptions.followSymlinks,
        depth: watchOptions.depth,
      });

      watcher
        .on('add', filePath => this.emitFileEvent('file:added', filePath))
        .on('change', filePath => this.emitFileEvent('file:changed', filePath))
        .on('unlink', filePath => this.emitFileEvent('file:deleted', filePath))
        .on('addDir', dirPath => this.emitFileEvent('directory:added', dirPath))
        .on('unlinkDir', dirPath => this.emitFileEvent('directory:deleted', dirPath))
        .on('error', error => this.emitFileEvent('watch:error', error.message));

      this.watchers.set(watchId, watcher);
      return watchId;
    } catch (error) {
      throw new Error(`Failed to watch project ${projectPath}: ${error}`);
    }
  }

  /**
   * Stop watching a project
   */
  async unwatchProject(watchId: string): Promise<void> {
    const watcher = this.watchers.get(watchId);
    if (watcher) {
      await watcher.close();
      this.watchers.delete(watchId);
    }
  }

  /**
   * Get project metadata
   */
  async getProjectMetadata(projectPath: string): Promise<ProjectMetadata> {
    const cached = this.projectCache.get(projectPath);
    if (cached) {
      return cached;
    }

    try {
      const stats = await fs.stat(projectPath);
      const projectName = path.basename(projectPath);
      
      const metadata: ProjectMetadata = {
        name: projectName,
        path: projectPath,
        type: await this.inferProjectType(projectPath),
        created: stats.birthtime,
        lastModified: stats.mtime,
        gitRepository: await this.getGitInfo(projectPath),
        stats: await this.getProjectStats(projectPath),
      };

      this.projectCache.set(projectPath, metadata);
      return metadata;
    } catch (error) {
      throw new Error(`Failed to get project metadata for ${projectPath}: ${error}`);
    }
  }

  /**
   * Search files in directory
   */
  async searchFiles(
    dirPath: string, 
    query: string, 
    options: { 
      includeContent?: boolean; 
      fileTypes?: string[]; 
      maxResults?: number;
      caseSensitive?: boolean;
    } = {}
  ): Promise<Array<{ path: string; matches?: number; preview?: string }>> {
    const results: Array<{ path: string; matches?: number; preview?: string }> = [];
    const { includeContent = false, fileTypes, maxResults = 100, caseSensitive = false } = options;
    
    const searchQuery = caseSensitive ? query : query.toLowerCase();

    async function searchRecursively(currentPath: string) {
      if (results.length >= maxResults) return;

      try {
        const items = await fs.readdir(currentPath);
        
        for (const item of items) {
          if (results.length >= maxResults) break;
          
          const itemPath = path.join(currentPath, item);
          const stats = await fs.stat(itemPath);
          
          // Skip hidden files and common ignore patterns
          if (item.startsWith('.') || item === 'node_modules' || item === 'dist') {
            continue;
          }

          if (stats.isDirectory()) {
            await searchRecursively(itemPath);
          } else if (stats.isFile()) {
            const fileName = caseSensitive ? item : item.toLowerCase();
            const extension = path.extname(item).toLowerCase();
            
            // Filter by file types if specified
            if (fileTypes && !fileTypes.includes(extension)) {
              continue;
            }

            // Check filename match
            if (fileName.includes(searchQuery)) {
              results.push({ path: itemPath });
              continue;
            }

            // Check content match if requested
            if (includeContent && this.isTextFile(extension)) {
              try {
                const content = await fs.readFile(itemPath, 'utf8');
                const searchContent = caseSensitive ? content : content.toLowerCase();
                
                if (searchContent.includes(searchQuery)) {
                  const matches = (searchContent.match(new RegExp(searchQuery, caseSensitive ? 'g' : 'gi')) || []).length;
                  const preview = this.getSearchPreview(content, query, caseSensitive);
                  
                  results.push({ 
                    path: itemPath, 
                    matches,
                    preview 
                  });
                }
              } catch (error) {
                // Ignore files that can't be read
              }
            }
          }
        }
      } catch (error) {
        // Ignore directories that can't be read
      }
    }

    await searchRecursively(dirPath);
    return results;
  }

  /**
   * Get file permissions
   */
  private async getPermissions(filePath: string): Promise<{ readable: boolean; writable: boolean; executable: boolean }> {
    try {
      await fs.access(filePath, fsSync.constants.R_OK);
      const readable = true;
      
      let writable = false;
      try {
        await fs.access(filePath, fsSync.constants.W_OK);
        writable = true;
      } catch {
        // File is not writable
      }
      
      let executable = false;
      try {
        await fs.access(filePath, fsSync.constants.X_OK);
        executable = true;
      } catch {
        // File is not executable
      }

      return { readable, writable, executable };
    } catch {
      return { readable: false, writable: false, executable: false };
    }
  }

  /**
   * Get git status for a file/directory
   */
  private async getGitStatus(itemPath: string): Promise<'modified' | 'added' | 'deleted' | 'untracked' | 'staged' | 'clean' | undefined> {
    try {
      // Check if we're in a git repository
      const gitRoot = await this.findGitRoot(itemPath);
      if (!gitRoot) return undefined;

      // Get relative path from git root
      const relativePath = path.relative(gitRoot, itemPath);
      
      // Run git status on the specific file
      const { stdout } = await this.execCommand('git', ['status', '--porcelain', relativePath], { cwd: gitRoot });
      
      if (!stdout.trim()) return 'clean';

      const statusCode = stdout.trim().substring(0, 2);
      
      // Parse git status codes
      if (statusCode.includes('M')) return 'modified';
      if (statusCode.includes('A')) return 'added';
      if (statusCode.includes('D')) return 'deleted';
      if (statusCode.includes('??')) return 'untracked';
      if (statusCode.includes('R') || statusCode.includes('C')) return 'staged';
      
      return 'clean';
    } catch {
      return undefined;
    }
  }

  /**
   * Get git repository information
   */
  private async getGitInfo(projectPath: string): Promise<ProjectMetadata['gitRepository']> {
    try {
      const gitRoot = await this.findGitRoot(projectPath);
      if (!gitRoot) {
        return { hasGit: false };
      }

      const [remoteResult, branchResult, statusResult] = await Promise.allSettled([
        this.execCommand('git', ['remote', 'get-url', 'origin'], { cwd: gitRoot }),
        this.execCommand('git', ['branch', '--show-current'], { cwd: gitRoot }),
        this.execCommand('git', ['status', '--porcelain'], { cwd: gitRoot }),
      ]);

      return {
        hasGit: true,
        remoteUrl: remoteResult.status === 'fulfilled' ? remoteResult.value.stdout.trim() : undefined,
        branch: branchResult.status === 'fulfilled' ? branchResult.value.stdout.trim() : undefined,
        status: statusResult.status === 'fulfilled' ? 
          (statusResult.value.stdout.trim() ? 'dirty' : 'clean') : undefined,
      };
    } catch {
      return { hasGit: false };
    }
  }

  /**
   * Find git root directory
   */
  private async findGitRoot(startPath: string): Promise<string | null> {
    let currentPath = startPath;
    
    while (currentPath !== path.dirname(currentPath)) {
      try {
        const gitPath = path.join(currentPath, '.git');
        await fs.access(gitPath);
        return currentPath;
      } catch {
        currentPath = path.dirname(currentPath);
      }
    }
    
    return null;
  }

  /**
   * Infer project type based on files and structure
   */
  private async inferProjectType(projectPath: string): Promise<ProjectMetadata['type']> {
    try {
      const files = await fs.readdir(projectPath);
      
      // Check for specific project indicators
      if (files.includes('package.json') || files.includes('yarn.lock') || files.includes('pnpm-lock.yaml')) {
        return 'code';
      }
      
      if (files.some(f => f.endsWith('.ipynb'))) {
        return 'notebook';
      }
      
      if (files.includes('omnipanel.json') || files.includes('.omnipanel')) {
        return 'ai-workspace';
      }
      
      return 'general';
    } catch {
      return 'general';
    }
  }

  /**
   * Get project statistics
   */
  private async getProjectStats(projectPath: string): Promise<ProjectMetadata['stats']> {
    const stats = {
      fileCount: 0,
      totalSize: 0,
      languages: {} as Record<string, number>,
    };

    const languageExtensions: Record<string, string> = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.jsx': 'React',
      '.tsx': 'React',
      '.py': 'Python',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C',
      '.cs': 'C#',
      '.go': 'Go',
      '.rs': 'Rust',
      '.php': 'PHP',
      '.rb': 'Ruby',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
      '.scala': 'Scala',
      '.r': 'R',
      '.sql': 'SQL',
      '.html': 'HTML',
      '.css': 'CSS',
      '.scss': 'SCSS',
      '.less': 'LESS',
      '.vue': 'Vue',
      '.md': 'Markdown',
      '.json': 'JSON',
      '.xml': 'XML',
      '.yaml': 'YAML',
      '.yml': 'YAML',
    };

    async function analyzeDirectory(dirPath: string) {
      try {
        const items = await fs.readdir(dirPath);
        
        for (const item of items) {
          if (item.startsWith('.') || item === 'node_modules' || item === 'dist') {
            continue;
          }
          
          const itemPath = path.join(dirPath, item);
          const itemStats = await fs.stat(itemPath);
          
          if (itemStats.isDirectory()) {
            await analyzeDirectory(itemPath);
          } else {
            stats.fileCount++;
            stats.totalSize += itemStats.size;
            
            const extension = path.extname(item).toLowerCase();
            const language = languageExtensions[extension];
            
            if (language) {
              stats.languages[language] = (stats.languages[language] || 0) + 1;
            }
          }
        }
      } catch {
        // Ignore directories that can't be read
      }
    }

    await analyzeDirectory(projectPath);
    return stats;
  }

  /**
   * Copy directory recursively
   */
  private async copyDirectory(sourcePath: string, destinationPath: string): Promise<void> {
    await fs.mkdir(destinationPath, { recursive: true });
    
    const items = await fs.readdir(sourcePath);
    
    for (const item of items) {
      const sourceItemPath = path.join(sourcePath, item);
      const destItemPath = path.join(destinationPath, item);
      const stats = await fs.stat(sourceItemPath);
      
      if (stats.isDirectory()) {
        await this.copyDirectory(sourceItemPath, destItemPath);
      } else {
        await fs.copyFile(sourceItemPath, destItemPath);
      }
    }
  }

  /**
   * Check if file is a text file based on extension
   */
  private isTextFile(extension: string): boolean {
    const textExtensions = [
      '.txt', '.md', '.json', '.xml', '.yaml', '.yml', '.toml', '.ini', '.cfg',
      '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.go',
      '.rs', '.php', '.rb', '.swift', '.kt', '.scala', '.r', '.sql', '.html',
      '.css', '.scss', '.less', '.vue', '.svelte', '.sh', '.bash', '.zsh',
      '.ps1', '.bat', '.cmd', '.dockerfile', '.gitignore', '.gitattributes'
    ];
    
    return textExtensions.includes(extension.toLowerCase());
  }

  /**
   * Get search preview around matched text
   */
  private getSearchPreview(content: string, query: string, caseSensitive: boolean): string {
    const searchContent = caseSensitive ? content : content.toLowerCase();
    const searchQuery = caseSensitive ? query : query.toLowerCase();
    
    const index = searchContent.indexOf(searchQuery);
    if (index === -1) return '';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 50);
    
    return content.substring(start, end).replace(/\n/g, ' ').trim();
  }

  /**
   * Execute a command and return the result
   */
  private async execCommand(command: string, args: string[], options: { cwd: string }): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { 
        cwd: options.cwd,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
      
      child.on('error', reject);
    });
  }

  /**
   * Emit file system events to the renderer process
   */
  private emitFileEvent(event: string, data: any): void {
    // This would be connected to the main window to send events
    // For now, we'll just log them
    console.log(`File event: ${event}`, data);
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    // Close all watchers
    for (const [watchId, watcher] of this.watchers) {
      await watcher.close();
    }
    this.watchers.clear();
    this.projectCache.clear();
  }
} 