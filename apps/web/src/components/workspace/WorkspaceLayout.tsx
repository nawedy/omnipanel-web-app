'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceStore } from '@/stores/workspace';
import { WorkspaceHeader } from './WorkspaceHeader';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { TabManager } from './TabManager';
import { MainContentArea } from './MainContentArea';
import { FileTree } from './FileTree';

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, sidebarWidth, setSidebarWidth, layout } = useWorkspaceStore();
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();

    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <WorkspaceHeader />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative flex-shrink-0 glass-dark border-r border-border"
              style={{ width: sidebarWidth }}
            >
              <WorkspaceSidebar />
              
              {/* Resize Handle */}
              <div
                className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${
                  isResizing ? 'bg-primary/40' : ''
                }`}
                onMouseDown={handleMouseDown}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Tree Panel */}
        {layout.showFileTree && (
          <div className="flex-shrink-0 w-80">
            <FileTree 
              projectId={undefined}
              onFileSelect={(file) => {
                console.log('File selected:', file);
              }}
              onFileCreate={(parentPath, name, type) => {
                console.log('Create file:', parentPath, name, type);
              }}
              onFileDelete={(path) => {
                console.log('Delete file:', path);
              }}
              onFileRename={(oldPath, newName) => {
                console.log('Rename file:', oldPath, newName);
              }}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Tab Manager */}
          <TabManager />
          
          {/* Content */}
          <div className="flex-1 overflow-hidden w-full">
            <MainContentArea>
              {children}
            </MainContentArea>
          </div>
        </div>
      </div>
    </div>
  );
} 