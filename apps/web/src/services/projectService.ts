// apps/web/src/services/projectService.ts
// Project management service leveraging robust @omnipanel packages

"use client";

import { ProjectsService as coreProjectService } from '@omnipanel/core';
import type { Project, ProjectSettings } from '@omnipanel/types';

// File tree node interface for file explorer
export interface FileTreeNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileTreeNode[];
  size?: number;
  lastModified?: Date;
  isExpanded?: boolean;
  isSelected?: boolean;
  icon?: string;
  language?: string;
}

// Project template types
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'web' | 'mobile' | 'desktop' | 'ai' | 'data' | 'other';
  framework?: string;
  language: string[];
  features: string[];
  icon: string;
  config: ProjectTemplateConfig;
}

interface ProjectTemplateConfig {
  files: { path: string; content: string }[];
  dependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  gitignore?: string[];
  readme?: string;
}

// Recent project interface
export interface RecentProject {
  id: string;
  name: string;
  path: string;
  lastOpened: Date;
  type: string;
  description?: string;
  thumbnail?: string;
}

// File system access interface
interface FileSystemFileHandle {
  name: string;
  kind: 'file';
  getFile(): Promise<File>;
  createWritable(): Promise<WritableStream>;
}

interface FileSystemDirectoryHandle {
  name: string;
  kind: 'directory';
  entries(): AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
}

interface WritableStream {
  write(data: string): Promise<void>;
  close(): Promise<void>;
}

declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
    showOpenFilePicker?: (options?: any) => Promise<FileSystemFileHandle[]>;
  }
}

// Project service class
export class ProjectService {
  private static instance: ProjectService;
  private currentProject: Project | null = null;
  private recentProjects: RecentProject[] = [];
  private fileTree: FileTreeNode | null = null;
  private listeners: Set<(project: Project | null) => void> = new Set();

  private constructor() {
    this.loadRecentProjects();
  }

  static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  // File type detection
  private getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      // Code files
      'ts': '📘', 'tsx': '📘', 'js': '📒', 'jsx': '📒',
      'py': '🐍', 'java': '☕', 'cpp': '⚡', 'c': '⚡',
      'rs': '🦀', 'go': '🐹', 'php': '🐘', 'rb': '💎',
      'swift': '🍎', 'kt': '🤖', 'dart': '🎯',
      
      // Web files  
      'html': '🌐', 'css': '🎨', 'scss': '🎨', 'sass': '🎨',
      'vue': '💚', 'svelte': '🧡',
      
      // Config files
      'json': '📋', 'yaml': '📋', 'yml': '📋', 'toml': '📋',
      'xml': '📄', 'ini': '⚙️', 'env': '🔐',
      
      // Documentation
      'md': '📖', 'txt': '📄', 'rst': '📄',
      
      // Data files
      'csv': '📊', 'sql': '🗃️', 'db': '🗃️', 'sqlite': '🗃️',
      
      // Image files
      'png': '🖼️', 'jpg': '🖼️', 'jpeg': '🖼️', 'gif': '🖼️',
      'svg': '🎨', 'ico': '🖼️',
      
      // Other
      'pdf': '📕', 'zip': '📦', 'tar': '📦', 'gz': '📦',
      'log': '📝', 'lock': '🔒'
    };
    
    return iconMap[extension || ''] || '📄';
  }

  private getLanguageFromFileName(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'ts': 'typescript', 'tsx': 'typescript',
      'js': 'javascript', 'jsx': 'javascript',
      'py': 'python', 'java': 'java', 'cpp': 'cpp', 'c': 'c',
      'rs': 'rust', 'go': 'go', 'php': 'php', 'rb': 'ruby',
      'swift': 'swift', 'kt': 'kotlin', 'dart': 'dart',
      'html': 'html', 'css': 'css', 'scss': 'scss',
      'vue': 'vue', 'svelte': 'svelte',
      'json': 'json', 'yaml': 'yaml', 'yml': 'yaml',
      'xml': 'xml', 'md': 'markdown', 'sql': 'sql'
    };
    
    return languageMap[extension || ''] || 'plaintext';
  }

  // File system operations
  async selectProjectDirectory(): Promise<FileSystemDirectoryHandle | null> {
    if (!window.showDirectoryPicker) {
      console.warn('File System Access API not supported');
      return null;
    }

    try {
      return await window.showDirectoryPicker();
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to select directory:', error);
      }
      return null;
    }
  }

  async scanFileSystemDirectory(
    dirHandle: FileSystemDirectoryHandle,
    parentPath: string = ''
  ): Promise<FileTreeNode> {
    const currentPath = parentPath ? `${parentPath}/${dirHandle.name}` : dirHandle.name;
    
    const node: FileTreeNode = {
      id: currentPath,
      name: dirHandle.name,
      type: 'directory',
      path: currentPath,
      isExpanded: false,
      children: []
    };

    try {
      const entries: [string, FileSystemFileHandle | FileSystemDirectoryHandle][] = [];
      
      for await (const entry of dirHandle.entries()) {
        entries.push(entry);
      }

      // Sort entries: directories first, then files alphabetically
      entries.sort(([nameA, handleA], [nameB, handleB]) => {
        if (handleA.kind !== handleB.kind) {
          return handleA.kind === 'directory' ? -1 : 1;
        }
        return nameA.localeCompare(nameB);
      });

      for (const [name, handle] of entries) {
        // Skip hidden files and common ignore patterns
        if (this.shouldSkipFile(name)) {
          continue;
        }

        if (handle.kind === 'directory') {
          const childNode = await this.scanFileSystemDirectory(handle, currentPath);
          node.children!.push(childNode);
        } else {
          const file = await handle.getFile();
          const fileNode: FileTreeNode = {
            id: `${currentPath}/${name}`,
            name,
            type: 'file',
            path: `${currentPath}/${name}`,
            size: file.size,
            lastModified: new Date(file.lastModified),
            icon: this.getFileIcon(name),
            language: this.getLanguageFromFileName(name)
          };
          node.children!.push(fileNode);
        }
      }
    } catch (error) {
      console.error(`Failed to scan directory ${dirHandle.name}:`, error);
    }

    return node;
  }

  private shouldSkipFile(name: string): boolean {
    const skipPatterns = [
      // Hidden files
      /^\./,
      // Node modules
      /^node_modules$/,
      // Build outputs
      /^(dist|build|out|target|\.next|\.nuxt)$/,
      // Version control
      /^\.git$/,
      // IDE files
      /^\.(vscode|idea|eclipse)$/,
      // OS files
      /^(Thumbs\.db|\.DS_Store)$/,
      // Cache directories
      /^(\.cache|\.npm|\.yarn)$/,
      // Python
      /^(__pycache__|\.pyc|\.pyo|\.egg-info)$/,
      // Rust
      /^(target|Cargo\.lock)$/,
      // Java
      /^(target|\.class)$/
    ];

    return skipPatterns.some(pattern => pattern.test(name));
  }

  // Project Templates
  getProjectTemplates(): ProjectTemplate[] {
    return [
      {
        id: 'next-app',
        name: 'Next.js App',
        description: 'Modern React framework with App Router',
        category: 'web',
        framework: 'Next.js',
        language: ['typescript', 'javascript'],
        features: ['SSR', 'Static Generation', 'API Routes', 'Tailwind CSS'],
        icon: '⚡',
        config: {
          files: [
            { path: 'package.json', content: this.generatePackageJson('next-app') },
            { path: 'app/page.tsx', content: this.generateNextPage() },
            { path: 'app/layout.tsx', content: this.generateNextLayout() },
            { path: 'tailwind.config.js', content: this.generateTailwindConfig() },
            { path: 'next.config.js', content: this.generateNextConfig() }
          ],
          gitignore: ['.next', 'node_modules', '.env.local'],
          readme: 'This is a Next.js project created with OmniPanel.'
        }
      },
      {
        id: 'react-app',
        name: 'React App',
        description: 'Single-page React application with Vite',
        category: 'web',
        framework: 'React',
        language: ['typescript', 'javascript'],
        features: ['Vite', 'Hot Reload', 'ESBuild', 'Tailwind CSS'],
        icon: '⚛️',
        config: {
          files: [
            { path: 'package.json', content: this.generatePackageJson('react-app') },
            { path: 'src/App.tsx', content: this.generateReactApp() },
            { path: 'src/main.tsx', content: this.generateReactMain() },
            { path: 'index.html', content: this.generateReactIndex() },
            { path: 'vite.config.ts', content: this.generateViteConfig() }
          ],
          gitignore: ['dist', 'node_modules', '.env.local'],
          readme: 'This is a React project created with OmniPanel.'
        }
      },
      {
        id: 'python-api',
        name: 'Python API',
        description: 'FastAPI backend with PostgreSQL',
        category: 'web',
        framework: 'FastAPI',
        language: ['python'],
        features: ['FastAPI', 'SQLAlchemy', 'Pydantic', 'PostgreSQL'],
        icon: '🐍',
        config: {
          files: [
            { path: 'main.py', content: this.generateFastAPIMain() },
            { path: 'requirements.txt', content: this.generatePythonRequirements() },
            { path: 'models.py', content: this.generateSQLAlchemyModels() },
            { path: 'database.py', content: this.generateDatabaseConfig() }
          ],
          gitignore: ['__pycache__', '.env', 'venv'],
          readme: 'This is a FastAPI project created with OmniPanel.'
        }
      },
      {
        id: 'ai-project',
        name: 'AI/ML Project',
        description: 'Machine learning project with Jupyter notebooks',
        category: 'ai',
        language: ['python'],
        features: ['Jupyter', 'Pandas', 'Scikit-learn', 'Matplotlib'],
        icon: '🤖',
        config: {
          files: [
            { path: 'main.ipynb', content: this.generateJupyterNotebook() },
            { path: 'requirements.txt', content: this.generateMLRequirements() },
            { path: 'data/README.md', content: '# Data Directory\n\nPlace your datasets here.' },
            { path: 'models/README.md', content: '# Models Directory\n\nSave trained models here.' }
          ],
          gitignore: ['*.pkl', '.ipynb_checkpoints', 'data/*.csv'],
          readme: 'This is an AI/ML project created with OmniPanel.'
        }
      }
    ];
  }

  // Project creation methods using File System Access API
  async createProject(template: ProjectTemplate, options: {
    name: string;
    description?: string;
  }): Promise<Project | null> {
    try {
      // Select directory for new project
      const dirHandle = await this.selectProjectDirectory();
      if (!dirHandle) {
        return null;
      }

      // Create the project structure
      await this.generateProjectStructure(dirHandle, template.config);

      // Create project record with correct types
      const project: Project = {
        id: Date.now().toString(),
        name: options.name,
        description: options.description || template.description,
        ownerId: 'current-user', // In real app, get from auth
        visibility: 'private' as const,
        status: 'active' as const,
        settings: {
          allowInvites: true,
          defaultMemberRole: 'contributor' as const,
          aiProvider: template.framework
        },
        metadata: {
          framework: template.framework,
          language: template.language,
          category: template.category,
          template: template.id,
          path: dirHandle.name
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.setCurrentProject(project);
      
      // Load file tree from created project
      const fileTree = await this.scanFileSystemDirectory(dirHandle);
      this.fileTree = fileTree;
      
      // Add to recent projects
      this.addRecentProject({
        id: project.id,
        name: project.name,
        path: dirHandle.name,
        lastOpened: new Date(),
        type: template.name,
        description: project.description
      });

      return project;
    } catch (error) {
      console.error('Failed to create project:', error);
      return null;
    }
  }

  async openProject(): Promise<Project | null> {
    try {
      const dirHandle = await this.selectProjectDirectory();
      if (!dirHandle) {
        return null;
      }

      // Scan the directory to build file tree
      const fileTree = await this.scanFileSystemDirectory(dirHandle);
      this.fileTree = fileTree;

      // Create project record with correct types
      const project: Project = {
        id: Date.now().toString(),
        name: dirHandle.name,
        description: 'Opened from file system',
        ownerId: 'current-user',
        visibility: 'private' as const,
        status: 'active' as const,
        settings: {
          allowInvites: false,
          defaultMemberRole: 'viewer' as const
        },
        metadata: {
          path: dirHandle.name,
          opened: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.setCurrentProject(project);
      
      // Add to recent projects
      this.addRecentProject({
        id: project.id,
        name: project.name,
        path: dirHandle.name,
        lastOpened: new Date(),
        type: 'Opened Project'
      });

      return project;
    } catch (error) {
      console.error('Failed to open project:', error);
      return null;
    }
  }

  async importProject(source: 'github' | 'gitlab' | 'zip', url: string): Promise<Project | null> {
    try {
      // For GitHub/GitLab, we'd use their APIs or git clone
      // For ZIP, we'd download and extract
      // This is a complex operation that would require backend support
      
      const projectName = url.split('/').pop()?.replace('.git', '') || 'Imported Project';
      
      const project: Project = {
        id: Date.now().toString(),
        name: projectName,
        description: `Imported from ${source}`,
        ownerId: 'current-user',
        visibility: 'private' as const,
        status: 'active' as const,
        settings: {
          allowInvites: false,
          defaultMemberRole: 'viewer' as const
        },
        metadata: {
          source,
          sourceUrl: url,
          imported: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.setCurrentProject(project);
      
      return project;
    } catch (error) {
      console.error('Failed to import project:', error);
      return null;
    }
  }

  // Generate project structure using File System Access API
  private async generateProjectStructure(
    dirHandle: FileSystemDirectoryHandle, 
    config: ProjectTemplateConfig
  ): Promise<void> {
    try {
      for (const fileConfig of config.files) {
        const pathParts = fileConfig.path.split('/');
        const fileName = pathParts.pop()!;
        
        // Create subdirectories if needed
        let currentDir = dirHandle;
        for (const dirName of pathParts) {
          try {
            currentDir = await currentDir.getDirectoryHandle(dirName, { create: true });
          } catch (error) {
            console.error(`Failed to create directory ${dirName}:`, error);
          }
        }
        
        // Create the file
        try {
          const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(fileConfig.content);
          await writable.close();
        } catch (error) {
          console.error(`Failed to create file ${fileConfig.path}:`, error);
        }
      }

      // Create .gitignore if specified
      if (config.gitignore) {
        try {
          const gitignoreHandle = await dirHandle.getFileHandle('.gitignore', { create: true });
          const writable = await gitignoreHandle.createWritable();
          await writable.write(config.gitignore.join('\n'));
          await writable.close();
        } catch (error) {
          console.error('Failed to create .gitignore:', error);
        }
      }

      // Create README if specified
      if (config.readme) {
        try {
          const readmeHandle = await dirHandle.getFileHandle('README.md', { create: true });
          const writable = await readmeHandle.createWritable();
          await writable.write(config.readme);
          await writable.close();
        } catch (error) {
          console.error('Failed to create README.md:', error);
        }
      }
    } catch (error) {
      console.error('Failed to generate project structure:', error);
    }
  }

  // Current project management
  getCurrentProject(): Project | null {
    return this.currentProject;
  }

  setCurrentProject(project: Project | null): void {
    this.currentProject = project;
    this.notifyListeners();
    
    if (project) {
      this.updateRecentProject(project.id);
    }
  }

  async closeProject(): Promise<void> {
    this.currentProject = null;
    this.fileTree = null;
    this.notifyListeners();
  }

  // Recent projects
  getRecentProjects(): RecentProject[] {
    return [...this.recentProjects];
  }

  private addRecentProject(project: RecentProject): void {
    // Remove if already exists
    this.recentProjects = this.recentProjects.filter(p => p.id !== project.id);
    
    // Add to beginning
    this.recentProjects.unshift(project);
    
    // Keep only last 10
    this.recentProjects = this.recentProjects.slice(0, 10);
    
    this.saveRecentProjects();
  }

  private updateRecentProject(projectId: string): void {
    const project = this.recentProjects.find(p => p.id === projectId);
    if (project) {
      project.lastOpened = new Date();
      this.saveRecentProjects();
    }
  }

  private loadRecentProjects(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('omnipanel-recent-projects');
      if (stored) {
        this.recentProjects = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load recent projects:', error);
    }
  }

  private saveRecentProjects(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('omnipanel-recent-projects', JSON.stringify(this.recentProjects));
    } catch (error) {
      console.error('Failed to save recent projects:', error);
    }
  }

  // File tree management
  getFileTree(): FileTreeNode | null {
    return this.fileTree;
  }

  toggleNode(nodeId: string): void {
    if (!this.fileTree) return;
    
    const toggleNodeRecursive = (node: FileTreeNode): void => {
      if (node.id === nodeId) {
        node.isExpanded = !node.isExpanded;
        return;
      }
      
      if (node.children) {
        node.children.forEach(toggleNodeRecursive);
      }
    };

    toggleNodeRecursive(this.fileTree);
  }

  selectNode(nodeId: string): void {
    if (!this.fileTree) return;
    
    const selectNodeRecursive = (node: FileTreeNode): void => {
      node.isSelected = node.id === nodeId;
      
      if (node.children) {
        node.children.forEach(selectNodeRecursive);
      }
    };

    selectNodeRecursive(this.fileTree);
  }

  // File content reading
  async readFileContent(filePath: string): Promise<string | null> {
    // This would need to maintain a reference to file handles
    // For now, return null - in a full implementation, we'd store file handles
    // and use them to read file contents
    console.log(`Reading file content for: ${filePath}`);
    return null;
  }

  // Event subscription
  subscribe(listener: (project: Project | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentProject));
  }

  // Template generation methods
  private generatePackageJson(template: string): string {
    const basePackage = {
      name: 'omnipanel-project',
      version: '0.1.0',
      private: true
    };

    switch (template) {
      case 'next-app':
        return JSON.stringify({
          ...basePackage,
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start',
            lint: 'next lint'
          },
          dependencies: {
            next: '^15.0.0',
            react: '^19.0.0',
            'react-dom': '^19.0.0'
          },
          devDependencies: {
            '@types/node': '^22.0.0',
            '@types/react': '^19.0.0',
            '@types/react-dom': '^19.0.0',
            typescript: '^5.0.0',
            tailwindcss: '^3.0.0',
            autoprefixer: '^10.0.0',
            postcss: '^8.0.0'
          }
        }, null, 2);
      case 'react-app':
        return JSON.stringify({
          ...basePackage,
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview'
          },
          dependencies: {
            react: '^19.0.0',
            'react-dom': '^19.0.0'
          },
          devDependencies: {
            '@types/react': '^19.0.0',
            '@types/react-dom': '^19.0.0',
            '@vitejs/plugin-react': '^4.0.0',
            typescript: '^5.0.0',
            vite: '^5.0.0'
          }
        }, null, 2);
      default:
        return JSON.stringify(basePackage, null, 2);
    }
  }

  private generateNextPage(): string {
    return `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold">Welcome to OmniPanel!</h1>
        <p className="mt-4 text-lg">Your Next.js project is ready to go.</p>
      </div>
    </main>
  );
}`;
  }

  private generateNextLayout(): string {
    return `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OmniPanel Project',
  description: 'Created with OmniPanel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`;
  }

  private generateTailwindConfig(): string {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
  }

  private generateNextConfig(): string {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: true,
  },
};

module.exports = nextConfig;`;
  }

  private generateReactApp(): string {
    return `import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to OmniPanel!</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;`;
  }

  private generateReactMain(): string {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`;
  }

  private generateReactIndex(): string {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OmniPanel Project</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
  }

  private generateViteConfig(): string {
    return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`;
  }

  private generateFastAPIMain(): string {
    return `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="OmniPanel API", version="1.0.0")

class Item(BaseModel):
    name: str
    description: str = None
    price: float
    tax: float = None

@app.get("/")
async def root():
    return {"message": "Welcome to OmniPanel API!"}

@app.post("/items/")
async def create_item(item: Item):
    return item`;
  }

  private generatePythonRequirements(): string {
    return `fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
python-multipart==0.0.6`;
  }

  private generateSQLAlchemyModels(): string {
    return `from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)`;
  }

  private generateDatabaseConfig(): string {
    return `from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/dbname")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()`;
  }

  private generateJupyterNotebook(): string {
    return JSON.stringify({
      cells: [
        {
          cell_type: 'markdown',
          metadata: {},
          source: ['# OmniPanel AI/ML Project\n\nWelcome to your machine learning project!']
        },
        {
          cell_type: 'code',
          execution_count: null,
          metadata: {},
          outputs: [],
          source: [
            'import pandas as pd\n',
            'import numpy as np\n',
            'import matplotlib.pyplot as plt\n',
            'from sklearn.model_selection import train_test_split\n',
            '\n',
            'print("Welcome to OmniPanel ML!")'
          ]
        }
      ],
      metadata: {
        kernelspec: {
          display_name: 'Python 3',
          language: 'python',
          name: 'python3'
        }
      },
      nbformat: 4,
      nbformat_minor: 4
    }, null, 2);
  }

  private generateMLRequirements(): string {
    return `pandas==2.1.3
numpy==1.24.3
matplotlib==3.7.2
scikit-learn==1.3.2
jupyter==1.0.0
seaborn==0.12.2
plotly==5.17.0`;
  }
}

// Export singleton instance
export const omnipanelProjectService = ProjectService.getInstance(); 