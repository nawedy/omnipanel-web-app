'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Code, 
  BookOpen, 
  Terminal, 
  Folder,
  FolderOpen,
  Plus,
  ArrowRight,
  Zap,
  Clock,
  Star,
  Settings,
  GitBranch,
  Package
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspace';
import { useCurrentProject, useRecentProjects, useProjectLoading } from '@/stores/projectStore';
import { ProjectOpener } from '@/components/project/ProjectOpener';
import { Button } from '@/components/ui/button';
import { type Project } from '@/services/projectService';

export function WelcomeScreen() {
  const { addTab } = useWorkspaceStore();
  const currentProject = useCurrentProject();
  const recentProjects = useRecentProjects();
  const { isLoading } = useProjectLoading();
  
  // Local state for project opener modal
  const [projectOpenerMode, setProjectOpenerMode] = useState<'open' | 'create' | null>(null);

  const quickActions = [
    {
      title: 'Start a Chat',
      description: 'Begin a conversation with AI models',
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-500',
      action: () => addTab({
        title: 'New Chat',
        type: 'chat',
        icon: 'message-square',
        projectId: currentProject?.id
      })
    },
    {
      title: 'Create a File',
      description: 'Write code with Monaco editor',
      icon: Code,
      color: 'from-purple-500 to-pink-500',
      action: () => addTab({
        title: 'Untitled.tsx',
        type: 'code',
        icon: 'code',
        projectId: currentProject?.id
      })
    },
    {
      title: 'New Notebook',
      description: 'Jupyter-style interactive notebook',
      icon: BookOpen,
      color: 'from-green-500 to-emerald-500',
      action: () => addTab({
        title: 'Untitled Notebook',
        type: 'notebook',
        icon: 'book-open',
        projectId: currentProject?.id
      })
    },
    {
      title: 'Open Terminal',
      description: 'Access command line interface',
      icon: Terminal,
      color: 'from-gray-600 to-gray-800',
      action: () => addTab({
        title: 'Terminal',
        type: 'terminal',
        icon: 'terminal',
        projectId: currentProject?.id
      })
    }
  ];

  const handleProjectSelected = (project: Project) => {
    // Project is automatically set as current in the store
    // We can optionally add a tab or perform other actions
    console.log('Project selected:', project.name);
  };

  const handleOpenProjectFiles = () => {
    if (currentProject) {
      // Open file explorer for current project
      addTab({
        title: 'Files',
        type: 'file',
        icon: 'folder',
        projectId: currentProject.id,
        filePath: currentProject.path
      });
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="h-full bg-gradient-to-br from-background via-background to-accent/10 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 relative">
                <Image 
                  src="/logo.png" 
                  alt="OmniPanel Logo" 
                  width={80} 
                  height={80} 
                  className="rounded-xl shadow-lg"
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Welcome to OmniPanel
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your modern, extensible AI workspace for chat, code, notebooks, and
              automation. {currentProject ? 'Continue working or start something new.' : 'Create or open a project to get started.'}
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-neon-blue" />
              Quick Start
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                  onClick={action.action}
                  className="group p-6 bg-card/50 hover:bg-card/80 border border-border hover:border-border/80 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg text-left"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {action.description}
                  </p>
                  <div className="flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Get started <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Project Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Current Project / Project Actions */}
            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Folder className="w-6 h-6 text-neon-green" />
                {currentProject ? 'Current Project' : 'Project Management'}
              </h2>
              
              {currentProject ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card/50 border border-border rounded-xl p-6 mb-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-neon-green to-green-600 rounded-lg flex items-center justify-center">
                        <FolderOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{currentProject.name}</h3>
                        <p className="text-sm text-muted-foreground">{currentProject.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentProject.metadata?.gitRepository && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded">
                          <GitBranch className="w-3 h-3" />
                          {currentProject.metadata.gitBranch || 'main'}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded">
                        <Package className="w-3 h-3" />
                        {currentProject.metadata?.framework || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Files:</span>
                      <span className="ml-2 font-medium">{currentProject.metadata?.fileCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <span className="ml-2 font-medium">
                        {currentProject.metadata?.totalSize ? 
                          `${(currentProject.metadata.totalSize / 1024 / 1024).toFixed(1)} MB` : 
                          'Unknown'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Languages:</span>
                      <span className="ml-2 font-medium">
                        {currentProject.metadata?.languages?.slice(0, 3).join(', ') || 'Unknown'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last opened:</span>
                      <span className="ml-2 font-medium">{formatTimeAgo(currentProject.lastAccessedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleOpenProjectFiles}
                      className="flex-1 bg-gradient-to-r from-neon-green to-green-600 hover:from-neon-green/90 hover:to-green-600/90"
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Open Files
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setProjectOpenerMode('open')}
                      className="flex-1"
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      Switch Project
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-card/30 border border-dashed border-border rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Folder className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Project Open</h3>
                    <p className="text-muted-foreground mb-6">
                      Open an existing project or create a new one to get started with your workspace.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={() => setProjectOpenerMode('open')}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                      >
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Open Project
                      </Button>
                      <Button
                        onClick={() => setProjectOpenerMode('create')}
                        variant="outline"
                        className="border-primary/50 hover:bg-primary/10"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Projects */}
            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-neon-purple" />
                Recent Projects
              </h2>
              
              {recentProjects.length > 0 ? (
                <div className="space-y-3">
                  {recentProjects.slice(0, 5).map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => handleProjectSelected(project)}
                      className="group bg-card/30 hover:bg-card/60 border border-border hover:border-border/80 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-neon-purple to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Folder className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                              {project.name}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {project.description || project.path}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {project.metadata?.framework && (
                            <div className="text-xs bg-accent/50 px-2 py-1 rounded">
                              {project.metadata.framework}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {formatTimeAgo(project.lastAccessedAt)}
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {recentProjects.length > 5 && (
                    <Button
                      variant="ghost"
                      onClick={() => setProjectOpenerMode('open')}
                      className="w-full text-muted-foreground hover:text-primary"
                    >
                      View all {recentProjects.length} recent projects
                    </Button>
                  )}
                </div>
              ) : (
                <div className="bg-card/20 border border-dashed border-border rounded-lg p-8 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No Recent Projects</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Projects you open will appear here for quick access.
                  </p>
                  <Button
                    onClick={() => setProjectOpenerMode('open')}
                    variant="outline"
                    size="sm"
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Browse Projects
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Additional Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-neon-yellow" />
              Features & Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card/30 border border-border rounded-lg p-6">
                <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold mb-2">AI-Powered Assistance</h3>
                <p className="text-sm text-muted-foreground">
                  Get intelligent code suggestions, explanations, and improvements with context-aware AI.
                </p>
              </div>
              
              <div className="bg-card/30 border border-border rounded-lg p-6">
                <div className="w-10 h-10 bg-gradient-to-br from-neon-green to-green-600 rounded-lg flex items-center justify-center mb-4">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Customizable Workspace</h3>
                <p className="text-sm text-muted-foreground">
                  Personalize your environment with themes, shortcuts, and AI model preferences.
                </p>
              </div>
              
              <div className="bg-card/30 border border-border rounded-lg p-6">
                <div className="w-10 h-10 bg-gradient-to-br from-neon-purple to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <GitBranch className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Version Control</h3>
                <p className="text-sm text-muted-foreground">
                  Integrated Git support with visual status indicators and branch management.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Project Opener Modal */}
      {projectOpenerMode && (
        <ProjectOpener
          mode={projectOpenerMode}
          onClose={() => setProjectOpenerMode(null)}
          onProjectSelected={handleProjectSelected}
        />
      )}
    </>
  );
} 