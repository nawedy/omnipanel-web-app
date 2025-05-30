import type {
  DatabaseFile,
  CreateFileRequest,
  UpdateFileRequest,
  FileListResponse,
  FileSearchRequest,
  FileSearchResponse
} from '@omnipanel/types';
import { DatabaseClient } from '@/database/client';
import { CoreError, ErrorCodes } from '@/utils/errors';
import { validateInput } from '@/utils/validation';
import { sanitizeFilename, sanitizeInput } from '@/utils/sanitization';

export interface PaginationOptions {
  offset?: number;
  limit?: number;
}

export interface FileAnalytics {
  totalFiles: number;
  totalSize: number;
  filesByType: Record<string, number>;
  sizeByType: Record<string, number>;
  recentFiles: DatabaseFile[];
  averageFileSize: number;
}

export class FilesService {
  private db: DatabaseClient;

  constructor(database: DatabaseClient) {
    this.db = database;
  }

  /**
   * Create a new file
   */
  async createFile(
    userId: string,
    data: CreateFileRequest
  ): Promise<DatabaseFile> {
    try {
      // Validate input
      const validation = validateInput(data, {
        name: { required: true, minLength: 1, maxLength: 255 },
        project_id: { required: true },
        content: { required: true }
      });

      if (!validation.isValid) {
        throw new CoreError(
          'Invalid file data',
          ErrorCodes.VALIDATION_ERROR,
          validation.errors
        );
      }

      // Check if user has access to the project
      const project = await this.db.projects.findById(data.project_id);
      if (!project) {
        throw new CoreError(
          'Project not found',
          ErrorCodes.PROJECT_NOT_FOUND
        );
      }

      // For now, only check if user is the project owner
      // TODO: Add proper project membership check
      if (project.user_id !== userId) {
        throw new CoreError(
          'Access denied to project',
          ErrorCodes.ACCESS_DENIED
        );
      }

      // Sanitize filename
      const sanitizedName = sanitizeFilename(data.name);
      if (!sanitizedName) {
        throw new CoreError(
          'Invalid filename',
          ErrorCodes.VALIDATION_ERROR
        );
      }

      // Check if file with same name exists in project
      const existingFiles = await this.db.files.findByProjectId(data.project_id);
      const nameExists = existingFiles.some(file => file.name === sanitizedName);
      if (nameExists) {
        throw new CoreError(
          'File with this name already exists in project',
          ErrorCodes.FILE_ALREADY_EXISTS
        );
      }

      // Create file data for database
      const fileData = {
        name: sanitizedName,
        project_id: data.project_id,
        path: `/${sanitizedName}`, // Simple path for now
        type: 'file' as const,
        size: data.size || Buffer.byteLength(data.content.toString(), 'utf8'),
        content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content)
      };

      return await this.db.files.create(fileData);
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to create file',
        ErrorCodes.FILE_CREATE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Get a file by ID
   */
  async getFile(fileId: string, userId: string): Promise<DatabaseFile> {
    try {
      const file = await this.db.files.findById(fileId);
      if (!file) {
        throw new CoreError(
          'File not found',
          ErrorCodes.FILE_NOT_FOUND
        );
      }

      // Check if user has access to the project that owns this file
      const project = await this.db.projects.findById(file.project_id);
      if (!project) {
        throw new CoreError(
          'Project not found',
          ErrorCodes.PROJECT_NOT_FOUND
        );
      }

      // For now, only check if user is the project owner
      // TODO: Add proper project membership check
      if (project.user_id !== userId) {
        throw new CoreError(
          'Access denied to file',
          ErrorCodes.ACCESS_DENIED
        );
      }

      return file;
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to get file',
        ErrorCodes.FILE_GET_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Update a file
   */
  async updateFile(
    fileId: string,
    userId: string,
    data: UpdateFileRequest
  ): Promise<DatabaseFile> {
    try {
      // Get and validate file access
      const file = await this.getFile(fileId, userId);

      // Validate update data
      const validation = validateInput(data, {
        name: { minLength: 1, maxLength: 255 },
        content: { minLength: 0 }
      });

      if (!validation.isValid) {
        throw new CoreError(
          'Invalid update data',
          ErrorCodes.VALIDATION_ERROR,
          validation.errors
        );
      }

      // Prepare update data
      const updateData: Partial<DatabaseFile> = {};
      
      if (data.name !== undefined) {
        const sanitizedName = sanitizeFilename(data.name);
        if (!sanitizedName) {
          throw new CoreError(
            'Invalid filename',
            ErrorCodes.VALIDATION_ERROR
          );
        }

        // Check if new name conflicts with existing files
        const existingFiles = await this.db.files.findByProjectId(file.project_id);
        const nameExists = existingFiles.some(f => f.id !== fileId && f.name === sanitizedName);
        if (nameExists) {
          throw new CoreError(
            'File with this name already exists in project',
            ErrorCodes.FILE_ALREADY_EXISTS
          );
        }

        updateData.name = sanitizedName;
        updateData.path = `/${sanitizedName}`;
      }

      if (data.content !== undefined) {
        updateData.content = typeof data.content === 'string' ? data.content : JSON.stringify(data.content);
        updateData.size = Buffer.byteLength(updateData.content, 'utf8');
      }

      return await this.db.files.update(fileId, updateData);
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to update file',
        ErrorCodes.FILE_UPDATE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string, userId: string): Promise<void> {
    try {
      // Get and validate file access
      await this.getFile(fileId, userId);

      // Delete the file
      await this.db.files.delete(fileId);
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to delete file',
        ErrorCodes.FILE_DELETE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * List files for a project
   */
  async listFiles(
    userId: string,
    projectId: string,
    options: PaginationOptions = {}
  ): Promise<FileListResponse> {
    try {
      const { offset = 0, limit = 20 } = options;

      // Verify user has access to project
      const project = await this.db.projects.findById(projectId);
      if (!project) {
        throw new CoreError(
          'Project not found',
          ErrorCodes.PROJECT_NOT_FOUND
        );
      }

      // For now, only check if user is the project owner
      // TODO: Add proper project membership check
      if (project.user_id !== userId) {
        throw new CoreError(
          'Access denied to project',
          ErrorCodes.ACCESS_DENIED
        );
      }

      // Get files for project
      const allFiles = await this.db.files.findByProjectId(projectId);
      const total = allFiles.length;
      
      // Apply pagination
      const files = allFiles.slice(offset, offset + limit);

      return {
        files,
        total,
        offset,
        limit,
        hasMore: offset + limit < total
      };
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to list files',
        ErrorCodes.FILE_LIST_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Search files
   */
  async searchFiles(
    userId: string,
    request: FileSearchRequest
  ): Promise<FileSearchResponse> {
    try {
      const { query, projectId, offset = 0, limit = 20 } = request;

      let allFiles: DatabaseFile[];

      if (projectId) {
        // Verify user has access to project
        const project = await this.db.projects.findById(projectId);
        if (!project || project.user_id !== userId) {
          throw new CoreError(
            'Access denied to project',
            ErrorCodes.ACCESS_DENIED
          );
        }
        allFiles = await this.db.files.findByProjectId(projectId);
      } else {
        // Get all files from user's projects
        const userProjects = await this.db.projects.findByUserId(userId);
        allFiles = [];
        for (const project of userProjects) {
          const projectFiles = await this.db.files.findByProjectId(project.id);
          allFiles = [...allFiles, ...projectFiles];
        }
      }

      // Filter by search query
      let filteredFiles = allFiles.filter(file => {
        const matchesQuery = !query || 
          file.name.toLowerCase().includes(query.toLowerCase()) ||
          (file.content && file.content.toLowerCase().includes(query.toLowerCase()));
        
        return matchesQuery;
      });

      // Sort by relevance (name matches first, then content matches)
      if (query) {
        filteredFiles.sort((a, b) => {
          const aNameMatch = a.name.toLowerCase().includes(query.toLowerCase());
          const bNameMatch = b.name.toLowerCase().includes(query.toLowerCase());
          
          if (aNameMatch && !bNameMatch) return -1;
          if (!aNameMatch && bNameMatch) return 1;
          
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
      }

      const total = filteredFiles.length;
      const files = filteredFiles.slice(offset, offset + limit);

      return {
        files,
        total,
        offset,
        limit,
        hasMore: offset + limit < total
      };
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to search files',
        ErrorCodes.FILE_SEARCH_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Get file analytics for a user
   */
  async getFileAnalytics(userId: string, projectId?: string): Promise<FileAnalytics> {
    try {
      let allFiles: DatabaseFile[];

      if (projectId) {
        // Verify user has access to project
        const project = await this.db.projects.findById(projectId);
        if (!project || project.user_id !== userId) {
          throw new CoreError(
            'Access denied to project',
            ErrorCodes.ACCESS_DENIED
          );
        }
        allFiles = await this.db.files.findByProjectId(projectId);
      } else {
        // Get all files from user's projects
        const userProjects = await this.db.projects.findByUserId(userId);
        allFiles = [];
        for (const project of userProjects) {
          const projectFiles = await this.db.files.findByProjectId(project.id);
          allFiles = [...allFiles, ...projectFiles];
        }
      }

      const totalFiles = allFiles.length;
      const totalSize = allFiles.reduce((sum, file) => sum + (file.size || 0), 0);

      // Group by file type (using file extension as type)
      const filesByType: Record<string, number> = {};
      allFiles.forEach(file => {
        const extension = file.name.split('.').pop() || 'unknown';
        filesByType[extension] = (filesByType[extension] || 0) + 1;
      });

      // Get recent files (last 10)
      const recentFiles = allFiles
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 10);

      // Calculate size by type
      const sizeByType: Record<string, number> = {};
      allFiles.forEach(file => {
        const extension = file.name.split('.').pop() || 'unknown';
        sizeByType[extension] = (sizeByType[extension] || 0) + (file.size || 0);
      });

      return {
        totalFiles,
        totalSize,
        filesByType,
        sizeByType,
        recentFiles,
        averageFileSize: totalFiles > 0 ? Math.round(totalSize / totalFiles) : 0
      };
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to get file analytics',
        ErrorCodes.ANALYTICS_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Get file content only (for large files)
   */
  async getFileContent(fileId: string, userId: string): Promise<string> {
    try {
      const file = await this.getFile(fileId, userId);
      return file.content || '';
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to get file content',
        ErrorCodes.FILE_CONTENT_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Update file content only
   */
  async updateFileContent(
    fileId: string,
    userId: string,
    content: string
  ): Promise<DatabaseFile> {
    try {
      // Get and validate file access
      await this.getFile(fileId, userId);

      // Update content and size
      const updateData = {
        content: sanitizeInput(content),
        size: Buffer.byteLength(content, 'utf8')
      };

      return await this.db.files.update(fileId, updateData);
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to update file content',
        ErrorCodes.FILE_UPDATE_ERROR,
        { originalError: error }
      );
    }
  }
} 