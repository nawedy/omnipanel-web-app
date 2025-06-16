'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/stores/workspace';
import { WorkspaceHeader } from './WorkspaceHeader';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { TabManager } from './TabManager';
import { MainContentArea } from './MainContentArea';
import { FileTree } from './FileTree';

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, sidebarWidth, setSidebarWidth, layout, setFileTreeWidth } = useWorkspaceStore();
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingFileTree, setIsResizingFileTree] = useState(false);

  const handleSidebarMouseDown = (e: React.MouseEvent) => {
    setIsResizingSidebar(true);
    e.preventDefault();

    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, Math.min(500, startWidth + (e.clientX - startX)));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleFileTreeMouseDown = (e: React.MouseEvent) => {
    setIsResizingFileTree(true);
    e.preventDefault();

    const startX = e.clientX;
    const startWidth = layout.fileTreeWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, Math.min(600, startWidth + (e.clientX - startX)));
      setFileTreeWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingFileTree(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="workspace-layout h-screen w-full bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <WorkspaceHeader />

      {/* Main Content */}
      <div className="workspace-content flex-1 flex overflow-hidden w-full">
        {/* Projects Sidebar */}
        {sidebarOpen && (
          <div
            className="workspace-sidebar relative"
            style={{ width: sidebarWidth }}
          >
            <WorkspaceSidebar />
            
            {/* Sidebar Resize Handle */}
            <div
              className={`workspace-resizer group ${
                isResizingSidebar ? 'active' : ''
              }`}
              onMouseDown={handleSidebarMouseDown}
              title="Drag to resize projects panel"
            >
              <div className="absolute inset-y-0 right-0 w-1 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-1 h-8 bg-primary/40 rounded-l opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )}

        {/* File Tree Panel */}
        {layout.showFileTree && (
          <div
            className="file-tree-panel relative"
            style={{ width: layout.fileTreeWidth }}
          >
            <div className="file-tree-container">
              {/* File Tree Header */}
              <div className="file-tree-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Explorer</h3>
                  <div className="flex items-center gap-1">
                    {layout.showFileTree && (
                      <span className="text-xs text-muted-foreground">
                        {layout.fileTreeWidth}px
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* File Tree Content */}
              <div className="file-tree-content">
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
            </div>
            
            {/* File Tree Resize Handle */}
            <div
              className={`workspace-resizer group ${
                isResizingFileTree ? 'active' : ''
              }`}
              onMouseDown={handleFileTreeMouseDown}
              title="Drag to resize file explorer"
            >
              <div className="absolute inset-y-0 right-0 w-1 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-1 h-8 bg-primary/40 rounded-l opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="workspace-main flex-1 flex flex-col overflow-hidden w-full">
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