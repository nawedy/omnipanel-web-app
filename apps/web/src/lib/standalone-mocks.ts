// apps/web/src/lib/standalone-mocks.ts
// Mock implementations for workspace packages during standalone deployment

// Mock for @omnipanel/core
export const mockCoreService = {
  createChatService: () => ({
    createChat: async () => ({ id: 'mock-chat', title: 'Mock Chat' }),
    getChats: async () => [],
    deleteChat: async () => true,
  }),
  createAuthService: () => ({
    login: async () => ({ success: true }),
    logout: async () => ({ success: true }),
    getUser: async () => null,
  }),
  createFilesService: () => ({
    uploadFile: async () => ({ id: 'mock-file', name: 'Mock File' }),
    getFiles: async () => [],
    deleteFile: async () => true,
  }),
};

// Mock for @omnipanel/database
export const mockDatabaseService = {
  initializeDatabase: () => ({
    client: {
      query: async () => ({ rows: [] }),
      close: async () => {},
    },
  }),
  createDatabaseService: () => ({
    connect: async () => true,
    disconnect: async () => true,
    query: async () => ({ rows: [] }),
  }),
};

// Mock for @omnipanel/types
export interface MockUser {
  id: string;
  name: string;
  email: string;
}

export interface MockChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  role: 'user' | 'assistant';
}

// Mock for @omnipanel/config
export const mockConfig = {
  database: {
    neon: {
      connectionString: process.env.DATABASE_URL || '',
    },
  },
  auth: {
    stack: {
      projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID || '',
      publishableKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || '',
      secretKey: process.env.STACK_SECRET_SERVER_KEY || '',
    },
  },
};

// Mock for @omnipanel/llm-adapters
export const mockLLMAdapters = {
  createOpenAIAdapter: () => ({
    chat: async () => ({ content: 'Mock response from AI' }),
  }),
  createAnthropicAdapter: () => ({
    chat: async () => ({ content: 'Mock response from Claude' }),
  }),
};

// Mock for @omnipanel/plugin-sdk
export const mockPluginSDK = {
  PluginManager: class {
    async loadPlugin() { return null; }
    async unloadPlugin() { return true; }
    getLoadedPlugins() { return []; }
  },
};

// Export all mocks
export {
  mockCoreService as coreService,
  mockDatabaseService as databaseService,
  mockConfig as config,
  mockLLMAdapters as llmAdapters,
  mockPluginSDK as pluginSDK,
}; 