// apps/web/src/components/project/ProjectOpener.tsx
// Project opener component with template selection, folder browsing, and project creation workflows

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Folder,
  FolderOpen,
  Plus,
  Search,
  Clock,
  Star,
  GitBranch,
  Package,
  ArrowRight,
  FileText,
  Code,
  Database,
  Globe,
  Smartphone,
  Monitor,
  Brain,
  BarChart3,
  Settings,
  Check,
  AlertCircle,
  Loader2,
  Upload,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { projectService, type Project, type ProjectTemplate } from '@/services/projectService';
import { useProjectStore, useRecentProjects } from '@/stores/projectStore';
import { useMonitoring } from '@/components/providers/MonitoringProvider';

interface ProjectOpenerProps {
  mode: 'open' | 'create';
  onClose: () => void;
  onProjectSelected: (project: Project) => void;
}

export function ProjectOpener({ mode, onClose, onProjectSelected }: ProjectOpenerProps) {
  const { setCurrentProject } = useProjectStore();
  const recentProjects = useRecentProjects();
  const { captureMessage } = useMonitoring();

  // State for project browsing
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for project creation
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [projectPath, setProjectPath] = useState('');
  const [gitInit, setGitInit] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Get available templates
  const templates = projectService.getTemplates();

  // Filter recent projects based on search
  const filteredProjects = recentProjects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle project selection
  const handleProjectSelect = useCallback(async (project: Project) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Set as current project
      await setCurrentProject(project);
      
      // Update last accessed time
      await projectService.setCurrentProject(project);
      
      // Notify parent
      onProjectSelected(project);
      
      // Close modal
      onClose();
      
      captureMessage('Project opened successfully', 'info', {
        projectId: project.id,
        projectName: project.name
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open project';
      setError(errorMessage);
      captureMessage('Failed to open project', 'error', {
        error: errorMessage,
        projectId: project.id
      });
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentProject, onProjectSelected, onClose, captureMessage]);

  // Handle directory selection for opening projects
  const handleOpenDirectory = useCallback(async () => {
    if (!window.showDirectoryPicker) {
      setError('File System Access API not supported in this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dirHandle = await window.showDirectoryPicker();
      
      // Create project from directory
      const project = await projectService.openProject({
        path: dirHandle.name,
        addToRecent: true,
        loadSettings: true
      });

      await handleProjectSelect(project);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        const errorMessage = 'Failed to open directory: ' + err.message;
        setError(errorMessage);
        captureMessage('Failed to open directory', 'error', { error: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleProjectSelect, captureMessage]);

  // Handle project creation
  const handleCreateProject = useCallback(async () => {
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    if (!projectPath.trim()) {
      setError('Project path is required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const project = await projectService.createProject({
        name: projectName.trim(),
        description: projectDescription.trim() || undefined,
        path: projectPath.trim(),
        template: selectedTemplate || undefined,
        gitInit,
        visibility: 'private'
      });

      await handleProjectSelect(project);
      
      captureMessage('Project created successfully', 'info', {
        projectId: project.id,
        projectName: project.name,
        template: selectedTemplate?.id
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      captureMessage('Failed to create project', 'error', {
        error: errorMessage,
        projectName,
        template: selectedTemplate?.id
      });
    } finally {
      setIsCreating(false);
    }
  }, [projectName, projectDescription, projectPath, selectedTemplate, gitInit, handleProjectSelect, captureMessage]);

  // Handle directory selection for project creation
  const handleSelectDirectory = useCallback(async () => {
    if (!window.showDirectoryPicker) {
      setError('File System Access API not supported in this browser');
      return;
    }

    try {
      const dirHandle = await window.showDirectoryPicker();
      setProjectPath(dirHandle.name);
      
      // Auto-fill project name if empty
      if (!projectName.trim()) {
        setProjectName(dirHandle.name);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError('Failed to select directory: ' + err.message);
      }
    }
  }, [projectName]);

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  // Get template icon
  const getTemplateIcon = (template: ProjectTemplate) => {
    switch (template.category) {
      case 'web': return Globe;
      case 'mobile': return Smartphone;
      case 'desktop': return Monitor;
      case 'ai': return Brain;
      case 'data': return BarChart3;
      default: return Code;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                {mode === 'create' ? (
                  <Plus className="w-5 h-5 text-primary-foreground" />
                ) : (
                  <FolderOpen className="w-5 h-5 text-primary-foreground" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {mode === 'create' ? 'Create New Project' : 'Open Project'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {mode === 'create' 
                    ? 'Start a new project with templates and configurations'
                    : 'Browse and open existing projects from your workspace'
                  }
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {mode === 'open' ? (
              <Tabs defaultValue="recent" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="recent" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Projects
                  </TabsTrigger>
                  <TabsTrigger value="browse" className="flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    Browse Directory
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="recent" className="mt-6">
                  {/* Search */}
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Projects List */}
                  {filteredProjects.length > 0 ? (
                    <div className="space-y-3">
                      {filteredProjects.map((project) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group bg-card/50 hover:bg-card border border-border hover:border-border/80 rounded-lg p-4 cursor-pointer transition-all duration-200"
                          onClick={() => handleProjectSelect(project)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Folder className="w-6 h-6 text-primary-foreground" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                  {project.name}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {project.description || project.path}
                                </p>
                                <div className="flex items-center gap-3 mt-2">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {formatTimeAgo(project.lastAccessedAt)}
                                  </div>
                                  {project.metadata?.framework && (
                                    <Badge variant="secondary" className="text-xs">
                                      {project.metadata.framework}
                                    </Badge>
                                  )}
                                  {project.metadata?.gitRepository && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <GitBranch className="w-3 h-3" />
                                      {project.metadata.gitBranch || 'main'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Folder className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {searchTerm ? 'No projects found' : 'No recent projects'}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {searchTerm 
                          ? 'Try adjusting your search terms or browse for projects'
                          : 'Projects you open will appear here for quick access'
                        }
                      </p>
                      <Button
                        onClick={() => setSearchTerm('')}
                        variant="outline"
                      >
                        {searchTerm ? 'Clear search' : 'Browse directory'}
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="browse" className="mt-6">
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Browse for Project</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Select a directory from your file system to open as a project. 
                      OmniPanel will analyze the contents and set up the workspace.
                    </p>
                    <Button
                      onClick={handleOpenDirectory}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Opening...
                        </>
                      ) : (
                        <>
                          <FolderOpen className="w-4 h-4 mr-2" />
                          Select Directory
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              /* Create Project Mode */
              <div className="space-y-6">
                {/* Project Details */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="project-name">Project Name *</Label>
                    <Input
                      id="project-name"
                      placeholder="My Awesome Project"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="project-description">Description</Label>
                    <Textarea
                      id="project-description"
                      placeholder="Brief description of your project..."
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="project-path">Project Location *</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="project-path"
                        placeholder="Select project directory..."
                        value={projectPath}
                        onChange={(e) => setProjectPath(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSelectDirectory}
                        variant="outline"
                        className="flex-shrink-0"
                      >
                        <Folder className="w-4 h-4 mr-2" />
                        Browse
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Template Selection */}
                <div>
                  <Label className="text-base font-semibold">Project Template</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose a template to get started quickly with pre-configured files and dependencies.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* No Template Option */}
                    <motion.div
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        !selectedTemplate 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-border/80'
                      }`}
                      onClick={() => setSelectedTemplate(null)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">Empty Project</h3>
                          <p className="text-sm text-muted-foreground">Start with a blank project</p>
                        </div>
                        {!selectedTemplate && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </motion.div>

                    {/* Template Options */}
                    {templates.map((template) => {
                      const IconComponent = getTemplateIcon(template);
                      return (
                        <motion.div
                          key={template.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedTemplate?.id === template.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-border/80'
                          }`}
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{template.name}</h3>
                              <p className="text-sm text-muted-foreground truncate">{template.description}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {template.features.slice(0, 2).map((feature) => (
                                  <Badge key={feature} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                                {template.features.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{template.features.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {selectedTemplate?.id === template.id && (
                              <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Options</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="git-init"
                      checked={gitInit}
                      onChange={(e) => setGitInit(e.target.checked)}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                    />
                    <Label htmlFor="git-init" className="text-sm">
                      Initialize Git repository
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          {mode === 'create' && (
            <div className="flex items-center justify-between p-6 border-t border-border bg-card/30">
              <div className="text-sm text-muted-foreground">
                {selectedTemplate ? (
                  <span>Using template: <strong>{selectedTemplate.name}</strong></span>
                ) : (
                  <span>Creating empty project</span>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={isCreating || !projectName.trim() || !projectPath.trim()}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 