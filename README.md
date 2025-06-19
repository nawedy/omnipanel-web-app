# 🚀 OmniPanel Web Application

The standalone web application for OmniPanel AI Workspace - A powerful AI-powered workspace that brings together chat, code, data science, and automation in a unified platform.

![OmniPanel Logo](public/omnipanel-logo.png)

## 🎯 Current Status: Version 1.3.0 - Production Ready

**Latest Release**: Sprint 8 - Complete Workspace Enhancement & AI Integration ✅  
**Build Status**: ✅ Passing | **TypeScript**: ✅ 100% Compliant | **Tests**: ✅ Comprehensive Coverage

## ✨ Features

### 🎯 **Core Workspace**
- **Professional Tool Grid**: 2x2 layout with 5 integrated tools (Chat, Terminal, Notebook, Code Editor, Research)
- **Enhanced Drag System**: Improved sidebar resizing (320px default, 200-500px range) with visual feedback
- **AI-Powered Research**: Real-time web search with Tavily API integration and intelligent summarization
- **Professional Branding**: Consistent AI avatars across all components with gradient fallbacks
- **Settings Migration**: Complete transition from modal to page-based settings system
- **Multi-tab Interface**: Context-aware workspace with seamless tool switching
- **Real-time Sync**: Cloud synchronization with offline-first architecture
- **Project Organization**: Folders, tags, favorites, multi-project navigation with recent files tracking
- **Modern UI**: Glassmorphism design with 8 custom color schemes and advanced theming

### 🤖 **AI Integration**
- **Multi-Model Support**: OpenAI, Ollama, llama.cpp, vLLM, Deepseek, Qwen, HuggingFace, Anthropic, Google Gemini, Mistral
- **Local & Cloud**: Seamless switching between local and cloud AI models with cost tracking
- **Context-Aware Chat**: Intelligent conversations with workspace context (files, terminal, selections)
- **Streaming Responses**: Real-time AI responses with performance monitoring and abort controls
- **AI-Powered Tools**: Code explanation, improvement, generation with context awareness

### 💻 **Development Tools**
- **Monaco Editor**: VSCode-style editor with syntax highlighting and AI assistance
- **Enhanced Terminal**: Full terminal with AI assistance, command suggestions, and context integration
- **Advanced Git Integration**: Visual status indicators, repository management, and file tracking
- **Professional File Management**: File tree with drag-drop, context menus, and real-time monitoring
- **Keyboard Shortcuts**: 67+ customizable shortcuts across 11 categories

### 📊 **Data Science**
- **Jupyter Notebooks**: Interactive cells with code execution and AI assistance
- **Visualization**: Built-in charting and data visualization with context awareness
- **AI-Powered Analysis**: Smart cell generation and intelligent data analysis

## 🏗️ Architecture

### Standalone Structure
```
omnipanel-web-app/
├── src/                  # Web application source
│   ├── app/             # Next.js app router
│   ├── components/      # React components
│   ├── lib/             # Utility libraries
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Zustand state management
│   ├── types/           # TypeScript definitions
│   └── content/         # User guides and documentation
├── packages/            # Shared packages
│   ├── types/          # TypeScript definitions
│   ├── config/         # Global configuration
│   ├── database/       # Database models and utilities
│   ├── ui/             # Shared UI components
│   ├── llm-adapters/   # AI model connectors
│   ├── core/           # Business logic and sync
│   ├── plugin-sdk/     # Plugin development SDK
│   └── theme-engine/   # Advanced theming system
├── tests/              # Test suites
│   ├── flows/          # User flow tests
│   ├── processes/      # Process validation tests
│   └── user-guides/    # Documentation verification tests
└── public/             # Static assets
```

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript 5.8
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **Backend**: NeonDB (PostgreSQL, Auth, Storage, Functions)
- **Real-time**: NeonDB real-time subscriptions
- **Offline**: IndexedDB with automatic sync
- **UI Components**: Custom component library with Monaco Editor, xterm.js

## 🚀 Quick Start

### Prerequisites
- Node.js 22+ 
- npm 8+
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/nawedy/omnipanel-web-app.git
cd omnipanel-web-app

# Install dependencies
npm install

# Build shared packages
npm run build:packages

# Start development server
npm run dev
```

The application will be available at `http://localhost:3003`

### Production Build
```bash
# Build for production
npm run build:web

# Start production server
npm start
```

## 📚 User Guides & Documentation

### 🎯 **Getting Started**
- **[Quick Start Guide](src/content/QUICK_REFERENCE.md)** - Essential setup and first steps
- **[User Guide](src/content/USERS_GUIDE.md)** - Comprehensive usage instructions
- **[Onboarding Checklist](src/content/ONBOARDING_CHECKLIST.md)** - Step-by-step setup verification

### 🔧 **Configuration**
- **Environment Setup**: Copy `env.example` to `.env.local` and configure
- **AI Model Configuration**: Set up API keys for various AI providers
- **Database Setup**: Configure NeonDB connection strings
- **Theme Customization**: Use the built-in theme engine for custom styling

### 🛠️ **Development**
- **Package Development**: Each package in `packages/` is independently buildable
- **Component Library**: Shared UI components in `packages/ui/`
- **Type Definitions**: Comprehensive TypeScript types in `packages/types/`
- **Plugin Development**: Use `packages/plugin-sdk/` for custom extensions

## 🧪 Testing

### Comprehensive Test Suite

The application includes extensive testing to verify all documented flows and processes:

#### Test Categories
- **Unit Tests**: Component and function testing
- **Integration Tests**: Service and API testing  
- **E2E Tests**: Full user workflow testing
- **Flow Tests**: User journey validation
- **Process Tests**: Business logic verification
- **User Guide Tests**: Documentation accuracy validation

#### Running Tests
```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e          # End-to-end tests
npm run test:flows        # User flow tests
npm run test:processes    # Process validation tests
npm run test:user-guides  # Documentation verification

# Watch mode for development
npm run test:watch

# Coverage reports
npm run test:coverage
```

#### Test Structure
```
tests/
├── flows/              # User flow validation
│   ├── onboarding.spec.ts
│   ├── workspace-navigation.spec.ts
│   ├── ai-chat.spec.ts
│   ├── code-editor.spec.ts
│   ├── terminal.spec.ts
│   └── settings.spec.ts
├── processes/          # Business process validation
│   ├── project-management.spec.ts
│   ├── file-operations.spec.ts
│   ├── ai-integration.spec.ts
│   └── data-sync.spec.ts
└── user-guides/        # Documentation verification
    ├── quick-reference.spec.ts
    ├── users-guide.spec.ts
    └── onboarding-checklist.spec.ts
```

## 🚢 Deployment

### Vercel Deployment (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### Manual Deployment
```bash
# Build the application
npm run build:web

# The built application will be in .next/
# Deploy the .next/ directory to your hosting provider
```

### Environment Variables
Required environment variables for deployment:
```bash
# AI Provider API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Database Configuration
NEON_DATABASE_URL=your_neon_connection_string

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret
```

## 🤝 Community & Support

### Getting Help
- **📖 Documentation**: Comprehensive guides in `src/content/`
- **🐛 GitHub Issues**: Bug reports and feature requests
- **💬 Discussions**: Community discussions and Q&A

### Contributing
- **🔀 Pull Requests**: Code contributions and improvements
- **📝 Documentation**: Help improve guides and examples
- **🧪 Testing**: Add tests for new features and edge cases
- **🐛 Bug Reports**: Issue identification and reproduction

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔄 Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history and release notes.

---

**OmniPanel Web App** - The future of AI-powered development workspaces. Built with ❤️ for developers, by developers.