// apps/web/src/services/projectService.ts
// Project management service for handling project operations, recent projects, and project-specific settings

"use client";

import { ProjectsService as coreProjectService } from '@omnipanel/core';
import type { ProjectSettings } from '@omnipanel/types';
import { fileSystemService, type FileSystemStats } from './fileSystemService';
import { contextService } from './contextService';

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
  devDependencies?: Record<string, string>;
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

// Local Project interface with path property
export interface Project {
  id: string;
  name: string;
  description: string;
  path: string;
  visibility: 'private' | 'public';
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  settings: LocalProjectSettings;
  metadata: ProjectMetadata;
}

// Extended ProjectSettings with additional local properties
export interface LocalProjectSettings extends Partial<ProjectSettings> {
  theme?: 'dark' | 'light';
  aiModel?: string;
  autoSave?: boolean;
  gitIntegration?: boolean;
  linting?: boolean;
  formatting?: boolean;
  extensions?: string[];
  environment?: Record<string, string>;
  buildCommand?: string;
  startCommand?: string;
  testCommand?: string;
}

export interface ProjectMetadata {
  fileCount: number;
  totalSize: number;
  languages: string[];
  gitRepository?: string;
  gitBranch?: string;
  lastCommit?: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  framework?: string;
  version?: string;
}

export interface CreateProjectOptions {
  name: string;
  description?: string;
  path: string;
  template?: ProjectTemplate;
  gitInit?: boolean;
  visibility?: 'private' | 'public';
}

export interface OpenProjectOptions {
  path: string;
  addToRecent?: boolean;
  loadSettings?: boolean;
}

export interface ProjectSearchOptions {
  query?: string;
  visibility?: 'private' | 'public' | 'all';
  sortBy?: 'name' | 'lastAccessed' | 'created' | 'updated';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
}

class ProjectService {
  closeProject(arg0: { path: string; }) {
      throw new Error('Method not implemented.');
  }
  refreshProject() {
      throw new Error('Method not implemented.');
  }
  private projects: Map<string, Project> = new Map();
  private recentProjects: Project[] = [];
  private currentProject: Project | null = null;
  private maxRecentProjects = 10;

  // Project templates
  private templates: ProjectTemplate[] = [
    {
      id: 'react-typescript',
      name: 'React TypeScript',
      description: 'Modern React application with TypeScript',
      category: 'web',
      framework: 'React',
      language: ['typescript'],
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
      id: 'nextjs-typescript',
      name: 'Next.js TypeScript',
      description: 'Full-stack Next.js application with TypeScript',
      category: 'web',
      framework: 'Next.js',
      language: ['typescript'],
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
      id: 'python-data-science',
      name: 'Python Data Science',
      description: 'Python project for data science and machine learning',
      category: 'data',
      language: ['python'],
      features: ['Jupyter', 'Pandas', 'Scikit-learn', 'Matplotlib'],
      icon: '🐍',
      config: {
        files: [
          { path: 'requirements.txt', content: this.generatePythonRequirements() },
          { path: 'main.py', content: this.generateFastAPIMain() },
          { path: 'analysis.ipynb', content: this.generateJupyterNotebook() },
          { path: 'README.md', content: this.generateDataScienceReadme() }
        ],
        gitignore: ['__pycache__', '.env', 'venv'],
        readme: 'This is a Python project created with OmniPanel.'
      }
    },
    {
      id: 'empty',
      name: 'Empty Project',
      description: 'Start with a clean slate',
      category: 'other',
      language: [],
      features: [],
      icon: '📄',
      config: {
        files: [],
        gitignore: [],
        readme: 'This is an empty project created with OmniPanel.'
      }
    }
  ];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Create a new project with optional template
   */
  async createProject(options: CreateProjectOptions): Promise<Project> {
    try {
      const projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();

      // Create project metadata
      const project: Project = {
        id: projectId,
        name: options.name,
        description: options.description || '',
        path: options.path,
        visibility: options.visibility || 'private',
        ownerId: 'current-user', // In real app, get from auth
        createdAt: now,
        updatedAt: now,
        lastAccessedAt: now,
        settings: this.getDefaultSettings(),
        metadata: {
          fileCount: 0,
          totalSize: 0,
          languages: [],
          dependencies: {},
          devDependencies: {}
        }
      };

      // Apply template if specified
      if (options.template) {
        await this.applyTemplate(project, options.template);
      }

      // Initialize file system
      try {
        await fileSystemService.createEntry(options.path, 'directory');
      } catch (error) {
        console.warn('Failed to create directory:', error);
      }

      // Create project files from template
      if (options.template) {
        for (const file of options.template.config.files) {
          const fullPath = `${options.path}/${file.path}`;
          try {
            await fileSystemService.createEntry(fullPath, 'file', file.content);
          } catch (error) {
            console.warn('Failed to create file:', error);
          }
        }
      }

      // Initialize git if requested
      if (options.gitInit) {
        await this.initializeGit(project);
      }

      // Update metadata
      await this.updateProjectMetadata(project);

      // Store project
      this.projects.set(projectId, project);
      this.addToRecentProjects(project);
      this.saveToStorage();

      // Update context service
      if (contextService) {
        contextService.updateProject({
          id: project.id,
          name: project.name,
          rootPath: project.path,
          type: 'other'
        });
      }

      return project;
    } catch (error) {
      throw new Error(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Open an existing project
   */
  async openProject(options: OpenProjectOptions): Promise<Project> {
    try {
      // Check if project already exists in memory
      const existingProject = Array.from(this.projects.values())
        .find(p => p.path === options.path);

      if (existingProject) {
        existingProject.lastAccessedAt = new Date();
        if (options.addToRecent !== false) {
          this.addToRecentProjects(existingProject);
        }
        this.currentProject = existingProject;
        this.saveToStorage();
        return existingProject;
      }

      // Verify path exists
      const entry = await fileSystemService.getEntry(options.path);
      if (!entry) {
        throw new Error(`Project path does not exist: ${options.path}`);
      }

      // Create project from existing directory
      const projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const projectName = options.path.split('/').pop() || 'Untitled Project';

      const project: Project = {
        id: projectId,
        name: projectName,
        description: `Opened from ${options.path}`,
        path: options.path,
        visibility: 'private',
        ownerId: 'current-user',
        createdAt: entry.created || now,
        updatedAt: entry.lastModified || now,
        lastAccessedAt: now,
        settings: this.getDefaultSettings(),
        metadata: {
          fileCount: 0,
          totalSize: 0,
          languages: [],
          dependencies: {},
          devDependencies: {}
        }
      };

      // Load project settings if available
      if (options.loadSettings !== false) {
        await this.loadProjectSettings(project);
      }

      // Update metadata
      await this.updateProjectMetadata(project);

      // Store project
      this.projects.set(projectId, project);
      if (options.addToRecent !== false) {
        this.addToRecentProjects(project);
      }
      this.currentProject = project;
      this.saveToStorage();

      // Update context service
      if (contextService) {
        contextService.updateProject({
          id: project.id,
          name: project.name,
          rootPath: project.path,
          type: 'other'
        });
      }

      return project;
    } catch (error) {
      throw new Error(`Failed to open project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get current project
   */
  getCurrentProject(): Project | null {
    return this.currentProject;
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId: string): Promise<Project | null> {
    return this.projects.get(projectId) || null;
  }

  /**
   * Set current project
   */
  async setCurrentProject(project: Project): Promise<void> {
    this.currentProject = project;
    project.lastAccessedAt = new Date();
    this.addToRecentProjects(project);
    this.saveToStorage();

    // Update context service
    if (contextService) {
      contextService.updateProject({
        id: project.id,
        name: project.name,
        rootPath: project.path,
        type: 'other'
      });
    }
  }

  /**
   * Get recent projects
   */
  getRecentProjects(): Project[] {
    return [...this.recentProjects];
  }

  /**
   * Search projects
   */
  searchProjects(options: ProjectSearchOptions = {}): Project[] {
    let results = Array.from(this.projects.values());

    // Filter by visibility
    if (options.visibility && options.visibility !== 'all') {
      results = results.filter(p => p.visibility === options.visibility);
    }

    // Filter by query
    if (options.query) {
      const query = options.query.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        p.path.toLowerCase().includes(query)
      );
    }

    // Sort results
    const sortBy = options.sortBy || 'lastAccessed';
    const direction = options.sortDirection || 'desc';
    
    results.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'updated':
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        case 'lastAccessed':
        default:
          aValue = a.lastAccessedAt.getTime();
          bValue = b.lastAccessedAt.getTime();
          break;
      }

      if (direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Limit results
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Update project settings
   */
  async updateProjectSettings(projectId: string, settings: Partial<LocalProjectSettings>): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    project.settings = { ...project.settings, ...settings };
    project.updatedAt = new Date();
    this.saveToStorage();

    // Save settings to project directory
    await this.saveProjectSettings(project);
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string, deleteFiles = false): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    // Remove from memory
    this.projects.delete(projectId);
    this.recentProjects = this.recentProjects.filter(p => p.id !== projectId);
    
    if (this.currentProject?.id === projectId) {
      this.currentProject = null;
    }

    // Delete files if requested
    if (deleteFiles) {
      try {
        await fileSystemService.deleteEntry(project.path);
      } catch (error) {
        console.warn('Failed to delete directory:', error);
      }
    }

    this.saveToStorage();
  }

  /**
   * Get available project templates
   */
  getTemplates(): ProjectTemplate[] {
    return [...this.templates];
  }

  /**
   * Add custom template
   */
  addTemplate(template: ProjectTemplate): void {
    this.templates.push(template);
  }

  /**
   * Export project configuration
   */
  async exportProject(projectId: string): Promise<string> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    const exportData = {
      project: {
        name: project.name,
        description: project.description,
        settings: project.settings,
        metadata: project.metadata
      },
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import project configuration
   */
  async importProject(configJson: string, targetPath: string): Promise<Project> {
    try {
      const config = JSON.parse(configJson);
      
      const options: CreateProjectOptions = {
        name: config.project.name,
        description: config.project.description,
        path: targetPath
      };

      const project = await this.createProject(options);
      
      // Apply imported settings
      if (config.project.settings) {
        await this.updateProjectSettings(project.id, config.project.settings);
      }

      return project;
    } catch (error) {
      throw new Error(`Failed to import project: ${error instanceof Error ? error.message : 'Invalid configuration'}`);
    }
  }

  // Private helper methods

  private getDefaultSettings(): LocalProjectSettings {
    return {
      theme: 'dark',
      aiModel: 'gpt-4',
      autoSave: true,
      gitIntegration: true,
      linting: true,
      formatting: true,
      extensions: [],
      environment: {},
      buildCommand: 'npm run build',
      startCommand: 'npm run dev',
      testCommand: 'npm test',
      allowInvites: false,
      defaultMemberRole: 'viewer'
    };
  }

  private async applyTemplate(project: Project, template: ProjectTemplate): Promise<void> {
    // Update metadata with template info
    if (template.config.dependencies) {
      project.metadata.dependencies = { ...template.config.dependencies };
    }
    if (template.config.devDependencies) {
      project.metadata.devDependencies = { ...template.config.devDependencies };
    }

    // Detect framework from template
    if (template.id.includes('react')) {
      project.metadata.framework = 'React';
    } else if (template.id.includes('nextjs')) {
      project.metadata.framework = 'Next.js';
    } else if (template.id.includes('python')) {
      project.metadata.framework = 'Python';
    }
  }

  private async initializeGit(project: Project): Promise<void> {
    try {
      // In a real implementation, this would run git commands
      // For now, we'll just update metadata
      project.metadata.gitRepository = project.path;
      project.metadata.gitBranch = 'main';
      if (project.settings) {
        project.settings.gitIntegration = true;
      }
    } catch (error) {
      console.warn('Failed to initialize git:', error);
    }
  }

  private async updateProjectMetadata(project: Project): Promise<void> {
    try {
      const stats = await fileSystemService.getStats();
      if (stats) {
        project.metadata.fileCount = stats.totalFiles || 0;
        project.metadata.totalSize = stats.totalSize || 0;
        project.metadata.languages = Object.keys(stats.languages || {});
      }
    } catch (error) {
      console.warn('Failed to update project metadata:', error);
    }
  }

  private async loadProjectSettings(project: Project): Promise<void> {
    try {
      const settingsPath = `${project.path}/.omnipanel/settings.json`;
      const settingsEntry = await fileSystemService.getEntry(settingsPath);
      if (settingsEntry && settingsEntry.type === 'file') {
        // In a real implementation, we would read the file content
        // For now, we'll use default settings
        project.settings = { ...this.getDefaultSettings() };
      }
    } catch (error) {
      // Settings file doesn't exist, use defaults
      console.log('No project settings found, using defaults');
    }
  }

  private async saveProjectSettings(project: Project): Promise<void> {
    try {
      const settingsDir = `${project.path}/.omnipanel`;
      const settingsPath = `${settingsDir}/settings.json`;
      
      // Create settings directory if it doesn't exist
      await fileSystemService.createEntry(settingsDir, 'directory');
      
      // Save settings file
      await fileSystemService.createEntry(settingsPath, 'file', JSON.stringify(project.settings, null, 2));
    } catch (error) {
      console.warn('Failed to save project settings:', error);
    }
  }

  private addToRecentProjects(project: Project): void {
    // Remove if already exists
    this.recentProjects = this.recentProjects.filter(p => p.id !== project.id);
    
    // Add to beginning
    this.recentProjects.unshift(project);
    
    // Limit to max recent projects
    if (this.recentProjects.length > this.maxRecentProjects) {
      this.recentProjects = this.recentProjects.slice(0, this.maxRecentProjects);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        projects: Array.from(this.projects.entries()),
        recentProjects: this.recentProjects,
        currentProject: this.currentProject
      };
      localStorage.setItem('omnipanel-projects', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save projects to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      // Check if we're in the browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }
      
      const data = localStorage.getItem('omnipanel-projects');
      if (data) {
        const parsed = JSON.parse(data);
        
        // Restore projects map
        if (parsed.projects) {
          this.projects = new Map(parsed.projects.map(([id, project]: [string, any]) => [
            id,
            {
              ...project,
              createdAt: new Date(project.createdAt),
              updatedAt: new Date(project.updatedAt),
              lastAccessedAt: new Date(project.lastAccessedAt)
            }
          ]));
        }
        
        // Restore recent projects
        if (parsed.recentProjects) {
          this.recentProjects = parsed.recentProjects.map((project: any) => ({
            ...project,
            createdAt: new Date(project.createdAt),
            updatedAt: new Date(project.updatedAt),
            lastAccessedAt: new Date(project.lastAccessedAt)
          }));
        }
        
        // Restore current project
        if (parsed.currentProject) {
          this.currentProject = {
            ...parsed.currentProject,
            createdAt: new Date(parsed.currentProject.createdAt),
            updatedAt: new Date(parsed.currentProject.updatedAt),
            lastAccessedAt: new Date(parsed.currentProject.lastAccessedAt)
          };
        }
      }
    } catch (error) {
      console.warn('Failed to load projects from storage:', error);
    }
  }

  // Template generation methods
  private generatePackageJson(type: string): string {
    const base = {
      name: "omnipanel-project",
      version: "1.0.0",
      private: true
    };

    if (type === 'react-app') {
      return JSON.stringify({
        ...base,
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview"
        },
        dependencies: {
          react: "^18.2.0",
          "react-dom": "^18.2.0"
        },
        devDependencies: {
          "@types/react": "^18.2.0",
          "@types/react-dom": "^18.2.0",
          "@vitejs/plugin-react": "^4.0.0",
          typescript: "^5.0.0",
          vite: "^4.4.0"
        }
      }, null, 2);
    }

    if (type === 'next-app') {
      return JSON.stringify({
        ...base,
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
          lint: "next lint"
        },
        dependencies: {
          next: "^14.0.0",
          react: "^18.2.0",
          "react-dom": "^18.2.0"
        },
        devDependencies: {
          "@types/node": "^20.0.0",
          "@types/react": "^18.2.0",
          "@types/react-dom": "^18.2.0",
          typescript: "^5.0.0"
        }
      }, null, 2);
    }

    return JSON.stringify(base, null, 2);
  }

  private generateReactApp(): string {
    return `import React from 'react'

function App() {
  return (
    <div className="App">
      <h1>Welcome to OmniPanel</h1>
      <p>Your React app is ready!</p>
    </div>
  )
}

export default App`;
  }

  private generateReactMain(): string {
    return `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;
  }

  private generateReactIndex(): string {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
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
    return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`;
  }

  private generateNextPage(): string {
    return `export default function Home() {
  return (
    <main>
      <h1>Welcome to OmniPanel</h1>
      <p>Your Next.js app is ready!</p>
    </main>
  )
}`;
  }

  private generateNextLayout(): string {
    return `export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
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
const nextConfig = {}

module.exports = nextConfig`;
  }

  private generatePythonRequirements(): string {
    return `fastapi==0.104.1
uvicorn==0.24.0
pandas==2.1.3
numpy==1.25.2
scikit-learn==1.3.2
matplotlib==3.8.2
jupyter==1.0.0`;
  }

  private generateFastAPIMain(): string {
    return `from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)`;
  }

  private generateJupyterNotebook(): string {
    return JSON.stringify({
      cells: [
        {
          cell_type: "markdown",
          metadata: {},
          source: ["# Data Analysis Notebook\n", "\n", "Welcome to your OmniPanel data science project!"]
        },
        {
          cell_type: "code",
          execution_count: null,
          metadata: {},
          outputs: [],
          source: ["import pandas as pd\n", "import numpy as np\n", "import matplotlib.pyplot as plt\n", "\n", "print('Ready for data science!')"]
        }
      ],
      metadata: {
        kernelspec: {
          display_name: "Python 3",
          language: "python",
          name: "python3"
        }
      },
      nbformat: 4,
      nbformat_minor: 4
    }, null, 2);
  }

  private generateDataScienceReadme(): string {
    return `# Data Science Project

This project was created with OmniPanel.

## Getting Started

1. Install dependencies: \`pip install -r requirements.txt\`
2. Start Jupyter: \`jupyter notebook\`
3. Open analysis.ipynb to begin your analysis

## Project Structure

- \`main.py\` - FastAPI application
- \`analysis.ipynb\` - Jupyter notebook for data analysis
- \`requirements.txt\` - Python dependencies
`;
  }
}

export const projectService = new ProjectService(); 