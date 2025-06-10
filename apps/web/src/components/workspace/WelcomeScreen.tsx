'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Code, 
  BookOpen, 
  Terminal, 
  Folder,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspace';

export function WelcomeScreen() {
  const { addTab, setCurrentProject, currentProject } = useWorkspaceStore();

  const quickActions = [
    {
      title: 'Start a Chat',
      description: 'Begin a conversation with AI models',
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-500',
      action: () => addTab({
        title: 'New Chat',
        type: 'chat',
        icon: 'message-square'
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
        icon: 'code'
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
        icon: 'book-open'
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
        icon: 'terminal'
      })
    }
  ];

  const recentProjects = [
    { name: 'AI Assistant Bot', description: 'Chatbot development project', lastAccessed: '2 hours ago' },
    { name: 'Data Analysis', description: 'Customer insights dashboard', lastAccessed: '1 day ago' },
    { name: 'Web Scraper', description: 'Automated data collection tool', lastAccessed: '3 days ago' }
  ];

  const handleCreateProject = () => {
    // Mock project creation
    const newProject = {
      id: `project-${Date.now()}`,
      name: 'New Project',
      description: 'A new OmniPanel project',
      visibility: 'private' as const,
      ownerId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCurrentProject(newProject);
  };

  return (
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
            automation. Create a project to get started.
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
          {/* Create Project */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Folder className="w-6 h-6 text-neon-green" />
              Projects
            </h2>
            {!currentProject ? (
              <div className="p-8 bg-card/30 border-2 border-dashed border-border rounded-xl text-center">
                <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
                <p className="text-muted-foreground mb-6">
                  Create or select a project to organize your work
                </p>
                <button
                  onClick={handleCreateProject}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Create New Project
                </button>
              </div>
            ) : (
              <div className="p-6 bg-card/50 border border-border rounded-xl">
                <h3 className="text-lg font-semibold mb-2">{currentProject.name}</h3>
                <p className="text-muted-foreground mb-4">{currentProject.description}</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors">
                    Open Files
                  </button>
                  <button className="px-4 py-2 border border-border rounded-md hover:bg-accent/50 transition-colors">
                    Settings
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Projects */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Recent Projects</h2>
            <div className="space-y-3">
              {recentProjects.map((project, index) => (
                <motion.div
                  key={project.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="p-4 bg-card/30 hover:bg-card/50 border border-border rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                  onClick={() => {
                    const mockProject = {
                      id: `project-${index}`,
                      name: project.name,
                      description: project.description,
                      visibility: 'private' as const,
                      ownerId: 'user-1',
                      createdAt: new Date(),
                      updatedAt: new Date()
                    };
                    setCurrentProject(mockProject);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium mb-1">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {project.lastAccessed}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 p-6 bg-accent/20 border border-accent/30 rounded-xl"
        >
          <h3 className="text-lg font-semibold mb-3">💡 Pro Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Use <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘K</kbd> to open the command palette</li>
            <li>• Drag and drop files into the workspace to open them</li>
            <li>• Right-click on tabs for additional options</li>
            <li>• Use the sidebar to quickly switch between files and chats</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
} 