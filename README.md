# 🚀 OmniPanel AI Workspace

The ultimate AI-powered workspace that brings together chat, code, data science, and automation in a unified, extensible platform. Works seamlessly across web, desktop, and mobile with support for local and cloud LLMs.

![OmniPanel Logo](assets/OmniPanel-logo.png)

## ✨ Features

### 🎯 **Core Workspace**
- **Multi-tab Interface**: Chat, Code Editor, Terminal, Notebook, File Tree
- **Real-time Sync**: Cloud synchronization with offline-first architecture
- **Project Organization**: Folders, tags, favorites, multi-project navigation
- **Modern UI**: Glassmorphism design with dark/light themes

### 🤖 **AI Integration**
- **Multi-Model Support**: OpenAI, Ollama, llama.cpp, vLLM, Deepseek, Qwen, HuggingFace, Anthropic, Google Gemini, Mistral
- **Local & Cloud**: Seamless switching between local and cloud AI models
- **Chat Interface**: Context-aware conversations with file integration
- **AI-Powered Tools**: Code explanation, improvement, and generation

### 💻 **Development Tools**
- **Monaco Editor**: VSCode-style editor with syntax highlighting
- **Terminal Integration**: Full terminal with AI assistance
- **Git Integration**: Visual status indicators and repository management
- **File Management**: Professional file tree with advanced operations

### 📊 **Data Science**
- **Jupyter Notebooks**: Interactive cells with code execution
- **Visualization**: Built-in charting and data visualization
- **AI Assistance**: Smart cell generation and data analysis

### 🔌 **Extensibility**
- **Plugin System**: Comprehensive SDK with marketplace
- **Theme Engine**: Advanced theming with community marketplace
- **Custom Components**: Extensible UI component system
- **API Access**: Full REST API and CLI tools

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
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Functions)
- **State**: Zustand for client state management
- **Real-time**: Supabase Realtime subscriptions
- **Offline**: IndexedDB with automatic sync
- **UI**: Framer Motion, Monaco Editor, xterm.js

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
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