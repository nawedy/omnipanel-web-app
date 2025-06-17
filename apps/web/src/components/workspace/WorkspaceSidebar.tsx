'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { 
  FolderIcon, 
  FileIcon, 
  ChevronRightIcon, 
  ChevronDownIcon,
  PlusIcon,
  FolderOpenIcon,
  SearchIcon,
  SettingsIcon,
  CommandIcon,
  MessageSquareIcon,
  TerminalIcon,
  BookOpenIcon,
  CodeIcon,
  SearchCodeIcon
} from 'lucide-react';
import { projectService, type Project, type ProjectTemplate } from '@/services/projectService';
import { useCurrentProject, useRecentProjects } from '@/stores/projectStore';
import { useWorkspaceStore } from '@/stores/workspace';
import { ProjectOpener } from '@/components/project/ProjectOpener';

interface WorkspaceSidebarProps {
  onFileSelect?: (filePath: string) => void;
  onToolSelect?: (tool: string) => void;
}

// Workspace tools configuration
const WORKSPACE_TOOLS = [
  {
    id: 'chat',
    name: 'Chat',
    icon: MessageSquareIcon,
    description: 'AI-powered chat interface',
    route: '/chat'
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: TerminalIcon,
    description: 'Integrated terminal',
    route: '/terminal'
  },
  {
    id: 'notebook',
    name: 'Notebook',
    icon: BookOpenIcon,
    description: 'Jupyter-style notebooks',
    route: '/notebook'
  },
  {
    id: 'editor',
    name: 'Code Editor',
    icon: CodeIcon,
    description: 'Monaco code editor',
    route: '/editor'
  },
  {
    id: 'research',
    name: 'Research',
    icon: SearchCodeIcon,
    description: 'AI research with Tavily',
    route: '/research'
  }
];

export function WorkspaceSidebar({ onFileSelect, onToolSelect }: WorkspaceSidebarProps) {
  const router = useRouter();
  const currentProject = useCurrentProject();
  const recentProjects = useRecentProjects();
  const { activeTabId, setActiveTab, addTab } = useWorkspaceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProjectOpener, setShowProjectOpener] = useState(false);
  const [projectOpenerMode, setProjectOpenerMode] = useState<'open' | 'create'>('open');
  const [activeToolId, setActiveToolId] = useState<string>('chat');

  const handleOpenProject = () => {
    setProjectOpenerMode('open');
    setShowProjectOpener(true);
  };

  const handleNewProject = () => {
    setProjectOpenerMode('create');
    setShowProjectOpener(true);
  };

  const handleProjectSelected = (project: Project) => {
    console.log('Project selected:', project.name);
    setShowProjectOpener(false);
    // The ProjectOpener component handles setting the current project
  };

  const handleRecentProjectClick = async (project: Project) => {
    try {
      await projectService.setCurrentProject(project);
      console.log('Opened recent project:', project.name);
    } catch (error) {
      console.error('Failed to open recent project:', error);
    }
  };

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  const handleToolSelect = (tool: typeof WORKSPACE_TOOLS[0]) => {
    setActiveToolId(tool.id);
    
    // Create a new tab for the tool within the workspace
    const tabId = addTab({
      title: tool.name,
      type: tool.id as any,
      icon: tool.name.toLowerCase(),
      content: { toolId: tool.id }
    });
    
    setActiveTab(tabId);
    
    if (onToolSelect) {
      onToolSelect(tool.id);
    }
    
    // Don't navigate - keep tools within the workspace
    // router.push(tool.route); // REMOVED
  };

  const handleCommandPalette = () => {
    // TODO: Implement command palette modal
    console.log('Command palette - TODO: Implement modal');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredRecentProjects = recentProjects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Workspace</h2>
            <Button
              onClick={handleSettingsClick}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Project Actions */}
          <div className="flex gap-2 mb-4">
            <Button
              onClick={handleOpenProject}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              <FolderOpenIcon className="h-3 w-3 mr-1" />
              Open
            </Button>
            <Button
              onClick={handleNewProject}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              <PlusIcon className="h-3 w-3 mr-1" />
              New
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="pl-10 bg-slate-800 border-slate-700 text-slate-100 text-sm"
            />
          </div>
        </div>

        {/* Workspace Tools */}
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Tools</h3>
          <div className="grid grid-cols-2 gap-2">
            {WORKSPACE_TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeToolId === tool.id;
              
              return (
                <Button
                  key={tool.id}
                  onClick={() => handleToolSelect(tool)}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={`flex flex-col items-center gap-1 h-auto py-3 text-xs border transition-colors ${
                    isActive 
                      ? 'bg-blue-600 border-blue-500 text-white' 
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tool.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Current Project */}
        {currentProject && (
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Current Project</h3>
            <div className="p-3 bg-slate-800 rounded-lg">
              <div className="flex items-center mb-2">
                <FolderIcon className="h-4 w-4 text-blue-400 mr-2" />
                <span className="font-medium text-slate-200 truncate">{currentProject.name}</span>
              </div>
              <p className="text-xs text-slate-400 mb-2 line-clamp-2">{currentProject.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{currentProject.metadata?.fileCount || 0} files</span>
                <span>{currentProject.metadata?.framework || 'Unknown'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Recent Projects */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Recent Projects</h3>
            <div className="space-y-2 overflow-y-auto max-h-96">
              {filteredRecentProjects.length > 0 ? (
                filteredRecentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                    onClick={() => handleRecentProjectClick(project)}
                  >
                    <div className="flex items-center mb-1">
                      <FolderIcon className="h-3 w-3 text-blue-400 mr-2" />
                      <span className="text-sm font-medium text-slate-200 truncate">{project.name}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{project.description}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                      <span>{project.metadata?.framework || 'Unknown'}</span>
                      <span>{new Date(project.lastAccessedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FolderIcon className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    {searchQuery ? 'No projects found' : 'No recent projects'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Command Palette */}
        <div className="p-4 border-t border-slate-800">
          <Button
            onClick={handleCommandPalette}
            variant="ghost"
            size="sm"
            className="w-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <CommandIcon className="h-4 w-4 mr-2" />
            <span className="text-xs">Command Palette</span>
          </Button>
        </div>
      </div>

      {/* Project Opener Modal */}
      {showProjectOpener && (
        <ProjectOpener
          mode={projectOpenerMode}
          onClose={() => setShowProjectOpener(false)}
          onProjectSelected={handleProjectSelected}
        />
      )}
    </>
  );
} 