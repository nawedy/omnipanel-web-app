import { AIProvider, ChatMessage, MessageRole } from '@omnipanel/types';

// Base test data
export const mockData = {
  // User data
  user: {
    id: 'user-test-123',
    email: 'test@omnipanel.dev',
    name: 'Test User',
    username: 'testuser',
    avatar: 'https://avatars.githubusercontent.com/u/1234567?v=4',
    bio: 'Software developer and AI enthusiast',
    location: 'San Francisco, CA',
    website: 'https://testuser.dev',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    preferences: {
      theme: 'dark',
      language: 'en',
      timezone: 'America/Los_Angeles',
      notifications: {
        email: true,
        push: true,
        desktop: true
      }
    }
  },

  // Workspace data
  workspace: {
    id: 'workspace-test-123',
    name: 'Test Workspace',
    description: 'A workspace for testing purposes',
    slug: 'test-workspace',
    ownerId: 'user-test-123',
    members: ['user-test-123'],
    settings: {
      visibility: 'private',
      collaboration: true,
      aiProviders: ['openai', 'anthropic'],
      defaultModel: 'gpt-4'
    },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z')
  },

  // Project data
  project: {
    id: 'project-test-123',
    name: 'Test Project',
    description: 'A project for testing AI workflows',
    workspaceId: 'workspace-test-123',
    ownerId: 'user-test-123',
    type: 'general',
    tags: ['ai', 'testing', 'development'],
    settings: {
      aiProvider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2048
    },
    metadata: {
      fileCount: 5,
      chatCount: 3,
      lastActivity: new Date('2024-01-01T12:00:00.000Z')
    },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z')
  },

  // Chat session data
  chatSession: {
    id: 'chat-test-123',
    title: 'Test Chat Session',
    projectId: 'project-test-123',
    userId: 'user-test-123',
    provider: 'openai' as AIProvider,
    model: 'gpt-4',
    systemPrompt: 'You are a helpful AI assistant.',
    settings: {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0
    },
    metadata: {
      messageCount: 4,
      totalTokens: 150,
      cost: 0.003
    },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z')
  },

  // Messages data
  messages: [
    {
      id: 'msg-test-1',
      chatSessionId: 'chat-test-123',
      role: 'user' as MessageRole,
      content: 'Hello, can you help me write a React component?',
      timestamp: new Date('2024-01-01T12:00:00.000Z'),
      metadata: {
        tokenCount: 12,
        model: 'gpt-4'
      }
    },
    {
      id: 'msg-test-2', 
      chatSessionId: 'chat-test-123',
      role: 'assistant' as MessageRole,
      content: 'Of course! I\'d be happy to help you write a React component. What kind of component are you looking to create?',
      timestamp: new Date('2024-01-01T12:00:05.000Z'),
      metadata: {
        tokenCount: 28,
        model: 'gpt-4',
        usage: {
          promptTokens: 12,
          completionTokens: 28,
          totalTokens: 40
        }
      }
    },
    {
      id: 'msg-test-3',
      chatSessionId: 'chat-test-123',
      role: 'user' as MessageRole,
      content: 'I need a button component with multiple variants.',
      timestamp: new Date('2024-01-01T12:01:00.000Z'),
      metadata: {
        tokenCount: 10,
        model: 'gpt-4'
      }
    },
    {
      id: 'msg-test-4',
      chatSessionId: 'chat-test-123',
      role: 'assistant' as MessageRole,
      content: 'Here\'s a flexible Button component with multiple variants:\n\n```tsx\ninterface ButtonProps {\n  variant?: \'primary\' | \'secondary\' | \'outline\';\n  size?: \'sm\' | \'md\' | \'lg\';\n  children: React.ReactNode;\n  onClick?: () => void;\n}\n\nconst Button: React.FC<ButtonProps> = ({ \n  variant = \'primary\', \n  size = \'md\',\n  children,\n  onClick \n}) => {\n  return (\n    <button \n      className={`btn btn-${variant} btn-${size}`}\n      onClick={onClick}\n    >\n      {children}\n    </button>\n  );\n};\n```',
      timestamp: new Date('2024-01-01T12:01:05.000Z'),
      metadata: {
        tokenCount: 95,
        model: 'gpt-4',
        usage: {
          promptTokens: 52,
          completionTokens: 95,
          totalTokens: 147
        },
        codeBlocks: [{
          language: 'tsx',
          content: 'interface ButtonProps {\n  variant?: \'primary\' | \'secondary\' | \'outline\';\n  size?: \'sm\' | \'md\' | \'lg\';\n  children: React.ReactNode;\n  onClick?: () => void;\n}\n\nconst Button: React.FC<ButtonProps> = ({ \n  variant = \'primary\', \n  size = \'md\',\n  children,\n  onClick \n}) => {\n  return (\n    <button \n      className={`btn btn-${variant} btn-${size}`}\n      onClick={onClick}\n    >\n      {children}\n    </button>\n  );\n};'
        }]
      }
    }
  ] as ChatMessage[],

  // File data
  file: {
    id: 'file-test-123',
    name: 'Button.tsx',
    path: '/src/components/Button.tsx',
    type: 'typescript',
    size: 2048,
    projectId: 'project-test-123',
    content: 'import React from \'react\';\n\ninterface ButtonProps {\n  children: React.ReactNode;\n  onClick?: () => void;\n}\n\nconst Button: React.FC<ButtonProps> = ({ children, onClick }) => {\n  return (\n    <button onClick={onClick}>\n      {children}\n    </button>\n  );\n};\n\nexport default Button;',
    metadata: {
      language: 'typescript',
      lineCount: 15,
      encoding: 'utf-8',
      lastModified: new Date('2024-01-01T12:00:00.000Z')
    },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T12:00:00.000Z')
  },

  // LLM Providers data
  providers: [
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Advanced AI models including GPT-4 and GPT-3.5',
      website: 'https://openai.com',
      supportsStreaming: true,
      supportsFunctions: true,
      supportsVision: true,
      pricing: {
        currency: 'USD',
        inputCost: 0.01,
        outputCost: 0.03
      }
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Constitutional AI with Claude models',
      website: 'https://anthropic.com',
      supportsStreaming: true,
      supportsFunctions: true,
      supportsVision: true,
      pricing: {
        currency: 'USD',
        inputCost: 0.008,
        outputCost: 0.024
      }
    },
    {
      id: 'google',
      name: 'Google AI',
      description: 'Gemini models for advanced reasoning',
      website: 'https://ai.google.dev',
      supportsStreaming: true,
      supportsFunctions: true,
      supportsVision: true,
      pricing: {
        currency: 'USD',
        inputCost: 0.005,
        outputCost: 0.015
      }
    }
  ],

  // Models data
  models: [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai' as AIProvider,
      description: 'Most capable model, great for complex tasks',
      contextLength: 8192,
      maxOutputTokens: 4096,
      supportsStreaming: true,
      supportsFunctions: true,
      supportsVision: false,
      pricing: {
        inputCost: 0.01,
        outputCost: 0.03
      }
    },
    {
      id: 'gpt-4-vision',
      name: 'GPT-4 Vision',
      provider: 'openai' as AIProvider,
      description: 'GPT-4 with vision capabilities',
      contextLength: 8192,
      maxOutputTokens: 4096,
      supportsStreaming: true,
      supportsFunctions: true,
      supportsVision: true,
      pricing: {
        inputCost: 0.01,
        outputCost: 0.03
      }
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic' as AIProvider,
      description: 'Balanced model for most tasks',
      contextLength: 200000,
      maxOutputTokens: 4096,
      supportsStreaming: true,
      supportsFunctions: true,
      supportsVision: true,
      pricing: {
        inputCost: 0.008,
        outputCost: 0.024
      }
    }
  ],

  // Theme data
  theme: {
    id: 'theme-test-123',
    name: 'Test Theme',
    description: 'A theme for testing purposes',
    authorId: 'user-test-123',
    version: '1.0.0',
    config: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#f59e0b',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f8fafc'
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem'
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      }
    },
    previewImage: 'https://example.com/theme-preview.jpg',
    downloads: 42,
    rating: 4.5,
    price: 0,
    status: 'approved',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z')
  },

  // Plugin data
  plugin: {
    id: 'plugin-test-123',
    name: 'Test Plugin',
    description: 'A plugin for testing purposes',
    authorId: 'user-test-123',
    version: '1.0.0',
    manifest: {
      name: 'Test Plugin',
      version: '1.0.0',
      description: 'A plugin for testing purposes',
      main: 'index.js',
      permissions: ['workspace.read', 'chat.send'],
      dependencies: {}
    },
    code: 'console.log("Hello from test plugin!");',
    downloads: 15,
    rating: 4.2,
    status: 'approved',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z')
  },

  // Analytics data
  analytics: {
    users: {
      total: 1250,
      active: 890,
      new: 45
    },
    sessions: {
      total: 3420,
      average: 24.5,
      bounce: 0.12
    },
    messages: {
      total: 15680,
      today: 234,
      providers: {
        openai: 8940,
        anthropic: 4230,
        google: 2510
      }
    },
    usage: {
      tokens: 2340000,
      cost: 156.78,
      requests: 15680
    }
  },

  // Notebook data
  notebook: {
    id: 'notebook-test-123',
    name: 'Test Notebook',
    projectId: 'project-test-123',
    cells: [
      {
        id: 'cell-1',
        type: 'markdown',
        content: '# Test Notebook\n\nThis is a test notebook for AI-assisted data science.',
        metadata: {}
      },
      {
        id: 'cell-2',
        type: 'code',
        content: 'import pandas as pd\nimport numpy as np\n\ndf = pd.DataFrame({\n    "x": [1, 2, 3, 4, 5],\n    "y": [2, 4, 6, 8, 10]\n})\n\nprint(df.head())',
        metadata: {
          language: 'python',
          execution_count: 1
        },
        outputs: [
          {
            output_type: 'stream',
            name: 'stdout',
            text: '   x   y\n0  1   2\n1  2   4\n2  3   6\n3  4   8\n4  5  10\n'
          }
        ]
      }
    ],
    metadata: {
      kernelspec: {
        display_name: 'Python 3',
        language: 'python',
        name: 'python3'
      }
    },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z')
  }
};

// Helper functions for generating test data
export const generateMockData = {
  user: (overrides = {}) => ({
    ...mockData.user,
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    ...overrides
  }),

  workspace: (overrides = {}) => ({
    ...mockData.workspace,
    id: `workspace-${Math.random().toString(36).substr(2, 9)}`,
    ...overrides
  }),

  project: (overrides = {}) => ({
    ...mockData.project,
    id: `project-${Math.random().toString(36).substr(2, 9)}`,
    ...overrides
  }),

  chatSession: (overrides = {}) => ({
    ...mockData.chatSession,
    id: `chat-${Math.random().toString(36).substr(2, 9)}`,
    ...overrides
  }),

  message: (overrides = {}) => ({
    ...mockData.messages[0],
    id: `msg-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...overrides
  }),

  file: (overrides = {}) => ({
    ...mockData.file,
    id: `file-${Math.random().toString(36).substr(2, 9)}`,
    ...overrides
  })
}; 