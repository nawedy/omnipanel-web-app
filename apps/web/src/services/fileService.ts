import { generateId } from '@/lib/utils';

export interface FileContent {
  content: string;
  language: string;
  lastModified: Date;
  size: number;
}

export interface FileSystemEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: Date;
  children?: FileSystemEntry[];
}

class FileService {
  private cache = new Map<string, FileContent>();
  private mockFileSystem: FileSystemEntry[] = [
    {
      name: 'src',
      path: '/src',
      type: 'directory',
      children: [
        {
          name: 'components',
          path: '/src/components',
          type: 'directory',
          children: [
            {
              name: 'Button.tsx',
              path: '/src/components/Button.tsx',
              type: 'file',
              size: 1240,
              lastModified: new Date('2024-01-15T10:30:00Z'),
            },
            {
              name: 'Modal.tsx',
              path: '/src/components/Modal.tsx',
              type: 'file',
              size: 2156,
              lastModified: new Date('2024-01-14T16:45:00Z'),
            },
          ],
        },
        {
          name: 'utils',
          path: '/src/utils',
          type: 'directory',
          children: [
            {
              name: 'helpers.ts',
              path: '/src/utils/helpers.ts',
              type: 'file',
              size: 892,
              lastModified: new Date('2024-01-13T09:15:00Z'),
            },
          ],
        },
        {
          name: 'App.tsx',
          path: '/src/App.tsx',
          type: 'file',
          size: 1856,
          lastModified: new Date('2024-01-15T14:20:00Z'),
        },
        {
          name: 'index.ts',
          path: '/src/index.ts',
          type: 'file',
          size: 312,
          lastModified: new Date('2024-01-12T11:00:00Z'),
        },
      ],
    },
    {
      name: 'package.json',
      path: '/package.json',
      type: 'file',
      size: 1024,
      lastModified: new Date('2024-01-10T08:00:00Z'),
    },
    {
      name: 'README.md',
      path: '/README.md',
      type: 'file',
      size: 2048,
      lastModified: new Date('2024-01-08T12:30:00Z'),
    },
    {
      name: 'docs',
      path: '/docs',
      type: 'directory',
      children: [
        {
          name: 'getting-started.md',
          path: '/docs/getting-started.md',
          type: 'file',
          size: 4096,
          lastModified: new Date('2024-01-07T15:45:00Z'),
        },
        {
          name: 'api.md',
          path: '/docs/api.md',
          type: 'file',
          size: 8192,
          lastModified: new Date('2024-01-06T10:30:00Z'),
        },
      ],
    },
  ];

  private mockFileContents: Record<string, string> = {
    '/src/components/Button.tsx': `import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}: ButtonProps) {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}`,

    '/src/components/Modal.tsx': `import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={cn(
        'bg-background border border-border rounded-lg shadow-xl w-full max-h-[90vh] overflow-hidden',
        sizeClasses[size],
        className
      )}>
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}`,

    '/src/utils/helpers.ts': `import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(prefix = 'id'): string {
  return \`\${prefix}-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
}

export function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}`,

    '/src/App.tsx': `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Workspace } from './components/workspace/Workspace';
import { AuthProvider } from './providers/AuthProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import './globals.css';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="omnipanel-theme">
      <AuthProvider>
        <Router>
          <div className="h-screen bg-background text-foreground">
            <Routes>
              <Route path="/" element={<Workspace />} />
              <Route path="/workspace" element={<Workspace />} />
              <Route path="/workspace/:projectId" element={<Workspace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;`,

    '/src/index.ts': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,

    '/package.json': `{
  "name": "omnipanel-workspace",
  "version": "1.0.0",
  "description": "AI-powered workspace for developers",
  "main": "src/index.ts",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.400.0",
    "@monaco-editor/react": "^4.6.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.2.0"
  }
}`,

    '/README.md': `# OmniPanel Workspace

A modern, AI-powered workspace for developers that combines chat, code editing, notebooks, and terminal access in one unified interface.

## Features

- **Multi-tab Interface**: Seamlessly switch between chat, code, notebooks, and terminal
- **AI Integration**: Built-in AI assistance for code explanation, improvement, and generation
- **Monaco Editor**: Full-featured code editor with syntax highlighting and IntelliSense
- **Terminal Integration**: Embedded terminal with auto-completion and command history
- **Notebook Support**: Jupyter-style notebook interface for data science workflows
- **Real-time Sync**: Automatic synchronization across devices
- **Plugin System**: Extensible architecture with custom plugins

## Getting Started

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Start the development server: \`npm run dev\`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating a New Project

1. Click the "New Project" button in the sidebar
2. Choose a project template or start from scratch
3. Begin coding with AI assistance

### AI Features

- **Ctrl+E**: Explain selected code
- **Ctrl+I**: Improve selected code  
- **Ctrl+Shift+C**: Send code to chat for discussion

### Terminal Commands

The integrated terminal supports:
- Standard shell commands
- Project-specific commands
- AI-powered command suggestions

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.`,

    '/docs/getting-started.md': `# Getting Started with OmniPanel

Welcome to OmniPanel, the next-generation AI workspace for developers! This guide will help you get up and running quickly.

## What is OmniPanel?

OmniPanel is a unified workspace that combines:

- **Chat Interface**: Communicate with AI models for assistance, brainstorming, and problem-solving
- **Code Editor**: Full-featured Monaco-based editor with AI-powered features
- **Notebook Environment**: Jupyter-style notebooks for data science and experimentation
- **Terminal Access**: Integrated terminal with smart auto-completion
- **File Management**: Project-based file organization and management

## First Steps

### 1. Creating Your First Project

When you first open OmniPanel, you'll see the welcome screen. To create a new project:

1. Click "New Project" in the sidebar
2. Choose a template or start blank
3. Give your project a name
4. Start coding!

### 2. Understanding the Interface

The OmniPanel interface consists of:

- **Sidebar**: Project navigation, file tree, and workspace controls
- **Header**: Model selection, search, notifications, and settings
- **Main Area**: Tabbed interface for chat, code, notebooks, and terminal
- **Status Bar**: Sync status, current model, and workspace information

### 3. Working with AI

OmniPanel integrates AI assistance throughout the workflow:

- **Chat**: Ask questions, get explanations, brainstorm ideas
- **Code Assistance**: Get code suggestions, explanations, and improvements
- **Notebook AI**: Generate and explain code cells
- **Terminal AI**: Smart command suggestions and help

### 4. Keyboard Shortcuts

Master these shortcuts for maximum productivity:

- **⌘K / Ctrl+K**: Open command palette
- **⌘E / Ctrl+E**: Explain selected code
- **⌘I / Ctrl+I**: Improve selected code
- **⌘Shift+C**: Send code to chat
- **⌘T / Ctrl+T**: New tab
- **⌘W / Ctrl+W**: Close tab

## Next Steps

- Explore the [API Documentation](/docs/api.md)
- Learn about [Plugin Development](/docs/plugins.md)
- Join our [Community](https://community.omnipanel.app)

Happy coding with OmniPanel! 🚀`,

    '/docs/api.md': `# OmniPanel API Documentation

This document describes the OmniPanel API for developers who want to integrate with or extend OmniPanel functionality.

## Authentication

All API requests require authentication using an API key:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     https://api.omnipanel.app/v1/chat
\`\`\`

## Endpoints

### Chat API

#### POST /v1/chat

Send a message to the AI chat interface.

**Request Body:**
\`\`\`json
{
  "message": "Explain how React hooks work",
  "model": "gpt-4",
  "temperature": 0.7,
  "max_tokens": 2048,
  "context": {
    "projectId": "proj_123",
    "fileContext": ["src/App.tsx"]
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "msg_456",
  "response": "React hooks are functions that let you...",
  "model": "gpt-4",
  "timestamp": "2024-01-15T10:30:00Z",
  "usage": {
    "promptTokens": 150,
    "completionTokens": 500,
    "totalTokens": 650
  }
}
\`\`\`

### Code API

#### POST /v1/code/explain

Get an explanation for a code snippet.

**Request Body:**
\`\`\`json
{
  "code": "const [count, setCount] = useState(0);",
  "language": "typescript",
  "context": "React component"
}
\`\`\`

#### POST /v1/code/improve

Get suggestions to improve code.

**Request Body:**
\`\`\`json
{
  "code": "function add(a, b) { return a + b; }",
  "language": "javascript",
  "improvements": ["typescript", "error-handling", "documentation"]
}
\`\`\`

### Project API

#### GET /v1/projects

List all projects for the authenticated user.

#### POST /v1/projects

Create a new project.

**Request Body:**
\`\`\`json
{
  "name": "My New Project",
  "description": "A sample project",
  "template": "react-typescript"
}
\`\`\`

#### GET /v1/projects/{projectId}

Get details for a specific project.

#### PUT /v1/projects/{projectId}

Update project details.

#### DELETE /v1/projects/{projectId}

Delete a project.

### File API

#### GET /v1/projects/{projectId}/files

List files in a project.

#### GET /v1/projects/{projectId}/files/{filePath}

Get file content.

#### PUT /v1/projects/{projectId}/files/{filePath}

Create or update a file.

#### DELETE /v1/projects/{projectId}/files/{filePath}

Delete a file.

## WebSocket API

For real-time features, OmniPanel uses WebSocket connections:

\`\`\`javascript
const ws = new WebSocket('wss://api.omnipanel.app/v1/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'YOUR_API_KEY'
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
\`\`\`

### WebSocket Events

- \`project.updated\`: Project files changed
- \`chat.message\`: New chat message
- \`sync.status\`: Sync status update
- \`notification\`: New notification

## Error Handling

All API endpoints return standard HTTP status codes:

- \`200\`: Success
- \`400\`: Bad Request
- \`401\`: Unauthorized
- \`403\`: Forbidden
- \`404\`: Not Found
- \`429\`: Rate Limited
- \`500\`: Internal Server Error

Error responses include details:

\`\`\`json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request body is invalid",
    "details": {
      "field": "message",
      "issue": "required"
    }
  }
}
\`\`\`

## Rate Limits

API endpoints are rate limited:

- Chat API: 100 requests per minute
- Code API: 200 requests per minute
- Project API: 50 requests per minute
- File API: 500 requests per minute

Rate limit headers are included in responses:

\`\`\`
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642262400
\`\`\`

## SDKs

Official SDKs are available for:

- [JavaScript/TypeScript](https://github.com/omnipanel/sdk-js)
- [Python](https://github.com/omnipanel/sdk-python)
- [Go](https://github.com/omnipanel/sdk-go)

## Support

For API support, please:

- Check the [FAQ](https://docs.omnipanel.app/faq)
- Join our [Discord](https://discord.gg/omnipanel)
- Email [api-support@omnipanel.app](mailto:api-support@omnipanel.app)`,
  };

  async readFile(filePath: string): Promise<FileContent> {
    // Check cache first
    if (this.cache.has(filePath)) {
      return this.cache.get(filePath)!;
    }

    // Simulate file loading delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    let content = this.mockFileContents[filePath];
    
    // If file doesn't exist and it's an "Untitled" file, create it with empty content
    if (!content && filePath.toLowerCase().includes('untitled')) {
      content = '';
      console.log(`Creating new file: ${filePath}`);
    }
    
    if (!content) {
      throw new Error(`File not found: ${filePath}`);
    }

    const language = this.detectLanguage(filePath);
    const fileContent: FileContent = {
      content,
      language,
      lastModified: new Date(),
      size: content.length,
    };

    // Cache the result
    this.cache.set(filePath, fileContent);
    
    return fileContent;
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

    // Update cache
    const language = this.detectLanguage(filePath);
    this.cache.set(filePath, {
      content,
      language,
      lastModified: new Date(),
      size: content.length,
    });

    console.log(`File saved: ${filePath} (${content.length} bytes)`);
  }

  async deleteFile(filePath: string): Promise<void> {
    // Simulate delete delay
    await new Promise(resolve => setTimeout(resolve, 50));

    // Remove from cache
    this.cache.delete(filePath);
    
    console.log(`File deleted: ${filePath}`);
  }

  async listFiles(directoryPath = '/'): Promise<FileSystemEntry[]> {
    // Simulate directory listing delay
    await new Promise(resolve => setTimeout(resolve, 50));

    if (directoryPath === '/') {
      return this.mockFileSystem;
    }

    // Find the directory in the mock file system
    const findDirectory = (entries: FileSystemEntry[], path: string): FileSystemEntry[] => {
      for (const entry of entries) {
        if (entry.path === path && entry.type === 'directory') {
          return entry.children || [];
        }
        if (entry.children) {
          const result = findDirectory(entry.children, path);
          if (result.length > 0) return result;
        }
      }
      return [];
    };

    return findDirectory(this.mockFileSystem, directoryPath);
  }

  async createFile(filePath: string, content = ''): Promise<void> {
    const language = this.detectLanguage(filePath);
    await this.writeFile(filePath, content);
    
    console.log(`File created: ${filePath}`);
  }

  async createDirectory(directoryPath: string): Promise<void> {
    // Simulate directory creation delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    console.log(`Directory created: ${directoryPath}`);
  }

  private detectLanguage(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase();
    
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'markdown': 'markdown',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
      'zsh': 'shell',
      'fish': 'shell',
      'ps1': 'powershell',
      'dockerfile': 'dockerfile',
      'gitignore': 'gitignore',
      'env': 'dotenv',
    };

    return languageMap[extension || ''] || 'plaintext';
  }

  // Check if file exists
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await this.readFile(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // Get file metadata
  async getFileInfo(filePath: string): Promise<Omit<FileContent, 'content'>> {
    const content = await this.readFile(filePath);
    return {
      language: content.language,
      lastModified: content.lastModified,
      size: content.size,
    };
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const fileService = new FileService(); 