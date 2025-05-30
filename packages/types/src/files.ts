// packages/types/src/files.ts
// === FILE OPERATIONS ONLY ===

// File operations
export interface FileOperation {
  type: FileOperationType;
  file_id: string;
  old_path?: string;
  new_path?: string;
  content?: string;
  timestamp: string;
  user_id: string;
}

export type FileOperationType = 'create' | 'update' | 'delete' | 'move' | 'copy';

// File diff and versioning
export interface FileDiff {
  old_content: string;
  new_content: string;
  changes: FileDiffChange[];
  stats: FileDiffStats;
}

export interface FileDiffChange {
  type: 'add' | 'remove' | 'modify';
  line_number: number;
  content: string;
}

export interface FileDiffStats {
  additions: number;
  deletions: number;
  modifications: number;
}

// File search
export interface FileSearchResult {
  file_id: string;
  path: string;
  matches: FileSearchMatch[];
  relevance_score: number;
}

export interface FileSearchMatch {
  line_number: number;
  content: string;
  highlights: FileSearchHighlight[];
}

export interface FileSearchHighlight {
  start: number;
  end: number;
  text: string;
}

// File analytics
export interface FileAnalytics {
  most_edited: FileUsage[];
  language_distribution: FileLanguageStats[];
  size_distribution: FileSizeDistribution;
  recent_activity: FileActivity[];
}

export interface FileUsage {
  file_id: string;
  path: string;
  edit_count: number;
  last_edited: string;
}

export interface FileLanguageStats {
  language: string;
  file_count: number;
  total_size: number;
  percentage: number;
}

export interface FileSizeDistribution {
  small: number; // < 1KB
  medium: number; // 1KB - 100KB
  large: number; // 100KB - 1MB
  huge: number; // > 1MB
}

export interface FileActivity {
  file_id: string;
  operation: FileOperationType;
  timestamp: string;
  user_id: string;
}

// File upload and management
export interface FileUploadRequest {
  name: string;
  content: string;
  path: string;
  project_id: string;
}

export interface FileUpdateRequest {
  content?: string;
  path?: string;
  name?: string;
}

export interface FileWatchEvent {
  type: FileWatchEventType;
  file_id: string;
  path: string;
  timestamp: string;
}

export type FileWatchEventType = 'created' | 'modified' | 'deleted' | 'moved';

// === FILE OPERATIONS ===

export interface FileMetadata {
  encoding?: string;
  lastModified?: Date;
  checksum?: string;
  tags?: string[];
  description?: string;
  [key: string]: any;
}

export interface FileVersion {
  id: string;
  fileId: string;
  version: number;
  size: number;
  checksum: string;
  createdBy: string;
  createdAt: Date;
  comment?: string;
}

export interface FilePermissions {
  read: boolean;
  write: boolean;
  delete: boolean;
  share: boolean;
}

export interface FileShare {
  id: string;
  fileId: string;
  sharedBy: string;
  sharedWith?: string;
  shareType: 'public' | 'private' | 'project';
  permissions: FilePermissions;
  expiresAt?: Date;
  createdAt: Date;
}

export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface FileSearchFilters {
  fileTypes?: string[];
  sizeRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  createdBy?: string;
}

export interface FileStats {
  totalFiles: number;
  totalSize: number;
  filesByType: Record<string, number>;
  sizeByType: Record<string, number>;
  recentFiles: DatabaseFile[];
  largestFiles: DatabaseFile[];
}

// === FILE SERVICE REQUEST/RESPONSE TYPES ===

export interface CreateFileRequest {
  name: string;
  project_id: string;
  content: string | object;
  file_type?: string;
  size?: number;
  metadata?: Record<string, any>;
}

export interface UpdateFileRequest {
  name?: string;
  content?: string | object;
  metadata?: Record<string, any>;
}

export interface FileListResponse {
  files: DatabaseFile[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface FileSearchRequest {
  query?: string;
  projectId?: string;
  fileType?: string;
  offset?: number;
  limit?: number;
}

export interface FileSearchResponse {
  files: DatabaseFile[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface FileAnalytics {
  totalFiles: number;
  totalSize: number;
  filesByType: Record<string, number>;
  sizeByType: Record<string, number>;
  recentFiles: DatabaseFile[];
  averageFileSize: number;
}

// Import database types for reference
import type { DatabaseFile } from './database';