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
import { projectService, type Project, type ProjectTemplate } from '@/services/projectService';
import { useCurrentProject, useRecentProjects } from '@/stores/projectStore';

interface WorkspaceSidebarProps {
  onFileSelect?: (filePath: string) => void;
  onSettingsClick?: () => void;
}

export function WorkspaceSidebar({ onFileSelect, onSettingsClick }: WorkspaceSidebarProps) {
  const currentProject = useCurrentProject();
  const recentProjects = useRecentProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [newProjectName, setNewProjectName] = useState('');

  const handleOpenProject = async () => {
    try {
      // This would open a file picker in a real implementation
      console.log('Open project clicked - would show file picker');
    } catch (error) {
      console.error('Failed to open project:', error);
    }
  };

  const handleNewProject = () => {
    setIsCreatingProject(true);
  };

  const handleCreateProject = async () => {
    if (!selectedTemplate || !newProjectName.trim()) return;

    try {
      const project = await projectService.createProject({
        name: newProjectName.trim(),
        description: `${selectedTemplate.name} project created with OmniPanel`,
        path: `/projects/${newProjectName.trim().toLowerCase().replace(/\s+/g, '-')}`,
        template: selectedTemplate,
        gitInit: true,
        visibility: 'private'
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

  const handleRecentProjectClick = async (project: Project) => {
    try {
      await projectService.setCurrentProject(project);
      console.log('Opened recent project:', project.name);
    } catch (error) {
      console.error('Failed to open recent project:', error);
    }
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
    const templates = projectService.getTemplates();
    
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
                        : 'border-slate-700 bg-slate-800 hover:bg-slate-700'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-200">{template.name}</span>
                      <span className="text-lg">{template.icon}</span>
                    </div>
                    <p className="text-sm text-slate-400">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.features.slice(0, 3).map((feature) => (
                        <span
                          key={feature}
                          className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="flex gap-2">
            <Button
              onClick={() => setIsCreatingProject(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!selectedTemplate || !newProjectName.trim()}
              className="flex-1"
            >
              Create
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
            onClick={onSettingsClick}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-100"
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

      {/* Quick Actions */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-100"
          >
            <CommandIcon className="h-4 w-4 mr-2" />
            <span className="text-xs">Command Palette</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 