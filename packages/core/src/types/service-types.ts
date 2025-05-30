// packages/core/src/types/service-types.ts
// Service-specific type mappings

import type {
  DatabaseChatSession,
  DatabaseMessage,
  DatabaseProject,
  DatabaseProjectMember,
  DatabaseFile,
  DatabaseFileVersion,
  DatabaseProjectRole,
  DatabaseMessageRole,
  APIPaginatedResponse,
  APIPagination
} from '@omnipanel/types';

// Chat types
export interface ChatSession extends Omit<DatabaseChatSession, 'user_id' | 'project_id' | 'model_provider' | 'model_name' | 'system_prompt' | 'created_at' | 'updated_at'> {
  userId: string;
  projectId: string;
  modelProvider: string;
  modelName: string;
  modelConfig?: Record<string, any>;
  systemPrompt?: string;
  metadata?: Record<string, any>;
  settings: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
  };
  messageCount: number;
  totalTokens: number;
  lastMessageAt?: Date | null;
  archived?: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message extends Omit<DatabaseMessage, 'session_id' | 'content_type' | 'created_at'> {
  sessionId: string;
  parentMessageId?: string;
  updatedAt?: Date;
  createdAt: Date;
}

export type MessageRole = DatabaseMessageRole;

// Project types
export interface Project extends Omit<DatabaseProject, 'user_id' | 'created_at' | 'updated_at' | 'status' | 'type'> {
  ownerId: string;
  slug: string;
  visibility: 'private' | 'public' | 'team';
  tags: string[];
  metadata: Record<string, any>;
  archived?: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember extends Omit<DatabaseProjectMember, 'project_id' | 'user_id' | 'invited_by' | 'joined_at'> {
  projectId: string;
  userId: string;
  invitedBy: string;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectInvite {
  id: string;
  projectId: string;
  email: string;
  role: ProjectRole;
  invitedBy: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
  acceptedAt?: Date;
  declinedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectRole = DatabaseProjectRole | 'contributor' | 'editor' | 'viewer';

// File types
export interface File extends Omit<DatabaseFile, 'project_id' | 'parent_id' | 'created_at' | 'updated_at' | 'type'> {
  originalName: string;
  projectId: string;
  parentFolderId?: string | null;
  mimeType: string;
  extension?: string | null;
  hash?: string | null;
  uploadedBy: string;
  storageProvider: string;
  storageKey: string;
  url?: string | null;
  isFolder: boolean;
  metadata: Record<string, any>;
  tags: string[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileVersion extends Omit<DatabaseFileVersion, 'file_id' | 'version_number' | 'created_by' | 'created_at'> {
  fileId: string;
  versionNumber: number;
  contentHash: string;
  comment?: string;
  createdBy: string;
  createdAt: Date;
}

// API types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchFilters {
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  type?: string;
  status?: string;
  [key: string]: any;
}

// Request/Response types
export interface CreateChatSessionData {
  title?: string;
  projectId: string;
  modelProvider: string;
  modelName: string;
  modelConfig?: Record<string, any>;
  systemPrompt?: string;
  settings?: Partial<ChatSession['settings']>;
  metadata?: Record<string, any>;
}

export interface UpdateChatSessionData {
  title?: string;
  systemPrompt?: string;
  settings?: Partial<ChatSession['settings']>;
  metadata?: Record<string, any>;
  archived?: boolean;
}

export interface CreateMessageData {
  role: MessageRole;
  content: string | object;
  parentMessageId?: string;
  metadata?: Record<string, any>;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  visibility?: Project['visibility'];
  settings?: {
    allowContributors?: boolean;
    requireApproval?: boolean;
    defaultRole?: string;
    features?: Record<string, boolean>;
  };
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  visibility?: Project['visibility'];
  settings?: Partial<CreateProjectData['settings']>;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface InviteProjectMemberData {
  email: string;
  role: ProjectRole;
  message?: string;
}

export interface CreateFileData {
  name: string;
  projectId: string;
  size: number;
  mimeType: string;
  content?: string;
  parentFolderId?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface UpdateFileData {
  name?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface FileUploadData extends CreateFileData {
  encoding?: string;
  lastModified?: Date;
  storageProvider?: string;
  storageKey?: string;
  url?: string;
}

export interface FileMoveData {
  projectId?: string;
  parentFolderId?: string;
}

export interface FileCopyData {
  name?: string;
  projectId?: string;
  parentFolderId?: string;
}

// Statistics types
export interface ChatStats {
  totalSessions: number;
  totalMessages: number;
  totalTokens: number;
  recentSessions: Array<{
    id: string;
    title: string;
    messageCount: number;
    lastMessageAt?: Date;
    createdAt: Date;
  }>;
  modelUsage: Record<string, number>;
  dailyUsage: Array<{
    date: string;
    messages: number;
    tokens: number;
  }>;
  averageSessionLength: number;
}

export interface ProjectStats {
  memberCount: number;
  chatSessionCount: number;
  fileCount: number;
  notebookCount: number;
  recentActivity: {
    chatSessions: Array<{
      id: string;
      title: string;
      updatedAt: Date;
      type: string;
    }>;
    files: Array<{
      id: string;
      name: string;
      updatedAt: Date;
      type: string;
    }>;
  };
  storageUsed: number;
}

export interface FileStats {
  totalFiles: number;
  totalFolders: number;
  totalSize: number;
  recentFiles: Array<{
    id: string;
    name: string;
    size: number;
    mimeType: string;
    updatedAt: Date;
  }>;
  fileTypes: Record<string, number>;
  averageFileSize: number;
}

// Export formats
export type ChatExportFormat = 'json' | 'markdown' | 'txt'; 