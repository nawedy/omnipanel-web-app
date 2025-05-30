import type {
  ChatSession,
  Message,
  Project,
  ProjectMember,
  File,
  FileVersion,
  CreateChatSessionData,
  UpdateChatSessionData,
  CreateMessageData,
  CreateProjectData,
  UpdateProjectData,
  CreateFileData,
  UpdateFileData,
  PaginatedResponse,
  SearchFilters,
  MessageRole,
  ProjectRole
} from '../service-types';

describe('Service Types', () => {
  describe('ChatSession', () => {
    it('should have correct structure', () => {
      const chatSession: ChatSession = {
        id: 'session-123',
        title: 'Test Session',
        userId: 'user-123',
        projectId: 'project-123',
        modelProvider: 'openai',
        modelName: 'gpt-4',
        modelConfig: { temperature: 0.7 },
        systemPrompt: 'You are a helpful assistant',
        metadata: { source: 'web' },
        settings: {
          temperature: 0.7,
          maxTokens: 2048,
          topP: 1.0,
          frequencyPenalty: 0,
          presencePenalty: 0
        },
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(chatSession.id).toBe('session-123');
      expect(chatSession.userId).toBe('user-123');
      expect(chatSession.projectId).toBe('project-123');
      expect(chatSession.modelProvider).toBe('openai');
      expect(chatSession.settings.temperature).toBe(0.7);
    });

    it('should allow optional fields to be undefined', () => {
      const minimalSession: ChatSession = {
        id: 'session-123',
        title: 'Test Session',
        userId: 'user-123',
        projectId: 'project-123',
        modelProvider: 'openai',
        modelName: 'gpt-4',
        settings: {},
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(minimalSession.systemPrompt).toBeUndefined();
      expect(minimalSession.metadata).toBeUndefined();
      expect(minimalSession.modelConfig).toBeUndefined();
    });
  });

  describe('Message', () => {
    it('should have correct structure', () => {
      const message: Message = {
        id: 'msg-123',
        sessionId: 'session-123',
        role: 'user',
        content: 'Hello, world!',
        metadata: { timestamp: Date.now() },
        tokens: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(message.id).toBe('msg-123');
      expect(message.sessionId).toBe('session-123');
      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello, world!');
      expect(message.tokens).toBe(10);
    });

    it('should support different message roles', () => {
      const userMessage: Message = {
        id: 'msg-1',
        sessionId: 'session-1',
        role: 'user',
        content: 'User message',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const assistantMessage: Message = {
        id: 'msg-2',
        sessionId: 'session-1',
        role: 'assistant',
        content: 'Assistant response',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const systemMessage: Message = {
        id: 'msg-3',
        sessionId: 'session-1',
        role: 'system',
        content: 'System message',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(userMessage.role).toBe('user');
      expect(assistantMessage.role).toBe('assistant');
      expect(systemMessage.role).toBe('system');
    });
  });

  describe('Project', () => {
    it('should have correct structure', () => {
      const project: Project = {
        id: 'proj-123',
        name: 'Test Project',
        description: 'A test project',
        slug: 'test-project',
        ownerId: 'user-123',
        settings: {
          isPublic: false,
          allowInvites: true,
          defaultRole: 'member'
        },
        metadata: { category: 'development' },
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(project.id).toBe('proj-123');
      expect(project.name).toBe('Test Project');
      expect(project.slug).toBe('test-project');
      expect(project.ownerId).toBe('user-123');
      expect(project.settings.isPublic).toBe(false);
    });
  });

  describe('File', () => {
    it('should have correct structure', () => {
      const file: File = {
        id: 'file-123',
        name: 'document.pdf',
        originalName: 'My Document.pdf',
        projectId: 'project-123',
        parentFolderId: 'folder-123',
        size: 1024000,
        mimeType: 'application/pdf',
        extension: 'pdf',
        hash: 'abc123',
        uploadedBy: 'user-123',
        storageProvider: 's3',
        storageKey: 'files/document.pdf',
        url: 'https://example.com/document.pdf',
        isFolder: false,
        metadata: { source: 'upload' },
        tags: ['document', 'important'],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(file.id).toBe('file-123');
      expect(file.name).toBe('document.pdf');
      expect(file.originalName).toBe('My Document.pdf');
      expect(file.projectId).toBe('project-123');
      expect(file.isFolder).toBe(false);
      expect(file.tags).toContain('document');
    });

    it('should support folder structure', () => {
      const folder: File = {
        id: 'folder-123',
        name: 'Documents',
        originalName: 'Documents',
        projectId: 'project-123',
        parentFolderId: null,
        size: 0,
        mimeType: 'application/x-directory',
        extension: null,
        hash: null,
        uploadedBy: 'user-123',
        storageProvider: 'local',
        storageKey: 'folders/documents',
        url: null,
        isFolder: true,
        metadata: {},
        tags: [],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(folder.isFolder).toBe(true);
      expect(folder.parentFolderId).toBeNull();
      expect(folder.extension).toBeNull();
    });
  });

  describe('Create/Update Data Types', () => {
    it('should have correct CreateChatSessionData structure', () => {
      const createData: CreateChatSessionData = {
        title: 'New Session',
        projectId: 'project-123',
        modelProvider: 'openai',
        modelName: 'gpt-4',
        systemPrompt: 'You are helpful',
        settings: { temperature: 0.8 }
      };

      expect(createData.title).toBe('New Session');
      expect(createData.projectId).toBe('project-123');
      expect(createData.settings?.temperature).toBe(0.8);
    });

    it('should have correct UpdateChatSessionData structure', () => {
      const updateData: UpdateChatSessionData = {
        title: 'Updated Session',
        systemPrompt: 'Updated prompt',
        settings: { maxTokens: 4096 }
      };

      expect(updateData.title).toBe('Updated Session');
      expect(updateData.settings?.maxTokens).toBe(4096);
    });

    it('should have correct CreateMessageData structure', () => {
      const createData: CreateMessageData = {
        sessionId: 'session-123',
        role: 'user',
        content: 'Hello!',
        metadata: { source: 'web' }
      };

      expect(createData.sessionId).toBe('session-123');
      expect(createData.role).toBe('user');
      expect(createData.content).toBe('Hello!');
    });

    it('should have correct CreateProjectData structure', () => {
      const createData: CreateProjectData = {
        name: 'New Project',
        description: 'Project description',
        settings: {
          isPublic: true,
          allowInvites: false,
          defaultRole: 'viewer'
        }
      };

      expect(createData.name).toBe('New Project');
      expect(createData.settings?.isPublic).toBe(true);
      expect(createData.settings?.defaultRole).toBe('viewer');
    });

    it('should have correct CreateFileData structure', () => {
      const createData: CreateFileData = {
        name: 'new-file.txt',
        originalName: 'New File.txt',
        projectId: 'project-123',
        size: 1024,
        mimeType: 'text/plain',
        storageProvider: 's3',
        storageKey: 'files/new-file.txt'
      };

      expect(createData.name).toBe('new-file.txt');
      expect(createData.projectId).toBe('project-123');
      expect(createData.mimeType).toBe('text/plain');
    });
  });

  describe('Utility Types', () => {
    it('should have correct PaginatedResponse structure', () => {
      const response: PaginatedResponse<Message> = {
        data: [
          {
            id: 'msg-1',
            sessionId: 'session-1',
            role: 'user',
            content: 'Hello',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      expect(response.data).toHaveLength(1);
      expect(response.pagination.page).toBe(1);
      expect(response.pagination.total).toBe(1);
      expect(response.pagination.hasNext).toBe(false);
    });

    it('should have correct SearchFilters structure', () => {
      const filters: SearchFilters = {
        query: 'search term',
        tags: ['tag1', 'tag2'],
        dateRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31')
        },
        metadata: {
          category: 'development',
          priority: 'high'
        }
      };

      expect(filters.query).toBe('search term');
      expect(filters.tags).toContain('tag1');
      expect(filters.dateRange?.start).toBeInstanceOf(Date);
      expect(filters.metadata?.category).toBe('development');
    });
  });

  describe('Enum Types', () => {
    it('should support MessageRole values', () => {
      const userRole: MessageRole = 'user';
      const assistantRole: MessageRole = 'assistant';
      const systemRole: MessageRole = 'system';

      expect(userRole).toBe('user');
      expect(assistantRole).toBe('assistant');
      expect(systemRole).toBe('system');
    });

    it('should support ProjectRole values', () => {
      const ownerRole: ProjectRole = 'owner';
      const adminRole: ProjectRole = 'admin';
      const memberRole: ProjectRole = 'member';
      const viewerRole: ProjectRole = 'viewer';

      expect(ownerRole).toBe('owner');
      expect(adminRole).toBe('admin');
      expect(memberRole).toBe('member');
      expect(viewerRole).toBe('viewer');
    });
  });

  describe('Type Safety', () => {
    it('should enforce required fields', () => {
      // This test ensures TypeScript compilation catches missing required fields
      // The actual test is that this file compiles without errors
      
      const isValidChatSession = (session: ChatSession): boolean => {
        return !!(session.id && session.title && session.userId && session.projectId);
      };

      const session: ChatSession = {
        id: 'test',
        title: 'Test',
        userId: 'user',
        projectId: 'project',
        modelProvider: 'openai',
        modelName: 'gpt-4',
        settings: {},
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(isValidChatSession(session)).toBe(true);
    });

    it('should allow optional fields to be omitted', () => {
      const minimalCreateData: CreateChatSessionData = {
        title: 'Test',
        projectId: 'project-123',
        modelProvider: 'openai',
        modelName: 'gpt-4'
      };

      expect(minimalCreateData.title).toBe('Test');
      expect(minimalCreateData.systemPrompt).toBeUndefined();
      expect(minimalCreateData.metadata).toBeUndefined();
    });
  });
}); 