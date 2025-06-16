'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Settings,
  Eye,
  EyeOff,
  Filter,
  SortAsc,
  SortDesc,
  Clock,
  FileText,
  Code,
  Image,
  Archive,
  Database,
  Globe,
  Zap,
  Star,
  BookOpen,
  Terminal,
  Brain
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspace';
import { useCurrentProject } from '@/stores/projectStore';
import { projectService } from '@/services/projectService';
import { fileSystemService } from '@/services/fileSystemService';
import { contextService, type FileContext } from '@/services/contextService';
import { useMonitoring } from '@/components/providers/MonitoringProvider';

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
  language?: string;
  isActive?: boolean;
  isStarred?: boolean;
  isHidden?: boolean;
  permissions?: {
    read: boolean;
    write: boolean;
    execute: boolean;
  };
  metadata?: {
    lines?: number;
    encoding?: string;
    mimeType?: string;
    isSymlink?: boolean;
    target?: string;
  };
}

interface FileTreeProps {
  projectId?: string;
  onFileSelect?: (file: FileNode) => void;
  onFileCreate?: (parentPath: string, name: string, type: 'file' | 'folder') => void;
  onFileDelete?: (path: string) => void;
  onFileRename?: (oldPath: string, newName: string) => void;
  onFileMove?: (sourcePath: string, targetPath: string) => void;
  showHidden?: boolean;
  enableContextIntegration?: boolean;
}

type SortOption = 'name' | 'type' | 'size' | 'modified';
type SortDirection = 'asc' | 'desc';
type FilterOption = 'all' | 'files' | 'folders' | 'modified' | 'starred';

export function FileTree({
  projectId,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
  onFileMove,
  showHidden = false,
  enableContextIntegration = true
}: FileTreeProps) {
  const { addTab } = useWorkspaceStore();
  const currentProject = useCurrentProject();
  const { captureMessage } = useMonitoring();
  
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    file: FileNode;
  } | null>(null);
  const [draggedItem, setDraggedItem] = useState<FileNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [starredFiles, setStarredFiles] = useState<Set<string>>(new Set());
  const [recentFiles, setRecentFiles] = useState<FileNode[]>([]);
  const [fileWatcher, setFileWatcher] = useState<any | null>(null);

  // Load files from current project or file system service
  const loadProjectFiles = useCallback(async () => {
    if (!projectId && !currentProject) {
      setFiles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const projectPath = projectId ? 
        (await projectService.getProjectById(projectId))?.path : 
        currentProject?.path;

      if (projectPath) {
        // Load files from file system service
        const projectFiles = await fileSystemService.getDirectoryTree(projectPath);
        setFiles(projectFiles || []);
      } else {
        // Show empty state for new projects
        setFiles([]);
      }
    } catch (error) {
      console.error('Failed to load project files:', error);
      captureMessage('Failed to load project files', 'error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId: projectId || currentProject?.id
      });
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, currentProject, captureMessage]);

  // Initialize with project files or show empty state
  useEffect(() => {
    loadProjectFiles();
  }, [loadProjectFiles]);

  // Show empty state when no project is loaded
  const emptyState = !currentProject && !projectId;

  // Context integration
  useEffect(() => {
    if (!enableContextIntegration) return;

    const unsubscribe = contextService.subscribe((context) => {
      // Update active files based on context
      const activeFilePaths = context.activeFiles.map(f => f.path);
      
      setFiles(prevFiles => {
        const updateActiveStatus = (nodes: FileNode[]): FileNode[] => {
          return nodes.map(node => ({
            ...node,
            isActive: node.type === 'file' && activeFilePaths.includes(node.path),
            children: node.children ? updateActiveStatus(node.children) : undefined
          }));
        };
        
        return updateActiveStatus(prevFiles);
      });

      // Update recent files
      const recentFileNodes = context.activeFiles.slice(0, 5).map(contextFile => {
        const findFileNode = (nodes: FileNode[]): FileNode | undefined => {
          for (const node of nodes) {
            if (node.path === contextFile.path) return node;
            if (node.children) {
              const found = findFileNode(node.children);
              if (found) return found;
            }
          }
          return undefined;
        };
        
        return findFileNode(files);
      }).filter(Boolean) as FileNode[];
      
      setRecentFiles(recentFileNodes);
    });

    return unsubscribe;
  }, [enableContextIntegration, files]);

  // File system monitoring (simplified)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Simplified file monitoring - in production, integrate with File System Access API
    const interval = setInterval(() => {
      // Periodic refresh for demo purposes
      if (Math.random() > 0.98) { // 2% chance of refresh
        loadProjectFiles();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [loadProjectFiles]);

  // Load starred files from localStorage
  useEffect(() => {
    const savedStarred = localStorage.getItem('omnipanel-starred-files');
    if (savedStarred) {
      setStarredFiles(new Set(JSON.parse(savedStarred)));
    }
  }, []);

  // Enhanced file click handler with context integration
  const handleFileClick = useCallback((file: FileNode) => {
    if (file.type === 'folder') {
      toggleFolder(file.id);
    } else {
      setSelectedFile(file.id);
      onFileSelect?.(file);
      
      // Add to context service
      if (enableContextIntegration) {
        const fileContext: FileContext = {
          path: file.path,
          name: file.name,
          type: 'file',
          language: file.language,
          size: file.size,
          lastModified: file.lastModified
        };
        
        contextService.addFile(fileContext);
      }
      
      // Open file in new tab
      addTab({
        title: file.name,
        type: 'code',
        filePath: file.path,
        projectId: currentProject?.id
      });
      
      captureMessage('File opened', 'info', {
        fileName: file.name,
        filePath: file.path,
        language: file.language
      });
    }
  }, [addTab, currentProject?.id, onFileSelect, enableContextIntegration, captureMessage]);

  // Toggle folder expansion
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

  // Star/unstar file
  const toggleStar = useCallback((file: FileNode) => {
    const newStarred = new Set(starredFiles);
    
    if (starredFiles.has(file.path)) {
      newStarred.delete(file.path);
    } else {
      newStarred.add(file.path);
    }
    
    setStarredFiles(newStarred);
    localStorage.setItem('omnipanel-starred-files', JSON.stringify([...newStarred]));
    
    // Update file in tree
    const updateStarStatus = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => ({
        ...node,
        isStarred: newStarred.has(node.path),
        children: node.children ? updateStarStatus(node.children) : undefined
      }));
    };
    
    setFiles(updateStarStatus(files));
    
    captureMessage(`File ${newStarred.has(file.path) ? 'starred' : 'unstarred'}`, 'info', {
      fileName: file.name,
      filePath: file.path
    });
  }, [starredFiles, captureMessage]);

  // Enhanced context menu
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

  // Enhanced file operations
  const handleRename = useCallback((file: FileNode) => {
    const newName = prompt('Enter new name:', file.name);
    if (newName && newName !== file.name) {
      onFileRename?.(file.path, newName);
      
      captureMessage('File renamed', 'info', {
        oldName: file.name,
        newName,
        filePath: file.path
      });
    }
    closeContextMenu();
  }, [onFileRename, closeContextMenu, captureMessage]);

  const handleDelete = useCallback((file: FileNode) => {
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      onFileDelete?.(file.path);
      
      // Remove from context if active
      if (enableContextIntegration) {
        contextService.removeFile(file.path);
      }
      
      captureMessage('File deleted', 'info', {
        fileName: file.name,
        filePath: file.path
      });
    }
    closeContextMenu();
  }, [onFileDelete, closeContextMenu, enableContextIntegration, captureMessage]);

  // Enhanced drag and drop
  const handleDragStart = useCallback((e: React.DragEvent, file: FileNode) => {
    setDraggedItem(file);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', file.path);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetFile: FileNode) => {
    e.preventDefault();
    
    if (draggedItem && targetFile.type === 'folder' && draggedItem.id !== targetFile.id) {
      const sourcePath = draggedItem.path;
      const targetPath = `${targetFile.path}/${draggedItem.name}`;
      
      onFileMove?.(sourcePath, targetPath);
      
      captureMessage('File moved', 'info', {
        fileName: draggedItem.name,
        sourcePath,
        targetPath
      });
    }
    
    setDraggedItem(null);
  }, [draggedItem, onFileMove, captureMessage]);

  // Enhanced file icon with language detection
  const getFileIcon = useCallback((file: FileNode) => {
    if (file.type === 'folder') {
      return file.isExpanded ? 
        <FolderOpen className="w-4 h-4 text-blue-400" /> : 
        <Folder className="w-4 h-4 text-blue-400" />;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    const iconClass = "w-4 h-4";
    
    // Language-specific icons
    switch (file.language || extension) {
      case 'typescript':
      case 'tsx':
      case 'ts':
        return <Code className={`${iconClass} text-blue-300`} />;
      case 'javascript':
      case 'jsx':
      case 'js':
        return <Code className={`${iconClass} text-yellow-300`} />;
      case 'css':
      case 'scss':
      case 'sass':
        return <FileText className={`${iconClass} text-pink-300`} />;
      case 'markdown':
      case 'md':
        return <BookOpen className={`${iconClass} text-gray-300`} />;
      case 'json':
        return <Database className={`${iconClass} text-orange-300`} />;
      case 'svg':
        return <Image className={`${iconClass} text-purple-300`} />;
      case 'env':
        return <Settings className={`${iconClass} text-green-300`} />;
      case 'gitignore':
        return <GitBranch className={`${iconClass} text-gray-400`} />;
      case 'binary':
        return <Archive className={`${iconClass} text-red-300`} />;
      default:
        return <File className={`${iconClass} text-gray-400`} />;
    }
  }, []);

  // Git status color
  const getGitStatusColor = useCallback((status?: string) => {
    switch (status) {
      case 'modified': return 'text-yellow-400';
      case 'added': return 'text-green-400';
      case 'deleted': return 'text-red-400';
      case 'untracked': return 'text-gray-400';
      default: return '';
    }
  }, []);

  // Enhanced filtering and sorting
  const processFiles = useMemo(() => {
    let processed = [...files];

    // Apply filters
    if (!showHidden) {
      const filterHidden = (nodes: FileNode[]): FileNode[] => {
        return nodes.filter(node => !node.isHidden).map(node => ({
          ...node,
          children: node.children ? filterHidden(node.children) : undefined
        }));
      };
      processed = filterHidden(processed);
    }

    // Apply search
    if (searchTerm) {
      const filterBySearch = (nodes: FileNode[]): FileNode[] => {
        return nodes.filter(node => {
          const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase());
          const hasMatchingChildren = node.children && filterBySearch(node.children).length > 0;
          return matchesSearch || hasMatchingChildren;
        }).map(node => ({
          ...node,
          children: node.children ? filterBySearch(node.children) : undefined,
          isExpanded: searchTerm ? true : node.isExpanded
        }));
      };
      processed = filterBySearch(processed);
    }

    // Apply type filter
    if (filterBy !== 'all') {
      const filterByType = (nodes: FileNode[]): FileNode[] => {
        return nodes.filter(node => {
          switch (filterBy) {
            case 'files': return node.type === 'file';
            case 'folders': return node.type === 'folder';
            case 'modified': return node.gitStatus === 'modified';
            case 'starred': return node.isStarred;
            default: return true;
          }
        }).map(node => ({
          ...node,
          children: node.children ? filterByType(node.children) : undefined
        }));
      };
      processed = filterByType(processed);
    }

    // Apply sorting
    const sortNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes.sort((a, b) => {
        let comparison = 0;
        
        // Folders first
        if (a.type !== b.type) {
          comparison = a.type === 'folder' ? -1 : 1;
        } else {
          switch (sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'size':
              comparison = (a.size || 0) - (b.size || 0);
              break;
            case 'modified':
              comparison = (a.lastModified?.getTime() || 0) - (b.lastModified?.getTime() || 0);
              break;
            case 'type':
              comparison = (a.language || '').localeCompare(b.language || '');
              break;
          }
        }
        
        return sortDirection === 'desc' ? -comparison : comparison;
      }).map(node => ({
        ...node,
        children: node.children ? sortNodes(node.children) : undefined
      }));
    };

    return sortNodes(processed);
  }, [files, showHidden, searchTerm, filterBy, sortBy, sortDirection]);

  // Render file node with enhanced features
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
          className={`group flex items-center gap-2 px-2 py-1 hover:bg-accent/50 cursor-pointer rounded-sm transition-colors ${
            isSelected ? 'bg-accent/70' : ''
          } ${file.isActive ? 'bg-primary/10 border-l-2 border-primary' : ''}`}
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
          
          <span className={`flex-1 text-sm truncate ${file.isActive ? 'font-medium text-primary' : ''}`}>
            {file.name}
          </span>
          
          {/* File badges */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {file.isStarred && (
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
            )}
            
            {file.isActive && (
              <Zap className="w-3 h-3 text-primary" />
            )}
            
            {file.gitStatus && (
              <div className={`w-2 h-2 rounded-full ${getGitStatusColor(file.gitStatus)} bg-current`} />
            )}
            
            {file.isLoading && (
              <div className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" />
            )}
          </div>
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

  return (
    <div className="h-full flex flex-col bg-card/30 border-r border-border">
      {/* Enhanced Header */}
      <div className="flex-shrink-0 h-12 px-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-blue-400" />
          <span className="font-medium text-sm">Explorer</span>
          {enableContextIntegration && (
            <Brain className="w-3 h-3 text-primary" />
          )}
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
            className={`p-1.5 hover:bg-accent/50 rounded transition-colors ${showFilters ? 'bg-accent/50' : ''}`}
            title="Filters & Sort"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1.5 hover:bg-accent/50 rounded transition-colors"
            title="Refresh"
            onClick={loadProjectFiles}
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

      {/* Filters & Sort Panel */}
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="flex-shrink-0 p-3 border-b border-border bg-muted/20"
        >
          <div className="space-y-3">
            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs bg-background border border-border rounded px-2 py-1"
              >
                <option value="name">Name</option>
                <option value="type">Type</option>
                <option value="size">Size</option>
                <option value="modified">Modified</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="p-1 hover:bg-accent/50 rounded"
              >
                {sortDirection === 'asc' ? 
                  <SortAsc className="w-3 h-3" /> : 
                  <SortDesc className="w-3 h-3" />
                }
              </button>
            </div>
            
            {/* Filter Options */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Filter:</span>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="text-xs bg-background border border-border rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="files">Files</option>
                <option value="folders">Folders</option>
                <option value="modified">Modified</option>
                <option value="starred">Starred</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

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

      {/* Recent Files Section */}
      {recentFiles.length > 0 && (
        <div className="flex-shrink-0 border-b border-border">
          <div className="px-3 py-2 bg-muted/10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Recent</span>
            </div>
            <div className="space-y-1">
              {recentFiles.slice(0, 3).map(file => (
                <div
                  key={`recent-${file.id}`}
                  className="flex items-center gap-2 px-2 py-1 hover:bg-accent/50 cursor-pointer rounded-sm text-xs"
                  onClick={() => handleFileClick(file)}
                >
                  {getFileIcon(file)}
                  <span className="truncate">{file.name}</span>
                  {file.isActive && <Zap className="w-2 h-2 text-primary" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* File List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Loading files...</span>
            </div>
          </div>
        ) : processFiles.length === 0 ? (
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
              {processFiles.map(file => renderFileNode(file))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Enhanced Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[200px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={closeContextMenu}
        >
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-accent/50 flex items-center gap-2"
            onClick={() => {
              toggleStar(contextMenu.file);
              closeContextMenu();
            }}
          >
            <Star className={`w-4 h-4 ${contextMenu.file.isStarred ? 'text-yellow-400 fill-current' : ''}`} />
            {contextMenu.file.isStarred ? 'Unstar' : 'Star'}
          </button>
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
          {enableContextIntegration && (
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent/50 flex items-center gap-2"
              onClick={() => {
                if (contextMenu.file.type === 'file') {
                  const fileContext: FileContext = {
                    path: contextMenu.file.path,
                    name: contextMenu.file.name,
                    type: 'file',
                    language: contextMenu.file.language,
                    size: contextMenu.file.size,
                    lastModified: contextMenu.file.lastModified
                  };
                  contextService.addFile(fileContext);
                }
                closeContextMenu();
              }}
            >
              <Brain className="w-4 h-4" />
              <span>AI Assist</span>
            </button>
          )}
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

      {/* Enhanced Footer */}
      <div className="flex-shrink-0 h-8 px-3 flex items-center justify-between border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
          {enableContextIntegration && (
            <div className="flex items-center gap-1">
              <Brain className="w-3 h-3 text-primary" />
              <span className="text-primary">Context</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>{processFiles.length} items</span>
          {starredFiles.size > 0 && <span>{starredFiles.size} starred</span>}
          {recentFiles.length > 0 && <span>{recentFiles.length} recent</span>}
        </div>
      </div>
    </div>
  );
} 