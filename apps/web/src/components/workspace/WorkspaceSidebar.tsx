'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FolderIcon, 
  FileIcon, 
  ChevronRightIcon, 
  ChevronDownIcon,
  PlusIcon,
  FolderOpenIcon,
  SearchIcon,
  SettingsIcon,
  CommandIcon
} from 'lucide-react';
import { omnipanelProjectService, type FileTreeNode, type RecentProject, type ProjectTemplate } from '@/services/projectService';
import type { Project } from '@omnipanel/types';

interface WorkspaceSidebarProps {
  onFileSelect?: (filePath: string) => void;
  onSettingsClick?: () => void;
}

export function WorkspaceSidebar({ onFileSelect, onSettingsClick }: WorkspaceSidebarProps) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [fileTree, setFileTree] = useState<FileTreeNode | null>(null);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [newProjectName, setNewProjectName] = useState('');

  // Subscribe to project changes
  useEffect(() => {
    const unsubscribe = omnipanelProjectService.subscribe((project) => {
      setCurrentProject(project);
      setFileTree(omnipanelProjectService.getFileTree());
    });

    // Load initial data
    setCurrentProject(omnipanelProjectService.getCurrentProject());
    setFileTree(omnipanelProjectService.getFileTree());
    setRecentProjects(omnipanelProjectService.getRecentProjects());

    return unsubscribe;
  }, []);

  // Update recent projects when current project changes
  useEffect(() => {
    setRecentProjects(omnipanelProjectService.getRecentProjects());
  }, [currentProject]);

  const handleOpenProject = async () => {
    const project = await omnipanelProjectService.openProject();
    if (project) {
      console.log('Opened project:', project.name);
    }
  };

  const handleNewProject = () => {
    setIsCreatingProject(true);
  };

  const handleCreateProject = async () => {
    if (!selectedTemplate || !newProjectName.trim()) return;

    try {
      const project = await omnipanelProjectService.createProject(selectedTemplate, {
        name: newProjectName.trim(),
        description: `${selectedTemplate.name} project created with OmniPanel`
      });

      if (project) {
        console.log('Created project:', project.name);
        setIsCreatingProject(false);
        setSelectedTemplate(null);
        setNewProjectName('');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleImportProject = async () => {
    // For now, just show a simple prompt - in a real app this would be a proper modal
    const url = prompt('Enter GitHub/GitLab repository URL:');
    if (url) {
      const project = await omnipanelProjectService.importProject('github', url);
      if (project) {
        console.log('Imported project:', project.name);
      }
    }
  };

  const handleFileClick = (node: FileTreeNode) => {
    if (node.type === 'directory') {
      omnipanelProjectService.toggleNode(node.id);
      setFileTree(omnipanelProjectService.getFileTree());
    } else {
      omnipanelProjectService.selectNode(node.id);
      setFileTree(omnipanelProjectService.getFileTree());
      onFileSelect?.(node.path);
    }
  };

  const handleRecentProjectClick = async (recentProject: RecentProject) => {
    // For now, just set it as current - in a real app we'd actually open the project
    console.log('Opening recent project:', recentProject.name);
  };

  const renderFileTreeNode = (node: FileTreeNode, depth: number = 0): React.ReactNode => {
    const isDirectory = node.type === 'directory';
    const isExpanded = node.isExpanded;
    const isSelected = node.isSelected;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center py-1 px-2 hover:bg-slate-800/50 cursor-pointer rounded-sm ${
            isSelected ? 'bg-slate-700/50' : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleFileClick(node)}
        >
          {isDirectory && (
            <span className="mr-1 text-slate-400">
              {isExpanded ? (
                <ChevronDownIcon className="h-3 w-3" />
              ) : (
                <ChevronRightIcon className="h-3 w-3" />
              )}
            </span>
          )}
          
          <span className="mr-2 text-sm">
            {isDirectory ? (
              isExpanded ? (
                <FolderOpenIcon className="h-4 w-4 text-blue-400" />
              ) : (
                <FolderIcon className="h-4 w-4 text-blue-400" />
              )
            ) : (
              <span className="text-xs">{node.icon || '📄'}</span>
            )}
          </span>
          
          <span className={`text-sm truncate ${
            isDirectory ? 'text-slate-200' : 'text-slate-300'
          }`}>
            {node.name}
          </span>
          
          {!isDirectory && node.size && (
            <span className="ml-auto text-xs text-slate-500">
              {formatFileSize(node.size)}
            </span>
          )}
        </div>
        
        {isDirectory && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderFileTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
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

  if (isCreatingProject) {
    const templates = omnipanelProjectService.getProjectTemplates();
    
    return (
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Create New Project</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Project Name
              </label>
              <Input
                value={newProjectName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProjectName(e.target.value)}
                placeholder="Enter project name"
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Template
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 bg-slate-800 hover:bg-slate-750'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{template.icon}</span>
                      <div>
                        <h3 className="font-medium text-slate-100">{template.name}</h3>
                        <p className="text-xs text-slate-400">{template.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <Button
              onClick={handleCreateProject}
              disabled={!selectedTemplate || !newProjectName.trim()}
              className="flex-1"
            >
              Create Project
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreatingProject(false);
                setSelectedTemplate(null);
                setNewProjectName('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100">Workspace</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsClick}
            className="text-slate-400 hover:text-slate-100"
          >
            <SettingsIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button
            onClick={handleOpenProject}
            className="w-full justify-start text-left"
            variant="outline"
          >
            <FolderOpenIcon className="h-4 w-4 mr-2" />
            Open Project
            <span className="ml-auto text-xs text-slate-400 flex items-center">
              <CommandIcon className="h-3 w-3 mr-1" />O
            </span>
          </Button>
          
          <Button
            onClick={handleNewProject}
            className="w-full justify-start text-left"
            variant="outline"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Project
            <span className="ml-auto text-xs text-slate-400 flex items-center">
              <CommandIcon className="h-3 w-3 mr-1" />⇧N
            </span>
          </Button>
        </div>
      </div>

      {/* Current Project */}
      {currentProject && (
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-slate-100">{currentProject.name}</h3>
            <span className="text-xs text-slate-400 capitalize">{currentProject.status}</span>
          </div>
          {currentProject.description && (
            <p className="text-sm text-slate-400 mb-3">{currentProject.description}</p>
          )}
        </div>
      )}

      {/* File Explorer */}
      {fileTree && (
        <div className="flex-1 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-medium text-slate-100 mb-2">Files</h3>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="pl-10 bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {renderFileTreeNode(fileTree)}
          </div>
        </div>
      )}

      {/* Recent Projects */}
      {!currentProject && (
        <div className="flex-1 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-medium text-slate-100 mb-2">Recent Projects</h3>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="pl-10 bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {filteredRecentProjects.length > 0 ? (
              <div className="space-y-1">
                {filteredRecentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-3 rounded-lg bg-slate-800 hover:bg-slate-750 cursor-pointer transition-colors"
                    onClick={() => handleRecentProjectClick(project)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-100 truncate">{project.name}</h4>
                      <span className="text-xs text-slate-400">{project.type}</span>
                    </div>
                    {project.description && (
                      <p className="text-sm text-slate-400 mt-1 truncate">{project.description}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      Last opened: {new Date(project.lastOpened).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderIcon className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No recent projects</p>
                <p className="text-slate-500 text-xs mt-1">Create or open a project to get started</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800">
        <Button
          onClick={handleImportProject}
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-slate-100"
        >
          Import from Git
        </Button>
      </div>
    </div>
  );
} 