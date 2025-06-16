'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Scissors,
  Download,
  Upload,
  GitBranch,
  RotateCcw,
  Settings
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspace';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  lastModified?: Date;
  children?: FileNode[];
  isExpanded?: boolean;
  isLoading?: boolean;
  isGitTracked?: boolean;
  gitStatus?: 'modified' | 'added' | 'deleted' | 'untracked';
}

interface FileTreeProps {
  projectId?: string;
  onFileSelect?: (file: FileNode) => void;
  onFileCreate?: (parentPath: string, name: string, type: 'file' | 'folder') => void;
  onFileDelete?: (path: string) => void;
  onFileRename?: (oldPath: string, newName: string) => void;
}

export function FileTree({
  projectId,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename
}: FileTreeProps) {
  const { addTab, currentProject } = useWorkspaceStore();
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    file: FileNode;
  } | null>(null);
  const [draggedItem, setDraggedItem] = useState<FileNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock file system data - in real implementation, this would come from API/filesystem
  const mockFileSystem: FileNode[] = [
    {
      id: '1',
      name: 'src',
      type: 'folder',
      path: '/src',
      isExpanded: true,
      children: [
        {
          id: '2',
          name: 'components',
          type: 'folder',
          path: '/src/components',
          isExpanded: true,
          children: [
            {
              id: '3',
              name: 'Chat.tsx',
              type: 'file',
              path: '/src/components/Chat.tsx',
              size: 2048,
              lastModified: new Date(),
              isGitTracked: true,
              gitStatus: 'modified'
            },
            {
              id: '4',
              name: 'Editor.tsx',
              type: 'file',
              path: '/src/components/Editor.tsx',
              size: 3072,
              lastModified: new Date(),
              isGitTracked: true
            }
          ]
        },
        {
          id: '5',
          name: 'hooks',
          type: 'folder',
          path: '/src/hooks',
          children: [
            {
              id: '6',
              name: 'useWorkspace.ts',
              type: 'file',
              path: '/src/hooks/useWorkspace.ts',
              size: 1024,
              lastModified: new Date(),
              isGitTracked: true,
              gitStatus: 'added'
            }
          ]
        },
        {
          id: '7',
          name: 'styles',
          type: 'folder',
          path: '/src/styles',
          children: [
            {
              id: '8',
              name: 'globals.css',
              type: 'file',
              path: '/src/styles/globals.css',
              size: 512,
              lastModified: new Date(),
              isGitTracked: true
            }
          ]
        }
      ]
    },
    {
      id: '9',
      name: 'public',
      type: 'folder',
      path: '/public',
      children: [
        {
          id: '10',
          name: 'favicon.ico',
          type: 'file',
          path: '/public/favicon.ico',
          size: 15086,
          lastModified: new Date(),
          isGitTracked: true
        }
      ]
    },
    {
      id: '11',
      name: 'package.json',
      type: 'file',
      path: '/package.json',
      size: 2048,
      lastModified: new Date(),
      isGitTracked: true
    },
    {
      id: '12',
      name: 'README.md',
      type: 'file',
      path: '/README.md',
      size: 1536,
      lastModified: new Date(),
      isGitTracked: true,
      gitStatus: 'modified'
    },
    {
      id: '13',
      name: '.env.local',
      type: 'file',
      path: '/.env.local',
      size: 256,
      lastModified: new Date(),
      isGitTracked: false,
      gitStatus: 'untracked'
    }
  ];

  useEffect(() => {
    // Simulate loading files
    const loadFiles = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFiles(mockFileSystem);
      setIsLoading(false);
    };

    loadFiles();
  }, [projectId]);

  const handleFileClick = useCallback((file: FileNode) => {
    if (file.type === 'folder') {
      toggleFolder(file.id);
    } else {
      setSelectedFile(file.id);
      onFileSelect?.(file);
      
      // Open file in new tab
      addTab({
        title: file.name,
        type: 'code',
        filePath: file.path,
        projectId: currentProject?.id
      });
    }
  }, [addTab, currentProject?.id, onFileSelect]);

  const toggleFolder = useCallback((folderId: string) => {
    const updateNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === folderId) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };

    setFiles(updateNode(files));
  }, [files]);

  const handleContextMenu = useCallback((e: React.MouseEvent, file: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      file
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleRename = useCallback((file: FileNode) => {
    const newName = prompt('Enter new name:', file.name);
    if (newName && newName !== file.name) {
      onFileRename?.(file.path, newName);
      // Update local state
      // In real implementation, this would trigger a sync
    }
    closeContextMenu();
  }, [onFileRename, closeContextMenu]);

  const handleDelete = useCallback((file: FileNode) => {
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      onFileDelete?.(file.path);
      // Update local state
      // In real implementation, this would trigger a sync
    }
    closeContextMenu();
  }, [onFileDelete, closeContextMenu]);

  const handleDragStart = useCallback((e: React.DragEvent, file: FileNode) => {
    setDraggedItem(file);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetFile: FileNode) => {
    e.preventDefault();
    
    if (draggedItem && targetFile.type === 'folder' && draggedItem.id !== targetFile.id) {
      console.log(`Moving ${draggedItem.path} to ${targetFile.path}`);
      // In real implementation, this would trigger file move operation
    }
    
    setDraggedItem(null);
  }, [draggedItem]);

  const getFileIcon = useCallback((file: FileNode) => {
    if (file.type === 'folder') {
      return file.isExpanded ? 
        <FolderOpen className="w-4 h-4 text-blue-400" /> : 
        <Folder className="w-4 h-4 text-blue-400" />;
    }

    // File type icons based on extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    const iconClass = "w-4 h-4";
    
    switch (extension) {
      case 'tsx':
      case 'ts':
        return <File className={`${iconClass} text-blue-300`} />;
      case 'js':
      case 'jsx':
        return <File className={`${iconClass} text-yellow-300`} />;
      case 'css':
      case 'scss':
        return <File className={`${iconClass} text-pink-300`} />;
      case 'md':
        return <File className={`${iconClass} text-gray-300`} />;
      case 'json':
        return <File className={`${iconClass} text-orange-300`} />;
      default:
        return <File className={`${iconClass} text-gray-400`} />;
    }
  }, []);

  const getGitStatusColor = useCallback((status?: string) => {
    switch (status) {
      case 'modified': return 'text-yellow-400';
      case 'added': return 'text-green-400';
      case 'deleted': return 'text-red-400';
      case 'untracked': return 'text-gray-400';
      default: return '';
    }
  }, []);

  const filterFiles = useCallback((nodes: FileNode[], term: string): FileNode[] => {
    if (!term) return nodes;
    
    return nodes.filter(node => {
      if (node.name.toLowerCase().includes(term.toLowerCase())) {
        return true;
      }
      if (node.children) {
        const filteredChildren = filterFiles(node.children, term);
        return filteredChildren.length > 0;
      }
      return false;
    }).map(node => ({
      ...node,
      children: node.children ? filterFiles(node.children, term) : undefined,
      isExpanded: term ? true : node.isExpanded
    }));
  }, []);

  const renderFileNode = useCallback((file: FileNode, level: number = 0) => {
    const isSelected = selectedFile === file.id;
    const isDragging = draggedItem?.id === file.id;

    return (
      <motion.div
        key={file.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        className={`select-none ${isDragging ? 'opacity-50' : ''}`}
      >
        <div
          className={`flex items-center gap-2 px-2 py-1 hover:bg-accent/50 cursor-pointer rounded-sm transition-colors ${
            isSelected ? 'bg-accent/70' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleFileClick(file)}
          onContextMenu={(e) => handleContextMenu(e, file)}
          draggable
          onDragStart={(e) => handleDragStart(e, file)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, file)}
        >
          {file.type === 'folder' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(file.id);
              }}
              className="p-0.5 hover:bg-accent/50 rounded"
            >
              {file.isExpanded ? 
                <ChevronDown className="w-3 h-3" /> : 
                <ChevronRight className="w-3 h-3" />
              }
            </button>
          )}
          
          {file.type === 'file' && <div className="w-4" />}
          
          {getFileIcon(file)}
          
          <span className="flex-1 text-sm truncate">{file.name}</span>
          
          {file.gitStatus && (
            <div className={`w-2 h-2 rounded-full ${getGitStatusColor(file.gitStatus)} bg-current`} />
          )}
          
          {file.isLoading && (
            <div className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {file.type === 'folder' && file.isExpanded && file.children && (
          <AnimatePresence>
            {file.children.map(child => renderFileNode(child, level + 1))}
          </AnimatePresence>
        )}
      </motion.div>
    );
  }, [
    selectedFile,
    draggedItem,
    handleFileClick,
    handleContextMenu,
    handleDragStart,
    handleDragOver,
    handleDrop,
    toggleFolder,
    getFileIcon,
    getGitStatusColor
  ]);

  const filteredFiles = filterFiles(files, searchTerm);

  return (
    <div className="h-full flex flex-col bg-card/30 border-r border-border">
      {/* File Tree Header */}
      <div className="flex-shrink-0 h-12 px-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-blue-400" />
          <span className="font-medium text-sm">Files</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 hover:bg-accent/50 rounded transition-colors"
            title="New File"
            onClick={() => {
              const name = prompt('File name:');
              if (name) {
                onFileCreate?.('/', name, 'file');
              }
            }}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1.5 hover:bg-accent/50 rounded transition-colors"
            title="Refresh"
            onClick={() => window.location.reload()}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1.5 hover:bg-accent/50 rounded transition-colors"
            title="More options"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex-shrink-0 p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Loading files...</span>
            </div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Folder className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'No files found' : 'No files in project'}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <AnimatePresence>
              {filteredFiles.map(file => renderFileNode(file))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={closeContextMenu}
        >
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-accent/50 flex items-center gap-2"
            onClick={() => handleRename(contextMenu.file)}
          >
            <Edit className="w-4 h-4" />
            Rename
          </button>
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-accent/50 flex items-center gap-2"
            onClick={() => {
              navigator.clipboard.writeText(contextMenu.file.path);
              closeContextMenu();
            }}
          >
            <Copy className="w-4 h-4" />
            Copy Path
          </button>
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-accent/50 flex items-center gap-2"
            onClick={() => {
              // Download file logic
              closeContextMenu();
            }}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <div className="border-t border-border my-1" />
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-accent/50 flex items-center gap-2 text-red-400"
            onClick={() => handleDelete(contextMenu.file)}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      {/* Footer with Git status */}
      <div className="flex-shrink-0 h-8 px-3 flex items-center justify-between border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>
        <div className="flex items-center gap-3">
          <span>3 files</span>
          <span>2 modified</span>
        </div>
      </div>
    </div>
  );
} 