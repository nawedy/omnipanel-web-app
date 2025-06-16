# 🚀 OmniPanel AI Workspace

The ultimate AI-powered workspace that brings together chat, code, data science, and automation in a unified, extensible platform. Works seamlessly across web, desktop, and mobile with support for local and cloud LLMs.

![OmniPanel Logo](assets/OmniPanel-logo.png)

## 🎯 Current Status: Version 1.3.0 - Production Ready

**Latest Release**: Sprint 7 - Workspace Layout Optimization & Production Stability ✅  
**Build Status**: ✅ Passing | **TypeScript**: ✅ 100% Compliant | **Tests**: ✅ Comprehensive Coverage

### 🆕 Recent Major Updates (v1.3.0)
- **✅ Sprint 7**: Workspace layout fixes, professional resizable panels, production stability
- **✅ Sprint 6**: Complete testing infrastructure, E2E tests, quality assurance
- **✅ Sprint 5**: File management overhaul, UI polish, context-aware AI assistance
- **✅ Sprint 4**: Enhanced file explorer, terminal integration, real-time monitoring
- **✅ Sprint 3**: Chat system redesign, context-aware AI, conversation management
- **✅ Sprint 2**: Settings system overhaul, advanced theming, keyboard shortcuts
- **✅ Sprint 1**: TypeScript error resolution, service integration, 100% type safety

## ✨ Features

### 🎯 **Core Workspace**
- **Professional Layout System**: Resizable panels with drag-to-resize functionality (200-600px ranges)
- **Multi-tab Interface**: Chat, Code Editor, Terminal, Notebook, File Tree with context awareness
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

### 🔌 **Extensibility**
- **Plugin System**: Comprehensive SDK with marketplace integration
- **Advanced Theme Engine**: 8 color schemes, custom fonts, export/import functionality
- **Custom Components**: Extensible UI component system with TypeScript support
- **API Access**: Full REST API and CLI tools for automation

### ⚙️ **Settings & Configuration**
- **Comprehensive Settings**: 8 major sections (General, Theme, Keyboard, Database, Performance, Plugins, Errors, Privacy)
- **GDPR Compliance**: Complete privacy policy with data protection rights
- **Internationalization**: 12 language options with timezone management
- **Database Integration**: PostgreSQL, MySQL, SQLite, NeonDB with connection string support

## 🏗️ Architecture

### Monorepo Structure
```
omnipanel-core/
├── packages/              # Shared packages
│   ├── types/            # TypeScript definitions
│   ├── config/           # Global configuration
│   ├── database/         # Database models and utilities
│   ├── ui/               # Shared UI components
│   ├── llm-adapters/     # AI model connectors
│   ├── core/             # Business logic and sync
│   ├── plugin-sdk/       # Plugin development SDK
│   └── theme-engine/     # Advanced theming system
├── apps/                 # Applications
│   ├── web/              # Next.js web application
│   ├── desktop/          # Electron desktop app
│   ├── mobile/           # React Native mobile app
│   ├── docs/             # Documentation site
│   ├── website/          # Marketing website
│   └── marketplace/      # Plugin marketplace
└── assets/               # Shared assets and branding
```

### Technology Stack
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Desktop**: Electron with native APIs
- **Mobile**: React Native with Expo
- **Backend**: NeonDB (PostgreSQL, Auth, Storage, Functions)
- **State**: Zustand for client state management
- **Real-time**: NeonDB real-time subscriptions
- **Offline**: IndexedDB with automatic sync
- **UI**: Framer Motion, Monaco Editor, xterm.js

## 🚀 Quick Start

### Prerequisites
- Node.js 22+ 
- npm 8+
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/omnipanel-core.git
cd omnipanel-core

# Install dependencies
npm install

# Build all packages
npm run build

# Start development servers
npm run dev:web      # Web app (localhost:3003)
npm run dev:docs     # Documentation (localhost:3001)
npm run dev:website  # Marketing site (localhost:3004)
```

### Desktop App
```bash
# Build and run desktop app
npm run dev:desktop

# Build for distribution
npm run build:desktop
```

### Mobile App
```bash
# Start Expo development server
npm run dev:mobile

# Run on iOS simulator
npm run mobile:ios

# Run on Android emulator
npm run mobile:android
```

## 📱 Platform Support

### Web Application
- **URL**: Deploy on Vercel, Netlify, or any hosting platform
- **Features**: Full workspace functionality in browser
- **Sync**: Real-time collaboration and cloud backup

### Desktop Application
- **Platforms**: Windows, macOS, Linux
- **Distribution**: Direct download (no app store required)
- **Features**: Native file system, local LLMs, offline mode

### Mobile Application
- **Platforms**: iOS, Android
- **Distribution**: Direct APK/IPA (no app store required)
- **Features**: Full workspace on mobile with sync

## 🔧 Development

### Package Scripts
```bash
# Build all packages
npm run build

# Development mode
npm run dev

# Type checking
npm run type-check

# Linting and formatting
npm run lint
npm run format

# Testing
npm run test
npm run test:coverage

# Clean builds
npm run clean
npm run reset
```

### App-specific Scripts
```bash
# Web app
npm run dev:web
npm run build:web

# Desktop app
npm run dev:desktop
npm run build:desktop

# Mobile app
npm run dev:mobile
npm run mobile:build

# Documentation
npm run docs:dev
npm run docs:build

# Website
npm run website:dev
npm run website:build
```

## 🎨 Theming

OmniPanel includes an advanced theming system with marketplace support:

```bash
# Create a new theme
npx omnipanel-theme create

# Preview theme
npx omnipanel-theme preview my-theme.json

# Publish to marketplace
npx omnipanel-theme publish my-theme.json
```

## 🔌 Plugin Development

Develop custom plugins with the comprehensive SDK:

```bash
# Create a new plugin
npx omnipanel-plugin create

# Start development
npx omnipanel-plugin dev

# Build and package
npx omnipanel-plugin build
npx omnipanel-plugin package

# Publish to marketplace
npx omnipanel-plugin publish
```

## 🤖 LLM Configuration

### Local Models (Ollama)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull models
ollama pull llama2
ollama pull codellama
ollama pull mistral
```

### Cloud Models
Configure API keys in settings:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- Deepseek, Qwen, HuggingFace

## 📊 Project Status

### Sprint Progress
- ✅ **Sprint 1**: Dashboard shell, sidebar, header, tab manager
- ✅ **Sprint 2**: Chat, code editor, terminal, notebook, file tree
- ✅ **Sprint 3**: Real-time sync, offline capabilities
- ✅ **Sprint 4**: Desktop integration, LLM adapters
- ✅ **Sprint 5**: Mobile app foundation
- ✅ **Sprint 6**: Documentation site
- ✅ **Sprint 7**: Marketing website
- ✅ **Sprint 8**: Plugin SDK and marketplace
- ✅ **Sprint 9**: Advanced theming system and theme marketplace

### Code Metrics
- **Total Lines**: 25,000+ lines of production code
- **Packages**: 8 shared packages
- **Applications**: 6 complete applications
- **Type Coverage**: 100% TypeScript with strict mode
- **Test Coverage**: Comprehensive test suite

## 🚢 Deployment

### Web Apps (Vercel)
```bash
# Deploy web application
vercel deploy apps/web

# Deploy documentation
vercel deploy apps/docs

# Deploy website
vercel deploy apps/website
```

### Desktop Distribution
```bash
# Build for all platforms
npm run build:desktop

# Distributables will be in apps/desktop/dist/
```

### Mobile Distribution
```bash
# Build for iOS
npm run mobile:build:ios

# Build for Android  
npm run mobile:build:android

# Distributables for direct installation
```

## 📝 Documentation

- **Getting Started**: [docs/getting-started](apps/docs/app/getting-started/page.mdx)
- **API Reference**: [docs/api](apps/docs/app/api/page.mdx)
- **Plugin Development**: [packages/plugin-sdk/README.md](packages/plugin-sdk/README.md)
- **Theme Development**: [packages/theme-engine/README.md](packages/theme-engine/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with love for the AI and developer community
- Inspired by VSCode, Notion, and Jupyter
- Thanks to all contributors and users

## 🔗 Links

- **Website**: [omnipanel.ai](https://omnipanel.ai)
- **Documentation**: [docs.omnipanel.ai](https://docs.omnipanel.ai)  
- **GitHub**: [github.com/omnipanel/omnipanel-core](https://github.com/omnipanel/omnipanel-core)
- **Discord**: [discord.gg/omnipanel](https://discord.gg/omnipanel)

---

**Made with ❤️ for the future of AI workspaces** 