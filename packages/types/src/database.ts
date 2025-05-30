// packages/types/src/database.ts
// === CORE DATABASE ENTITIES ONLY ===

// Users table
export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  subscription_tier: DatabaseSubscriptionTier;
  preferences: DatabaseUserPreferences;
  created_at: string;
  updated_at: string;
}

// Legacy alias for backward compatibility
export type User = DatabaseUser;

export type DatabaseSubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface DatabaseUserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    mentions: boolean;
  };
}

// Projects table
export interface DatabaseProject {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  status: DatabaseProjectStatus;
  type: DatabaseProjectType;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type DatabaseProjectStatus = 'active' | 'archived' | 'deleted';
export type DatabaseProjectType = 'chat' | 'code' | 'notebook' | 'mixed';

// Project members table
export interface DatabaseProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: DatabaseProjectRole;
  invited_by: string;
  joined_at: string;
}

export type DatabaseProjectRole = 'owner' | 'admin' | 'member' | 'viewer';

// Chat sessions table
export interface DatabaseChatSession {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  model_provider: string;
  model_name: string;
  system_prompt?: string;
  created_at: string;
  updated_at: string;
}

// Messages table
export interface DatabaseMessage {
  id: string;
  session_id: string;
  role: DatabaseMessageRole;
  content: string;
  content_type: DatabaseContentType;
  attachments?: DatabaseMessageAttachment[];
  metadata: Record<string, any>;
  created_at: string;
}

export type DatabaseMessageRole = 'user' | 'assistant' | 'system';
export type DatabaseContentType = 'text' | 'markdown' | 'code' | 'image' | 'file';

export interface DatabaseMessageAttachment {
  id: string;
  type: DatabaseAttachmentType;
  url: string;
  name: string;
  size?: number;
}

export type DatabaseAttachmentType = 'image' | 'file' | 'code' | 'link';

// Files table
export interface DatabaseFile {
  id: string;
  project_id: string;
  name: string;
  path: string;
  type: DatabaseFileType;
  size: number;
  content?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export type DatabaseFileType = 'file' | 'directory';

// File versions table
export interface DatabaseFileVersion {
  id: string;
  file_id: string;
  version_number: number;
  content: string;
  size: number;
  checksum: string;
  created_by: string;
  created_at: string;
}