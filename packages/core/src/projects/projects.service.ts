// packages/core/src/projects/projects.service.ts
import { nanoid } from 'nanoid';
import type {
  Project,
  ProjectMember,
  ProjectInvite,
  ProjectRole,
  ProjectStats,
  CreateProjectData,
  UpdateProjectData,
  InviteProjectMemberData,
  PaginatedResponse,
  SearchFilters
} from '../types/service-types';
import type { DatabaseClient } from '../database/client';
import { CoreError, ErrorCodes } from '../utils/errors';
import { validateInput } from '../utils/validation';
import { generateSlug } from '../utils/helpers';

export class ProjectsService {
  private db: DatabaseClient;

  constructor(database: DatabaseClient) {
    this.db = database;
  }

  /**
   * Create a new project
   */
  async createProject(userId: string, data: CreateProjectData): Promise<Project> {
    try {
      // Validate input
      const validation = validateInput(data, {
        name: { required: true, minLength: 1, maxLength: 100 },
        description: { maxLength: 500 },
        visibility: { enum: ['private', 'public', 'team'] }
      });

      if (!validation.isValid) {
        throw new CoreError(
          'Invalid project data',
          ErrorCodes.VALIDATION_ERROR,
          validation.errors
        );
      }

      // Generate unique slug
      const baseSlug = generateSlug(data.name);
      const slug = await this.generateUniqueSlug(baseSlug);

      // Create project
      const project = {
        id: nanoid(),
        name: data.name.trim(),
        description: data.description?.trim() || null,
        slug,
        ownerId: userId,
        visibility: data.visibility || 'private',
        settings: {
          allowContributors: data.settings?.allowContributors ?? true,
          requireApproval: data.settings?.requireApproval ?? false,
          defaultRole: data.settings?.defaultRole || 'contributor',
          features: {
            chat: true,
            codeEditor: true,
            notebooks: true,
            terminal: true,
            collaboration: true,
            ...data.settings?.features
          }
        },
        tags: data.tags || [],
        metadata: data.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date()
      } as Project;

      const createdProject = await this.db.projects.create(project);

      // Add owner as project member
      await this.addProjectMember(createdProject.id, userId, 'owner');

      return createdProject;
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to create project',
        ErrorCodes.PROJECT_CREATION_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Get project by ID
   */
  async getProject(projectId: string, userId?: string): Promise<Project | null> {
    try {
      const project = await this.db.projects.findById(projectId);
      if (!project) {
        return null;
      }

      // Check if user has access to private projects
      if (project.visibility === 'private' && userId) {
        const member = await this.db.projectMembers.findByUserAndProject(userId, projectId);
        if (!member && project.ownerId !== userId) {
          return null;
        }
      }

      return project;
    } catch (error) {
      throw new CoreError(
        'Failed to get project',
        ErrorCodes.PROJECT_ACCESS_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Update project
   */
  async updateProject(projectId: string, userId: string, data: UpdateProjectData): Promise<Project> {
    try {
      // Check if user is owner or admin
      const project = await this.db.projects.findById(projectId);
      if (!project) {
        throw new CoreError('Project not found', ErrorCodes.PROJECT_NOT_FOUND);
      }

      const member = await this.db.projectMembers.findByUserAndProject(userId, projectId);
      if (project.ownerId !== userId && (!member || !['admin', 'owner'].includes(member.role))) {
        throw new CoreError('Insufficient permissions', ErrorCodes.INSUFFICIENT_PERMISSIONS);
      }

      // Validate input
      const validation = validateInput(data, {
        name: { minLength: 1, maxLength: 100 },
        description: { maxLength: 500 },
        visibility: { enum: ['private', 'public', 'team'] }
      });

      if (!validation.isValid) {
        throw new CoreError(
          'Invalid project data',
          ErrorCodes.VALIDATION_ERROR,
          validation.errors
        );
      }

      // Update slug if name changed
      let slug = project.slug;
      if (data.name && data.name !== project.name) {
        const baseSlug = generateSlug(data.name);
        slug = await this.generateUniqueSlug(baseSlug, projectId);
      }

      // Prepare update data
      const updateData = {
        ...data,
        slug,
        updatedAt: new Date()
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      return await this.db.projects.update(projectId, updateData);
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to update project',
        ErrorCodes.PROJECT_UPDATE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string, userId: string): Promise<void> {
    try {
      const project = await this.db.projects.findById(projectId);
      if (!project) {
        throw new CoreError('Project not found', ErrorCodes.PROJECT_NOT_FOUND);
      }

      // Only owner can delete project
      if (project.ownerId !== userId) {
        throw new CoreError('Only project owner can delete project', ErrorCodes.INSUFFICIENT_PERMISSIONS);
      }

      await this.db.projects.delete(projectId);
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to delete project',
        ErrorCodes.PROJECT_DELETION_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Get user's projects with pagination
   */
  async getUserProjects(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters?: SearchFilters
  ): Promise<PaginatedResponse<Project>> {
    try {
      const offset = (page - 1) * limit;
      
      const { projects, total } = await this.db.projects.findByUserWithPagination(
        userId,
        offset,
        limit,
        filters
      );

      return {
        data: projects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new CoreError(
        'Failed to get user projects',
        ErrorCodes.PROJECT_ACCESS_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Search projects
   */
  async searchProjects(
    query: string,
    userId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Project>> {
    try {
      const offset = (page - 1) * limit;
      
      const { projects, total } = await this.db.projects.search(query, userId, offset, limit);

      return {
        data: projects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new CoreError(
        'Failed to search projects',
        ErrorCodes.PROJECT_SEARCH_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Add project member
   */
  async addProjectMember(projectId: string, userId: string, role: ProjectRole): Promise<ProjectMember> {
    try {
      // Check if member already exists
      const existingMember = await this.db.projectMembers.findByUserAndProject(userId, projectId);
      if (existingMember) {
        throw new CoreError('User is already a project member', ErrorCodes.MEMBER_ALREADY_EXISTS);
      }

      const member = {
        id: nanoid(),
        projectId,
        userId,
        role,
        joinedAt: new Date(),
        invitedBy: userId, // Will be overridden for invitations
        createdAt: new Date(),
        updatedAt: new Date()
      } as ProjectMember;

      return await this.db.projectMembers.create(member);
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to add project member',
        ErrorCodes.MEMBER_ADDITION_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Remove project member
   */
  async removeProjectMember(projectId: string, userId: string, removedBy: string): Promise<void> {
    try {
      const project = await this.db.projects.findById(projectId);
      if (!project) {
        throw new CoreError('Project not found', ErrorCodes.PROJECT_NOT_FOUND);
      }

      // Can't remove project owner
      if (project.ownerId === userId) {
        throw new CoreError('Cannot remove project owner', ErrorCodes.INVALID_OPERATION);
      }

      const member = await this.db.projectMembers.findByUserAndProject(userId, projectId);
      if (!member) {
        throw new CoreError('User is not a project member', ErrorCodes.MEMBER_NOT_FOUND);
      }

      await this.db.projectMembers.delete(member.id);
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to remove project member',
        ErrorCodes.MEMBER_REMOVAL_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Update project member role
   */
  async updateProjectMemberRole(
    projectId: string,
    userId: string,
    newRole: ProjectRole,
    updatedBy: string
  ): Promise<ProjectMember> {
    try {
      const project = await this.db.projects.findById(projectId);
      if (!project) {
        throw new CoreError('Project not found', ErrorCodes.PROJECT_NOT_FOUND);
      }

      // Can't change owner role
      if (project.ownerId === userId) {
        throw new CoreError('Cannot change project owner role', ErrorCodes.INVALID_OPERATION);
      }

      const member = await this.db.projectMembers.findByUserAndProject(userId, projectId);
      if (!member) {
        throw new CoreError('User is not a project member', ErrorCodes.MEMBER_NOT_FOUND);
      }

      return await this.db.projectMembers.update(member.id, {
        role: newRole,
        updatedAt: new Date()
      });
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to update member role',
        ErrorCodes.MEMBER_UPDATE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Get project members
   */
  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    try {
      return await this.db.projectMembers.findByProject(projectId);
    } catch (error) {
      throw new CoreError(
        'Failed to get project members',
        ErrorCodes.PROJECT_ACCESS_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Invite user to project
   */
  async inviteToProject(
    projectId: string,
    inviterUserId: string,
    data: InviteProjectMemberData
  ): Promise<ProjectInvite> {
    try {
      // Validate input
      const validation = validateInput(data, {
        email: { required: true, email: true },
        role: { required: true, enum: ['viewer', 'contributor', 'editor', 'admin'] }
      });

      if (!validation.isValid) {
        throw new CoreError(
          'Invalid invitation data',
          ErrorCodes.VALIDATION_ERROR,
          validation.errors
        );
      }

      // Check if user is already a member
      const existingUser = await this.db.users.findByEmail(data.email);
      if (existingUser) {
        const existingMember = await this.db.projectMembers.findByUserAndProject(
          existingUser.id,
          projectId
        );
        if (existingMember) {
          throw new CoreError('User is already a project member', ErrorCodes.MEMBER_ALREADY_EXISTS);
        }
      }

      // Check for existing pending invitation
      const existingInvite = await this.db.projectInvites.findByProjectAndEmail(projectId, data.email);
      if (existingInvite && existingInvite.status === 'pending') {
        throw new CoreError('Invitation already sent', ErrorCodes.INVITATION_ALREADY_SENT);
      }

      // Create invitation
      const invitation = {
        id: nanoid(),
        projectId,
        email: data.email.toLowerCase().trim(),
        role: data.role,
        invitedBy: inviterUserId,
        message: data.message || null,
        status: 'pending' as const,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date(),
        updatedAt: new Date()
      } as ProjectInvite;

      return await this.db.projectInvites.create(invitation);
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to invite user to project',
        ErrorCodes.INVITATION_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Accept project invitation
   */
  async acceptInvitation(inviteId: string, userId: string): Promise<ProjectMember> {
    try {
      const invite = await this.db.projectInvites.findById(inviteId);
      if (!invite) {
        throw new CoreError('Invitation not found', ErrorCodes.INVITATION_NOT_FOUND);
      }

      if (invite.status !== 'pending') {
        throw new CoreError('Invitation is no longer valid', ErrorCodes.INVITATION_INVALID);
      }

      if (invite.expiresAt < new Date()) {
        throw new CoreError('Invitation has expired', ErrorCodes.INVITATION_EXPIRED);
      }

      // Get user email to verify
      const user = await this.db.users.findById(userId);
      if (!user || user.email !== invite.email) {
        throw new CoreError('Invalid user for this invitation', ErrorCodes.INVITATION_INVALID);
      }

      // Add user to project
      const member = await this.addProjectMember(invite.projectId, userId, invite.role);

      // Update invitation status
      await this.db.projectInvites.update(inviteId, {
        status: 'accepted',
        acceptedAt: new Date(),
        updatedAt: new Date()
      });

      return member;
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to accept invitation',
        ErrorCodes.INVITATION_ACCEPTANCE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Decline project invitation
   */
  async declineInvitation(inviteId: string, userId: string): Promise<void> {
    try {
      const invite = await this.db.projectInvites.findById(inviteId);
      if (!invite) {
        throw new CoreError('Invitation not found', ErrorCodes.INVITATION_NOT_FOUND);
      }

      const user = await this.db.users.findById(userId);
      if (!user || user.email !== invite.email) {
        throw new CoreError('Invalid user for this invitation', ErrorCodes.INVITATION_INVALID);
      }

      await this.db.projectInvites.update(inviteId, {
        status: 'declined',
        declinedAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to decline invitation',
        ErrorCodes.INVITATION_DECLINE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Get project invitations
   */
  async getProjectInvitations(projectId: string): Promise<ProjectInvite[]> {
    try {
      return await this.db.projectInvites.findByProject(projectId);
    } catch (error) {
      throw new CoreError(
        'Failed to get project invitations',
        ErrorCodes.PROJECT_ACCESS_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Get user's pending invitations
   */
  async getUserInvitations(email: string): Promise<ProjectInvite[]> {
    try {
      return await this.db.projectInvites.findByEmail(email, 'pending');
    } catch (error) {
      throw new CoreError(
        'Failed to get user invitations',
        ErrorCodes.PROJECT_ACCESS_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStats(projectId: string): Promise<ProjectStats> {
    try {
      const [
        memberCount,
        chatSessionCount,
        fileCount,
        notebookCount
      ] = await Promise.all([
        this.db.projectMembers.countByProject(projectId),
        this.db.chatSessions.countByProject(projectId),
        this.db.files.countByProject(projectId),
        this.db.notebooks?.countByProject(projectId) || Promise.resolve(0)
      ]);

      // Get recent activity
      const recentSessions = await this.db.chatSessions.findByProject(projectId, 5);
      const recentFiles = await this.db.files.findByProject(projectId, 5);

      return {
        memberCount,
        chatSessionCount,
        fileCount,
        notebookCount,
        recentActivity: {
          chatSessions: recentSessions.map((session: any) => ({
            id: session.id,
            title: session.title,
            updatedAt: session.updatedAt,
            type: 'chat_session'
          })),
          files: recentFiles.map((file: any) => ({
            id: file.id,
            name: file.name,
            updatedAt: file.updatedAt,
            type: 'file'
          }))
        },
        storageUsed: await this.calculateProjectStorageUsage(projectId)
      };
    } catch (error) {
      throw new CoreError(
        'Failed to get project statistics',
        ErrorCodes.PROJECT_STATS_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Duplicate project
   */
  async duplicateProject(
    projectId: string,
    userId: string,
    newName: string,
    includeChatSessions: boolean = false
  ): Promise<Project> {
    try {
      const originalProject = await this.db.projects.findById(projectId);
      if (!originalProject) {
        throw new CoreError('Project not found', ErrorCodes.PROJECT_NOT_FOUND);
      }

      // Create new project
      const duplicateData: CreateProjectData = {
        name: newName,
        description: `Copy of ${originalProject.name}`,
        visibility: originalProject.visibility,
        settings: originalProject.settings,
        tags: originalProject.tags,
        metadata: {
          ...originalProject.metadata,
          duplicatedFrom: projectId,
          duplicatedAt: new Date().toISOString()
        }
      };

      const newProject = await this.createProject(userId, duplicateData);

      // Copy files if any
      const files = await this.db.files.findByProject(projectId);
      for (const file of files) {
        await this.db.files.create({
          ...file,
          id: nanoid(),
          projectId: newProject.id,
          uploadedBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Copy chat sessions if requested
      if (includeChatSessions) {
        const sessions = await this.db.chatSessions.findByProject(projectId);
        for (const session of sessions) {
          const newSession = await this.db.chatSessions.create({
            ...session,
            id: nanoid(),
            projectId: newProject.id,
            userId,
            createdAt: new Date(),
            updatedAt: new Date()
          });

          // Copy messages
          const messages = await this.db.messages.findBySession(session.id);
          for (const message of messages) {
            await this.db.messages.create({
              ...message,
              id: nanoid(),
              sessionId: newSession.id,
              createdAt: new Date()
            });
          }
        }
      }

      return newProject;
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to duplicate project',
        ErrorCodes.PROJECT_DUPLICATION_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Archive project
   */
  async archiveProject(projectId: string, userId: string): Promise<Project> {
    try {
      const project = await this.db.projects.findById(projectId);
      if (!project) {
        throw new CoreError('Project not found', ErrorCodes.PROJECT_NOT_FOUND);
      }

      // Check permissions
      if (project.ownerId !== userId) {
        const member = await this.db.projectMembers.findByUserAndProject(userId, projectId);
        if (!member || !['admin', 'owner'].includes(member.role)) {
          throw new CoreError('Insufficient permissions', ErrorCodes.INSUFFICIENT_PERMISSIONS);
        }
      }

      return await this.db.projects.update(projectId, {
        archived: true,
        archivedAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      if (error instanceof CoreError) {
        throw error;
      }
      throw new CoreError(
        'Failed to archive project',
        ErrorCodes.PROJECT_ARCHIVE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Generate unique slug for project
   */
  private async generateUniqueSlug(baseSlug: string, excludeProjectId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.db.projects.findBySlug(slug);
      if (!existing || (excludeProjectId && existing.id === excludeProjectId)) {
        break;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Calculate project storage usage
   */
  private async calculateProjectStorageUsage(projectId: string): Promise<number> {
    try {
      const files = await this.db.files.findByProject(projectId);
      return files.reduce((total: number, file: any) => total + (file.size || 0), 0);
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
      return 0;
    }
  }
}